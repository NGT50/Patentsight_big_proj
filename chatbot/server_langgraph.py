#!/usr/bin/env python3
import os
import json
from typing import Any, Dict, List, Optional, TypedDict

import httpx
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END

# =========================
# 환경설정
# =========================
load_dotenv()

# 문서 점검 API (명세서 점검)
VALIDATE_URL = os.getenv("VALIDATE_URL", "http://3.26.101.212:8000/api/ai/validations")

# 유사특허/거절 분석 API (한 엔드포인트에서 유사검색 + 거절분석 수행)
# 사용자 요청이 "유사만"일 때는 여기 결과에서 유사특허 부분만 추출
# 사용자가 /docs/analyze 라고 지시했으므로 우선 시도하되, 일반 /analyze 로 폴백도 추가
ANALYZE_ENDPOINTS = [
    u.strip() for u in os.getenv(
        "ANALYZE_URLS",
        "http://13.236.174.54:8000/docs/analyze,"
        "http://13.236.174.54:8000/analyze,"
        "http://127.0.0.1:8000/analyze"
    ).split(",") if u.strip()
]

# 윈도우 호환: Timeout 4개 파라미터 모두 지정
# TIMEOUT = httpx.Timeout(connect=20.0, read=90.0, write=20.0, pool=20.0)
TIMEOUT = httpx.Timeout(connect=30.0, read=600.0, write=60.0, pool=30.0)
HEADERS_JSON = {"Content-Type": "application/json"}

# =========================
# HTTP 유틸
# =========================
async def http_post(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS_JSON) as c:
        r = await c.post(url, json=payload)
        r.raise_for_status()
        return r.json()

async def http_post_failover(urls: List[str], payload: Dict[str, Any]) -> Dict[str, Any]:
    """여러 후보 URL로 순차 시도; 모두 실패 시 상세 에러를 묶어 raise."""
    errors = []
    for u in urls:
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS_JSON) as c:
                r = await c.post(u, json=payload)
                r.raise_for_status()
                print(f"🔗 analyze OK -> {u}")
                return r.json()
        except Exception as e:
            err = f"{u} -> {repr(e)}"
            print(f"⚠️ analyze 실패: {err}")
            errors.append(err)
    raise RuntimeError(" ; ".join(errors))

# =========================
# 요청/상태 스키마
# =========================
class ChatRequest(BaseModel):
    session_id: str
    user_msg: str
    application_text: str = ""   # 명세서 본문(선택)
    claims_text: str = ""        # 청구항 본문(선택)
    forced_intent: Optional[str] = None  # "validate_doc" 등 강제

class BotState(TypedDict, total=False):
    user_msg: str
    application_text: str
    claims_text: str
    forced_intent: Optional[str]

    intent: Optional[str]
    results: Dict[str, Any]
    final_answer: str
    history: List[Dict[str, str]]

def new_state() -> BotState:
    return {
        "user_msg": "",
        "application_text": "",
        "claims_text": "",
        "forced_intent": None,
        "intent": None,
        "results": {},
        "final_answer": "",
        "history": [],
    }

# =========================
# 의도 분류 (심사관 사용 문구 강화)
# =========================
VALIDATE_KEYS = [
    "오류", "문제", "점검", "검토", "확인",
    "유효성", "validation", "형식", "문맥",
    "지금 선택한 서류", "심사중", "현재 서류"
]
SIMILAR_KEYS = [
    "유사", "선행", "비슷", "검색", "찾아줘", "특허공보",
    "기술적으로 유사", "유사특허", "similar"
]
REJECT_KEYS = [
    "거절", "거절사유", "통지", "전체적으로 검토", "의견제출통지서", "rejection"
]

async def node_classify(s: BotState) -> BotState:
    if s.get("forced_intent"):
        s["intent"] = s["forced_intent"]
        return s

    m = (s.get("user_msg") or "").lower()
    print(f"🔍 분류 중: {m}")

    if any(k in m for k in REJECT_KEYS):
        s["intent"] = "rejection_draft"
    elif any(k in m for k in SIMILAR_KEYS):
        s["intent"] = "similar_patent"
    elif any(k in m for k in VALIDATE_KEYS):
        s["intent"] = "validate_doc"
    else:
        s["intent"] = "small_talk"
    print(f"✅ intent = {s['intent']}")
    return s

# =========================
# 페이로드 빌더
# =========================
def build_validate_payload(s: BotState) -> Dict[str, Any]:
    """
    사용자 명세서/청구항을 점검 API 스키마에 맞춰 포장.
    명세서 전체를 어디에 넣을지 명확치 않으므로, 최소 필드를 맞추고
    application_text는 backgroundTechnology로 임시 매핑.
    """
    claims_list: List[str] = []
    txt = (s.get("claims_text") or "").strip()
    if txt:
        parts = [p.strip() for p in txt.split("\n") if p.strip()]
        claims_list = parts if parts else [txt]

    return {
        "title": "",  # 필요 시 클라이언트에서 제목 채워서 보내도록 확장
        "technicalField": "",
        "backgroundTechnology": (s.get("application_text") or "").strip(),
        "claims": claims_list,
        "inventionDetails": {
            "problemToSolve": "",
            "solution": "",
            "effect": ""
        }
    }

def build_analyze_payload(s: BotState) -> Dict[str, Any]:
    """
    유사/거절 통합 분석 서버 입력(JSON).
    '유사만' 요청 시에도 동일 바디 전송 후, 응답에서 유사 부분만 추출.
    """
    app_text = (s.get("application_text") or "").strip()
    claims_text = (s.get("claims_text") or "").strip()
    claims = []
    if claims_text:
        claims.append({"claimNumber": 1, "claimType": "independent", "claimText": claims_text})
    return {
        "title": "출원문 자동 분석",
        "summary": s.get("user_msg") or "",
        "applicationContent": app_text,
        "claims": claims
    }

# =========================
# 기능 노드
# =========================
async def node_validate(s: BotState) -> BotState:
    try:
        result = await http_post(VALIDATE_URL, build_validate_payload(s))
    except Exception as e:
        result = {"error": f"validation failed: {e}"}
    s.setdefault("results", {})["validate_doc"] = result
    return s

async def node_similar_patent(s: BotState) -> BotState:
    """
    한 엔드포인트에서 유사검색+거절분석을 같이 하지만,
    '유사만' 요청이므로 유사특허 파트만 추출해서 보여준다.
    """
    try:
        full = await http_post_failover(ANALYZE_ENDPOINTS, build_analyze_payload(s))
        # 가능한 키 후보에서 유사특허만 추출
        similar = (
            full.get("similar_patents")
            or full.get("patents")
            or full.get("results", {}).get("similar_patents")
            or []
        )
        result = {"patents": similar, "raw": full}
    except Exception as e:
        result = {"error": f"similar search failed: {e}"}
    s.setdefault("results", {})["similar_patent"] = result
    return s

async def node_rejection_draft(s: BotState) -> BotState:
    """
    종합 거절 판단: (1) analyze 호출 (유사+거절 분석 포함) + (2) validations 호출
    두 결과를 합쳐 요약 응답 생성.
    """
    try:
        analyze_full = await http_post_failover(ANALYZE_ENDPOINTS, build_analyze_payload(s))
    except Exception as e:
        analyze_full = {"error": f"analyze failed: {e}"}

    try:
        validate_res = await http_post(VALIDATE_URL, build_validate_payload(s))
    except Exception as e:
        validate_res = {"error": f"validation failed: {e}"}

    combined = {
        "analyze": analyze_full,
        "validation": validate_res,
        "summary": {
            "analysis_type": "combined_rejection_review",
            "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z"
        }
    }
    s.setdefault("results", {})["rejection_draft"] = combined
    return s

async def node_small_talk(s: BotState) -> BotState:
    s["final_answer"] = "안녕하세요! ‘문서 점검’, ‘유사특허 검색’, ‘거절사유 검토’ 중 무엇을 도와드릴까요?"
    return s

# =========================
# 결과 합성 (텍스트)
# =========================
def summarize_validate(res: Dict[str, Any]) -> str:
    if "error" in res:
        return f"⚠️ 점검 오류: {res['error']}"
    lines = ["[문서 점검 결과]"]
    fe = res.get("formatErrors") or []
    ms = res.get("missingSections") or []
    ce = res.get("contextualErrors") or []
    if not fe and not ms and not ce:
        lines.append("• 뚜렷한 오류가 발견되지 않았습니다.")
    else:
        if fe:
            lines.append("• 형식 오류:")
            for e in fe:
                lines.append(f"  - {e.get('message','')}")
        if ms:
            lines.append("• 누락 섹션:")
            for e in ms:
                lines.append(f"  - {e.get('message','') or e.get('field','')}")
        if ce:
            lines.append("• 문맥/내용 오류:")
            for e in ce:
                lines.append(f"  - {e.get('analysis','') or e.get('message','')}")
    return "\n".join(lines)

def summarize_similar(res: Dict[str, Any]) -> str:
    if "error" in res:
        return f"⚠️ 유사특허 검색 오류: {res['error']}"
    patents = res.get("patents") or []
    if not patents:
        return "[유사특허 검색 결과]\n• 유사 특허를 찾지 못했습니다."
    lines = [f"[유사특허 검색 결과] • {len(patents)}건"]
    for i, p in enumerate(patents[:5], 1):
        title = p.get("title") or p.get("plain_text", "")[:30] or "제목 없음"
        sim = p.get("similarity", p.get("score", "N/A"))
        lines.append(f"  - {i}. {title} (유사도: {sim})")
    return "\n".join(lines)

def summarize_rejection(res: Dict[str, Any]) -> str:
    # 우리 쪽 종합: analyze + validation
    analyze = res.get("analyze", {})
    valid   = res.get("validation", {})
    lines = ["[거절사유 종합 검토]"]

    # 유사/거절 분석 요약
    if "error" in analyze:
        lines.append(f"• 유사/거절 분석 오류: {analyze['error']}")
    else:
        sim = (
            analyze.get("similar_patents")
            or analyze.get("patents")
            or analyze.get("results", {}).get("similar_patents")
            or []
        )
        lines.append(f"• 유사특허 후보: {len(sim)}건")
        # 거절 판단 텍스트가 있으면 스니펫 노출
        opinion = analyze.get("opinion") or analyze.get("results", {}).get("opinion")
        if isinstance(opinion, str) and opinion.strip():
            lines.append("• 거절 판단 요지:")
            lines.append(f"  " + opinion.strip()[:400] + ("..." if len(opinion.strip()) > 400 else ""))

    # 점검 결과 요약
    if "error" in valid:
        lines.append(f"• 문서 점검 오류: {valid['error']}")
    else:
        fe = valid.get("formatErrors") or []
        ms = valid.get("missingSections") or []
        ce = valid.get("contextualErrors") or []
        cnt = len(fe)+len(ms)+len(ce)
        lines.append(f"• 문서 오류 발견: {cnt}건")

    lines.append("• 결론: 선행기술 대비 및 문서 오류를 함께 고려하여 거절사유 가능성을 평가했습니다.")
    return "\n".join(lines)

async def node_synthesize(s: BotState) -> BotState:
    intent = s.get("intent")
    resmap = s.get("results", {})
    if intent == "validate_doc":
        s["final_answer"] = summarize_validate(resmap.get("validate_doc", {}))
    elif intent == "similar_patent":
        s["final_answer"] = summarize_similar(resmap.get("similar_patent", {}))
    elif intent == "rejection_draft":
        s["final_answer"] = summarize_rejection(resmap.get("rejection_draft", {}))
    else:
        s["final_answer"] = "요청을 이해했습니다. ‘문서 점검/유사검색/거절사유’ 중에서 선택해 주세요."
    s.setdefault("history", []).append({"user": s.get("user_msg",""), "bot": s["final_answer"]})
    return s

# =========================
# LangGraph 구성
# =========================
graph = StateGraph(BotState)
graph.add_node("classify", node_classify)
graph.add_node("validate_doc", node_validate)
graph.add_node("similar_patent", node_similar_patent)
graph.add_node("rejection_draft", node_rejection_draft)
graph.add_node("small_talk", node_small_talk)
graph.add_node("synthesize", node_synthesize)

graph.add_edge(START, "classify")
graph.add_conditional_edges(
    "classify",
    lambda s: s.get("intent"),
    {
        "validate_doc": "validate_doc",
        "similar_patent": "similar_patent",
        "rejection_draft": "rejection_draft",
        "small_talk": "small_talk",
    },
)
graph.add_edge("validate_doc", "synthesize")
graph.add_edge("similar_patent", "synthesize")
graph.add_edge("rejection_draft", "synthesize")
graph.add_edge("small_talk", "synthesize")
graph.add_edge("synthesize", END)

app_graph = graph.compile()

# =========================
# FastAPI
# =========================
app = FastAPI(title="Inspector LangGraph Chatbot (No Claim Draft)")

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS: Dict[str, BotState] = {}

@app.get("/health")
async def health():
    return {
        "ok": True,
        "validate_url": VALIDATE_URL,
        "analyze_first": ANALYZE_ENDPOINTS[0] if ANALYZE_ENDPOINTS else None
    }

@app.post("/chat", response_class=PlainTextResponse)
async def chat(req: ChatRequest):
    try:
        state: BotState = SESSIONS.get(req.session_id) or new_state()
        state["user_msg"] = req.user_msg
        state["application_text"] = req.application_text
        state["claims_text"] = req.claims_text
        state["forced_intent"] = req.forced_intent

        final: BotState = await app_graph.ainvoke(state)
        SESSIONS[req.session_id] = final
        return final.get("final_answer", "응답 생성 실패")
    except Exception as e:
        return f"오류가 발생했습니다: {e}"
