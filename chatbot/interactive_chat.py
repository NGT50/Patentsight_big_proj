#!/usr/bin/env python3
"""
대화형 특허 챗봇 테스트 스크립트
"""
import asyncio
import httpx
import json
import os

class InteractiveChatbot:
    def __init__(self):
        self.session_id = f"user_{os.getpid()}_{int(asyncio.get_event_loop().time())}"
        self.base_url = "http://localhost:58080"
        self.application_text = ""
        self.claims_text = ""
        
    async def send_message(self, message: str) -> str:
        """챗봇에 메시지 전송"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat",
                    json={
                        "session_id": self.session_id,
                        "user_msg": message,
                        "application_text": self.application_text,
                        "claims_text": self.claims_text
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.text
                else:
                    return f"❌ 오류: {response.status_code} - {response.text}"
                    
            except Exception as e:
                return f"❌ 네트워크 오류: {str(e)}"
    
    def set_document_content(self, application_text: str = "", claims_text: str = ""):
        """문서 내용 설정"""
        self.application_text = application_text
        self.claims_text = claims_text
        print("📄 문서 내용이 설정되었습니다.")
    
    def show_presets(self):
        """프리셋 메뉴 표시"""
        print("\n" + "="*50)
        print("📋 프리셋 메뉴")
        print("="*50)
        print("1. 문서 점검 테스트 (오타 포함)")
        print("2. 유사 특허 검색")
        print("3. 청구항 초안 생성")
        print("4. 거절사유 분석")
        print("5. 직접 입력")
        print("0. 종료")
        print("="*50)
    
    def get_preset_data(self, choice: str):
        """프리셋 데이터 반환"""
        presets = {
            "1": {
                "name": "문서 점검 테스트",
                "message": "내 서류에 문제 있는지 확인해줘",
                "application": "본 발명은 인공지눙을 이용한 특허 검색 시스템에 관한 것이다. 이 시스템은 기존의 수동 검색 방식의 한계를 극복하고, 대용량 특허 데이터베이스에서 관련 특허를 효율적으로 찾아내는 것을 목적으로 한다. 배경기술 섹션이 누락되어 있고, 기술적 효과가 명확하지 않으며, 청구항의 구성요소가 불완전하다.",
                "claims": "1. 인공지눙을 이용한 특허 검색 시스템으로서, 검색 엔진과 데이터베이스를 포함하는 시스템. 2. 전항의 시슈템에 있어서, 머신러닝 알고리즘을 사용하는 것을 특징으로 하는 시스템."
            },
            "2": {
                "name": "유사 특허 검색",
                "message": "인공지능 특허 검색과 관련된 유사 특허를 찾아줘",
                "application": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다. 이 시스템은 딥러닝 알고리즘을 사용하여 특허 문서의 의미를 분석하고, 사용자의 검색 의도를 이해하여 관련성 높은 특허를 추천하는 기능을 제공한다.",
                "claims": "1. 인공지능을 이용한 특허 검색 시스템으로서, 딥러닝 모델과 검색 엔진을 포함하는 시스템."
            },
            "3": {
                "name": "청구항 초안 생성",
                "message": "인공지능 특허 검색 시스템에 대한 청구항을 작성해줘",
                "application": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다. 이 시스템은 자연어 처리 기술을 활용하여 사용자의 검색 쿼리를 분석하고, 벡터 유사도 계산을 통해 관련 특허를 찾아내는 기능을 제공한다.",
                "claims": ""
            },
            "4": {
                "name": "거절사유 분석",
                "message": "이 특허에 대한 거절사유를 분석해줘",
                "application": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다.",
                "claims": "1. 인공지능을 이용한 특허 검색 시스템."
            }
        }
        return presets.get(choice)

async def main():
    print("🤖 특허 챗봇 대화형 테스트")
    print("="*50)
    
    chatbot = InteractiveChatbot()
    
    while True:
        chatbot.show_presets()
        choice = input("\n선택하세요 (0-5): ").strip()
        
        if choice == "0":
            print("👋 종료합니다.")
            break
        
        elif choice in ["1", "2", "3", "4"]:
            preset = chatbot.get_preset_data(choice)
            if preset:
                print(f"\n📋 {preset['name']} 프리셋을 로드합니다.")
                chatbot.set_document_content(preset['application'], preset['claims'])
                
                print(f"\n💬 메시지: {preset['message']}")
                print("🤖 챗봇 응답:")
                print("-" * 50)
                
                response = await chatbot.send_message(preset['message'])
                print(response)
                print("-" * 50)
        
        elif choice == "5":
            print("\n📝 직접 입력 모드")
            print("명세서 내용을 입력하세요 (엔터로 건너뛰기):")
            application = input().strip()
            
            print("청구항 내용을 입력하세요 (엔터로 건너뛰기):")
            claims = input().strip()
            
            chatbot.set_document_content(application, claims)
            
            while True:
                message = input("\n💬 메시지를 입력하세요 (종료: 'quit'): ").strip()
                if message.lower() in ['quit', 'exit', '종료']:
                    break
                
                if message:
                    print("🤖 챗봇 응답:")
                    print("-" * 50)
                    response = await chatbot.send_message(message)
                    print(response)
                    print("-" * 50)
        
        else:
            print("❌ 잘못된 선택입니다. 다시 선택해주세요.")

if __name__ == "__main__":
    print("🚀 챗봇 서버가 실행 중인지 확인하세요: http://localhost:58080")
    print("⚠️  서버가 실행되지 않았다면: cd chatbot && python run_chatbot.py")
    print()
    
    asyncio.run(main())
