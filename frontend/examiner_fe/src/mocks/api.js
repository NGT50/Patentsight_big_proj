// src/mocks/api.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

/* ---------------------------
   샘플 리뷰(특허/디자인 혼합)
---------------------------- */
const ALL_REVIEWS = [
  // 특허
  { reviewId: 101, title: 'AI 기반 특허',       status: 'SUBMITTED', type: 'PATENT',
    applicantName: '출원인X', examinerName: '심사관X', submittedAt: '2025-08-01' },
  { reviewId: 103, title: '네트워크 보안 특허', status: 'APPROVED',  type: 'PATENT',
    applicantName: '출원인Y', examinerName: '심사관Y', submittedAt: '2025-08-03' },

  // 디자인
  { reviewId: 102, title: '디자인 권리 출원',   status: 'REVIEWING', type: 'DESIGN',
    applicantName: '출원인A', examinerName: '심사관A', submittedAt: '2025-08-01' },
  { reviewId: 104, title: '가전 외관 디자인',   status: 'SUBMITTED', type: 'DESIGN',
    applicantName: '출원인B', examinerName: '심사관B', submittedAt: '2025-08-02' },
  { reviewId: 105, title: '의류 부착물 디자인', status: 'REJECTED',  type: 'DESIGN',
    applicantName: '출원인C', examinerName: '심사관C', submittedAt: '2025-08-03' },
];

/* ---------------------------
   파일 테이블(mock)
---------------------------- */
const FILES = [
  { file_id: 1,  patent_id: 15, updated_at: '2025-08-20 01:31:08.535712', uploader_id: 4,
    file_name: 'awfewafawefawef.png', file_url: 'eaa49b..._awfewafawefaw.png', content: null, file_type: null },
  { file_id: 2,  patent_id: 15, updated_at: '2025-08-20 01:31:31.792815', uploader_id: 4,
    file_name: '[12조]6기 12조 소개이미지 - 복사본.jpg', file_url: '614d6b..._12team_copy.jpg', content: null, file_type: null },
  { file_id: 3,  patent_id: 15, updated_at: '2025-08-20 01:32:10.247526', uploader_id: 4,
    file_name: 'awfewafawefawef.png', file_url: '79f87b..._awfewafawefaw.png', content: null, file_type: null },
  { file_id: 4,  patent_id: 15, updated_at: '2025-08-20 01:32:10.536468', uploader_id: 4,
    file_name: '이미지 (3).png', file_url: 'cc0571..._img3.png', content: null, file_type: null },
  { file_id: 5,  patent_id: 15, updated_at: '2025-08-20 01:32:10.919931', uploader_id: 4,
    file_name: '[8조]6기 8조 소개이미지.jpg', file_url: '51bb4a..._8team.jpg', content: null, file_type: null },

  { file_id: 6,  patent_id: 20, updated_at: '2025-08-20 02:19:46.068166', uploader_id: 1,
    file_name: 'awfewafawefawef.png', file_url: 'd8d578..._awfew.png', content: null, file_type: null },

  { file_id: 7,  patent_id: 21, updated_at: '2025-08-20 02:49:14.971200', uploader_id: 1,
    file_name: '이미지 (3) - 복사본.png', file_url: '35bd74..._img3_copy.png', content: null, file_type: null },
  { file_id: 8,  patent_id: 21, updated_at: '2025-08-20 02:49:32.968914', uploader_id: 1,
    file_name: '집보내줘.png', file_url: '4d1a18..._home.png', content: null, file_type: null },
  { file_id: 9,  patent_id: 21, updated_at: '2025-08-20 02:50:12.153963', uploader_id: 1,
    file_name: '집보내줘.png', file_url: '5c979f..._home2.png', content: null, file_type: null },

  { file_id: 10, patent_id: 22, updated_at: '2025-08-20 02:52:15.821105', uploader_id: 1,
    file_name: '집보내줘.png', file_url: '6fdded..._home3.png', content: null, file_type: null },

  { file_id: 11, patent_id: 23, updated_at: '2025-08-20 02:54:12.793564', uploader_id: 12,
    file_name: '집보내줘.png', file_url: 'ed4fd7..._home4.png', content: null, file_type: null },
  { file_id: 12, patent_id: 23, updated_at: '2025-08-20 02:54:32.937896', uploader_id: 12,
    file_name: '집보내줘.png', file_url: '4625ae..._home5.png', content: null, file_type: null },

  { file_id: 13, patent_id: 24, updated_at: '2025-08-20 03:23:07.885947', uploader_id: 1,
    file_name: '집보내줘.png', file_url: 'd54cba..._home6.png', content: null, file_type: null },
  { file_id: 14, patent_id: 24, updated_at: '2025-08-20 03:23:31.695742', uploader_id: 1,
    file_name: '집.png', file_url: '457a46..._house.png', content: null, file_type: null },
];

/* ---------------------------
   특허 청구항
---------------------------- */
const CLAIMS = {
  15: [
    { patent_id: 15, claim_text: '청구항 1: AI 모델을 이용한 데이터 처리 방법.' },
    { patent_id: 15, claim_text: '청구항 2: 상기 방법을 수행하는 장치.' },
  ],
  24: [
    { patent_id: 24, claim_text: '청구항 1: 네트워크 트래픽 암호화 장치.' },
    { patent_id: 24, claim_text: '청구항 2: 키 교환 프로토콜 최적화 방법.' },
  ],
};

/* ---------------------------
   리뷰ID → 특허ID 매핑(특허형 리뷰만)
---------------------------- */
const REVIEW_TO_PATENT = { 101: 15, 103: 24 };

/* 디자인 리뷰 → 파일 연결용 가짜 patent_id 매핑 */
const DESIGN_TO_FAKE_PATENT = { 102: 21, 104: 20, 105: 23 };

/* ---------------------------
   로그인 (두 엔드포인트)
---------------------------- */
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body || {};
  res.json({ id: 1, name: username || '홍길동', role: 'EXAMINER', token: 'fake-jwt-token' });
});

app.post('/api/users/login', (req, res) => {
  const { username } = req.body || {};
  const payload = { id: 1, userId: 1, name: username || '홍길동' };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'signature';
  const fakeJwt = [header, body, signature].join('.');
  res.json({ id: 1, name: username || '홍길동', role: 'EXAMINER', token: fakeJwt });
});

/* ---------------------------
   대시보드 요약
---------------------------- */
app.get('/api/reviews/dashboard/:userId', (req, res) => {
  const total = ALL_REVIEWS.length;
  const pending   = ALL_REVIEWS.filter(r => r.status === 'SUBMITTED').length;
  const reviewing = ALL_REVIEWS.filter(r => r.status === 'REVIEWING').length;
  const completed = ALL_REVIEWS.filter(r => ['APPROVED', 'REJECTED'].includes(r.status)).length;
  res.json({ userId: req.params.userId, totalReviews: total, pending, reviewing, completed });
});

/* ---------------------------
   심사 목록 (type/status/title 필터) - 프론트 기대 키로 반환
---------------------------- */
app.get('/api/reviews/list/:userId', (req, res) => {
  const { status, type, reviewType, category, targetType, title } = req.query;

  const rawType = (type || reviewType || category || targetType || '').toString().toUpperCase();
  const wantType = rawType && ['PATENT', 'DESIGN'].includes(rawType) ? rawType : null;

  const wantStatus = (status || '').toString().toUpperCase();
  const hasStatus = !!wantStatus;

  let list = [...ALL_REVIEWS];

  if (wantType)  list = list.filter(r => String(r.type).toUpperCase() === wantType);
  if (hasStatus) list = list.filter(r => String(r.status).toUpperCase() === wantStatus);
  if (title) {
    const q = String(title).toLowerCase();
    list = list.filter(r => r.title.toLowerCase().includes(q));
  }

  const mapped = list.map(i => ({
    reviewId: i.reviewId,
    patentTitle: i.title,
    status: i.status,
    type: i.type,
    applicantName: i.applicantName,
    examinerName: i.examinerName,
    submittedAt: i.submittedAt,
  }));

  res.json(mapped);
});

/* ---------------------------
   심사 검색 (동일 로직)
---------------------------- */
app.get('/api/reviews/search/:examinerId', (req, res) => {
  const { status, type, reviewType, category, targetType, title } = req.query;

  const rawType = (type || reviewType || category || targetType || '').toString().toUpperCase();
  const wantType = rawType && ['PATENT', 'DESIGN'].includes(rawType) ? rawType : null;

  const wantStatus = (status || '').toString().toUpperCase();
  const hasStatus = !!wantStatus;

  let list = [...ALL_REVIEWS];

  if (wantType)  list = list.filter(r => String(r.type).toUpperCase() === wantType);
  if (hasStatus) list = list.filter(r => String(r.status).toUpperCase() === wantStatus);
  if (title) {
    const q = String(title).toLowerCase();
    list = list.filter(r => r.title.toLowerCase().includes(q));
  }

  const mapped = list.map(i => ({
    reviewId: i.reviewId,
    patentTitle: i.title,
    status: i.status,
    type: i.type,
    applicantName: i.applicantName,
    examinerName: i.examinerName,
    submittedAt: i.submittedAt,
  }));

  res.json(mapped);
});

/* ---------------------------
   심사 상세 (리뷰ID별 첨부/청구항 연결)
---------------------------- */
app.get('/api/reviews/:reviewId', (req, res) => {
  const id = Number(req.params.reviewId);
  const base = ALL_REVIEWS.find(r => r.reviewId === id);
  if (!base) return res.status(404).json({ message: 'not found' });

  const isPatent = base.type === 'PATENT';
  const isDesign = base.type === 'DESIGN';

  // 첨부 파일 연결
  let attachmentIds = [];
  if (isPatent && REVIEW_TO_PATENT[id]) {
    attachmentIds = FILES.filter(f => f.patent_id === REVIEW_TO_PATENT[id]).map(f => f.file_id);
  } else if (isDesign && DESIGN_TO_FAKE_PATENT[id]) {
    attachmentIds = FILES.filter(f => f.patent_id === DESIGN_TO_FAKE_PATENT[id]).map(f => f.file_id);
  }

  const decision =
    base.status === 'APPROVED' ? 'APPROVE' :
    base.status === 'REJECTED' ? 'REJECT'  : 'SUBMITTED';

  const commonDetail = {
    reviewId: id,
    patentTitle: base.title,
    applicantName: base.applicantName,
    examinerName: base.examinerName,
    submittedAt: base.submittedAt,
    type: base.type,
    status: base.status,
    decision,
    comment: `리뷰 ${id} 상세 코멘트`,
    description: `${base.title} 에 대한 설명`,
    attachmentIds,
    applicationNumber: (isDesign ? `D-2025-${String(id).padStart(4, '0')}` : `P-2025-${String(id).padStart(4, '0')}`),
    applicationDate: base.submittedAt,
    technicalField: isDesign ? '산업디자인/외관' : '정보통신/보안',
    summary: `${base.title}의 핵심 내용 요약입니다.`,
    reviewProgress: base.status === 'SUBMITTED' ? 20 : base.status === 'REVIEWING' ? 60 : 100,
    estimatedDays: base.status === 'REVIEWING' ? 5 : 0,
    priority: 'medium',
  };

  if (isPatent && REVIEW_TO_PATENT[id]) {
    const patentId = REVIEW_TO_PATENT[id];
    const claims = CLAIMS[patentId] || [];
    return res.json({ ...commonDetail, patentId, claims });
  }

  // 디자인 상세
  res.json({ ...commonDetail, designId: 900 + id });
});

/* ---------------------------
   파일 메타/다운로드/특허별 파일
---------------------------- */
app.get('/api/files/meta/:id', (req, res) => {
  const id = Number(req.params.id);
  const file = FILES.find(f => f.file_id === id);
  if (!file) return res.status(404).json({ message: 'file not found' });
  res.json(file);
});

app.get('/api/files/:id', (req, res) => {
  const id = Number(req.params.id);
  const file = FILES.find(f => f.file_id === id);
  if (!file) return res.status(404).send('Cannot GET /api/files/' + id);

  const name = file.file_name || `attachment-${id}.txt`;
  const body = `Mock file download for #${id}\npatent_id=${file.patent_id}\nfile_url=${file.file_url}`;

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
  res.type('text/plain').send(body);
});

app.get('/api/patents/:patentId/files', (req, res) => {
  const pid = Number(req.params.patentId);
  const rows = FILES.filter(f => f.patent_id === pid);
  res.json(rows);
});

/* ---------------------------
   특허 청구항
---------------------------- */
app.get('/api/patents/:patentId/claims', (req, res) => {
  const pid = Number(req.params.patentId);
  res.json(CLAIMS[pid] || []);
});

/* ---------------------------
   의견서/제출
---------------------------- */
app.post('/api/reviews/submit', (req, res) => {
  console.log('submit body:', req.body);
  res.json({ ok: true, submitted: req.body });
});

app.post('/api/reviews/:reviewId/opinion-notices', (req, res) => {
  const { reviewId } = req.params;
  res.json({ reviewId, ...req.body, createdAt: new Date().toISOString() });
});

app.get('/api/reviews/:reviewId/opinion-notices', (req, res) => {
  const { reviewId } = req.params;
  res.json([
    { id: 1, reviewId, content: '의견서 1', createdAt: '2025-08-01T12:00:00Z' },
    { id: 2, reviewId, content: '의견서 2', createdAt: '2025-08-02T15:30:00Z' },
  ]);
});

/* ---------------------------
   서버 시작
---------------------------- */
app.listen(8080, () => {
  console.log('✅ Mock API running on http://localhost:8080');
});
