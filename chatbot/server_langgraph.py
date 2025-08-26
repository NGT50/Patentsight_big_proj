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
# 실제 AI 모델 서버 주소들 (환경변수 기반)
VALIDATE_URL   = os.getenv("VALIDATE_URL")     # 형식/문맥 오류 탐지
CLAIM_DRAFT_URL = os.getenv("CLAIM_DRAFT_URL") # 청구항 초안 생성
SIMILAR_URL    = os.getenv("SIMILAR_URL")      # 유사 특허 검색
REJECTION_URL  = os.getenv("REJECTION_URL")    # 거절사유 초안 생성 (JSON)
REJECTION_TXT_URL = os.getenv("REJECTION_TXT_URL")  # 거절사유 초안 생성 (텍스트)
 
TIMEOUT = httpx.Timeout(connect=30.0, read=600.0, write=30.0, pool=30.0)
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
    forced_intent: Optional[str] = None
 
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
# 분류 노드
# =========================
VALIDATE_KEYWORDS = ["문제점","문제","오류","에러","검토","확인","체크","점검","validation","validate","형식","문맥","누락","오탈자"]
SIMILAR_KEYWORDS  = ["유사","선행","검색","비슷한","같은","참고"]
CLAIM_KEYWORDS    = ["청구항","초안","생성","작성","claim","draft"]
REJECTION_KEYWORDS= ["거절","통지","거부","rejection","reject"]
 
async def node_classify(s: BotState) -> BotState:
    forced = s.get("forced_intent")
    if forced:
        s["intent"] = forced
        return s
    m = s.get("user_msg","") or ""
    if any(k in m for k in VALIDATE_KEYWORDS):
        s["intent"] = "validate_doc"
    elif any(k in m for k in SIMILAR_KEYWORDS):
        s["intent"] = "similar_patent"
    elif any(k in m for k in CLAIM_KEYWORDS):
        s["intent"] = "claim_draft"
    elif any(k in m for k in REJECTION_KEYWORDS):
        s["intent"] = "rejection_draft"
    else:
        s["intent"] = "small_talk"
    return s
 
# =========================
# 기능 노드
# =========================
async def node_validate(s: BotState) -> BotState:
    payload = {
        "title": "인공지능 특허 검색 시스템",
        "technicalField": "인공지능, 특허 검색",
        "backgroundTechnology": "기존 수동 검색 방식의 한계",
        "claims": [s.get("claims_text","")] if s.get("claims_text") else [],
        "application_text": s.get("application_text",""),
    }
    try:
        print("📨 node_validate 실행됨, payload:", payload)   # 디버깅 로그
        result = await http_post(VALIDATE_URL, payload)
        print("✅ AI 모델 응답(검증):", result)  
    except Exception as e:
        result = {"error": f"validation call failed: {e}"}
        print("❌ AI 모델 호출 실패(검증):", e)
    s.setdefault("results", {})["validate_doc"] = result
    return s
 
async def node_similar_patent(s: BotState) -> BotState:
    params = {
        "query": s.get("application_text") or s.get("claims_text") or s.get("user_msg",""),
        "top_n": 5
    }
    try:
        print("📨 node_similar_patent 실행됨, params:", params)   # 디버깅 로그
        full_result = await http_get(SIMILAR_URL, params)
        print("✅ node_similar_patent response:", full_result)      # 성공 시 결과 로그
        
        patents = []
        for item in full_result:
            info = item.get("basicInfo", {})
            patents.append({
                "title": info.get("inventionTitle","제목 없음"),
                "abstract": info.get("astrtCont",""),
                "applicationNumber": info.get("applicationNumber",""),
                "ipcNumber": info.get("ipcNumber",""),
                "applicant": info.get("applicantName",""),
                "similarity": "N/A"
            })
        result = {"patents": patents}
    except Exception as e:
        result = {"error": f"similar search failed: {e}"}
        print("❌ similar search 호출 실패:", e)
    s.setdefault("results", {})["similar_patent"] = result
    return s
async def node_claim_draft(s: BotState) -> BotState:
    payload = {
        "query": s.get("user_msg") or "발명 요약",
        "top_k": 5
    }
    try:
        print("📨 claim_draft payload:", payload)
        result = await http_post(CLAIM_DRAFT_URL, payload)
        print("✅ claim_draft response:", result)
    except Exception as e:
        result = {"error": f"claim draft failed: {e}"}
        print("❌ claim draft 호출 실패:", e)
    s.setdefault("results", {})["claim_draft"] = result
    return s
 
async def node_rejection_draft(s: BotState) -> BotState:
    try:
        application_text = s.get("application_text", "")
        claims_text = s.get("claims_text", "")
        user_msg = s.get("user_msg", "")
        
        # 텍스트 입력이 있는 경우 /analyze-txt 사용
        if application_text or claims_text or user_msg:
            # 텍스트 형태로 결합
            combined_text = f"출원서: {application_text}\n청구항: {claims_text}\n사용자 요청: {user_msg}"
            
            payload = {
                "text": combined_text.strip()
            }
            
            print("📨 node_rejection_draft (텍스트) 실행됨, payload:", payload)
            print("🔄 서버 응답 대기 중...")
            rejection_result = await http_post(REJECTION_TXT_URL, payload)
            print("✅ rejection_draft (텍스트) response:", rejection_result)
        else:
            # 구조화된 JSON 형태로 전송
            payload = {
                "title": "특허 문서 분석",
                "technicalField": "특허 분석",
                "backgroundTechnology": "특허 문서 분석 시스템",
                "summary": user_msg if user_msg else "거절사유 분석 요청",
                "claims": [claims_text] if claims_text else [],
                "inventionDetails": {
                    "problemToSolve": "특허 문서의 거절 가능성 분석",
                    "solution": "AI 기반 거절사유 분석",
                    "effect": "정확한 거절사유 도출"
                },
                "application_text": application_text,
                "drawingDescription": "",
                "type": "PATENT"
            }
            
            print("📨 node_rejection_draft (JSON) 실행됨, payload:", payload)
            rejection_result = await http_post(REJECTION_URL, payload)
            print("✅ rejection_draft (JSON) response:", rejection_result)
            
    except httpx.ReadTimeout:
        rejection_result = {"error": "거절사유 분석 서버 응답 시간 초과 (5분). AI 모델 처리 중입니다. 잠시 후 다시 시도해주세요."}
        print("❌ rejection draft 타임아웃 발생")
    except httpx.ConnectTimeout:
        rejection_result = {"error": "거절사유 분석 서버 연결 시간 초과. 서버가 실행 중인지 확인해주세요."}
        print("❌ rejection draft 연결 타임아웃 발생")
    except Exception as e:
        rejection_result = {"error": f"rejection draft failed: {e}"}
        import traceback
        print("❌ rejection draft 호출 실패:", traceback.format_exc())

    s.setdefault("results", {})["rejection_draft"] = rejection_result
    return s
 
 
async def node_small_talk(s: BotState) -> BotState:
    s["final_answer"] = "안녕하세요! 특허 문서 점검, 유사특허 검색, 청구항 초안, 거절사유 초안 중 무엇을 도와드릴까요?"
    return s
 
# =========================
# 결과 합성
# =========================
def summarize_validate(result: Dict[str, Any]) -> str:
    print("📌 summarize_validate input:", result)  # 디버깅용 로그
    
    if not result:
        return "⚠️ 문서 점검 결과가 비어 있습니다."
    
    if "error" in result:
        return f"⚠️ 문서 점검 오류: {result['error']}"
    
    # 원본 AI 모델 응답 표시
    lines = ["[문서 점검 결과]"]
    lines.append(f"원본 AI 모델 응답: {json.dumps(result, ensure_ascii=False, indent=2)}")
    
    # 사용자 친화적 요약
    lines.append("\n[사용자 친화적 요약]")
    
    # 형식 오류
    format_errors = result.get("formatErrors", [])
    if format_errors:
        lines.append("• 형식 오류:")
        for error in format_errors:
            lines.append(f"  - {error.get('message', '')}")
    
    # 누락된 섹션
    missing_sections = result.get("missingSections", [])
    if missing_sections:
        lines.append("• 누락된 섹션:")
        for section in missing_sections:
            lines.append(f"  - {section.get('message', '')}")
    
    # 문맥 오류
    contextual_errors = result.get("contextualErrors", [])
    if contextual_errors:
        lines.append("• 문맥/내용 오류:")
        for error in contextual_errors:
            claim = error.get('claim', '')
            analysis = error.get('analysis', '')
            suggestion = error.get('suggestion', '')
            lines.append(f"  - {claim}: {analysis}")
            if suggestion:
                lines.append(f"    수정 제안: {suggestion}")
    
    if not format_errors and not missing_sections and not contextual_errors:
        lines.append("• 문서 점검이 완료되었습니다. 특별한 문제점이 발견되지 않았습니다.")
    
    return "\n".join(lines)
def summarize_similar(result: Dict[str, Any]) -> str:
    print("📌 summarize_similar input:", result)  # 디버깅용 로그
 
    if not result:
        return "⚠️ 유사 특허 검색 결과가 비어 있습니다."
 
    if "error" in result:
        return f"⚠️ 유사 특허 검색 오류: {result['error']}"
 
    patents = result.get("patents")
    if not patents and isinstance(result, list):
        # 혹시 node_similar_patent에서 변환 안 하고 배열 그대로 들어온 경우
        patents = result
 
    lines = ["[유사 특허 검색 결과]"]
    if not patents:
        lines.append("• 유사한 특허를 찾지 못했습니다.")
        return "\n".join(lines)
 
    lines.append(f"• 발견된 유사 특허 {len(patents)}개:")
    for i, patent in enumerate(patents[:5], 1):
        title = patent.get("title") or patent.get("inventionTitle") or "제목 없음"
        abstract = patent.get("abstract") or patent.get("astrtCont", "")
        lines.append(f"  - {i}. {title}")
        if abstract:
            lines.append(f"    요약: {abstract}")
 
    return "\n".join(lines)
def summarize_claim_draft(result: Dict[str, Any]) -> str:
    print("📌 summarize_claim_draft input:", result)  # 디버깅용 로그
    
    if not result:
        return "⚠️ 청구항 초안 생성 결과가 비어 있습니다."
    
    if "error" in result:
        return f"⚠️ 청구항 초안 생성 오류: {result['error']}"
    
    # 원본 AI 모델 응답 표시
    lines = ["[청구항 초안 생성 결과]"]
    lines.append(f"원본 AI 모델 응답: {json.dumps(result, ensure_ascii=False, indent=2)}")
    
    # 사용자 친화적 요약
    lines.append("\n[사용자 친화적 요약]")
    if isinstance(result, dict):
        if "claims" in result:
            lines.append("• 생성된 청구항:")
            for i, claim in enumerate(result["claims"], 1):
                lines.append(f"  - {i}. {claim}")
        elif "draft" in result:
            lines.append(f"• 청구항 초안: {result['draft']}")
        else:
            lines.append("• 청구항 초안이 생성되었습니다.")
    else:
        lines.append("• 청구항 초안이 생성되었습니다.")
    
    return "\n".join(lines)
def summarize_rejection(result: Dict[str, Any]) -> str:
    print("📌 summarize_rejection input:", result)  # 디버깅용 로그
    
    if not result:
        return "⚠️ 거절사유 분석 결과가 비어 있습니다."
    
    if "error" in result:
        return f"⚠️ 거절사유 분석 오류: {result['error']}"
    
    lines = ["🔍 [거절사유 분석 결과]"]
    
    if isinstance(result, dict):
        # 거절사유 분석
        if "rejection_reasons" in result and result["rejection_reasons"]:
            lines.append("🚨 발견된 거절사유:")
            for i, reason in enumerate(result["rejection_reasons"], 1):
                # JSON 형식 제거 및 텍스트 정리
                clean_reason = reason.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                lines.append(f"  {i}. {clean_reason}")
        
        # 유사 특허 정보
        if "similar_patents" in result and result["similar_patents"]:
            if isinstance(result["similar_patents"], list) and result["similar_patents"]:
                lines.append("\n📚 관련 유사 특허:")
                for i, patent in enumerate(result["similar_patents"][:5], 1):  # 상위 5개 표시
                    if isinstance(patent, dict):
                        app_num = patent.get("app_num", "번호 없음")
                        claim_num = patent.get("claim_num", "N/A")
                        lines.append(f"  {i}. 유사특허번호: {app_num}, 유사청구항: {claim_num}")
        
        # 매칭 쌍 정보 (상세하게)
        if "matches_with_pairs" in result and result["matches_with_pairs"]:
            lines.append("\n🔗 유사 특허 문장 비교:")
            for i, match in enumerate(result["matches_with_pairs"][:3], 1):  # 상위 3개만 표시
                if isinstance(match, dict) and "patent" in match and "matched_pairs" in match:
                    patent_info = match["patent"]
                    app_num = patent_info.get("app_num", "번호 없음")
                    claim_num = patent_info.get("claim_num", "N/A")
                    
                    lines.append(f"\n  📄 유사특허 {i}: {app_num} (청구항 {claim_num})")
                    
                    matched_pairs = match["matched_pairs"]
                    for j, pair in enumerate(matched_pairs[:2], 1):  # 각 특허당 상위 2개 쌍만 표시
                        if isinstance(pair, dict):
                            claim_sentence = pair.get("claim_sentence", "")
                            exam_sentence = pair.get("exam_sentence", "")
                            similarity = pair.get("similarity_percent", 0)
                            
                            # 텍스트 정리 (JSON 형식 제거)
                            claim_sentence = claim_sentence.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                            exam_sentence = exam_sentence.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                            
                            lines.append(f"    쌍 {j}:")
                            lines.append(f"      유사특허청구항: {claim_sentence[:150]}...")
                            lines.append(f"      심사서류청구항: {exam_sentence[:150]}...")
                            lines.append(f"      유사도: {similarity}%")
        
        # 검증 오류 정보
        if "validation_errors" in result and result["validation_errors"]:
            validation = result["validation_errors"]
            
            # 형식 오류
            format_errors = validation.get("formatErrors", [])
            if format_errors:
                lines.append("\n⚠️ 형식 오류:")
                for error in format_errors:
                    message = error.get('message', '')
                    message = message.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                    lines.append(f"  • {message}")
            
            # 누락된 섹션
            missing_sections = validation.get("missingSections", [])
            if missing_sections:
                lines.append("\n📝 누락된 섹션:")
                for section in missing_sections:
                    message = section.get('message', '')
                    message = message.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                    lines.append(f"  • {message}")
            
            # 문맥 오류
            contextual_errors = validation.get("contextualErrors", [])
            if contextual_errors:
                lines.append("\n🔍 문맥/내용 오류:")
                for error in contextual_errors:
                    claim = error.get('claim', '')
                    analysis = error.get('analysis', '')
                    suggestion = error.get('suggestion', '')
                    
                    # 텍스트 정리
                    analysis = analysis.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                    suggestion = suggestion.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                    
                    lines.append(f"  • {claim}: {analysis[:200]}...")  # 200자로 제한
                    if suggestion:
                        lines.append(f"    💡 수정 제안: {suggestion[:200]}...")  # 200자로 제한
        
        # 종합 분석
        if "combined_analysis" in result:
            lines.append("\n🎯 종합 거절사유 제안:")
            lines.append("위 분석 결과를 바탕으로 다음과 같은 거절사유를 고려해볼 수 있습니다:")
            
            # 거절사유가 있으면 표시
            if "rejection_reasons" in result and result["rejection_reasons"]:
                for reason in result["rejection_reasons"]:
                    clean_reason = reason.replace('\\n', '\n').replace('\\/', '/').replace('\\"', '"')
                    lines.append(f"  • {clean_reason}")
            else:
                lines.append("  • 문서 형식/문맥 오류로 인한 거절")
        
        # 분석 타임스탬프
        if "combined_analysis" in result and "timestamp" in result["combined_analysis"]:
            lines.append(f"\n⏰ 분석 시간: {result['combined_analysis']['timestamp']}")
        
        # 아무것도 없으면 기본 메시지
        if not any(key in result for key in ["rejection_reasons", "similar_patents", "matches_with_pairs", "validation_errors", "combined_analysis"]):
            lines.append("• 거절사유 분석이 완료되었습니다.")
    else:
        lines.append("• 거절사유 분석이 완료되었습니다.")
    
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
graph.add_conditional_edges("classify", lambda s: s.get("intent"), {
    "validate_doc": "validate_doc",
    "similar_patent": "similar_patent",
    "claim_draft": "claim_draft",
    "rejection_draft": "rejection_draft",
    "small_talk": "small_talk",
})
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
    return {"ok": True}
 
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
        return final.get("final_answer","응답을 생성하지 못했습니다.")
    except Exception as e:
        return f"오류가 발생했습니다: {str(e)}"
 