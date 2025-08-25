
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
# 실제 AI 모델 서버 주소들
VALIDATE_URL = "http://3.26.101.212:8000/api/ai/validations"  # 형식/문맥 오류 탐지
CLAIM_DRAFT_URL = "http://3.26.101.212:8000/generate"         # 청구항 초안 생성
ANALYZE_URL = "http://13.236.174.54:8000/analyze"             # 유사 특허 + 거절사유 분석

# ★ 여기 수정: httpx.Timeout은 4개 파라미터(connect/read/write/pool) 모두 지정 필요
TIMEOUT = httpx.Timeout(connect=20.0, read=60.0, write=20.0, pool=20.0)
HEADERS = {"Content-Type": "application/json"}

# =========================
# HTTP 유틸
# =========================
async def http_post(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as c:
        r = await c.post(url, json=payload)
        r.raise_for_status()
        return r.json()

async def http_get(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as c:
        r = await c.get(url, params=params)
        r.raise_for_status()
        return r.json()

# =========================
# 요청/상태 스키마
# =========================
class ChatRequest(BaseModel):
    session_id: str
    user_msg: str
    application_text: str = ""
    claims_text: str = ""
    forced_intent: Optional[str] = None  # "validate_doc" 등 강제

class BotState(TypedDict, total=False):
    # 입력/맥락
    user_msg: str
    application_text: str
    claims_text: str
    forced_intent: Optional[str]

    # 의도/결과
    intent: Optional[str]
    results: Dict[str, Any]
    final_answer: str

    # 대화 히스토리
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
# 분류 노드 (규칙 우선, 한글 키워드 강화)
# =========================
VALIDATE_KEYWORDS = [
    "문제점", "문제", "오류", "에러", "검토", "확인", "체크", "점검",
    "유효성", "validation", "validate", "형식", "문맥", "누락", "오탈자"
]
SIMILAR_KEYWORDS = ["유사", "선행", "검색", "비슷한", "같은", "참고"]
CLAIM_KEYWORDS = ["청구항", "초안", "생성", "작성", "claim", "draft"]
REJECTION_KEYWORDS = ["거절", "통지", "거부", "rejection", "reject"]

async def node_classify(s: BotState) -> BotState:
    forced = s.get("forced_intent")
    if forced:
        s["intent"] = forced
        return s

    m = s.get("user_msg", "") or ""
    print(f"🔍 분류 중: '{m}'")

    if any(k in m for k in VALIDATE_KEYWORDS):
        s["intent"] = "validate_doc"
        print("✅ validate_doc로 분류됨")
    elif any(k in m for k in SIMILAR_KEYWORDS):
        s["intent"] = "similar_patent"
        print("✅ similar_patent로 분류됨")
    elif any(k in m for k in CLAIM_KEYWORDS):
        s["intent"] = "claim_draft"
        print("✅ claim_draft로 분류됨")
    elif any(k in m for k in REJECTION_KEYWORDS):
        s["intent"] = "rejection_draft"
        print("✅ rejection_draft로 분류됨")
    else:
        s["intent"] = "small_talk"
        print("✅ small_talk로 분류됨")
    return s

# =========================
# analyze 페이로드 헬퍼 (main.py의 extract_text_from_json 기대 스키마)
# =========================
def build_analyze_payload(s: BotState) -> Dict[str, Any]:
    app_text = (s.get("application_text") or "").strip()
    claims_text = (s.get("claims_text") or "").strip()
    return {
        "title": "출원문 자동 분석",
        "summary": (s.get("user_msg") or "").strip(),
        "applicationContent": app_text,
        "claims": (
            [{"claimNumber": 1, "claimType": "independent", "claimText": claims_text}]
            if claims_text else []
        ),
        # 필요 시 technicalField, backgroundTechnology 등 확장 가능
    }

# =========================
# 기능 노드
# =========================
async def node_validate(s: BotState) -> BotState:
    payload = {
        "title": "인공지능 특허 검색 시스템",
        "technicalField": "인공지능, 특허 검색",
        "backgroundTechnology": "기존 수동 검색 방식의 한계",
        "claims": [s.get("claims_text","")] if s.get("claims_text") else [],
        "inventionDetails": {
            "problemToSolve": "수동 검색의 비효율성",
            "solution": "AI 기반 자동 검색",
            "effect": "검색 효율성 향상"
        },
        "application_text": s.get("application_text",""),
    }
    try:
        result = await http_post(VALIDATE_URL, payload)
        print(f"🔍 AI 모델 응답(검증): {json.dumps(result, ensure_ascii=False)[:1000]}")
    except Exception as e:
        result = {"error": f"validation call failed: {e}"}
        print(f"❌ AI 모델 호출 실패(검증): {e}")

    s.setdefault("results", {})["validate_doc"] = result
    return s

async def node_similar_patent(s: BotState) -> BotState:
    payload = build_analyze_payload(s)
    try:
        full_result = await http_post(ANALYZE_URL, payload)
        print(f"✅ analyze 호출 성공: keys={list(full_result.keys())}")
        # main.py는 "similar_patents" 키로 반환
        if "similar_patents" in full_result:
            result = {
                "patents": full_result["similar_patents"],
                "extracted_from": "analyze_endpoint"
            }
        else:
            # 구조가 달라도 원본을 그대로 보관
            result = full_result
    except Exception as e:
        result = {"error": f"similar search failed: {e}"}
        print(f"❌ analyze 호출 실패(유사특허): {e}")

    s.setdefault("results", {})["similar_patent"] = result
    return s

async def node_claim_draft(s: BotState) -> BotState:
    payload = {
        "query": s.get("user_msg") or "발명 요약",
        "top_k": 5
    }
    try:
        result = await http_post(CLAIM_DRAFT_URL, payload)
    except Exception as e:
        result = {"error": f"claim draft failed: {e}"}
    s.setdefault("results", {})["claim_draft"] = result
    return s

async def node_rejection_draft(s: BotState) -> BotState:
    # 1) 유사 특허 (analyze)
    try:
        similar_patents_result = await http_post(ANALYZE_URL, build_analyze_payload(s))
        print(f"✅ analyze 호출 성공(거절사유): keys={list(similar_patents_result.keys())}")
    except Exception as e:
        similar_patents_result = {"error": f"similar search failed: {e}"}
        print(f"❌ analyze 호출 실패(거절사유): {e}")

    # 2) 형식/문맥 검증
    try:
        validation_payload = {
            "title": "인공지능 특허 검색 시스템",
            "technicalField": "인공지능, 특허 검색",
            "backgroundTechnology": "기존 수동 검색 방식의 한계",
            "claims": [s.get("claims_text","")] if s.get("claims_text") else [],
            "inventionDetails": {
                "problemToSolve": "수동 검색의 비효율성",
                "solution": "AI 기반 자동 검색",
                "effect": "검색 효율성 향상"
            },
            "application_text": s.get("application_text",""),
        }
        validation_result = await http_post(VALIDATE_URL, validation_payload)
        print(f"🔍 형식/문맥 검사 결과: {json.dumps(validation_result, ensure_ascii=False)[:1000]}")
    except Exception as e:
        validation_result = {"error": f"validation failed: {e}"}
        print(f"❌ 형식/문맥 검사 실패: {e}")

    combined_result = {
        "similar_patents": similar_patents_result,
        "validation_errors": validation_result,
        "combined_analysis": {
            "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "analysis_type": "comprehensive_rejection_analysis"
        }
    }
    s.setdefault("results", {})["rejection_draft"] = combined_result
    return s

async def node_small_talk(s: BotState) -> BotState:
    s["final_answer"] = "안녕하세요! 특허 문서 점검, 유사특허 검색, 청구항 초안, 거절 사유 초안 중 무엇을 도와드릴까요?"
    return s

# =========================
# 결과 합성
# =========================
def summarize_validate(result: Dict[str, Any]) -> str:
    if "error" in result:
        return f"⚠️ 점검 API 호출 오류: {result['error']}"
    lines = ["[문서 점검 결과]", "원본 AI 모델 응답:", json.dumps(result, ensure_ascii=False, indent=2), "\n[사용자 친화적 요약]"]
    fmt = result.get("formatErrors") or []
    ctx = result.get("contextualErrors") or []
    miss = result.get("missingSections") or []
    if not fmt and not ctx and not miss:
        lines.append("• 뚜렷한 형식/문맥 오류가 발견되지 않았습니다.")
    else:
        if fmt:
            lines.append("• 형식 오류:")
            for e in fmt:
                lines.append(f"  - ({e.get('severity','')}) {e.get('message','')}")
        if ctx:
            lines.append("• 문맥/내용 오류:")
            for e in ctx:
                lines.append(f"  - {e.get('analysis','') or e.get('message','')}")
        if miss:
            lines.append("• 누락된 섹션:")
            for e in miss:
                lines.append(f"  - {e.get('message','') or e.get('field','')}")
    lines.append("\n다음 액션 제안: 1) 문제 문구/섹션 보완  2) 유사특허 검색으로 차별점 확인  3) 보완 후 재점검")
    return "\n".join(lines)

def summarize_similar(result: Dict[str, Any]) -> str:
    if "error" in result:
        return f"⚠️ 유사 특허 검색 오류: {result['error']}"
    lines = ["[유사 특허 검색 결과]", "원본 AI 모델 응답:", json.dumps(result, ensure_ascii=False, indent=2), "\n[사용자 친화적 요약]"]
    patents = result.get("patents") or []
    if not patents:
        lines.append("• 유사한 특허를 찾지 못했습니다.")
    else:
        lines.append(f"• 발견된 유사 특허 {len(patents)}개:")
        for i, patent in enumerate(patents[:5], 1):
            lines.append(f"  - {i}. {patent.get('title', '제목 없음')}")
            lines.append(f"    유사도: {patent.get('similarity', patent.get('score', 'N/A'))}")
            if patent.get('abstract'):
                lines.append(f"    요약: {patent.get('abstract', '')[:100]}...")
    return "\n".join(lines)

def summarize_claim_draft(result: Dict[str, Any]) -> str:
    if "error" in result:
        return f"⚠️ 청구항 초안 생성 오류: {result['error']}"
    claims = result.get("claims") or []
    lines = ["[청구항 초안 생성 결과]"]
    if not claims:
        lines.append("• 청구항 초안을 생성하지 못했습니다.")
    else:
        for i, claim in enumerate(claims, 1):
            lines.append(f"• 청구항 {i}: {claim}")
    return "\n".join(lines)

def summarize_rejection(result: Dict[str, Any]) -> str:
    if "error" in result:
        return f"⚠️ 거절사유 종합 분석 오류: {result['error']}"
    lines = ["[거절사유 종합 분석 결과]", "원본 AI 모델 응답:", json.dumps(result, ensure_ascii=False, indent=2), "\n[사용자 친화적 요약]"]
    similar_patents = result.get("similar_patents", {})
    if "error" in similar_patents:
        lines.append("• 유사 특허 검색 실패")
    else:
        patents = similar_patents.get("patents") or similar_patents.get("similar_patents") or []
        if patents:
            lines.append("• 발견된 유사 특허:")
            for i, patent in enumerate(patents[:3], 1):
                score = patent.get('similarity', patent.get('score', 'N/A'))
                lines.append(f"  - {i}. {patent.get('title', '제목 없음')} (유사도: {score})")
        else:
            lines.append("• 유사한 특허를 찾지 못했습니다.")

    validation_errors = result.get("validation_errors", {})
    if "error" in validation_errors:
        lines.append("• 형식/문맥 오류 검사 실패")
    else:
        fmt_errors = validation_errors.get("formatErrors") or []
        ctx_errors = validation_errors.get("contextualErrors") or []
        miss_sections = validation_errors.get("missingSections") or []
        if fmt_errors or ctx_errors or miss_sections:
            lines.append("• 발견된 문서 오류:")
            if fmt_errors:
                lines.append("  - 형식 오류:")
                for e in fmt_errors[:3]:
                    lines.append(f"    * {e.get('message', '')}")
            if ctx_errors:
                lines.append("  - 문맥 오류:")
                for e in ctx_errors[:3]:
                    lines.append(f"    * {e.get('analysis', '') or e.get('message', '')}")
            if miss_sections:
                lines.append("  - 누락된 섹션:")
                for e in miss_sections[:3]:
                    lines.append(f"    * {e.get('message', '')}")
        else:
            lines.append("• 뚜렷한 문서 오류가 발견되지 않았습니다.")

    lines.append("\n[종합 거절사유 제안]")
    has_similar = similar_patents and "error" not in similar_patents and (similar_patents.get("patents") or similar_patents.get("similar_patents"))
    has_errors = validation_errors and "error" not in validation_errors and (
        validation_errors.get("formatErrors") or validation_errors.get("contextualErrors") or validation_errors.get("missingSections")
    )
    if has_similar and has_errors:
        lines.append("• 선행기술에 의한 거절 + 문서 형식/문맥 오류")
    elif has_similar:
        lines.append("• 선행기술에 의한 거절")
    elif has_errors:
        lines.append("• 문서 형식/문맥 오류로 인한 거절")
    else:
        lines.append("• 현재로서는 명확한 거절사유가 발견되지 않았습니다.")
    return "\n".join(lines)

async def node_synthesize(s: BotState) -> BotState:
    intent = s.get("intent")
    resmap = s.get("results", {})
    if intent == "validate_doc":
        s["final_answer"] = summarize_validate(resmap.get("validate_doc", {}))
    elif intent == "similar_patent":
        s["final_answer"] = summarize_similar(resmap.get("similar_patent", {}))
    elif intent == "claim_draft":
        s["final_answer"] = summarize_claim_draft(resmap.get("claim_draft", {}))
    elif intent == "rejection_draft":
        s["final_answer"] = summarize_rejection(resmap.get("rejection_draft", {}))
    elif intent == "small_talk" and s.get("final_answer"):
        pass
    else:
        s["final_answer"] = "요청을 처리했습니다."
    s.setdefault("history", []).append({"user": s.get("user_msg",""), "bot": s["final_answer"]})
    return s

# =========================
# LangGraph 구성
# =========================
graph = StateGraph(BotState)
graph.add_node("classify", node_classify)
graph.add_node("validate_doc", node_validate)
graph.add_node("similar_patent", node_similar_patent)
graph.add_node("claim_draft", node_claim_draft)
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
        "claim_draft": "claim_draft",
        "rejection_draft": "rejection_draft",
        "small_talk": "small_talk",
    },
)
graph.add_edge("validate_doc", "synthesize")
graph.add_edge("similar_patent", "synthesize")
graph.add_edge("claim_draft", "synthesize")
graph.add_edge("rejection_draft", "synthesize")
graph.add_edge("small_talk", "synthesize")
graph.add_edge("synthesize", END)

app_graph = graph.compile()

# =========================
# FastAPI
# =========================
app = FastAPI(title="LangGraph Patent Chatbot")

# CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 인메모리 세션 저장
SESSIONS: Dict[str, BotState] = {}

@app.get("/health")
async def health():
    return {"ok": True, "validate_url": VALIDATE_URL is not None}

@app.post("/chat", response_class=PlainTextResponse)
async def chat(req: ChatRequest):
    """
    body:
    {
      "session_id": "u1",
      "user_msg": "...",
      "application_text": "...",
      "claims_text": "...",
      "forced_intent": "rejection_draft"  # 옵션
    }
    """
    try:
        print(f"📨 요청 받음: session_id={req.session_id}, user_msg='{req.user_msg}'")
        state: BotState = SESSIONS.get(req.session_id) or new_state()

        # 최신 입력 반영
        state["user_msg"] = req.user_msg
        state["application_text"] = req.application_text
        state["claims_text"] = req.claims_text
        state["forced_intent"] = req.forced_intent

        # 그래프 실행
        final: BotState = await app_graph.ainvoke(state)

        # 세션 저장
        SESSIONS[req.session_id] = final

        answer = final.get("final_answer", "응답을 생성하지 못했습니다.")
        print(f"💬 응답: {answer[:200]}...")
        return answer
    except Exception as e:
        print(f"❌ 오류: {str(e)}")
        return f"오류가 발생했습니다: {str(e)}"
