# API 정의서

## **1️⃣ Auth (회원가입 / 로그인 / 인증)**

[제목 없음](https://www.notion.so/242abad4cf24807b89a6ed7d4714a128?pvs=21)

- 이름/ ID 등의 중복확인 필요→ 아이디변수 추가로 해결

---

## **2️⃣ Patents (출원 관리)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Create Patent | 출원 생성 (임시 저장 상태로 생성) | POST | /api/patents | { "title", "type", "file_ids": [], "cpc", "inventor", "technical_field", "background_technology", "invention_details": { "problem_to_solve", "solution", "effect" }, "summary", "drawing_description", "claims": [] } | { "patent_id", "status" } | 🔹 status: "DRAFT" 자동 설정<br>🔹 type: "PATENT", "TRADEMARK", "DESIGN" |
| Get Patent Detail | 출원 상세 정보 조회 | GET | /api/patents/{patent_id} | – | { "patent_id", "title", "type", "status", "attachments": [], "cpc", "application_number", "inventor", "technical_field", "background_technology", "invention_details": { "problem_to_solve", "solution", "effect" }, "summary", "drawing_description", "claims": [], "classification_codes": [] } | 🔹 attachments: FileAttachment 기준<br>🔹 classification_codes: AI 분류 결과 포함 가능 |
| Get My Patents | 로그인한 사용자의 출원 목록 | GET | /api/patents/my | – | [ { "patent_id", "title", "status" } ] | 🔹 최신순 정렬 |
| Submit Patent | 출원 최종 제출 및 AI 분류 트리거 | POST | /api/patents/{patent_id}/submit | – | { "patent_id", "status", "application_number", "classification_codes": [] } | 🔹 status → "SUBMITTED"<br>🔹 application_number 자동 부여<br>🔹 AI 분류 결과 포함 |
| Update Patent Status | 출원 상태 수동 변경 (심사관/관리자용) | PATCH | /api/patents/{patent_id}/status | { "status" } | { "patent_id", "status" } | 🔹 권한 제한 필요 (EXAMINER or ADMIN) |
| Get File Versions | 출원서/도면 파일 버전 목록 조회 | GET | /api/patents/{patent_id}/file-versions | – | [ { "version_id", "file_id", "version_no", "author_id", "change_summary", "is_current", "created_at" } ] | 🔹 SpecVersion 기반 버전 이력 |
| Get Latest File | 최신 문서 파일(에디터용) 조회 | GET | /api/patents/{patent_id}/file/latest | – | { "file_id", "version_no", "content" } | 🔹 에디터 최초 로딩 시 사용 |
| Update File Content | 문서 내용 단순 수정 (버전 없음) | PATCH | /api/patents/file/{file_id} | { "content" } | { "file_id", "updated_at" } | 🔹 임시 저장 용도로만 사용 (주의) |
| Create File Version | 새 문서 버전 생성 (내용 포함) | POST | /api/patents/{patent_id}/file-versions | { "file_id", "new_content", "author_id", "change_summary" } | { "version_id", "version_no", "is_current" } | 🔹 생성 시 이전 버전 is_current=false 처리 |
| Update Version Info | 버전 정보(요약 등) 수정 | PATCH | /api/file-versions/{version_id} | { "change_summary", "is_current" } | { "version_id", "updated_at" } | 🔹 is_current=true 지정 시 기존 버전들 비활성화 |
| Restore File Version | 특정 버전 복원 → 새 버전 생성 | POST | /api/file-versions/{version_id}/restore | – | { "version_id", "new_version_no", "restored_from" } | 🔹 기존 버전 내용을 복사해 새 버전 생성 |
| Delete File Version | 특정 버전 삭제 | DELETE | /api/file-versions/{version_id} | – | { "deleted": true } | 🔹 현재 버전(is_current)은 삭제 불가 |

---

## **3️⃣ Review (심사, 승인/반려, 대시보드)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Assign Reviewer | 심사관을 출원에 배정 | POST | /api/reviews/assign | { "patent_id", "examiner_id" } | { "review_id", "patent_id", "examiner_id" } | 분류 기반 자동 또는 수동 배정 지원 |
| Get Review List | 심사관 전용 심사 목록 조회 | GET | /api/reviews?status=IN_REVIEW | (쿼리 없이도 전체 가능) | [ { "patent_id", "title", "applicant_name", "status" } ] | 로그인한 심사관의 할당된 건만 반환 가능 |
| Get Review Detail | 특정 심사 상세 정보 조회 | GET | /api/reviews/{review_id} | – | { "patent_id", "files": [], "status", "ai_checks": [] } | 첨부파일, AI 점검 결과 포함 |
| Submit Review | 심사 결과 등록 및 결정 저장 | POST | /api/reviews | { "patent_id", "decision", "comment" } | { "review_id", "decision", "reviewed_at" } | decision: "APPROVE", "REJECT", "PENDING" 사용 |
| Create Opinion Notice | 심사 결과 기반 의견서 작성 | POST | /api/reviews/{review_id}/opinion-notices | { "content", "structured_content"?, "is_ai_drafted"?, "response_due_date"? } | { "notice_id" } | Review 리소스의 하위로 구조 변경, AI 초안 여부 및 구조화 내용 포함 가능 |
| Get Opinion Notices | 특정 심사에 대한 의견서 목록 조회 | GET | /api/reviews/{review_id}/opinion-notices | – | [ { "notice_id", "content", "structured_content", "status", "response_due_date", "is_ai_drafted" } ] | 심사 결과별 의견서 내역 확인 가능 |
| Get Dashboard | 전체 심사 대시보드 요약 | GET | /api/reviews/dashboard | – | { "total", "reviewing", "approved", "rejected" } | 전체 심사 상태 통계 정보 제공 |

---

## **4️⃣ Notification (알림)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| List Notifications | 로그인 사용자 알림 목록 조회 | GET | /api/notifications | 없음 | [ { "notification_id", "notification_type", "message", "target_type", "target_id", "is_read", "created_at" } ] | user_id 기반 필터링, 읽음/안 읽음 포함 |
| Mark Read Notification | 알림 읽음 처리 | PATCH | /api/notifications/{notification_id} | { "is_read": true } | { "success": true } | is_read 설정 |
| Delete Notification | 알림 삭제 | DELETE | /api/notifications/{notification_id} | 없음 | { "success": true } | 사용자가 삭제 가능 |

---

## **5️⃣ AI (AI 점검, 유사검색, 초안, 챗봇)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Generate Claim Draft | 청구항 초안 생성 | POST | /api/ai/draft/claims | { "patent_id" } | { "log_id", "draft_text" } | AI_ActionLog 및 AI_ChatMessage 로그 포함 |
| Generate Rejection Draft | 거절 사유 초안 생성 | POST | /api/ai/draft/rejections | { "patent_id" } | { "log_id", "draft_text" } | 구조 동일 |
| List Drafts | 출원별 생성된 초안 목록 조회 | GET | /api/ai/drafts?patent_id={patent_id} | – | [ { "draft_id", "type", "content" } ] | type: "CLAIM" 또는 "REJECTION", 최신순 정렬 |
| Delete Drafts | 생성된 초안 삭제 | DELETE | /api/ai/drafts?patent_id={patent_id} | – | – |  |
| Validate Patent Document | 출원 문서 오류 점검 (Rule + GPT) | POST | /api/ai/validations | { "patent_id" } | [ { "error_type", "message" } ] | 규칙 기반 + AI 분석 |
| Analyze Image Similarity | 이미지 유사도 분석 | POST | /api/ai/image-similarities | { "patent_id", "image_ids": [] } | [ { "image_id", "similarity_score" } ] | 다중 이미지 가능 |
| Generate 3D Model | 3D 모델 생성 | POST | /api/ai/3d-models | { "patent_id", "image_id" } | { "result_id", "file_path" } | 결과는 FileAttachment로 연결 가능 |
| Start Chat Session | 챗봇 세션 생성 | POST | /api/ai/chat/sessions | { "patent_id"?, "session_type" } | { "session_id", "started_at" } | session_type: ex. "CHECK", "DRAFT" |
| Send Chat Message | AI 챗봇 메시지 전송 + 기능 실행 요청 | POST | /api/ai/chat/sessions/{session_id}/messages | { "message", "requested_features": [] } | { "message_id", "sender", "content", "executed_features": [], "features_result", "created_at" } | AI_ChatMessage, AI_ActionLog 포함 |
| Get Chat History | 특정 챗봇 세션 대화 내역 조회 | GET | /api/ai/chat/sessions/{session_id}/messages | – | [ { "message_id", "sender", "content", "executed_features", "features_result", "created_at" } ] | session 단위 대화 이력 제공 |
| End Chat Session | 챗봇 세션 종료 및 요약 저장 | PATCH | /api/ai/chat/sessions/{session_id}/end | – | { "session_id", "ended_at", "session_summary" } | 요약 자동 저장 |
| Get Action Logs | 메시지별 AI 행동 로그 조회 | GET | /api/ai/actions?message_id={message_id} | – | [ { "action_id", "action_type", "action_input", "action_output", "status", "created_at" } ] | AI_ActionLog 조회 |
| Get File Versions | 출원서 및 도면 파일 버전 목록 조회 | GET | /api/file-versions?patent_id={patent_id} | – | [ { "version_id", "file_id", "version_no", "author_id", "change_summary", "is_current", "created_at" } ] | SpecVersion 테이블 구조 반영 |
| Get Unread Notifications | 로그인 사용자 미확인 알림 조회 | GET | /api/notifications/unread | – | [ { "notification_id", "notification_type", "message", "target_type", "target_id" } ] | ERD 기반 Notification 구조 사용 |
| Run AI Check | AI 기반 문서 점검 수행 | POST | /api/ai/checks | { "version_id": string, "model_version"?: string } | { "check_id": string, "risk_score": float, "detailed_results": [...] } | GPT 기반 점검, check_id로 결과 식별 |
| Get AI Check Result | 점검 결과 상세 조회 | GET | /api/ai/checks/result/{check_id} | – | { "check_id": string, "risk_score": float, "detailed_results": [...] } | 상세 결과를 개별 호출로 조회 가능 |
| SearchSimilarPatent | 유사특허 검색 실행 | POST | /api/search/similar | { patent_id, search_query, search_type } | [ { result_id, similar_patent_code, similarity_score } ] | 검색 결과는 DB에 저장, similarity_score 내림차순 |
| SubmitSearchFeedback | 검색 결과 피드백 등록 | POST | /api/search/results/{result_id}/feedback | { is_relevant } | { result_id, is_relevant, updated_at } | 피드백은 AI 학습 데이터로 활용 가능 |

## 6️⃣ **FileAttachment (파일 관리)**

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| **UploadFile** | 파일 업로드 | POST | /api/files | { patent_id, file } | { file_id, file_name, file_hash } | 파일은 multipart/form-data로 업로드, DB에 file_hash로 중복 체크 |
| **GetFileDetail** | 파일 상세 조회 | GET | /api/files/{file_id} | - | { file_id, file_name, uploader_id, mime_type, file_hash } | 파일 메타데이터만 제공, 실제 파일 다운로드 시 별도 URL 활용 |
