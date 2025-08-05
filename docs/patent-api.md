# API 정의서

## **1️⃣ Auth (회원가입 / 로그인 / 인증)**

[제목 없음](https://www.notion.so/242abad4cf24807b89a6ed7d4714a128?pvs=21)

- 이름/ ID 등의 중복확인 필요→ 아이디변수 추가로 해결

---

## **2️⃣ Patents (출원 관리)**

모든 출원 문서는 JSON 텍스트로 저장되며 파일 업로드 대신 `content` 필드로 관리됩니다.

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Create Patent | 출원 생성 (임시 저장 상태로 생성) | POST | /api/patents | `{"title":"Smart Wheel Lock","type":"PATENT","file_ids":[101,102],"cpc":"B62H1/00","inventor":"홍길동","technical_field":"자전거 잠금장치 관련 기술","background_technology":"기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.","invention_details":{"problem_to_solve":"스마트폰과 연동 가능한 자전거 잠금장치 부재","solution":"BLE 기반 잠금장치 및 위치 추적 모듈 개발","effect":"도난 방지와 위치 추적이 동시에 가능"},"summary":"본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.","drawing_description":"도 1은 잠금장치의 회로 구성도이다.","claims":["BLE 통신 모듈을 포함하는 자전거 잠금장치","상기 잠금장치가 GPS 모듈과 통신 가능한 것을 특징으로 하는 시스템"]}` | `{"patent_id":1,"applicant_id":1,"status":"DRAFT"}` | 🔹 status: "DRAFT" 자동 설정<br>🔹 type: "PATENT", "UTILITY_MODEL", "DESIGN", "TRADEMARK" |
| Get Patent Detail | 출원 상세 정보 조회 | GET | /api/patents/{patent_id} | – | `{"patent_id":1,"applicant_id":1,"title":"Smart Wheel Lock","type":"PATENT","status":"DRAFT","attachments":[101,102],"cpc":"B62H1/00","application_number":"1020240001234","inventor":"홍길동","technical_field":"자전거 잠금장치 관련 기술","background_technology":"기존 자물쇠 방식은 위치 감지가 어렵고 분실 위험이 있음.","invention_details":{"problem_to_solve":"스마트폰과 연동 가능한 자전거 잠금장치 부재","solution":"BLE 기반 잠금장치 및 위치 추적 모듈 개발","effect":"도난 방지와 위치 추적이 동시에 가능"},"summary":"본 발명은 BLE 통신 기반의 스마트 자전거 잠금장치에 관한 것이다.","drawing_description":"도 1은 잠금장치의 회로 구성도이다.","claims":["BLE 통신 모듈을 포함하는 자전거 잠금장치","상기 잠금장치가 GPS 모듈과 통신 가능한 것을 특징으로 하는 시스템"],"classification_codes":["B62H1/00"]}` | 🔹 attachments: FileAttachment 기준<br>🔹 classification_codes: AI 분류 결과 포함 가능 |
| Get My Patents | 로그인한 사용자의 출원 목록 | GET | /api/patents/my | – | `[{"patent_id":1,"applicant_id":1,"title":"Smart Wheel Lock","status":"DRAFT"}]` | 🔹 최신순 정렬 |
| Submit Patent | 출원 최종 제출 및 AI 분류 트리거 | POST | /api/patents/{patent_id}/submit | – | `{"patent_id":1,"status":"SUBMITTED","application_number":"1020240001234","classification_codes":["B62H1/00"]}` | 🔹 status → "SUBMITTED"<br>🔹 application_number 자동 부여 (형식: ttyyyynnnnnnn, tt=10 발명 / 20 실용신안 / 30 디자인 / 40 상표)<br>🔹 AI 분류 결과 포함 |
| Update Patent Status | 출원 상태 수동 변경 (심사관/관리자용) | PATCH | /api/patents/{patent_id}/status | `{"status":"APPROVED"}` | `{"patent_id":1,"status":"APPROVED"}` | 🔹 권한 제한 필요 (EXAMINER or ADMIN) |
| Get Document Versions | 출원 문서 버전 목록 조회 | GET | /api/patents/{patent_id}/document-versions | – | `[{"patent_id":1,"version_id":10,"version_no":1,"author_id":5,"change_summary":"초안","is_current":true,"created_at":"2024-01-01T10:00:00Z"}]` | 🔹 SpecVersion 기반 버전 이력<br>🔹 각 항목에 `patent_id` 포함 |
| Get Latest Document | 최신 문서 내용 조회 (에디터용) | GET | /api/patents/{patent_id}/document/latest | – | `{"version_no":1,"document":{"patent_id":1,"title":"Smart Wheel Lock","type":"PATENT"},"updated_at":"2024-01-01T10:00:00Z"}` | 🔹 에디터 최초 로딩 시 사용 |
| Update Document Content | 문서 내용 단순 수정 (버전 없음) | PATCH | /api/patents/{patent_id}/document | `{"document":{"title":"Smart Wheel Lock v2"}}` | `{"version_no":1,"document":{"patent_id":1,"title":"Smart Wheel Lock v2"},"updated_at":"2024-01-01T10:05:00Z"}` | 🔹 임시 저장 용도로만 사용 (주의) |
| Create Document Version | 새 문서 버전 생성 (내용 포함) | POST | /api/patents/{patent_id}/document-versions | `{"new_document":{"title":"Smart Wheel Lock v2"},"author_id":5,"change_summary":"v2 초안"}` | `{"patent_id":1,"version_id":11,"version_no":2,"is_current":true}` | 🔹 생성 시 이전 버전 is_current=false 처리 |
| Update Version Info | 버전 정보(요약 등) 수정 | PATCH | /api/document-versions/{version_id} | `{"change_summary":"typo fix","is_current":true}` | `{"patent_id":1,"version_id":11,"updated_at":"2024-01-01T11:00:00Z"}` | 🔹 is_current=true 지정 시 기존 버전들 비활성화 |
| Restore Document Version | 특정 버전 복원 → 새 버전 생성 | POST | /api/document-versions/{version_id}/restore | – | `{"patent_id":1,"version_id":12,"new_version_no":3,"restored_from":10}` | 🔹 기존 버전 내용을 복사해 새 버전 생성 |
| Delete Document Version | 특정 버전 삭제 | DELETE | /api/document-versions/{version_id} | – | `{"deleted":true}` | 🔹 현재 버전(is_current)은 삭제 불가 |

---

## **3️⃣ Review (심사, 승인/반려, 대시보드)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Assign Reviewer | 심사관을 출원에 배정 | POST | /api/reviews/assign | `{"patent_id":1,"examiner_id":2}` | `{"review_id":1,"patent_id":1,"examiner_id":2}` | 분류 기반 자동 또는 수동 배정 지원 |
| Get Review List | 심사관 전용 심사 목록 조회 | GET | /api/reviews?status=IN_REVIEW | (쿼리 없이도 전체 가능) | `[{"patent_id":1,"title":"Smart Wheel Lock","applicant_name":"홍길동","status":"IN_REVIEW"}]` | 로그인한 심사관의 할당된 건만 반환 가능 |
| Get Review Detail | 특정 심사 상세 정보 조회 | GET | /api/reviews/{review_id} | – | `{"patent_id":1,"files":[101,102],"status":"IN_REVIEW","ai_checks":[]}` | 첨부파일, AI 점검 결과 포함 |
| Submit Review | 심사 결과 등록 및 결정 저장 | POST | /api/reviews | `{"patent_id":1,"decision":"APPROVE","comment":"적합"}` | `{"review_id":1,"decision":"APPROVE","reviewed_at":"2024-01-01T12:00:00Z"}` | decision: "APPROVE", "REJECT", "PENDING" 사용 |
| Create Opinion Notice | 심사 결과 기반 의견서 작성 | POST | /api/reviews/{review_id}/opinion-notices | `{"content":"의견서 내용","structured_content":{"sections":[]},"is_ai_drafted":false,"response_due_date":"2024-02-01"}` | `{"notice_id":1}` | Review 리소스의 하위로 구조 변경, AI 초안 여부 및 구조화 내용 포함 가능 |
| Get Opinion Notices | 특정 심사에 대한 의견서 목록 조회 | GET | /api/reviews/{review_id}/opinion-notices | – | `[{"notice_id":1,"content":"의견서 내용","structured_content":{"sections":[]},"status":"SENT","response_due_date":"2024-02-01","is_ai_drafted":false}]` | 심사 결과별 의견서 내역 확인 가능 |
| Get Dashboard | 전체 심사 대시보드 요약 | GET | /api/reviews/dashboard | – | `{"total":5,"reviewing":2,"approved":2,"rejected":1}` | 전체 심사 상태 통계 정보 제공 |

---

## **4️⃣ Notification (알림)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| List Notifications | 로그인 사용자 알림 목록 조회 | GET | /api/notifications | 없음 | `[{"notification_id":1,"notification_type":"INFO","message":"신규 알림","target_type":"PATENT","target_id":1,"is_read":false,"created_at":"2024-01-01T09:00:00Z"}]` | user_id 기반 필터링, 읽음/안 읽음 포함 |
| Mark Read Notification | 알림 읽음 처리 | PATCH | /api/notifications/{notification_id} | `{"is_read":true}` | `{"success":true}` | is_read 설정 |
| Delete Notification | 알림 삭제 | DELETE | /api/notifications/{notification_id} | 없음 | `{"success":true}` | 사용자가 삭제 가능 |

---

## **5️⃣ AI (AI 점검, 유사검색, 초안, 챗봇)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Generate Claim Draft | 청구항 초안 생성 | POST | /api/ai/draft/claims | `{"patent_id":1}` | `{"log_id":1,"draft_text":"청구항 초안"}` | AI_ActionLog 및 AI_ChatMessage 로그 포함 |
| Generate Rejection Draft | 거절 사유 초안 생성 | POST | /api/ai/draft/rejections | `{"patent_id":1}` | `{"log_id":2,"draft_text":"거절 사유 초안"}` | 구조 동일 |
| List Drafts | 출원별 생성된 초안 목록 조회 | GET | /api/ai/drafts?patent_id={patent_id} | – | `[{"draft_id":1,"type":"CLAIM","content":"청구항 초안"}]` | type: "CLAIM" 또는 "REJECTION", 최신순 정렬 |
| Delete Drafts | 생성된 초안 삭제 | DELETE | /api/ai/drafts?patent_id={patent_id} | – | – |  |
| Validate Patent Document | 출원 문서 오류 점검 (Rule + GPT) | POST | /api/ai/validations | `{"patent_id":1}` | `[{"error_type":"MISSING_FIELD","message":"title is required"}]` | 규칙 기반 + AI 분석 |
| Analyze Image Similarity | 이미지 유사도 분석 | POST | /api/ai/image-similarities | `{"patent_id":1,"image_ids":[1,2]}` | `[{"image_id":1,"similarity_score":0.87}]` | 다중 이미지 가능 |
| Generate 3D Model | 3D 모델 생성 | POST | /api/ai/3d-models | `{"patent_id":1,"image_id":1}` | `{"result_id":1,"file_path":"/models/1.glb"}` | 결과는 FileAttachment로 연결 가능 |
| Start Chat Session | 챗봇 세션 생성 | POST | /api/ai/chat/sessions | `{"patent_id":1,"session_type":"CHECK"}` | `{"session_id":1,"started_at":"2024-01-01T09:00:00Z"}` | session_type: ex. "CHECK", "DRAFT" |
| Send Chat Message | AI 챗봇 메시지 전송 + 기능 실행 요청 | POST | /api/ai/chat/sessions/{session_id}/messages | `{"message":"안녕하세요","requested_features":["CHECK"]}` | `{"message_id":1,"sender":"USER","content":"답변","executed_features":["CHECK"],"features_result":{},"created_at":"2024-01-01T09:01:00Z"}` | AI_ChatMessage, AI_ActionLog 포함 |
| Get Chat History | 특정 챗봇 세션 대화 내역 조회 | GET | /api/ai/chat/sessions/{session_id}/messages | – | `[{"message_id":1,"sender":"USER","content":"안녕하세요","executed_features":[],"features_result":{},"created_at":"2024-01-01T09:01:00Z"}]` | session 단위 대화 이력 제공 |
| End Chat Session | 챗봇 세션 종료 및 요약 저장 | PATCH | /api/ai/chat/sessions/{session_id}/end | – | `{"session_id":1,"ended_at":"2024-01-01T09:30:00Z","session_summary":"요약"}` | 요약 자동 저장 |
| Get Action Logs | 메시지별 AI 행동 로그 조회 | GET | /api/ai/actions?message_id={message_id} | – | `[{"action_id":1,"action_type":"CHECK","action_input":{},"action_output":{},"status":"DONE","created_at":"2024-01-01T09:01:00Z"}]` | AI_ActionLog 조회 |
| Get Document Versions | 출원 문서 버전 목록 조회 | GET | /api/document-versions?patent_id={patent_id} | – | `[{"patent_id":1,"version_id":10,"version_no":1,"author_id":5,"change_summary":"초안","is_current":true,"created_at":"2024-01-01T10:00:00Z"}]` | SpecVersion 테이블 구조 반영 |
| Get Unread Notifications | 로그인 사용자 미확인 알림 조회 | GET | /api/notifications/unread | – | `[{"notification_id":1,"notification_type":"INFO","message":"신규 알림","target_type":"PATENT","target_id":1}]` | ERD 기반 Notification 구조 사용 |
| Run AI Check | AI 기반 문서 점검 수행 | POST | /api/ai/checks | `{"version_id":"10","model_version":"v1"}` | `{"check_id":"chk-1","risk_score":0.1,"detailed_results":[]}` | GPT 기반 점검, check_id로 결과 식별 |
| Get AI Check Result | 점검 결과 상세 조회 | GET | /api/ai/checks/result/{check_id} | – | `{"check_id":"chk-1","risk_score":0.1,"detailed_results":[]}` | 상세 결과를 개별 호출로 조회 가능 |
| SearchSimilarPatent | 유사특허 검색 실행 | POST | /api/search/similar | `{"patent_id":1,"search_query":"자전거","search_type":"KEYWORD"}` | `[{"result_id":1,"similar_patent_code":"KR12345","similarity_score":0.92}]` | 검색 결과는 DB에 저장, similarity_score 내림차순 |
| SubmitSearchFeedback | 검색 결과 피드백 등록 | POST | /api/search/results/{result_id}/feedback | `{"is_relevant":true}` | `{"result_id":1,"is_relevant":true,"updated_at":"2024-01-02T09:00:00Z"}` | 피드백은 AI 학습 데이터로 활용 가능 |

## 6️⃣ **FileAttachment (파일 관리)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| **UploadFile** | 파일 업로드 | POST | /api/files | `patent_id=1, file=@lock.png` | `{"file_id":101,"file_name":"lock.png","file_hash":"abc123"}` | 파일은 multipart/form-data로 업로드, DB에 file_hash로 중복 체크 |
| **GetFileDetail** | 파일 상세 조회 | GET | /api/files/{file_id} | - | `{"file_id":101,"file_name":"lock.png","uploader_id":1,"mime_type":"image/png","file_hash":"abc123"}` | 파일 메타데이터만 제공, 실제 파일 다운로드 시 별도 URL 활용 |
