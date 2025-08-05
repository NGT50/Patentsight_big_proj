# Database ERD

Document content for each version is stored as JSON in the `SpecVersion` table.

```
Table User {
  user_id     int       [pk, not null]
  username    varchar   [not null]
  password    varchar   [not null]
  role        varchar   [not null]  // APPLICANT / EXAMINER / ADMIN
  email       varchar   [not null]
  created_at  datetime  [not null]
  department  varchar               // nullable
}

Table Patent {
  patent_id          int       [pk, not null]
  title              varchar   [not null]
  type               varchar   [not null]  // PATENT, UTILITY_MODEL, DESIGN, TRADEMARK
  applicant_id       int       [not null]  // FK → User.user_id
  status             varchar   [not null]
  submitted_at       datetime
  cpc                varchar
  application_number varchar
  inventor           varchar
  technical_field    varchar
  background_technology text
  problem_to_solve   text
  solution           text
  effect             text
  summary            text
  drawing_description text
  claims             json
}

Table Review {
  review_id   int       [pk, not null]
  patent_id   int       [not null]  // FK → Patent.patent_id
  examiner_id int       [not null]  // FK → User.user_id
  decision    varchar   [not null]
  comment     text
  reviewed_at datetime
}

Table FileAttachment {
  file_id     int       [pk, not null]
  patent_id   int       [not null]  // FK → Patent.patent_id
  uploader_id int       [not null]  // FK → User.user_id
  file_name   varchar   [not null]
  file_path   varchar   [not null]
  file_size   bigint
  mime_type   varchar
  file_hash   varchar
  uploaded_at datetime  [not null]
}

Table SpecVersion {
  version_id     int       [pk, not null]
  patent_id      int       [not null]  // FK → Patent.patent_id
  version_no     int       [not null]
  document       json                 // document content stored as JSON
  author_id      int       [not null]  // FK → User.user_id
  change_summary text
  is_current     boolean   [not null]
  created_at     datetime  [not null]
  updated_at     datetime
}

Table AI_Check {
  check_id         int      [pk, not null]
  patent_id        int      [not null]  // FK → Patent.patent_id
  version_id       int      [not null]  // FK → SpecVersion.version_id
  model_version    varchar  [not null]
  risk_score       float
  detailed_results json
  created_at       datetime [not null]
}

Table AI_ChatSession {
  session_id      int       [pk, not null]
  patent_id       int                    // FK → Patent.patent_id (nullable)
  user_id         int       [not null]  // FK → User.user_id
  session_type    varchar   [not null]
  session_summary text
  started_at      datetime
  ended_at        datetime
}

Table AI_ChatMessage {
  message_id         int      [pk, not null]
  session_id         int      [not not null]  // FK → AI_ChatSession.session_id
  parent_message_id  int                    // self‑FK nullable
  sender             varchar  [not null]
  message            text
  feedback_score     int
  token_count        int
  created_at         datetime [not null]
}

Table AI_ActionLog {
  action_id     int      [pk, not null]
  message_id    int      [not null]  // FK → AI_ChatMessage.message_id
  action_type   varchar  [not null]
  action_input  json
  action_output json
  status        varchar
  created_at    datetime [not null]
}

Table SearchResult {
  result_id           int      [pk, not null]
  patent_id           int      [not null]  // FK → Patent.patent_id
  user_id             int      [not null]  // FK → User.user_id
  search_query        json
  search_type         varchar
  similar_patent_code varchar
  similarity_score    float
  is_relevant         boolean
  created_at          datetime [not null]
}

Table OpinionNotice {
  notice_id           int      [pk, not null]
  review_id           int      [not null]  // FK → Review.review_id
  content             text
  structured_content  json
  status              varchar
  response_due_date   datetime
  is_ai_drafted       boolean
  created_at          datetime [not null]
}

Table Notification {
  notification_id    int      [pk, not null]
  user_id            int      [not null]  // FK → User.user_id
  notification_type  varchar  [not null]
  message            text
  target_type        varchar  [not null]
  target_id          int      [not null]
  is_read            boolean
  created_at         datetime [not null]
}

Ref: Patent.applicant_id > User.user_id
Ref: Review.patent_id > Patent.patent_id
Ref: Review.examiner_id > User.user_id

Ref: FileAttachment.patent_id > Patent.patent_id
Ref: FileAttachment.uploader_id > User.user_id

Ref: SpecVersion.patent_id > Patent.patent_id
Ref: SpecVersion.author_id > User.user_id

Ref: AI_Check.patent_id > Patent.patent_id
Ref: AI_Check.version_id > SpecVersion.version_id

Ref: AI_ChatSession.user_id > User.user_id
Ref: AI_ChatSession.patent_id > Patent.patent_id

Ref: AI_ChatMessage.session_id > AI_ChatSession.session_id
Ref: AI_ChatMessage.parent_message_id > AI_ChatMessage.message_id

Ref: AI_ActionLog.message_id > AI_ChatMessage.message_id

Ref: SearchResult.patent_id > Patent.patent_id
Ref: SearchResult.user_id > User.user_id

Ref: OpinionNotice.review_id > Review.review_id

Ref: Notification.user_id > User.user_id
```
