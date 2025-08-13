# API 정의서

## 1. Auth (회원가입 / 로그인)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| SignUpApplicant | POST | /api/users/applicant | `{username, password, name, birthDate, email}` | `{userId, username, role}` |
| SignUpExaminer | POST | /api/users/examiner | `{username, password, name, birthDate, department}` | `{userId, username, role}` |
| Login | POST | /api/users/login | `{username, password}` | `{token, userId, username, role}` |
| Verify Examiner | POST | /api/users/verify-code | `{authCode}` | `{verified}` |

## 2. Patents (출원 관리)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- |
| Create Patent | POST | /api/patents | `PatentRequest` | `PatentResponse` | Authorization 필요 |
| Get Patent Detail | GET | /api/patents/{id} | – | `PatentResponse` |  |
| Get My Patents | GET | /api/patents/my | – | `[PatentResponse]` | Authorization 필요 |
| Submit Patent | POST | /api/patents/{id}/submit | `SubmitPatentRequest` | `SubmitPatentResponse` |  |
| Update Patent Status | PATCH | /api/patents/{id}/status | `PatentStatus` | `PatentResponse` |  |
| Update Patent | PUT | /api/patents/{id} | `PatentRequest` | `PatentResponse` |  |
| Delete Patent | DELETE | /api/patents/{id} | – | 204 No Content |  |
| Get Document Versions | GET | /api/patents/{id}/document-versions | – | `[FileVersionResponse]` |  |
| Get Latest Document | GET | /api/patents/{id}/document/latest | – | `DocumentContentResponse` |  |
| Update Document Content | PATCH | /api/patents/{id}/document | `{document}` | `DocumentContentResponse` | 임시 저장 |
| Create Document Version | POST | /api/patents/{id}/document-versions | `DocumentVersionRequest` | `FileVersionResponse` | Authorization 필요 |
| Update Version Info | PATCH | /api/document-versions/{id} | `FileVersionInfoRequest` | `FileVersionResponse` |  |
| Restore Document Version | POST | /api/document-versions/{id}/restore | – | `RestoreVersionResponse` |  |
| Delete Document Version | DELETE | /api/document-versions/{id} | – | `{deleted: true}` | 현재 버전 삭제 불가 |

## 3. Review (심사, 의견서)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Assign Reviewer | POST | /api/reviews/assign | `AssignRequest` | `Review` |
| Get Review List | GET | /api/reviews/list/{userId}?status= | – | `[ReviewListResponse]` |
| Get Review Detail | GET | /api/reviews/{reviewId} | – | `ReviewDetailResponse` |
| Submit Review | POST | /api/reviews/submit | `SubmitReviewRequest` | `Review` |
| Create Opinion Notice | POST | /api/reviews/{reviewId}/opinion-notices | `OpinionNoticeRequest` | `OpinionNoticeResponse` |
| Get Opinion Notices | GET | /api/reviews/{reviewId}/opinion-notices | – | `[OpinionNoticeResponse]` |
| Get Dashboard | GET | /api/reviews/dashboard/{userId} | – | `DashboardResponse` |
| Get Recent Activities | GET | /api/reviews/recent-activities | – | `[RecentActivityResponse]` |
| Search Reviews | GET | /api/reviews/search/{examinerId}?status=&title=&applicantId= | – | `[ReviewSearchResponse]` |

## 4. Notification (알림)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Create Notification | POST | /api/notifications | `NotificationRequest` | `NotificationResponse` |
| List Notifications | GET | /api/notifications?userId= | – | `[NotificationResponse]` |
| Get Unread Notifications | GET | /api/notifications/unread?userId= | – | `[NotificationResponse]` |
| Mark Read Notification | PATCH | /api/notifications/{id} | – | 200 OK |
| Delete Notification | DELETE | /api/notifications/{id} | – | 200 OK |

## 5. AI 기능

### 5.1 Drafts

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Generate Rejection Draft | POST | /api/ai/drafts/rejections | `{patentId, fileId}` | `DraftDetailResponse` |
| List Drafts | GET | /api/ai/drafts?patent_id= | – | `[DraftListResponse]` |
| Get Draft | GET | /api/ai/drafts/{draftId} | – | `DraftDetailResponse` |
| Update Draft | PATCH | /api/ai/drafts/{draftId} | `{content}` | `DraftDetailResponse` |
| Delete Draft | DELETE | /api/ai/drafts/{draftId} | – | 200 OK |

### 5.2 Chat

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Start Chat Session | POST | /api/ai/chat/sessions | `ChatSessionRequest` | `ChatSessionResponse` |
| Send Chat Message | POST | /api/ai/chat/sessions/{sessionId}/messages | `ChatMessageRequest` | `ChatMessageResponse` |
| Get Chat History | GET | /api/ai/chat/sessions/{sessionId}/messages | – | `[ChatMessageResponse]` |
| End Chat Session | PATCH | /api/ai/chat/sessions/{sessionId}/end | – | `ChatEndResponse` |

### 5.3 Action Logs

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Get Action Logs | GET | /api/ai/actions?messageId= | – | `[ActionLogResponse]` |

### 5.4 Validation

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Validate Document | POST | /api/ai/validations | `AiCheckRequest` | `AiCheckResponse` |
| Validate Document by Patent ID | POST | /api/ai/patents/{id}/validate | – | `AiCheckResponse` |

### 5.5 Search & Parsing

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Trademark Image Search | POST | /api/ai/search/trademark/image | file | `ImageSearchResponse` |
| Trademark Text Search | POST | /api/ai/search/trademark/text | text | `ImageSearchResponse` |
| Design Image Search | POST | /api/ai/search/design/image | file | `ImageSearchResponse` |
| Design Text Search | POST | /api/ai/search/design/text | text | `ImageSearchResponse` |
| Parse Patent PDF | POST | /api/ai/parse-pdf | file | `ParsePdfResponse` |
| Search Similar Patents | GET | /api/search/similar?query=&top_n= | – | raw JSON |

## 6. FileAttachment (파일 관리)

| API 이름 | Method | URL | 요청 데이터 | 응답 데이터 |
| --- | --- | --- | --- | --- |
| Upload File | POST | /api/files | `file`, `patentId` | `FileResponse` |
| Get File Detail | GET | /api/files/{id} | – | `FileResponse` |
| Update File | PUT | /api/files/{id} | `file` | `FileResponse` |
| Delete File | DELETE | /api/files/{id} | – | 204 No Content |
