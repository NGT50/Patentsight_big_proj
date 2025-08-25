#!/usr/bin/env python3
import asyncio
import httpx
import os

BASE = os.getenv("CHAT_URL", "http://127.0.0.1:58080")

async def send(session_id, user_msg, app_text="", claims_text="", patent_id=None, file_id=None, forced_intent=None):
    async with httpx.AsyncClient(timeout=60.0) as c:
        r = await c.post(f"{BASE}/chat", json={
            "session_id": session_id,
            "user_msg": user_msg,
            "application_text": app_text,
            "claims_text": claims_text,
            "patent_id": patent_id,
            "file_id": file_id,
            "forced_intent": forced_intent
        })
        return r.text

async def main():
    sid = "demo"
    print("🤖 프리셋 테스트")
    # 1) 유사특허
    print("\n[유사특허]")
    print(await send(sid, "현재 심사서류와 비슷한 유사특허 찾아줘",
                     app_text="본 발명은 인공지능을 이용한 특허 검색 시스템...",
                     claims_text="1. 인공지능을 이용한 특허 검색 시스템..."))
    # 2) 점검
    print("\n[문서 점검]")
    print(await send(sid, "문제 있는지 점검해줘",
                     app_text="절전 기능을 이용한 공기 살균 기능이 부가된 컴퓨터시스템...",
                     claims_text="청구항 1 ..."))
    # 3) 청구항 초안
    print("\n[청구항 초안]")
    print(await send(sid, "자율주행 차량 객체 인식 취약점 보완 장치에 대한 청구항 작성해줘"))
    # 4) 거절사유 (백엔드 초안 API 사용)
    print("\n[거절사유 초안(서버)]")
    print(await send(sid, "거절 사유 초안 만들어줘", patent_id=2, file_id=1))

if __name__ == "__main__":
    asyncio.run(main())
