#!/usr/bin/env python3
"""
LangGraph Patent Chatbot 테스트 클라이언트
"""
import asyncio
import httpx
import json

async def test_chatbot():
    """챗봇 API 테스트"""
    
    # 테스트 케이스들
    test_cases = [
        {
            "name": "문서 검증 요청",
            "data": {
                "user_msg": "이 특허 명세서에 형식 오류가 있는지 확인해줘",
                "application_text": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다.",
                "claims_text": "1. 인공지능을 이용한 특허 검색 시스템으로서..."
            }
        },
        {
            "name": "유사 특허 검색",
            "data": {
                "user_msg": "인공지능 특허 검색과 관련된 유사 특허를 찾아줘",
                "application_text": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다."
            }
        },
        {
            "name": "청구항 초안 생성",
            "data": {
                "user_msg": "인공지능 특허 검색 시스템에 대한 청구항을 작성해줘",
                "application_text": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다."
            }
        },
        {
            "name": "일반 대화",
            "data": {
                "user_msg": "안녕하세요! 특허 도우미입니다."
            }
        }
    ]
    
    async with httpx.AsyncClient() as client:
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{'='*50}")
            print(f"테스트 {i}: {test_case['name']}")
            print(f"{'='*50}")
            
            try:
                response = await client.post(
                    "http://localhost:8000/chat",
                    json=test_case["data"],
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ 성공!")
                    print(f"의도: {result.get('intent', 'N/A')}")
                    print(f"답변: {result.get('final_answer', 'N/A')}")
                    print(f"결과: {json.dumps(result.get('results', {}), ensure_ascii=False, indent=2)}")
                else:
                    print(f"❌ 실패: {response.status_code}")
                    print(f"응답: {response.text}")
                    
            except Exception as e:
                print(f"❌ 오류: {str(e)}")
            
            print(f"\n{'='*50}")

if __name__ == "__main__":
    print("🧪 LangGraph Patent Chatbot 테스트 시작")
    print("⚠️  백엔드 서버(localhost:8080)가 실행 중인지 확인하세요!")
    print("⚠️  OPENAI_API_KEY가 설정되어 있는지 확인하세요!")
    print()
    
    asyncio.run(test_chatbot())
