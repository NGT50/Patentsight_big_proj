## 2️⃣ Patents (출원 관리)

| API 이름 | 설명 | Method | URL | 요청 데이터 | 응답 데이터 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| Create Patent | 출원 생성 (임시 저장 상태로 생성) | POST | /api/patents | { "title", "type", "file_ids": [] } | { "patent_id", "status" } | 🔹 status: "DRAFT" 자동 설정<br>🔹 type: "PATENT", "TRADEMARK", "DESIGN" |
| Get Patent Detail | 출원 상세 정보 조회 | GET | /api/patents/{patent_id} | – | { "patent_id", "title", "type", "status", "attachments": [], "classification_codes": [] } | 🔹 attachments: FileAttachment 기준<br>🔹 classification_codes: AI 분류 결과 포함 가능 |
| Get My Patents | 로그인한 사용자의 출원 목록 | GET | /api/patents/my | – | [ { "patent_id", "title", "status" } ] | 🔹 최신순 정렬 |
| Submit Patent | 출원 최종 제출 및 AI 분류 트리거 | POST | /api/patents/{patent_id}/submit | – | { "patent_id", "status", "classification_codes": [] } | 🔹 status → "SUBMITTED"<br>🔹 AI 분류 결과 포함 |
| Update Patent Status | 출원 상태 수동 변경 (심사관/관리자용) | PATCH | /api/patents/{patent_id}/status | { "status" } | { "patent_id", "status" } | 🔹 권한 제한 필요 (EXAMINER or ADMIN) |
| Update Patent | 출원 정보 수정 | PUT | /api/patents/{patent_id} | { "title", "type", "file_ids": [] } | { "patent_id", "title", "type", "status" } | – |
| Delete Patent | 출원 삭제 | DELETE | /api/patents/{patent_id} | – | { "deleted": true } | – |
| Get File Versions | 출원서/도면 파일 버전 목록 조회 | GET | /api/patents/{patent_id}/file-versions | – | [ { "version_id", "file_id", "version_no", "author_id", "change_summary", "is_current", "created_at" } ] | 🔹 SpecVersion 기반 버전 이력 |
| Get Latest File | 최신 문서 파일(에디터용) 조회 | GET | /api/patents/{patent_id}/file/latest | – | { "file_id", "version_no", "content" } | 🔹 에디터 최초 로딩 시 사용 |
| Update File Content | 문서 내용 단순 수정 (버전 없음) | PATCH | /api/patents/file/{file_id} | { "content" } | { "file_id", "updated_at" } | 🔹 임시 저장 용도로만 사용 (주의) |
| Create File Version | 새 문서 버전 생성 (내용 포함) | POST | /api/patents/{patent_id}/file-versions | { "file_id", "new_content", "author_id", "change_summary" } | { "version_id", "version_no", "is_current" } | 🔹 생성 시 이전 버전 is_current=false 처리 |
| Update Version Info | 버전 정보(요약 등) 수정 | PATCH | /api/file-versions/{version_id} | { "change_summary", "is_current" } | { "version_id", "updated_at" } | 🔹 is_current=true 지정 시 기존 버전들 비활성화 |
| Restore File Version | 특정 버전 복원 → 새 버전 생성 | POST | /api/file-versions/{version_id}/restore | – | { "version_id", "new_version_no", "restored_from" } | 🔹 기존 버전 내용을 복사해 새 버전 생성 |
| Delete File Version | 특정 버전 삭제 | DELETE | /api/file-versions/{version_id} | – | { "deleted": true } | 🔹 현재 버전(is_current)은 삭제 불가 |
