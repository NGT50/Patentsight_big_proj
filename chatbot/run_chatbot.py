# run_chatbot.py
#!/usr/bin/env python3
import uvicorn

if __name__ == "__main__":
    print("🚀 LangGraph Patent Chatbot 시작")
    print("📖 Health: http://0.0.0.0:58080/health")
    print("💬 Chat:   http://0.0.0.0:58080/chat")
    uvicorn.run("server_langgraph:app", host="0.0.0.0", port=58080, reload=False, log_level="info")
