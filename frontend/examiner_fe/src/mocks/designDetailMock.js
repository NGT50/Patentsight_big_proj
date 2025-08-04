export const designDetailMockData = {
  'D-2025-00001': {
    id: 'D-2025-00001',
    applicant: '홍길동',
    title: '스마트 안경 디자인',
    receptionDate: '2025-07-28',
    description: '증강 현실 기능을 통합한 미래지향적 스마트 안경 디자인. 인체공학적 설계로 착용감을 극대화하고, 미니멀리스트적인 외형으로 일상복과의 조화를 추구합니다.',
    drawings: [
      '/design_drawing_smart_glasses_1.jpg',
      '/design_drawing_smart_glasses_2.jpg',
    ],
    similarDesigns: [
      {
        id: 'D-2024-00100',
        image: '/similar_design_old_glasses.jpg',
        comment: '안경테의 곡선 라인 유사',
      },
      {
        id: 'D-2023-00200',
        image: '/similar_design_ar_headset.jpg',
        comment: '착용 방식 및 디스플레이 통합 아이디어 유사',
      },
    ],
    status: '심사대기',
    reviewerComment: null,
  },
  'D-2025-00002': {
    id: 'D-2025-00002',
    applicant: '이영희',
    title: 'AI 스피커 외형 디자인',
    receptionDate: '2025-07-27',
    description: '원통형 구조에 패브릭 소재를 사용하여 따뜻하고 친근한 느낌을 주는 AI 스피커 디자인. 상단 터치 패널은 직관적인 사용자 경험을 제공하며, 하단 LED 링은 스피커의 상태를 시각적으로 보여줍니다.',
    drawings: [
      '/design_drawing_ai_speaker_1.jpg',
      '/design_drawing_ai_speaker_2.jpg',
      '/design_drawing_ai_speaker_3.jpg',
    ],
    similarDesigns: [],
    status: '심사중',
    reviewerComment: '패브릭 소재 사용 부분에 대한 추가 상세 도면 필요.',
  },
  'D-2025-00003': {
    id: 'D-2025-00003',
    applicant: '김철수',
    title: '접이식 키보드 디자인',
    receptionDate: '2025-07-26',
    description: '휴대성을 극대화한 삼단 접이식 블루투스 키보드 디자인. 접었을 때 명함 지갑 크기로 줄어들어 편리하게 휴대할 수 있으며, 펼쳤을 때 풀사이즈 키보드와 동일한 타이핑 경험을 제공합니다.',
    drawings: [
      '/design_drawing_foldable_keyboard_1.jpg',
      '/design_drawing_foldable_keyboard_2.jpg',
    ],
    similarDesigns: [
      {
        id: 'D-2022-00300',
        image: '/similar_design_portable_keyboard.jpg',
        comment: '접이식 메커니즘이 유사함',
      },
    ],
    status: '심사완료',
    reviewerComment: '등록 결정. 독창적인 접이식 구조가 인정됨.',
  },
  'D-2025-00004': {
    id: 'D-2025-00004',
    applicant: '박선우',
    title: '친환경 텀블러 디자인',
    receptionDate: '2025-07-25',
    description: '재활용 플라스틱과 대나무 섬유를 사용하여 제작된 친환경 텀블러 디자인. 독특한 질감과 자연에서 영감을 받은 색상으로 환경 보호 메시지를 전달합니다.',
    drawings: [
      '/design_drawing_eco_tumbler_1.jpg',
      '/design_drawing_eco_tumbler_2.jpg',
    ],
    similarDesigns: [],
    status: '보류',
    reviewerComment: '친환경 소재 사용 증빙 자료 보완 필요.',
  },
};