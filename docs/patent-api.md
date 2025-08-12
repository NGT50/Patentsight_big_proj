# API 정의서

## **1️⃣ Auth (회원가입 / 로그인 / 인증)**

| 변경사항/요청사항 | API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 회원가입 두개로 나눔 | SignUpApplicant Up | 출원인 회원가입 | POST | /api/users/applicant | `{"username":"applicant1","password":"1234","name":"홍길동","birthDate":"1995-08-01","email":"applicant@test.com"}` | `{"user_id":1,"username":"applicant1","role":"APPLICANT"}` | 기본 role=APPLICANT, email 필수 |
|  | SignUpExaminer | 심사관 회원가입 | POST | /api/users/examiner | `{"username":"examiner1","password":"1234","name":"김심사","birthDate":"1988-03-15","department":"PATENT"}` | `{"user_id":2,"username":"examiner1","role":"EXAMINER"}` | 기본 role=EXAMINER, department 필수 |
|  | Login | 사용자 로그인 및 토큰 발급 | POST | /api/users/login | `{"username":"examiner1","password":"1234"}` | `{"token":"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlelgYgEpQ","user_id":2,"username":"examiner1","role":"EXAMINER"}` | JWT 기반 인증 |
|  | Verify Examiner | 심사관 인증 코드 검증 | POST | /api/users/verify-code | `{"auth_code":"123"}` | `{"verified":true/false}` | 🔹 EXAMINER 전용<br>🔹 향후 추가 보안 요소 필요 시 2FA, email_verification 등 고려 가능 |

- 이름/ ID 등의 중복확인 필요→ 아이디변수 추가로 해결
- 심사관 인증 코드 추가 내용있음

---

## **2️⃣ Patents (출원 관리)**

모든 출원 문서는 JSON 텍스트로 저장되며 파일 업로드 대신 `content` 필드로 관리됩니다.

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Create Patent | 출원 생성 (임시 저장 상태로 생성) | POST | /api/patents | `{"title":"Smart Wheel Lock","type":"PATENT","fileIds":[101,102],"cpc":"B62H1/00","inventor":"홍길동","technicalField":"자전거 잠금장치 관련 기술","backgroundTechnology":"기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.","inventionDetails":{"problemToSolve":"스마트폰과 연동 가능한 자전거 잠금장치 부재","solution":"BLE 기반 잠금장치 및 위치 추적 모듈 개발","effect":"도난 방지와 위치 추적이 동시에 가능"},"summary":"본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.","drawingDescription":"도 1은 잠금장치의 회로 구성도이다.","claims":["BLE 통신 모듈을 포함하는 자전거 잠금장치","상기 잠금장치가 GPS 모듈과 통신 가능한 것을 특징으로 하는 시스템"]}` | `{"patentId":1,"applicantId":1,"status":"DRAFT"}` | 🔹 status: "DRAFT" 자동 설정<br>🔹 type: "PATENT", "UTILITY_MODEL", "DESIGN", "TRADEMARK" |
| Get Patent Detail | 출원 상세 정보 조회 | GET | /api/patents/{patentId} | – | `{"patentId":1,"applicantId":1,"title":"Smart Wheel Lock","type":"PATENT","status":"DRAFT","attachments":[101,102],"cpc":"B62H1/00","applicationNumber":"1020240001234","inventor":"홍길동","technicalField":"자전거 잠금장치 관련 기술","backgroundTechnology":"기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.","inventionDetails":{"problemToSolve":"스마트폰과 연동 가능한 자전거 잠금장치 부재","solution":"BLE 기반 잠금장치 및 위치 추적 모듈 개발","effect":"도난 방지와 위치 추적이 동시에 가능"},"summary":"본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.","drawingDescription":"도 1은 잠금장치의 회로 구성도이다.","claims":["BLE 통신 모듈을 포함하는 자전거 잠금장치","상기 잠금장치가 GPS 모듈과 통신 가능한 것을 특징으로 하는 시스템"],"classificationCodes":["B62H1/00"]}` | 🔹 attachments: FileAttachment 기준<br>🔹 classificationCodes: AI 분류 결과 포함 가능 |
| Get My Patents | 로그인한 사용자의 출원 목록 | GET | /api/patents/my | – | `[{"patentId":1,"applicantId":1,"title":"Smart Wheel Lock","status":"DRAFT"}]` | 🔹 최신순 정렬 |
| Submit Patent | 출원 최종 제출 및 AI 분류 트리거 | POST | /api/patents/{patentId}/submit | – | `{"patentId":1,"status":"SUBMITTED","applicationNumber":"1020240001234","classificationCodes":["B62H1/00"]}` | 🔹 status → "SUBMITTED"<br>🔹 applicationNumber 자동 부여 (형식: ttyyyynnnnnnn, tt=10 발명 / 20 실용신안 / 30 디자인 / 40 상표)<br>🔹 AI 분류 결과 포함 |
| Update Patent Status | 출원 상태 수동 변경 (심사관/관리자용) | PATCH | /api/patents/{patentId}/status | `{"status":"APPROVED"}` | `{"patentId":1,"status":"APPROVED"}` | 🔹 권한 제한 필요 (EXAMINER or ADMIN) |
| Get Document Versions | 출원 문서 버전 목록 조회 | GET | /api/patents/{patentId}/document-versions | – | `[{"patentId":1,"versionId":10,"versionNo":1,"applicantId":5,"changeSummary":"초안","isCurrent":true,"createdAt":"2024-01-01T10:00:00Z"}]` | 🔹 SpecVersion 기반 버전 이력<br>🔹 각 항목에 `patentId` 포함<br>🔹 특허 생성 시 초기 버전(1) 자동 생성 |
| Get Latest Document | 최신 문서 내용 조회 (에디터용) | GET | /api/patents/{patentId}/document/latest | – | `{"versionNo":1,"document":{"patentId":1,"title":"Smart Wheel Lock","type":"PATENT"},"updatedAt":"2024-01-01T10:00:00Z"}` | 🔹 에디터 최초 로딩 시 사용 |
| Update Document Content | 문서 내용 단순 수정 (버전 없음) | PATCH | /api/patents/{patentId}/document | `{"document":{"title":"Smart Wheel Lock v2"}}` | `{"versionNo":1,"document":{"patentId":1,"title":"Smart Wheel Lock v2"},"updatedAt":"2024-01-01T10:05:00Z"}` | 🔹 임시 저장 용도로만 사용 (주의) |
| Create Document Version | 새 문서 버전 생성 (내용 포함) | POST | /api/patents/{patentId}/document-versions | `{"newDocument":{"title":"Smart Wheel Lock v2"},"applicantId":5,"changeSummary":"v2 초안"}` | `{"patentId":1,"versionId":11,"versionNo":2,"isCurrent":true}` | 🔹 생성 시 이전 버전 isCurrent=false 처리 |
| Update Version Info | 버전 정보(요약 등) 수정 | PATCH | /api/document-versions/{versionId} | `{"changeSummary":"typo fix","isCurrent":true}` | `{"patentId":1,"versionId":11,"updatedAt":"2024-01-01T11:00:00Z"}` | 🔹 isCurrent=true 지정 시 기존 버전들 비활성화 |
| Restore Document Version | 특정 버전 복원 → 새 버전 생성 | POST | /api/document-versions/{versionId}/restore | – | `{"patentId":1,"versionId":12,"newVersionNo":3,"restoredFrom":10}` | 🔹 기존 버전 내용을 복사해 새 버전 생성 |
| Delete Document Version | 특정 버전 삭제 | DELETE | /api/document-versions/{versionId} | – | `{"deleted":true}` | 🔹 현재 버전(isCurrent)은 삭제 불가 |

---

## **3️⃣ Review (심사, 승인/반려, 대시보드)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Assign Reviewer | 심사관을 출원에 배정 | POST | /api/reviews/assign | `{"patentId":1,"examinerId":2}` | `{"reviewId":1,"patentId":1,"examinerId":2}` | 분류 기반 자동 또는 수동 배정 지원 |
| Get Review List | 심사관 전용 심사 목록 조회 | GET | /api/reviews?status=IN_REVIEW | (쿼리 없이도 전체 가능) | `[{"patentId":1,"title":"Smart Wheel Lock","applicantName":"홍길동","status":"IN_REVIEW"}]` | 로그인한 심사관의 할당된 건만 반환 가능 |
| Get Review Detail | 특정 심사 상세 정보 조회 | GET | /api/reviews/{reviewId} | – | `{"patentId":1,"files":[101,102],"status":"IN_REVIEW","aiChecks":[]}` | 첨부파일, AI 점검 결과 포함 |
| Submit Review | 심사 결과 등록 및 결정 저장 | POST | /api/reviews | `{"patentId":1,"decision":"APPROVE","comment":"적합"}` | `{"reviewId":1,"decision":"APPROVE","reviewedAt":"2024-01-01T12:00:00Z"}` | decision: "APPROVE", "REJECT", "PENDING" 사용 |
| Create Opinion Notice | 심사 결과 기반 의견서 작성 | POST | /api/reviews/{reviewId}/opinion-notices | `{"content":"의견서 내용","structuredContent":{"sections":[]},"isAiDrafted":false,"responseDueDate":"2024-02-01"}` | `{"noticeId":1}` | Review 리소스의 하위로 구조 변경, AI 초안 여부 및 구조화 내용 포함 가능 |
| Get Opinion Notices | 특정 심사에 대한 의견서 목록 조회 | GET | /api/reviews/{reviewId}/opinion-notices | – | `[{"noticeId":1,"content":"의견서 내용","structuredContent":{"sections":[]},"status":"SENT","responseDueDate":"2024-02-01","isAiDrafted":false}]` | 심사 결과별 의견서 내역 확인 가능 |
| Get Dashboard | 전체 심사 대시보드 요약 | GET | /api/reviews/dashboard | – | `{"total":5,"reviewing":2,"approved":2,"rejected":1}` | 전체 심사 상태 통계 정보 제공 |

---

## **4️⃣ Notification (알림)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| List Notifications | 로그인 사용자 알림 목록 조회 | GET | /api/notifications | 없음 | `[{"notificationId":1,"notificationType":"INFO","message":"신규 알림","targetType":"PATENT","targetId":1,"isRead":false,"createdAt":"2024-01-01T09:00:00Z"}]` | userId 기반 필터링, 읽음/안 읽음 포함 |
| Mark Read Notification | 알림 읽음 처리 | PATCH | /api/notifications/{notificationId} | `{"isRead":true}` | `{"success":true}` | isRead 설정 |
| Delete Notification | 알림 삭제 | DELETE | /api/notifications/{notificationId} | 없음 | `{"success":true}` | 사용자가 삭제 가능 |

---

## **5️⃣ AI (AI 점검, 유사검색, 초안, 챗봇)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Generate Claim Draft | 청구항 초안 생성 | POST | /api/ai/draft/claims | `{"query":"자율주행 차량의 객체 인식 취약점 보완 장치 및 방법","top_k":5}` | `{"log_id":1,"draft_text":"청구항 초안","rag_context":"…","sections_raw":{…},"sections_parsed":{…}}` | AI_ActionLog 및 AI_ChatMessage 로그 포함 |
| Generate Rejection Draft | 거절 사유 초안 생성 | POST | /api/ai/draft/rejections | `{"patentId":1}` | `{"logId":2,"draftText":"거절 사유 초안"}` | 구조 동일 |
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

- 3D 모델 생성 외부 API 예시:

  ```bash
  curl -X POST "https://778efa9bea99.ngrok-free.app/generate" \
    -F "file=@3020130058145M011.1.jpg" \
    -F "octree_resolution=256" -F "num_inference_steps=8" \
    -F "guidance_scale=5.0" -F "face_count=40000" -F "texture=false" \
    --output result.glb
  ```

- 기본값 사용 시 간단 호출:

  ```bash
  curl -X POST "https://778efa9bea99.ngrok-free.app/generate" \
    -F "file=@3020130058145M011.1.jpg" \
    --output result.glb
  ```

## 6️⃣ **FileAttachment (파일 관리)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| **UploadFile** | 파일 업로드 | POST | /api/files | `file=@lock.png&patentId=1` | `{"fileId":101,"patentId":1,"fileName":"lock.png","fileUrl":"/uploads/lock.png","uploaderId":1,"updatedAt":"2024-01-01T10:00:00"}` | Authorization 헤더 필요, multipart/form-data로 업로드 |
| **GetFileDetail** | 파일 메타데이터 조회 | GET | /api/files/{fileId} | - | `{"fileId":101,"patentId":1,"fileName":"lock.png","fileUrl":"/uploads/lock.png","uploaderId":1,"content":null,"updatedAt":"2024-01-01T10:00:00"}` | 실제 파일 다운로드는 fileUrl 사용 |
| **UpdateFile** | 파일 교체 업로드 | PUT | /api/files/{fileId} | `file=@lock_v2.png` | `{"fileId":101,"patentId":1,"fileName":"lock_v2.png","fileUrl":"/uploads/lock_v2.png","uploaderId":1,"updatedAt":"2024-01-02T09:00:00"}` | 기존 파일 삭제 후 새로 저장 |
| **DeleteFile** | 파일 삭제 | DELETE | /api/files/{fileId} | - | `204 No Content` | 존재하지 않는 경우 404 반환 |
