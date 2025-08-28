import os
import re
import json
import faiss
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict

import torch
from transformers import AutoTokenizer, AutoModel
from dotenv import load_dotenv
from openai import OpenAI

# 팀원 모듈(필요 시 비활성)
try:
    from model import analyst  # KIPRIS 검색기
except Exception:
    analyst = None
    print("[WARN] KIPRIS analyst import 실패 → KIPRIS 검색 비활성화")

# ──────────────────────────────────────────────────────────────────────────────
# 0) 환경/키
# ──────────────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
HF_TOKEN       = os.getenv("HF_TOKEN", "").strip() or os.getenv("HUGGINGFACE_HUB_TOKEN","").strip()

oai = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
print(f"[ENV] OPENAI_API_KEY set: {bool(OPENAI_API_KEY)}")
print(f"[ENV] HF_TOKEN set: {bool(HF_TOKEN)}")

# ──────────────────────────────────────────────────────────────────────────────
# 1) 경로/모델 설정
# ──────────────────────────────────────────────────────────────────────────────
INDEX_PATH = (os.getenv("INDEX_PATH", str(ROOT / "korpat_index_quarter.faiss")) or "").strip()
META_PATH  = (os.getenv("META_PATH",  INDEX_PATH + ".meta.json") or "").strip()

MODEL_NAME = os.getenv("MODEL_NAME", "KIPI-ai/KorPatElectra")
MAX_LEN    = int(os.getenv("EMBED_MAX_LEN", "256"))
EMB_DIM    = 768
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")

GEN_MODEL_NAME = os.getenv("GEN_MODEL_NAME", "gpt-4o")
USE_LLM_GATE   = os.getenv("USE_LLM_GATE", "0") == "1"
LLM_GATE_MODEL = os.getenv("LLM_GATE_MODEL", "gpt-4o-mini")

TOP_K_DEFAULT       = int(os.getenv("TOP_K", "3"))
TOP_K_PAIRS_DEFAULT = int(os.getenv("TOP_K_PAIRS", "3"))
MIN_PAIR_P_DEFAULT  = float(os.getenv("MIN_PAIR_PERCENT", "25"))

# ──────────────────────────────────────────────────────────────────────────────
# 2) 모델 로드 (Auto*)
# ──────────────────────────────────────────────────────────────────────────────
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN, use_fast=True)
    encoder   = AutoModel.from_pretrained(MODEL_NAME, token=HF_TOKEN).to(DEVICE).eval()
    if DEVICE.type == "cuda":
        try:
            encoder = encoder.half()
        except Exception:
            pass
    print(f"✅ HF model loaded (auto): {MODEL_NAME} on {DEVICE.type}")
except Exception as e:
    print(f"❌ Failed to load HF model: {e}")
    raise

# ──────────────────────────────────────────────────────────────────────────────
# 3) FAISS / 메타
# ──────────────────────────────────────────────────────────────────────────────
try:
    index = faiss.read_index(INDEX_PATH)
    print(f"✅ FAISS loaded: {INDEX_PATH} (d={index.d}, n={index.ntotal})")
except Exception as e:
    print(f"❌ Failed to load FAISS index: {e}")
    raise

try:
    with open(META_PATH, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    print(f"✅ Metadata loaded: {len(metadata)} rows")
except Exception as e:
    print(f"❌ Failed to load metadata: {e}")
    raise

# ──────────────────────────────────────────────────────────────────────────────
# 4) 유틸
# ──────────────────────────────────────────────────────────────────────────────
def _clean_tags(t: str) -> str:
    return re.sub(r"</?[^>]+>", "", t or "").strip()

def _split_korean_sentences(text: str) -> List[str]:
    if not text:
        return []
    t = re.sub(r"\s+", " ", str(text)).strip()
    t = t.replace(";", ". ")
    sents = re.split(r"(?<=[\.!?。！？])\s+", t)
    return [s.strip() for s in sents if len(s.strip()) >= 2]

def _assert_dim(vec: np.ndarray):
    if vec.ndim == 1: d = vec.shape[0]
    else:             d = vec.shape[1]
    if d != index.d or d != EMB_DIM:
        raise RuntimeError(
            f"[DIM MISMATCH] embedding_dim={d}, index_dim={index.d}, expected={EMB_DIM}"
        )

# ──────────────────────────────────────────────────────────────────────────────
# 5) 임베딩 (CLS → L2 normalize → float32)
# ──────────────────────────────────────────────────────────────────────────────
@torch.inference_mode()
def _embed_batch(texts: List[str], batch_size: int = 128) -> np.ndarray:
    out = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        inputs = tokenizer(
            batch,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=MAX_LEN,
            return_token_type_ids=False,
        )
        inputs = {k: v.to(DEVICE, non_blocking=True) for k, v in inputs.items()}
        hidden = encoder(**inputs).last_hidden_state   # [B, L, H]
        cls    = hidden[:, 0, :]                       # [B, H]
        cls    = torch.nn.functional.normalize(cls, p=2, dim=1)
        out.append(cls.detach().float().cpu().numpy())
    vecs = np.vstack(out)
    _assert_dim(vecs)
    return vecs

def embed_exam_text(text: str) -> np.ndarray:
    vec = _embed_batch([text])[0]
    _assert_dim(vec)
    return vec.astype(np.float32)

# ──────────────────────────────────────────────────────────────────────────────
# 6) 1차: FAISS 검색
# ──────────────────────────────────────────────────────────────────────────────
def search_korpat(exam_embedding: np.ndarray, top_k: int = TOP_K_DEFAULT):
    if exam_embedding is None or exam_embedding.size == 0:
        return []
    _assert_dim(exam_embedding)

    q = np.array([exam_embedding], dtype=np.float32)
    scores, indices = index.search(q, top_k)

    results = []
    for i, idx in enumerate(indices[0]):
        meta = metadata[idx]
        ip = float(scores[0][i])              # (CLS 정규화 전제) 내적≈코사인
        cosine01 = max(0.0, min(1.0, (ip + 1.0) / 2))
        results.append({
            "app_num":    meta.get("app_num"),
            "claim_num":  meta.get("claim_num"),
            "is_indep":   meta.get("is_independent"),
            "plain_text": meta.get("plain_text"),
            "raw_text":   meta.get("raw_text"),
            "ip": ip,
            "score": cosine01,
            "source": "faiss"
        })
    return results

# ──────────────────────────────────────────────────────────────────────────────
# 6-1) 2차: KIPRIS 검색(항상 병행)
# ──────────────────────────────────────────────────────────────────────────────
def search_korpat_with_kipris(exam_text: str, exam_embedding: np.ndarray, top_k: int = TOP_K_DEFAULT) -> List[Dict]:
    """
    항상 1차 FAISS + 2차 KIPRIS 를 수행하여 병합 반환
    """
    results: List[Dict] = []

    # 1) FAISS
    try:
        results.extend(search_korpat(exam_embedding, top_k=top_k))
    except Exception as e:
        print(f"[WARN] FAISS 검색 실패: {e}")

    # 2) KIPRIS
    if analyst:
        try:
            klist = analyst.analyze_multi(exam_text, top_n=top_k)
            for k in klist:
                if "error" in k: 
                    continue
                bi = k.get("basicInfo", {}) or {}
                results.append({
                    "app_num":    k.get("applicationNumber"),
                    "claim_num":  None,
                    "is_indep":   None,
                    "plain_text": bi.get("inventionTitle", ""),
                    "raw_text":   bi.get("abstract", ""),
                    "ip": None,
                    "score": None,
                    "source": "kipris"
                })
        except Exception as e:
            print(f"[WARN] KIPRIS 검색 실패: {e}")
    else:
        print("[INFO] analyst 미존재 → KIPRIS 생략")

    # 중복 제거(app_num 기준)
    seen, merged = set(), []
    for r in results:
        key = r.get("app_num") or f"faiss_{r.get('claim_num')}"
        if key in seen:
            continue
        seen.add(key)
        merged.append(r)

    return merged

# ──────────────────────────────────────────────────────────────────────────────
# 7) 문장 매칭/페어링
# ──────────────────────────────────────────────────────────────────────────────
def extract_similar_sentences(exam_text: str, similar_patents, top_k: int = TOP_K_DEFAULT):
    sents = _split_korean_sentences(exam_text)
    uniq, seen = [], set()
    for s in sents:
        s2 = s.strip()
        if s2 and len(s2) > 10 and s2 not in seen:
            uniq.append(s2); seen.add(s2)
    if not uniq:
        return []

    sent_embs  = _embed_batch(uniq)         # [N, 768]
    sent_embsT = sent_embs.T                # [768, N]

    out = []
    for p in similar_patents:
        claim_text = p.get("plain_text") or ""
        claim_emb  = _embed_batch([claim_text])[0]
        sims = claim_emb @ sent_embsT
        top_idx = np.argsort(sims)[-top_k:][::-1]
        matched = [(uniq[i], float(sims[i])) for i in top_idx if sims[i] > 0.30]
        out.append({
            "patent": p,
            "matched_sentences": matched,
            "summary": None
        })
    return out

def _get_claim_sentences_from_metadata(app_num, claim_num, metadata_list):
    items = [m for m in metadata_list if m.get("app_num")==app_num and m.get("claim_num")==claim_num]
    items.sort(key=lambda x: x.get("sent_num", 0))
    joined = " ".join((m.get("plain_text") or "").strip() for m in items).strip()
    sents = _split_korean_sentences(joined)
    if not sents:
        pt = (items[0].get("plain_text") if items else "") or ""
        sents = _split_korean_sentences(pt) or [pt.strip()]
    return sents

def _llm_pair_gate(claim_sentence: str, exam_sentence: str) -> Tuple[bool, str]:
    if not oai:
        return True, ""
    prompt = f"""
너는 특허 심사관이다. 아래 두 문장의 '기술적 구성/관계/기능' 대응 여부를 엄밀히 판단하라.
JSON만 반환:
{{"similar": true/false, "reason": "한 줄 근거"}}

[인용] {claim_sentence}
[출원] {exam_sentence}
""".strip()
    try:
        r = oai.chat.completions.create(
            model=LLM_GATE_MODEL, temperature=0.0, max_tokens=100,
            messages=[{"role":"user","content":prompt}]
        )
        txt = (r.choices[0].message.content or "").strip()
        import json as _json, re as _re
        m = _re.search(r"\{.*\}", txt, _re.S)
        data = _json.loads(m.group(0)) if m else {}
        return bool(data.get("similar", False)), str(data.get("reason","")).strip()[:180]
    except Exception:
        return False, "LLM 게이트 실패"

def extract_side_by_side_pairs(
    exam_text,
    similar_patents,
    metadata_list,
    top_k_pairs: int = TOP_K_PAIRS_DEFAULT,
    min_percent: float = MIN_PAIR_P_DEFAULT,
    use_llm_gate: bool = USE_LLM_GATE,
):
    exam_sents = _split_korean_sentences(exam_text)
    if not exam_sents:
        return []

    exam_embs = _embed_batch(exam_sents)  # [E, 768]
    results = []

    for p in similar_patents:
        # KIPRIS-only 항목엔 claim_num이 없을 수 있음 → 문장 페어 스킵
        if p.get("source") != "faiss":
            results.append({"patent": p, "matched_pairs": []})
            continue

        claim_sents = _get_claim_sentences_from_metadata(p["app_num"], p["claim_num"], metadata)
        if not claim_sents:
            results.append({"patent": p, "matched_pairs": []})
            continue

        claim_embs = _embed_batch(claim_sents)   # [C, 768]
        sim = claim_embs @ exam_embs.T           # [C, E]

        flat = []
        C, E = sim.shape
        for ci in range(C):
            for ei in range(E):
                flat.append((ci, ei, float(sim[ci, ei])))
        flat.sort(key=lambda x: x[2], reverse=True)

        pairs, used_c, used_e = [], set(), set()
        for ci, ei, sc in flat:
            sc  = max(-1.0, min(1.0, sc))
            pct = round(max(0.0, sc) * 100, 2)
            if pct < min_percent:
                break
            if ci in used_c or ei in used_e:
                continue

            c_sent, e_sent = claim_sents[ci], exam_sents[ei]
            reason = ""
            if use_llm_gate and sc >= 0.35 and oai:
                ok, reason = _llm_pair_gate(c_sent, e_sent)
                if not ok:
                    continue

            pairs.append({
                "claim_sentence": c_sent,
                "exam_sentence":  e_sent,
                "similarity_percent": pct,
                "llm_gate_reason": reason
            })
            used_c.add(ci); used_e.add(ei)
            if len(pairs) >= top_k_pairs:
                break

        results.append({"patent": p, "matched_pairs": pairs})
    return results

# ──────────────────────────────────────────────────────────────────────────────
# 8) 의견서 생성 (응답2 프롬프트 규칙 반영)
# ──────────────────────────────────────────────────────────────────────────────
def generate_office_action_combined(
    matches_with_pairs,
    similar_matches=None,
    exam_title: str = "",
    exam_claims_excerpt: str = "",
    jurisdiction: str = "KR",
    max_claim_body_chars: int | None = None,
    min_pair_percent: float = MIN_PAIR_P_DEFAULT,
    model_name: str = None,
):
    """
    응답2 스타일:
    - 거절이유가 '있다/없다/일부 있다' 모두 가능
    - 제목/기한 안내 규칙 포함
    - '구성요소 대응 → 판단 근거 → 결론' 강제
    """
    if not oai:
        return json.dumps({
            "note": "OPENAI_API_KEY missing → returning raw data",
            "matches_with_pairs": matches_with_pairs,
            "similar_matches": similar_matches
        }, ensure_ascii=False, indent=2)

    def build_cited_block():
        rows = []
        # 우선순위: 페어가 있는 FAISS → 페어 없는 나머지(FAISS/KIPRIS) 순
        src = matches_with_pairs if matches_with_pairs else (similar_matches or [])
        for i, item in enumerate(src, 1):
            p = item.get("patent", item)
            raw = (p.get("raw_text") or "").strip()
            raw_clean = _clean_tags(raw)
            body = raw_clean
            if (max_claim_body_chars is not None) and len(body) > max_claim_body_chars:
                body = body[:max_claim_body_chars] + "…"
            app = p.get("app_num", "")
            clm = p.get("claim_num", None)
            ty  = "독립항" if p.get("is_indep") else ("종속항" if p.get("is_indep") is not None else "미상")
            src_tag = p.get("source", "unknown")
            rows.append(
                f"■ 인용발명 {i}\n"
                f"- 출원번호: {app}, 청구항: {clm if clm is not None else 'N/A'}, 유형: {ty}, 출처: {src_tag}\n"
                f"- 인용 청구항/개요(가능한 한 그대로):\n{body if body else '(본문/초록 미제공)'}\n"
            )
        return "\n".join(rows) if rows else "(인용 발명 없음)"

    def build_similarity_lines():
        lines = []
        if matches_with_pairs:
            for i, item in enumerate(matches_with_pairs, 1):
                p = item["patent"]
                app = p.get("app_num"); clm = p.get("claim_num")
                ty  = "독립항" if p.get("is_indep") else ("종속항" if p.get("is_indep") is not None else "미상")
                lines.append(f"■ 인용발명 {i} : {app} (청구항 {clm if clm is not None else 'N/A'}, {ty}, 출처:{p.get('source','?')})")
                for pair in item["matched_pairs"]:
                    if pair["similarity_percent"] < min_pair_percent:
                        continue
                    extra = f" / 근거: {pair.get('llm_gate_reason','')}" if pair.get("llm_gate_reason") else ""
                    lines.append(
                        f"  • ({pair['similarity_percent']}%) [인용] {pair['claim_sentence']}  ||  [출원] {pair['exam_sentence']}{extra}"
                    )
        elif similar_matches:
            for i, match in enumerate(similar_matches, 1):
                p = match["patent"]
                lines.append(f"■ 인용발명 {i} : {p.get('app_num')} (출처:{p.get('source','?')})")
                for s, score in match.get("matched_sentences", []):
                    percent = round(float(score) * 100, 2)
                    if percent < min_pair_percent:
                        continue
                    lines.append(f"  • ({percent}%) [출원] {s}")
        else:
            lines.append("(유사문장 없음)")
        return "\n".join(lines)

    # 간단한 내부 판단 힌트(LLM 의사결정 참고용)
    faiss_pairs_count = sum(len(m.get("matched_pairs", [])) for m in (matches_with_pairs or []))
    faiss_any_pairs   = faiss_pairs_count > 0

    cited_block = build_cited_block()
    sim_lines   = build_similarity_lines()
    model_name  = model_name or GEN_MODEL_NAME

    prompt = f"""
다음 자료만으로 한국 특허청 양식/어투에 맞추어 '거절이유통지서' 또는 '검토결과 통지(거절이유 없음)' 중 하나를 작성하라.
거절이유가 일부 청구항에만 있으면 그에 맞게 작성하라.

[입력 요약]
- 출원발명(제목): {exam_title or '(미제공)'}
- 출원발명(대표 청구항 발췌, 있으면 1항 위주): {exam_claims_excerpt or '(미제공)'}
- 인용 발명(본문/초록 그대로, 출처=faiss|kipris, 청구항번호 미상 가능):
{cited_block}

[구성요소별 유사 페어(인용 ↔ 출원, 유사도 %)]
{sim_lines}

[판단 요구사항]
1) 청구항별로 '구성요소 대응 → 판단 근거 → 결론'을 제시하라.
2) 신규성/진보성 판단은 특허법 제29조 제1항/제2항에 따라 명확히 기술하라.
3) 단순 유사성 나열이 아니라, 실제로 '대응 구성의 존재 여부, 차이점, 결합의 용이성'을 근거와 함께 판단하라.
4) 인용발명이 KIPRIS로만 온 경우(청구항 본문 미상)에는 초록/제목 수준에서 가능한 범위 내의 엄격한 판단만 하라.
5) 인용발명이 없거나, 구성요소 대응이 충분치 않다면 '거절이유 없음'을 고려하라.

[제목 및 통지 문구 규칙]
- 거절이유가 **있다**고 판단되면: 제목은 **[거절이유통지서]** 로 하고, 결론에 **의견서/보정서 제출 기한(예: 30일)** 안내 문구를 포함할 것.
- 거절이유가 **없다**고 판단되면: 제목은 **[검토결과 통지(거절이유 없음)]** 로 하고, **의견/보정 제출 기한 문구는 넣지 말 것**.
- 일부 청구항만 거절이유가 있는 경우: 제목은 **[거절이유통지서]**, 결론에 **청구항별 판단**을 명확히 구분(예: 청구항 1–3 거절이유 있음, 청구항 4–6 무거절)하고, 기한 안내 문구 포함.

[출력 형식]
- 섹션 순서: ① 출원발명 개요 ② 인용발명 개요 ③ 구성요소 대비표(청구항별) ④ 거절이유 상세(신규성/진보성) ⑤ 도출가능성 판단 ⑥ 최종 결론/통지
- 한국 특허청 공식 문체(…이다/…한다). 모호 표현 금지. 수치/조건/관계는 구체적으로.
- 코드블록/불필요 머리말 없이 **완성 문서만** 출력.
""".strip()

    r = oai.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.25,
        max_tokens=1400,
    )
    return (r.choices[0].message.content or "").strip()
