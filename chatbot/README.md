# LangGraph Patent Chatbot

LangGraph 기반의 특허 도우미 챗봇입니다. 사용자 질문을 분석하여 적절한 AI 서비스를 호출하고 결과를 종합하여 답변합니다.

## 🚀 기능

- **의도 분류**: GPT가 사용자 요청을 분석하여 적절한 기능 선택
- **문서 검증**: 형식/문맥 오류 점검
- **유사 특허 검색**: 관련 특허 검색
- **청구항 초안 생성**: AI 기반 청구항 작성
- **거절사유 초안 생성**: 거절사유 작성 지원
- **결과 종합**: GPT가 모든 결과를 종합하여 구조화된 답변 생성

## 📋 요구사항

- Python 3.8+
- OpenAI API Key
- 백엔드 서버 (Spring Boot) 실행 중

## 🛠️ 설치

1. **의존성 설치**:
```bash
pip install -r requirements.txt
```

2. **환경 변수 설정**:
```bash
# .env 파일 생성 (env.example.txt 참고)
cp env.example.txt .env
# OPENAI_API_KEY 설정
```

## 🏃‍♂️ 실행

### 1. 백엔드 서버 실행
```bash
cd ../backend
./gradlew bootRun
```

### 2. 챗봇 서버 실행
```bash
python run_chatbot.py
```

### 3. 테스트 실행
```bash
python test_chatbot.py
```

## 📖 API 사용법

### 채팅 API
```bash
POST http://localhost:8000/chat
```

**요청 예시**:
```json
{
  "user_msg": "이 특허 명세서에 형식 오류가 있는지 확인해줘",
  "application_text": "본 발명은 인공지능을 이용한 특허 검색 시스템에 관한 것이다.",
  "claims_text": "1. 인공지능을 이용한 특허 검색 시스템으로서...",
  "prior_arts": [],
  "forced_intent": null
}
```

**응답 예시**:
```json
{
  "intent": "validate_doc",
  "final_answer": "문서 검증 결과를 확인했습니다...",
  "results": {
    "validate_doc": {
      "errors": [],
      "warnings": ["청구항 1의 기술적 특징이 명확하지 않습니다."]
    }
  }
}
```

## 🔧 백엔드 연동

챗봇은 다음 백엔드 API들과 연동됩니다:

- **문서 검증**: `POST /api/ai/validations`
- **유사 특허 검색**: `GET /api/search/similar`
- **청구항 초안**: `POST /api/ai/drafts/claims`
- **거절사유 초안**: `POST /api/ai/drafts/rejections`

## 📊 워크플로우

1. **사용자 질문 입력** → 챗봇이 의도 분석
2. **의도에 따른 API 호출** → 백엔드 AI 서비스 실행
3. **결과 수집** → 각 서비스의 결과를 수집
4. **GPT 종합** → 모든 결과를 종합하여 구조화된 답변 생성
5. **사용자에게 응답** → 최종 답변 전달

## 🎯 지원하는 의도

- `validate_doc`: 문서 오류 점검
- `similar_patent`: 유사 특허 검색
- `claim_draft`: 청구항 초안 생성
- `rejection_draft`: 거절사유 초안 생성
- `small_talk`: 일반 대화/요약

## 🔍 디버깅

- **API 문서**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **로그 확인**: 서버 실행 시 상세 로그 출력

## 📝 주의사항

- OpenAI API Key가 필요합니다
- 백엔드 서버가 실행 중이어야 합니다
- 네트워크 연결이 안정적이어야 합니다
