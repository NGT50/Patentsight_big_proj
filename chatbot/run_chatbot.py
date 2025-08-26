# run_chatbot.py
#!/usr/bin/env python3
import uvicorn

if __name__ == "__main__":
    print("🚀 LangGraph Patent Chatbot 시작")
    print("📖 Health: http://127.0.0.1:58080/health")
    print("💬 Chat:   http://127.0.0.1:58080/chat")
    uvicorn.run("server_langgraph:app", host="127.0.0.1", port=58080, reload=False, log_level="info")
