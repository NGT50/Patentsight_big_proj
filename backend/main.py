from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import datetime
import random
import os
from uuid import uuid4

# --- LangChain 및 LangGraph 관련 라이브러리 import ---
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, BaseMessage, ToolMessage
# [수정 1] langgraph.prebuilt에서 ToolExecutor를 가져옵니다.
from langgraph.prebuilt import ToolExecutor
from langgraph.graph import StateGraph, END
from utils import AgentState, tools, validate_document_from_json, generate_full_draft_from_title, parse_pdf_to_json

# --- Pydantic 모델 정의 ---
class InventionDetails(BaseModel):
    problemToSolve: Optional[str] = None
    solution: Optional[str] = None
    effect: Optional[str] = None

class PatentCreateSchema(BaseModel):
    title: str
    type: Optional[str] = "PATENT"
    # (이하 Pydantic 모델은 기존과 동일)
    technicalField: Optional[str] = None
    backgroundTechnology: Optional[str] = None
    summary: Optional[str] = None
    drawingDescription: Optional[str] = None
    claims: Optional[List[str]] = None
    inventionDetails: Optional[InventionDetails] = None

class ChatSessionCreate(BaseModel):
    patentId: str

class ChatMessageCreate(BaseModel):
    content: str

# --- FastAPI 앱 생성 및 설정 ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# --- 임시 인메모리 데이터베이스 ---
db = {}
chat_sessions = {}

# --- LangGraph AI 에이전트 설정 ---
# [중요] OpenAI API 키 설정
os.environ["OPENAI_API_KEY"] = "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" # 실제 키로 교체해주세요

llm = ChatOpenAI(model="gpt-4.1")

# [수정 2] create_tool_executor 함수 대신 ToolExecutor 클래스를 사용합니다.
tool_executor = ToolExecutor(tools)



# --- Graph의 각 '노드(Node)' 함수 정의 ---
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert patent examiner assistant. Your goal is to help users review and improve their patent applications. "
            "When you use a tool, you must analyze the tool's output and then provide a clear, summarized, and helpful response to the user in Korean. "
            "Do not just state the raw tool output. Explain what the findings mean."
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)
chain = prompt | llm.bind_tools(tools)

def agent_node(state: AgentState):
    print("\n--- [Agent Node START] ---")
    print("Agent가 받은 메시지 기록:")
    # 현재까지의 대화 기록을 모두 출력
    for msg in state["messages"]:
        print(f"- Type: {type(msg).__name__}, Content: {msg.content}")
        if hasattr(msg, 'tool_calls') and msg.tool_calls:
            print(f"  Tool Calls: {msg.tool_calls}")

    # LLM을 호출하여 다음 행동을 결정
    response = chain.invoke({"messages": state["messages"]})
    
    print("\nAgent의 결정 (LLM 출력 객체):")
    # LLM이 어떤 결정을 내렸는지 객체 전체를 자세히 출력
    print(response)
    print("--- [Agent Node END] ---\n")
    return {"messages": [response]}

# [수정 3] tool_node 로직을 ToolExecutor에 맞게 훨씬 간결하게 수정합니다.
def tool_node(state: AgentState):
    print("\n--- [Tool Node START] ---")
    last_message = state["messages"][-1]
    tool_calls = last_message.tool_calls

    if not tool_calls:
        print("도구 호출이 없어 Tool Node를 스킵합니다.")
        print("--- [Tool Node END] ---\n")
        return {}

    patent_document = state["patent_document"]
    responses = []
    for call in tool_calls:
        tool_name = call["name"]
        tool_args = call["args"]
        
        # 주입 전 AI가 생성한 인자를 그대로 출력
        print(f"AI가 요청한 도구: {tool_name}, AI가 생성한 인자: {tool_args}")
        
        # 필수 재료(patent_document)를 추가
        tool_args['patent_document'] = patent_document
        print(f"실제 실행될 도구: {tool_name}, 최종 전달 인자: {tool_args}")

        # 도구 이름에 맞는 함수를 직접 찾아 실행
        selected_tool = next((t for t in tools if t.name == tool_name), None)
        
        if selected_tool:
            try:
                result = selected_tool.invoke(tool_args)
                print(f"'{tool_name}' 도구 실행 결과: {result}")
            except Exception as e:
                result = f"도구 실행 중 에러 발생: {e}"
                print(result)
        else:
            result = "오류: 알 수 없는 도구입니다."
            print(result)
        
        responses.append(result)

    tool_messages = [
        ToolMessage(content=str(res), tool_call_id=call["id"])
        for res, call in zip(responses, tool_calls)
    ]
    print(f"\nTool Node가 다음 Agent Node로 전달할 메시지:")
    print(tool_messages)
    print("--- [Tool Node END] ---\n")
    return {"messages": tool_messages}

# --- Graph의 '엣지(Edge)' 및 조립 (기존과 동일) ---
def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "end"
    else:
        return "continue"

workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("action", tool_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {"continue": "action", "end": END})
workflow.add_edge("action", "agent")
app_graph = workflow.compile()

# --- 기존 API 엔드포인트들 (이하 코드는 변경 없음) ---

@app.get("/")
def read_root():
    return {"message": "특허 어시스턴트 AI API 서버"}

@app.post("/api/patents/parse-pdf")
async def parse_patent_from_pdf_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        return parse_pdf_to_json(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/validations")
async def validate_patent_document_endpoint(document_data: Dict):
    try:
        return validate_document_from_json(document_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patents")
async def create_new_patent(patent_data: PatentCreateSchema):
    new_patent_id = str(random.randint(1000, 9999))
    new_patent_data = patent_data.dict()
    new_patent_data['status'] = 'DRAFT'
    db[new_patent_id] = new_patent_data
    return {"patentId": new_patent_id, "status": "DRAFT", "title": new_patent_data['title']}

@app.post("/api/patents/{patent_id}/submit")
async def submit_patent_application(patent_id: str):
    if patent_id not in db:
        raise HTTPException(status_code=404, detail="Patent not found")
    patent_data = db[patent_id]
    patent_data['status'] = 'SUBMITTED'
    current_year = datetime.datetime.now().year
    application_number = f"10-{current_year}-{random.randint(100000, 999999)}"
    patent_data['applicationNumber'] = application_number
    return {"status": patent_data['status'], "applicationNumber": patent_data['applicationNumber']}

@app.get("/api/patents/{patent_id}/document/latest")
async def get_latest_patent_document(patent_id: str):
    document_content = db.get(patent_id)
    if document_content:
        return {"versionNo": 1, "document": document_content, "updatedAt": datetime.datetime.now().isoformat()}
    else:
        return {"versionNo": 1, "document": {"patentId": patent_id, "title": "새 문서", "claims": [''], "inventionDetails": {}}, "updatedAt": datetime.datetime.now().isoformat()}

@app.get("/api/patents/my")
async def get_my_patents():
    patent_list = []
    for patent_id, content in db.items():
        patent_list.append({
            "patentId": patent_id, "title": content.get("title", "제목 없음"),
            "status": content.get("status", "DRAFT"), "inventor": content.get("inventor", "N/A"),
            "applicationNumber": content.get("applicationNumber"), "applicationDate": content.get("applicationDate"),
            "ipc": content.get("ipc", "N/A"), "cpc": content.get("cpc", "N/A"),
            "summary": content.get("summary", "요약 정보가 없습니다."),
        })
    return patent_list

@app.patch("/api/patents/{patent_id}/document")
async def update_patent_document_endpoint(patent_id: str, document_data: PatentCreateSchema):
    if patent_id not in db:
        raise HTTPException(status_code=404, detail="Patent not found")
    current_status = db[patent_id].get('status', 'DRAFT')
    updated_data = document_data.dict()
    updated_data['status'] = current_status
    db[patent_id] = updated_data
    return {"message": "Update successful", "updated_at": datetime.datetime.now().isoformat()}

@app.post("/api/ai/draft/full-document")
async def generate_full_patent_draft(request_data: Dict):
    title = request_data.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="title is required")
    try:
        return generate_full_draft_from_title(title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 초안 생성 실패: {str(e)}")

# --- 신규 AI 챗봇 API 엔드포인트 (변경 없음) ---

@app.post("/api/ai/chat/sessions", status_code=201)
async def create_chat_session(data: ChatSessionCreate):
    patent_id = data.patentId
    if patent_id not in db:
        raise HTTPException(status_code=404, detail="해당 특허 문서를 찾을 수 없습니다.")
    session_id = str(uuid4())
    initial_state = AgentState(
        messages=[HumanMessage(content="안녕하세요! 이 특허 문서 검토를 도와주세요.")],
        patent_document=db[patent_id]
    )
    chat_sessions[session_id] = initial_state
    print(f"--- 새 채팅 세션 생성: {session_id} (특허 ID: {patent_id}) ---")
    return {"sessionId": session_id}

@app.post("/api/ai/chat/sessions/{session_id}/messages")
async def post_chat_message(session_id: str, message: ChatMessageCreate):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="채팅 세션을 찾을 수 없습니다.")
    
    current_state = chat_sessions[session_id]
    current_state['messages'].append(HumanMessage(content=message.content))
    
    print(f"\n{'='*20} 새로운 요청 시작 {'='*20}")
    print(f"세션 '{session_id}'에 메시지 수신: {message.content}")
    print(">>> LangGraph 실행 시작...")
    
    final_state = app_graph.invoke(current_state)
    
    print("<<< LangGraph 실행 완료!")
    print("\n--- 최종 상태 (Final State) ---")
    print(final_state)
    
    ai_response = final_state['messages'][-1]
    
    print(f"\n--- 프론트엔드로 보낼 최종 응답 객체 ---")
    print(ai_response)
    print(f"--- 최종 응답의 content 속성 값: {ai_response.content} ---")
    print(f"{'='*20} 요청 처리 완료 {'='*20}\n")

    chat_sessions[session_id] = final_state
    
    return {"sender": "ai", "content": ai_response.content}