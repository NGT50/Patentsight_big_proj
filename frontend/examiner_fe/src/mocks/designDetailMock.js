export const designDetailMockData = {
  'D-2024-001': {
    id: 'D-2024-001',
    title: '미니멀리즘 스마트폰 디자인',
    applicant: '테크이노베이션',
    receptionDate: '2024-01-20',
    status: '심사중', // 심사대기, 심사중, 심사완료, 보류
    field: '전자제품',
    reviewer: '이서연',
    description: '불필요한 요소를 제거하고 사용자 경험에 집중한 차세대 스마트폰 디자인입니다. 부드러운 곡선과 무광택 마감이 특징입니다.',
    reviewProgress: 50,
    images: [ // 2D 도면 이미지 추가
      "https://placehold.co/300x200/FFC0CB/800000?text=Design+2D+1",
      "https://placehold.co/300x200/ADD8E6/00008B?text=Design+2D+2"
    ],
    modelPath: "/models/output_014746.glb", // 3D GLB 모델 경로
    similarDesigns: [
      { id: 'D-2023-010', title: '초슬림 노트북 디자인', description: '유사한 미니멀리즘 컨셉의 노트북 디자인입니다.', image: 'https://placehold.co/150x100/DDA0DD/800080?text=Similar+D1' },
      { id: 'D-2022-005', title: '무선 이어폰 케이스 디자인', description: '곡선형 디자인이 유사한 이어폰 케이스입니다.', image: 'https://placehold.co/150x100/98FB98/006400?text=Similar+D2' },
    ]
  },
  'D-2024-002': {
    id: 'D-2024-002',
    title: '친환경 재활용 의자 디자인',
    applicant: '에코퍼니처',
    receptionDate: '2024-02-10',
    status: '심사대기',
    field: '가구',
    reviewer: '박준영',
    description: '폐플라스틱을 재활용하여 제작된 인체공학적 의자 디자인입니다. 지속 가능성과 편안함을 동시에 추구합니다.',
    reviewProgress: 20,
    images: [
      "https://placehold.co/300x200/F0E68C/6B8E23?text=Design+2D+3"
    ],
    modelPath: "", // 이 디자인에는 3D 모델이 없다고 가정
    similarDesigns: []
  },
  'D-2023-005': {
    id: 'D-2023-005',
    title: '모듈형 스마트 워치 디자인',
    applicant: '퓨처웨어',
    receptionDate: '2023-05-01',
    status: '심사완료',
    field: '웨어러블',
    reviewer: '최지은',
    description: '사용자가 스트랩, 본체, 베젤 등을 자유롭게 조합하여 커스터마이징할 수 있는 모듈형 스마트 워치 디자인입니다.',
    reviewProgress: 100,
    images: [
      "https://placehold.co/300x200/E6E6FA/4B0082?text=Design+2D+4"
    ],
    modelPath: "/models/output_015440.glb", // 다른 3D GLB 모델 경로
    similarDesigns: [
      { id: 'D-2022-015', title: '커스터마이징 헤드폰', description: '사용자 맞춤형 헤드폰 디자인입니다.', image: 'https://placehold.co/150x100/AFEEEE/008080?text=Similar+D3' },
    ]
  },
  'D-2024-003': {
    id: 'D-2024-003',
    title: '스마트 키친 로봇 디자인',
    applicant: '홈오토메이트',
    receptionDate: '2024-03-10',
    status: '보류',
    field: '가전제품',
    reviewer: '김태호',
    description: '주방에서 요리 보조 및 식재료 관리를 돕는 로봇 디자인입니다. 사용자 친화적인 인터페이스와 귀여운 외형이 특징입니다.',
    reviewProgress: 70,
    images: [
      "https://placehold.co/300x200/FFF0F5/8B0000?text=Design+2D+5"
    ],
    modelPath: "/models/white_mesh.glb", // 또 다른 3D GLB 모델 경로
    similarDesigns: [
      { id: 'D-2021-008', title: 'AI 서빙 로봇', description: '레스토랑 서빙 로봇 디자인입니다.', image: 'https://placehold.co/150x100/F5DEB3/A0522D?text=Similar+D4' },
    ]
  }
};