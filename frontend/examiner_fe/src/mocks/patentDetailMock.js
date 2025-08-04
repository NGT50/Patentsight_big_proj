export const patentDetailMockData = {
  'P-2024-001': {
    id: 'P-2024-001',
    title: '인공지능 기반 스마트 홈 제어 시스템',
    applicant: '㈜미래기술',
    receptionDate: '2024-01-15',
    status: '심사중', // 심사대기, 심사중, 심사완료, 거절, 등록결정
    field: '정보통신',
    examiner: '김민준',
    description: '가정 내 다양한 기기들을 인공지능으로 통합 제어하여 에너지 효율을 극대화하고 사용자 편의성을 높이는 시스템에 대한 특허 출원입니다.',
    reviewProgress: 60,
    claims: [
      '인공지능 모듈을 포함하는 스마트 홈 제어 장치',
      '사용자 음성 명령을 인식하는 음성 인식 유닛',
      '연결된 기기의 상태를 모니터링하는 센서 네트워크'
    ],
    images: [
      "https://placehold.co/300x200?text=2D+Patent+Image+1",
      "https://placehold.co/300x200?text=2D+Patent+Image+2"
    ],
    // GLB 파일은 public 폴더에 있어야 하며, 경로는 public 폴더를 기준으로 합니다.
    modelPath: "/models/output_014746.glb", // 이 경로로 다시 변경하세요!
    relatedPatents: [
      { id: 'P-2022-005', title: '스마트 가전 통합 제어 시스템', description: '유사한 기술 분야의 기존 특허입니다.', image: 'https://placehold.co/150x100/A8DADC/2F4F4F?text=Patent1' },
      { id: 'P-2023-012', title: '음성 인식 기반 기기 제어 방법', description: '음성 인식 기술 관련 선행 특허입니다.', image: 'https://placehold.co/150x100/F0E68C/6B8E23?text=Patent2' },
    ]
  },
  'P-2024-002': {
    id: 'P-2024-002',
    title: '친환경 폐기물 처리 및 에너지 회수 기술',
    applicant: '에코솔루션',
    receptionDate: '2024-02-01',
    status: '심사대기',
    field: '환경/에너지',
    examiner: '이수진',
    description: '폐기물을 효율적으로 분해하고 이 과정에서 발생하는 열에너지를 회수하여 재활용하는 친환경 기술에 대한 특허 출원입니다.',
    reviewProgress: 20,
    claims: [
      '폐기물 열분해 장치',
      '열에너지 회수 모듈',
      '재활용 가능한 부산물 생성 방법'
    ],
    images: [
      "https://placehold.co/300x200?text=2D+Patent+Image+3"
    ],
    modelPath: "", 
    relatedPatents: []
  },
  'P-2023-005': {
    id: 'P-2023-005',
    title: '고효율 태양광 발전 패널 구조',
    applicant: '솔라텍',
    receptionDate: '2023-05-10',
    status: '심사완료',
    field: '신재생에너지',
    examiner: '박지훈',
    description: '기존 태양광 패널 대비 발전 효율을 20% 이상 향상시킨 새로운 구조의 태양광 발전 패널 특허입니다.',
    reviewProgress: 100,
    claims: [
      '나노 코팅이 적용된 태양광 흡수층',
      '다중 반사 구조를 포함하는 패널',
      '열 관리 시스템'
    ],
    images: [
      "https://placehold.co/300x200?text=2D+Patent+Image+4"
    ],
    // GLB 파일은 public 폴더에 있어야 하며, 경로는 public 폴더를 기준으로 합니다.
    modelPath: "/models/output_015440.glb", // 이 경로로 다시 변경하세요!
    relatedPatents: [
      { id: 'P-2021-003', title: '차세대 태양전지 기술', description: '태양전지 효율 개선 관련 특허입니다.', image: 'https://placehold.co/150x100/ADD8E6/00008B?text=Patent3' },
    ]
  },
  'P-2024-003': {
    id: 'P-2024-003',
    title: '자율주행 차량용 센서 융합 기술',
    applicant: '오토드라이브',
    receptionDate: '2024-03-20',
    status: '거절',
    field: '자동차',
    examiner: '최영희',
    description: '다양한 센서(레이더, 라이다, 카메라)에서 수집된 데이터를 융합하여 자율주행 정확도를 높이는 기술에 대한 특허 출원입니다. 선행 기술과의 유사성으로 인해 거절되었습니다.',
    reviewProgress: 80,
    claims: [
      '다중 센서 데이터 융합 모듈',
      '실시간 환경 인식 알고리즘',
      '차량 제어 인터페이스'
    ],
    images: [
      "https://placehold.co/300x200?text=2D+Patent+Image+5"
    ],
    // GLB 파일은 public 폴더에 있어야 하며, 경로는 public 폴더를 기준으로 합니다.
    modelPath: "/models/white_mesh.glb", // 이 경로로 다시 변경하세요!
    relatedPatents: [
      { id: 'P-2020-008', title: '자율주행 센서 데이터 처리 방법', description: '기존 자율주행 관련 특허입니다.', image: 'https://placehold.co/150x100/FFB6C1/8B0000?text=Patent4' },
    ]
  },
  'P-2024-004': {
    id: 'P-2024-004',
    title: '블록체인 기반 저작권 관리 시스템',
    applicant: '크리에이터랩',
    receptionDate: '2024-04-05',
    status: '등록결정',
    field: '블록체인',
    examiner: '강동원',
    description: '블록체인 기술을 활용하여 디지털 콘텐츠의 저작권을 투명하고 효율적으로 관리하는 시스템에 대한 특허 출원입니다.',
    reviewProgress: 100,
    claims: [
      '분산원장 기반 저작권 등록 모듈',
      '스마트 계약을 통한 저작권료 분배',
      '콘텐츠 사용 이력 추적 시스템'
    ],
    images: [
      "https://placehold.co/300x200?text=2D+Patent+Image+6"
    ],
    modelPath: "", 
    relatedPatents: []
  }
};
