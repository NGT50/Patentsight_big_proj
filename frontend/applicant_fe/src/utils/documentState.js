// 문서 데이터의 초기 구조를 정의합니다.
export const initialDocumentState = {
  title: '',
  // 분류 코드(CPC)는 백엔드에서 NOT NULL 제약이 있으므로
  // 초안 생성 시에도 빈 문자열로 전달한다.
  cpc: '',
  // 발명자명도 필수 컬럼이므로 기본값을 빈 문자열로 초기화한다.
  inventor: '',
  technicalField: '',
  backgroundTechnology: '',
  inventionDetails: {
    problemToSolve: '',
    solution: '',
    effect: '',
  },
  summary: '',
  drawingDescription: '',
  claims: [''],
};