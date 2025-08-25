# Database ERD

Document content for each version is stored as JSON in the `SpecVersion` table.

```
Table User {
  user_id        bigint    [pk, not null]
  username       varchar   [not null, unique]
  password       varchar   [not null]
  name           varchar   [not null]
  birth_date     date
  email          varchar
  department     varchar             // PATENT / DESIGN / TRADEMARK
  role           varchar   [not null] // APPLICANT / EXAMINER / ADMIN
  current_load   int       [not null, default: 0]
  employee_number varchar
  position       varchar
  created_at     datetime  [not null]
}

Table Patent {
  patent_id          bigint   [pk, not null]
  title              varchar  [not null]
  type               varchar  [not null] // PATENT, UTILITY_MODEL, DESIGN, TRADEMARK
  applicant_id       bigint   [not null] // FK → User.user_id
  status             varchar  [not null] // DRAFT, SUBMITTED, REVIEWING, APPROVED, REJECTED, WAITING_ASSIGNMENT
  submitted_at       datetime
  cpc                varchar
  ipc                varchar
  application_number varchar
  inventor           varchar
  technical_field    varchar
  background_technology text
  problem_to_solve   text
  solution           text
  effect             text
  summary            text
  drawing_description text
}

Table PatentClaim {
  patent_id   bigint  [not null] // FK → Patent.patent_id
  claim_text  text    [not null]
}

Table Draft {
  id         bigint  [pk, not null]
  patent_id  bigint
  type       varchar [not null] // CLAIM / REJECTION
  content    text
  created_at datetime [not null]
  updated_at datetime [not null]
}

Table Review {
  review_id    bigint   [pk, not null]
  patent_id    bigint   [not null] // FK → Patent.patent_id
  examiner_id  bigint   [not null] // FK → User.user_id
  decision     varchar  [not null] // APPROVE / PENDING / REJECT
  comment      text
  reviewed_at  datetime
  review_type  varchar  // PatentType
  auto_assigned boolean
}

Table FileAttachment {
  file_id     bigint   [pk, not null]
  patent_id   bigint   [not null] // FK → Patent.patent_id
  uploader_id bigint   [not null]
  file_name   varchar  [not null]
  file_url    varchar
  content     text
  updated_at  datetime
}

Table SpecVersion {
  version_id     bigint   [pk, not null]
  patent_id      bigint   [not null] // FK → Patent.patent_id
  version_no     int      [not null]
  applicant_id   bigint   [not null]
  change_summary text
  document       text
  is_current     boolean  [not null]
  created_at     datetime [not null]
  updated_at     datetime
}

Table AiCheck {
  id           bigint   [pk, not null]
  patent_id    bigint   [not null]
  check_id     varchar  [not null]
  status       varchar
  risk_score   float
  result_json  text
  created_at   datetime [not null]
}

Table AiChatSession {
  id           bigint   [pk, not null]
  session_id   varchar  [not null]
  patent_id    bigint
  session_type varchar  [not null]
  started_at   datetime [not null]
  ended_at     datetime
}

Table AiChatMessage {
  id                bigint   [pk, not null]
  message_id        varchar  [not null]
  session_id        varchar  [not null] // FK → AiChatSession.session_id
  sender            varchar  [not null]
  content           text
  executed_features text
  features_result   text
  created_at        datetime [not null]
}

Table AiActionLog {
  id           bigint   [pk, not null]
  action_id    varchar  [not null]
  message_id   varchar  [not null]
  action_type  varchar  [not null]
  action_input text
  action_output text
  status       varchar
  created_at   datetime [not null]
}

Table SearchResult {
  id                 bigint  [pk, not null]
  result_id          varchar [not null]
  patent_id          bigint  [not null] // FK → Patent.patent_id
  similar_patent_code varchar
  title              varchar
  ipc_code           varchar
  similarity_score   float
  is_relevant        boolean
  updated_at         datetime
}

Table OpinionNotice {
  notice_id          bigint   [pk, not null]
  review_id          bigint   [not null] // FK → Review.review_id
  content            text
  structured_content text
  response_due_date  datetime
  is_ai_drafted      boolean
  created_at         datetime [not null]
  type               varchar
  status             varchar
}

Table Notification {
  notification_id   bigint   [pk, not null]
  user_id           bigint   [not null] // FK → User.user_id
  notification_type varchar  [not null]
  message           text
  target_type       varchar  [not null]
  target_id         bigint   [not null]
  is_read           boolean
  created_at        datetime [not null]
}

Ref: Patent.applicant_id > User.user_id
Ref: Review.patent_id > Patent.patent_id
Ref: Review.examiner_id > User.user_id
Ref: FileAttachment.patent_id > Patent.patent_id
Ref: SpecVersion.patent_id > Patent.patent_id
Ref: Draft.patent_id > Patent.patent_id
Ref: AiChatMessage.session_id > AiChatSession.session_id
Ref: OpinionNotice.review_id > Review.review_id
Ref: Notification.user_id > User.user_id
```
