# API 정의서

## 1. Auth (회원가입 / 로그인)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| SignUpApplicant | POST | /api/users/applicant | `{"username":"applicant1","password":"pw1234","name":"홍길동","birthDate":"1990-01-01","email":"hong@example.com"}` | `{"userId":1,"username":"applicant1","role":"APPLICANT"}` |
| SignUpExaminer | POST | /api/users/examiner | `{"username":"examiner1","password":"pw1234","name":"이심사","birthDate":"1985-05-01","department":"전기"}` | `{"userId":10,"username":"examiner1","role":"EXAMINER"}` |
| Login | POST | /api/users/login | `{"username":"applicant1","password":"pw1234"}` | `{"token":"jwt-token","userId":1,"username":"applicant1","role":"APPLICANT"}` |
| Verify Examiner | POST | /api/users/verify-code | `{"authCode":"ABC123"}` | `{"verified":true}` |

## 2. Patents (출원 관리)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- |
| Create Patent | POST | /api/patents | `{"title":"스마트 전구","applicantId":1,"ipc":"H01L","summary":"LED 제어"}` | `{"id":1,"title":"스마트 전구","status":"DRAFT"}` | Authorization 필요 |
| Get Patent Detail | GET | /api/patents/{id} | – | `{"id":1,"title":"스마트 전구","status":"DRAFT"}` |  |
| Get My Patents | GET | /api/patents/my | – | `[{"id":1,"title":"스마트 전구"}]` | Authorization 필요 |
| Submit Patent | POST | /api/patents/{id}/submit | `{"submissionComment":"최종 제출"}` | `{"id":1,"status":"SUBMITTED"}` |  |
| Update Patent Status | PATCH | /api/patents/{id}/status | `{"status":"APPROVED"}` | `{"id":1,"status":"APPROVED"}` |  |
| Update Patent | PUT | /api/patents/{id} | `{"title":"업데이트된 전구","summary":"업데이트"}` | `{"id":1,"title":"업데이트된 전구"}` |  |
| Delete Patent | DELETE | /api/patents/{id} | – | 204 No Content |  |
| Get Document Versions | GET | /api/patents/{id}/document-versions | – | `[{"versionId":10,"versionNo":1}]` |  |
| Get Latest Document | GET | /api/patents/{id}/document/latest | – | `{"document":"특허 설명"}` |  |
| Update Document Content | PATCH | /api/patents/{id}/document | `{"document":"수정 내용"}` | `{"document":"수정 내용"}` | 임시 저장 |
| Create Document Version | POST | /api/patents/{id}/document-versions | `{"changeSummary":"초안"}` | `{"versionId":11,"versionNo":2}` | Authorization 필요 |
| Update Version Info | PATCH | /api/document-versions/{id} | `{"changeSummary":"오타 수정"}` | `{"versionId":11,"versionNo":2}` |  |
| Restore Document Version | POST | /api/document-versions/{id}/restore | – | `{"restored":true}` |  |
| Delete Document Version | DELETE | /api/document-versions/{id} | – | `{"deleted":true}` | 현재 버전 삭제 불가 |

## 3. Review (심사, 의견서)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Assign Reviewer | POST | /api/reviews/assign | `{"patentId":1,"examinerId":10}` | `{"reviewId":5,"status":"ASSIGNED"}` |
| Get Review List | GET | /api/reviews/list/{userId}?status= | – | `[{"reviewId":5,"patentTitle":"스마트 전구"}]` |
| Get Review Detail | GET | /api/reviews/{reviewId} | – | `{"reviewId":5,"comments":[]}` |
| Submit Review | POST | /api/reviews/submit | `{"reviewId":5,"result":"APPROVED"}` | `{"reviewId":5,"status":"COMPLETED"}` |
| Create Opinion Notice | POST | /api/reviews/{reviewId}/opinion-notices | `{"content":"보완 필요"}` | `{"noticeId":3,"content":"보완 필요"}` |
| Get Opinion Notices | GET | /api/reviews/{reviewId}/opinion-notices | – | `[{"noticeId":3,"content":"보완 필요"}]` |
| Get Dashboard | GET | /api/reviews/dashboard/{userId} | – | `{"pending":2,"completed":1}` |
| Get Recent Activities | GET | /api/reviews/recent-activities | – | `[{"reviewId":5,"updatedAt":"2024-01-01"}]` |
| Search Reviews | GET | /api/reviews/search/{examinerId}?status=&title=&applicantId= | – | `[{"reviewId":5,"status":"ASSIGNED"}]` |

## 4. Notification (알림)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Create Notification | POST | /api/notifications | `{"userId":1,"message":"제출 완료"}` | `{"notificationId":1,"message":"제출 완료"}` |
| List Notifications | GET | /api/notifications?userId= | – | `[{"notificationId":1,"message":"제출 완료"}]` |
| Get Unread Notifications | GET | /api/notifications/unread?userId= | – | `[{"notificationId":1,"message":"제출 완료"}]` |
| Mark Read Notification | PATCH | /api/notifications/{id} | – | 200 OK |
| Delete Notification | DELETE | /api/notifications/{id} | – | 200 OK |

## 5. AI (AI 점검, 유사검색, 초안, 챗봇)

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Generate Claim Draft | 청구항 초안 생성 | POST | /api/ai/drafts/claims | `{"query":"자율주행 차량의 객체 인식 취약점 보완 장치 및 방법","top_k":5}` | `{"log_id":"1","rag_context":[{"rank":1,"score":0.98,"app_num":"1020050050443","claim_num":1,"text":"…"}],"title":"…","summary":"…","technicalField":"…","backgroundTechnology":"…","inventionDetails":{"problemToSolve":"…","solution":"…","effect":"…"},"claims":["[청구항 1]...","[청구항 2]..."]}` | AI_ActionLog 및 AI_ChatMessage 로그 포함 |
| Generate Rejection Draft | 거절 사유 초안 생성 | POST | /api/ai/drafts/rejections | `{"patentId":1}` | `{"logId":2,"draftText":"거절 사유 초안"}` | 구조 동일 |
| List Drafts | 출원별 생성된 초안 목록 조회 | GET | /api/ai/drafts?patentId={patentId} | – | `[{"draftId":1,"type":"CLAIM","content":"청구항 초안"}]` | type: "CLAIM" 또는 "REJECTION", 최신순 정렬 |
| Delete Drafts | 생성된 초안 삭제 | DELETE | /api/ai/drafts?patentId={patentId} | – | – |  |
| Validate Patent Document | 출원 문서 오류 점검 (Rule + GPT) | POST | /api/ai/validations | `{"patentId":1}` | `[{"errorType":"MISSING_FIELD","message":"title is required"}]` | 규칙 기반 + AI 분석 |
| Analyze Image Similarity | 이미지 유사도 분석 | POST | /api/ai/image-similarities | `{"patentId":1,"imageIds":[1,2]}` | `[{"imageId":1,"similarityScore":0.87}]` | 다중 이미지 가능 |
| Generate 3D Model | 3D 모델 생성 | POST | /api/ai/3d-models | `{"patent_id":1,"image_id":"1"}` | `{"file_id":1,"file_url":"/uploads/model.glb"}` | 외부 3D 생성 API 호출 (기본값: octree_resolution=256, num_inference_steps=8, guidance_scale=5.0, face_count=40000, texture=false)<br>생성된 모델은 FileAttachment로 저장됨 |
| Start Chat Session | 챗봇 세션 생성 | POST | /api/ai/chat/sessions | `{"patentId":1,"sessionType":"CHECK"}` | `{"sessionId":1,"startedAt":"2024-01-01T09:00:00Z"}` | sessionType: ex. "CHECK", "DRAFT" |
| Send Chat Message | AI 챗봇 메시지 전송 + 기능 실행 요청 | POST | /api/ai/chat/sessions/{sessionId}/messages | `{"message":"안녕하세요","requestedFeatures":["CHECK"]}` | `{"messageId":1,"sender":"USER","content":"답변","executedFeatures":["CHECK"],"featuresResult":{},"createdAt":"2024-01-01T09:01:00Z"}` | AI_ChatMessage, AI_ActionLog 포함 |
| Get Chat History | 특정 챗봇 세션 대화 내역 조회 | GET | /api/ai/chat/sessions/{sessionId}/messages | – | `[{"messageId":1,"sender":"USER","content":"안녕하세요","executedFeatures":[],"featuresResult":{},"createdAt":"2024-01-01T09:01:00Z"}]` | session 단위 대화 이력 제공 |
| End Chat Session | 챗봇 세션 종료 및 요약 저장 | PATCH | /api/ai/chat/sessions/{sessionId}/end | – | `{"sessionId":1,"endedAt":"2024-01-01T09:30:00Z","sessionSummary":"요약"}` | 요약 자동 저장 |
| Get Action Logs | 메시지별 AI 행동 로그 조회 | GET | /api/ai/actions?messageId={messageId} | – | `[{"actionId":1,"actionType":"CHECK","actionInput":{},"actionOutput":{},"status":"DONE","createdAt":"2024-01-01T09:01:00Z"}]` | AI_ActionLog 조회 |
| Get Document Versions | 출원 문서 버전 목록 조회 | GET | /api/document-versions?patentId={patentId} | – | `[{"patentId":1,"versionId":10,"versionNo":1,"applicantId":5,"changeSummary":"초안","isCurrent":true,"createdAt":"2024-01-01T10:00:00Z"}]` | SpecVersion 테이블 구조 반영 |
| Get Unread Notifications | 로그인 사용자 미확인 알림 조회 | GET | /api/notifications/unread | – | `[{"notificationId":1,"notificationType":"INFO","message":"신규 알림","targetType":"PATENT","targetId":1}]` | ERD 기반 Notification 구조 사용 |
| Run AI Check | AI 기반 문서 점검 수행 | POST | /api/ai/checks | `{"versionId":"10","modelVersion":"v1"}` | `{"checkId":"chk-1","riskScore":0.1,"detailedResults":[]}` | GPT 기반 점검, checkId로 결과 식별 |
| Get AI Check Result | 점검 결과 상세 조회 | GET | /api/ai/checks/result/{checkId} | – | `{"checkId":"chk-1","riskScore":0.1,"detailedResults":[]}` | 상세 결과를 개별 호출로 조회 가능 |
| SearchSimilarPatent | 유사특허 검색 실행 | POST | /api/search/similar | `{"patentId":1,"searchQuery":"자전거","searchType":"KEYWORD"}` | `[{"resultId":1,"similarPatentCode":"KR12345","similarityScore":0.92}]` | 검색 결과는 DB에 저장, similarityScore 내림차순 |
| SubmitSearchFeedback | 검색 결과 피드백 등록 | POST | /api/search/results/{resultId}/feedback | `{"isRelevant":true}` | `{"resultId":1,"isRelevant":true,"updatedAt":"2024-01-02T09:00:00Z"}` | 피드백은 AI 학습 데이터로 활용 가능 |

- **청구항 초안 생성 외부 API 예시:**

```bash
curl -v "https://varieties-rings-advantage-buildings.trycloudflare.com/generate?minimal=true&include_rag_meta=true&rag_format=meta" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data '{"query":"자율주행 차량의 객체 인식 취약점 보완 장치 및 방법","top_k":5}'
```

응답 예시:

```json
{
  "log_id": "1",
  "rag_context": [
    {
      "rank": 1,
      "score": 0.9849,
      "app_num": "1020050050443",
      "claim_num": 1,
      "text": "기판 세정 건조 장치에 있어서..."
    }
  ],
  "title": "자율주행 차량의 객체 인식 취약점 보완 장치 및 방법",
  "summary": "자율주행 차량의 객체 인식 기술은 차량이 주변 환경을 인식하고 이해하는 데 필요한 기술...",
  "technicalField": "자율주행 차량의 객체 인식 기술은 차량이 주변의 다양한 객체를 실시간으로 인식하고 분석하는 시스템...",
  "backgroundTechnology": "종래의 자율주행 차량 기술은 객체 인식을 위해 다양한 센서와 알고리즘을 사용하였으나 여러 한계가 존재한다...",
  "inventionDetails": {
    "problemToSolve": "자율주행 차량의 객체 인식 기술은 다양한 환경에서의 신뢰성을 확보하는 데 어려움을 겪고 있다...",
    "solution": "본 발명은 다중 센서 융합 기술을 활용하여 카메라, 라이다, 레이더의 데이터를 통합 처리함으로써 객체 인식의 정확도를 향상시킨다...",
    "effect": "본 발명은 다중 센서 융합 기술을 통해 인식 정확도를 95% 이상으로 향상시키고 비용을 20% 이상 절감할 수 있다..."
  },
  "claims": [
    "[청구항 1] 자율주행 차량의 객체 인식 취약점을 보완하기 위한 장치...",
    "[청구항 2] 제 1항에 있어서...",
    "[청구항 3] 제 1항에 있어서...",
    "[청구항 4] 제 1항에 있어서...",
    "[청구항 5] 제 1항에 있어서..."
  ]
}
```

- **3D 모델 생성 외부 API 예시:**

```bash
curl -X POST "https://778efa9bea99.ngrok-free.app/generate" \
  -F "file=@3020130058145M011.1.jpg" \
  -F "octree_resolution=256" -F "num_inference_steps=8" \
  -F "guidance_scale=5.0" -F "face_count=40000" -F "texture=false" \
  --output result.glb
```

- **기본값 사용 시 간단 호출:**

```bash
curl -X POST "https://778efa9bea99.ngrok-free.app/generate" \
  -F "file=@3020130058145M011.1.jpg" \
  --output result.glb
```

## 6. FileAttachment (파일 관리)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Upload File | POST | /api/files | `file`, `patentId` | `{"fileId":1,"fileName":"drawing.png"}` |
| Get File Detail | GET | /api/files/{id} | – | `{"fileId":1,"fileName":"drawing.png"}` |
| Update File | PUT | /api/files/{id} | `file` | `{"fileId":1,"fileName":"updated.png"}` |
| Delete File | DELETE | /api/files/{id} | – | 204 No Content |
