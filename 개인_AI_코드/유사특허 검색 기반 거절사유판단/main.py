
# main.py
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

from korpat_utils import (
    embed_exam_text,
    search_korpat,
    extract_similar_sentences,
    extract_side_by_side_pairs,
    generate_office_action_combined,
    metadata,
)

# ──────────────────────────────────────────────────────────────────────────────
# 환경 로드 (.env 명시)
# ──────────────────────────────────────────────────────────────────────────────
ENV_PATH = Path(__file__).resolve().parent / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

app = FastAPI(title="RejectionAI (fast single-call)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 운영에선 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 내부 고정(필요 시 .env로 덮어쓰기)
TOP_K       = int(os.getenv("TOP_K", "2"))
TOP_K_PAIRS = int(os.getenv("TOP_K_PAIRS", "2"))
MIN_PAIR_P  = float(os.getenv("MIN_PAIR_PERCENT", "25"))
USE_GATE    = (os.getenv("USE_LLM_GATE", "0") == "1")  # 기본 0(비활성)
GEN_MODEL   = os.getenv("GEN_MODEL_NAME", "gpt-4o")
MAX_CLAIM_BODY = os.getenv("MAX_CLAIM_BODY_CHARS", "None")
MAX_CLAIM_BODY = None if str(MAX_CLAIM_BODY).lower() == "none" else int(MAX_CLAIM_BODY)

@app.get("/health")
async def health():
    return {
        "ok": True,
        "metadata_count": len(metadata),
        "config": {
            "TOP_K": TOP_K,
            "TOP_K_PAIRS": TOP_K_PAIRS,
            "MIN_PAIR_PERCENT": MIN_PAIR_P,
            "USE_LLM_GATE": USE_GATE,
            "GEN_MODEL_NAME": GEN_MODEL,
            "MAX_CLAIM_BODY_CHARS": MAX_CLAIM_BODY,
        }
    }

# -------------------------
# 텍스트 입력 버전
# -------------------------
@app.post("/analyze-txt")
async def analyze_txt(text: str = Body(..., embed=True)):
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="텍스트가 비어있습니다.")

    # 1) 임베딩
    emb = embed_exam_text(text)

    # 2) 유사특허 검색
    similar = search_korpat(emb, top_k=TOP_K)

    # 3) (옵션) 단문 매칭
    matches = extract_similar_sentences(text, similar, top_k=TOP_K)

    # 4) 페어(인용↔출원), LLM 게이트 사용 여부
    pairs = extract_side_by_side_pairs(
        exam_text=text,
        similar_patents=similar,
        metadata_list=metadata,
        top_k_pairs=TOP_K_PAIRS,
        min_percent=MIN_PAIR_P,
        use_llm_gate=USE_GATE
    )

    # 5) 최종 의견서 (LLM 한 번)
    opinion = generate_office_action_combined(
        matches_with_pairs=pairs,
        similar_matches=matches,
        exam_title="",
        exam_claims_excerpt="",
        max_claim_body_chars=MAX_CLAIM_BODY,
        min_pair_percent=MIN_PAIR_P,
        model_name=GEN_MODEL
    )

    # 응답 데이터 간소화
    simplified_similar_patents = [{"app_num": p["app_num"], "claim_num": p["claim_num"]} for p in similar]
    simplified_matches_with_pairs = []
    for match in pairs:
        simplified_pairs = [{
            "claim_sentence": pair["claim_sentence"],
            "exam_sentence": pair["exam_sentence"],
            "similarity_percent": pair["similarity_percent"],
            "llm_gate_reason": pair["llm_gate_reason"]
        } for pair in match.get("matched_pairs", [])]
        simplified_matches_with_pairs.append({
            "patent": {
                "app_num": match["patent"]["app_num"],
                "claim_num": match["patent"]["claim_num"]
            },
            "matched_pairs": simplified_pairs
        })

    return JSONResponse(content={
        "success": True,
        "similar_patents": simplified_similar_patents,
        "matches_with_pairs": simplified_matches_with_pairs,
        "opinion": opinion
    })

# -------------------------
# JSON 입력 버전
# -------------------------
@app.post("/analyze")
async def analyze_json(patent_data: Any = Body(...)):
    # dict 정규화
    if hasattr(patent_data, "model_dump"):
        patent_data = patent_data.model_dump()
    elif hasattr(patent_data, "dict"):
        patent_data = patent_data.dict()
    elif not isinstance(patent_data, dict):
        # FastAPI가 이미 dict로 파싱해주지만, 혹시 모를 상황 방어
        try:
            patent_data = dict(patent_data)
        except Exception:
            raise HTTPException(status_code=400, detail="요청 바디를 dict로 변환 불가")

    # 1) JSON → 텍스트 (유연 파서)
    def _normalize_to_text(value) -> str:
        """value가 str/list/dict 어떤 형태든 핵심 텍스트만 문자열로 정규화"""
        if value is None:
            return ""
        if isinstance(value, str):
            return value.strip()
        if isinstance(value, dict):
            # 대표 필드 우선
            for key in ("text", "claimText", "content", "value", "body", "desc", "description"):
                if key in value and isinstance(value[key], str):
                    return value[key].strip()
            # 전체를 순회하며 문자열만 이어붙임
            parts = []
            for k, v in value.items():
                if isinstance(v, str):
                    parts.append(v.strip())
            return " ".join(parts).strip()
        if isinstance(value, list):
            parts = []
            for it in value:
                parts.append(_normalize_to_text(it))
            return " ".join(p for p in parts if p).strip()
        # 그 외 타입은 문자열화
        try:
            return str(value)
        except Exception:
            return ""

    def _extract_text_from_json(d: dict) -> str:
        parts = []
        # 주요 키들 우선적으로 직렬화
        for k in [
            "title", "technicalField", "backgroundTechnology", "problemToSolve",
            "solution", "effect", "summary", "applicationContent", "drawingDescription"
        ]:
            v = d.get(k, "")
            t = _normalize_to_text(v)
            if t:
                parts.append(f"{k}: {t}")

        # claims 유연 처리
        claims = d.get("claims", "")
        if claims:
            parts.append("claims:")
            if isinstance(claims, list):
                for c in claims:
                    if isinstance(c, dict):
                        num = c.get("claimNumber", "")
                        ctype = c.get("claimType", "")
                        ctext = _normalize_to_text(c.get("claimText", c))
                        parts.append(f" - {num}({ctype}): {ctext}")
                    else:
                        parts.append(f" - {_normalize_to_text(c)}")
            elif isinstance(claims, dict):
                num  = claims.get("claimNumber", "")
                ctype = claims.get("claimType", "")
                ctext = _normalize_to_text(claims.get("claimText", claims))
                hdr = f" - {num}({ctype}): " if (num or ctype) else " - "
                parts.append(hdr + ctext)
            else:
                parts.append(f" - {_normalize_to_text(claims)}")

        return " ".join(parts)

    exam_text = _extract_text_from_json(patent_data)
    if not exam_text.strip():
        raise HTTPException(status_code=400, detail="JSON에서 유효 텍스트 추출 실패")

    # 2) 임베딩/검색
    emb = embed_exam_text(exam_text)
    similar = search_korpat(emb, top_k=TOP_K)

    # 3) (옵션) 단문 매칭
    matches = extract_similar_sentences(exam_text, similar, top_k=TOP_K)

    # 4) 페어
    pairs = extract_side_by_side_pairs(
        exam_text=exam_text,
        similar_patents=similar,
        metadata_list=metadata,
        top_k_pairs=TOP_K_PAIRS,
        min_percent=MIN_PAIR_P,
        use_llm_gate=USE_GATE
    )

    # 5) 제목/청구항 발췌(있으면) — 어떤 형태든 1개 샘플을 500자 내로
    title = _normalize_to_text(patent_data.get("title", ""))

    def _extract_claims_excerpt(claims_any) -> str:
        if not claims_any:
            return ""
        # list
        if isinstance(claims_any, list):
            # dict 우선 → str → 기타
            for it in claims_any:
                if isinstance(it, dict):
                    txt = _normalize_to_text(it.get("claimText", it))
                    if txt:
                        return txt[:500]
            for it in claims_any:
                if isinstance(it, str):
                    t = it.strip()
                    if t:
                        return t[:500]
            # 마지막으로 list 자체 문자열화
            return _normalize_to_text(claims_any)[:500]
        # dict
        if isinstance(claims_any, dict):
            return _normalize_to_text(claims_any.get("claimText", claims_any))[:500]
        # str
        if isinstance(claims_any, str):
            return claims_any[:500]
        # 기타
        return _normalize_to_text(claims_any)[:500]

    claims_excerpt = _extract_claims_excerpt(patent_data.get("claims"))

    # 6) 최종 의견서 (LLM 한 번)
    opinion = generate_office_action_combined(
        matches_with_pairs=pairs,
        similar_matches=matches,
        exam_title=title,
        exam_claims_excerpt=claims_excerpt,
        max_claim_body_chars=MAX_CLAIM_BODY,
        min_pair_percent=MIN_PAIR_P,
        model_name=GEN_MODEL
    )

    # 응답 데이터 간소화
    simplified_similar_patents = [{"app_num": p["app_num"], "claim_num": p["claim_num"]} for p in similar]
    simplified_matches_with_pairs = []
    for match in pairs:
        simplified_pairs = [{
            "claim_sentence": pair["claim_sentence"],
            "exam_sentence": pair["exam_sentence"],
            "similarity_percent": pair["similarity_percent"],
            "llm_gate_reason": pair["llm_gate_reason"]
        } for pair in match.get("matched_pairs", [])]
        simplified_matches_with_pairs.append({
            "patent": {
                "app_num": match["patent"]["app_num"],
                "claim_num": match["patent"]["claim_num"]
            },
            "matched_pairs": simplified_pairs
        })

    return JSONResponse(content={
        "success": True,
        "similar_patents": simplified_similar_patents,
        "matches_with_pairs": simplified_matches_with_pairs,
        "opinion": opinion
    })
