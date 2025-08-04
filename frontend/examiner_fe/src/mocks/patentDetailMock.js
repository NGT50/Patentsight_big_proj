export const patentDetailMockData = {
  '2025-00000': {
    id: '2025-00000',
    applicant: '홍길동',
    title: 'AI 기반 출원 점검 시스템',
    receptionDate: '2025-07-30',
    claim: '[1] 본 발명은 AI 기반 출원 서류 점검 시스템에 관한 것이다...',
    summary: 'AI 기술을 활용하여 출원 서류 내 오류를 자동 탐지하는 시스템.',
    drawings: [
      '/sample-claim1.jpg',
      '/sample-claim2.jpg',
    ],
    similarPatents: [
      {
        id: '2023-00001',
        image: '/similar_patent1.jpg',
        comment: '모듈 구조 유사',
      },
      {
        id: '2023-00002',
        image: '/similar_patent2.jpg',
        comment: 'AI 기반 오류 탐지 로직 유사',
      },
    ],
  },

  '2025-00001': {
    id: '2025-00001',
    applicant: '채윤승',
    title: 'AI 기반 출원 점검 시스템',
    receptionDate: '2025-07-29',
    claim: '[1] 출원 문서 내 누락 항목 탐지를 위한 알고리즘 구성...',
    summary: '서식 오류를 AI로 자동 판별하고 심사 전 사전 검토 가능하게 함.',
    drawings: ['/sample-claim3.jpg'],
    similarPatents: [],
  },

  // 다른 출원번호 추가 가능
};
