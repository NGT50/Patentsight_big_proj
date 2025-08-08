# Patentsight_big_proj

### 🧪 로그인 테스트용 더미 데이터 (localStorage)

프론트엔드에서 로그인 기능을 테스트하려면 아래 코드를 브라우저 개발자 도구 열고 콘솔에 복사하여 실행

```js
//붙여넣기 허용 코드 먼저 실행
allow pasting

// 출원인(applicant)과 심사관(examiner) 계정 등록
localStorage.setItem('registeredUsers', JSON.stringify({
  // 출원인 계정들
  "applicant1": {
    id: "applicant1",
    password: "1234",
    name: "홍길동",
    email: "applicant1@test.com",
    phone: "010-1234-5678",
    address: "서울시 강남구"
  },
  "applicant2": {
    id: "applicant2", 
    password: "1234",
    name: "김출원",
    email: "applicant2@test.com",
    phone: "010-2345-6789",
    address: "서울시 서초구"
  },
  "applicant3": {
    id: "applicant3",
    password: "1234", 
    name: "이특허",
    email: "applicant3@test.com",
    phone: "010-3456-7890",
    address: "부산시 해운대구"
  },
  "applicant4": {
    id: "applicant4",
    password: "1234",
    name: "박발명", 
    email: "applicant4@test.com",
    phone: "010-4567-8901",
    address: "대구시 수성구"
  },
  "applicant5": {
    id: "applicant5",
    password: "1234",
    name: "최창작",
    email: "applicant5@test.com", 
    phone: "010-5678-9012",
    address: "인천시 연수구"
  },
  
  // 심사관 계정들
  "examiner1": {
    id: "examiner1",
    password: "5678",
    name: "김심사",
    email: "examiner1@test.com",
    phone: "010-9876-5432",
    address: "특허청"
  },
  "examiner2": {
    id: "examiner2",
    password: "5678", 
    name: "이심사",
    email: "examiner2@test.com",
    phone: "010-8765-4321",
    address: "특허청"
  },
  "examiner3": {
    id: "examiner3",
    password: "5678",
    name: "박심사", 
    email: "examiner3@test.com",
    phone: "010-7654-3210",
    address: "특허청"
  },
  "examiner4": {
    id: "examiner4",
    password: "5678",
    name: "최심사",
    email: "examiner4@test.com",
    phone: "010-6543-2109", 
    address: "특허청"
  },
  "examiner5": {
    id: "examiner5",
    password: "5678",
    name: "정심사",
    email: "examiner5@test.com",
    phone: "010-5432-1098",
    address: "특허청"
  }
}));
```

### 📋 테스트 계정 정보

#### 출원인 계정 (Applicant)
| 아이디 | 비밀번호 | 이름 | 이메일 |
|--------|----------|------|--------|
| applicant1 | 1234 | 홍길동 | applicant1@test.com |
| applicant2 | 1234 | 김출원 | applicant2@test.com |
| applicant3 | 1234 | 이특허 | applicant3@test.com |
| applicant4 | 1234 | 박발명 | applicant4@test.com |
| applicant5 | 1234 | 최창작 | applicant5@test.com |

#### 심사관 계정 (Examiner)
| 아이디 | 비밀번호 | 이름 | 이메일 | 심사유형 |
|--------|----------|------|--------|----------|
| examiner1 | 5678 | 김심사 | examiner1@test.com | 특허·실용신안 / 디자인·상표 |
| examiner2 | 5678 | 이심사 | examiner2@test.com | 특허·실용신안 / 디자인·상표 |
| examiner3 | 5678 | 박심사 | examiner3@test.com | 특허·실용신안 / 디자인·상표 |
| examiner4 | 5678 | 최심사 | examiner4@test.com | 특허·실용신안 / 디자인·상표 |
| examiner5 | 5678 | 정심사 | examiner5@test.com | 특허·실용신안 / 디자인·상표 |

### 🔄 테스트 방법

1. **브라우저 개발자 도구 열기**
   - F12 또는 우클릭 → 검사

2. **콘솔 탭으로 이동**

3. **위의 JavaScript 코드 복사 후 붙여넣기**

4. **Enter 키로 실행**

5. **로그인 페이지에서 테스트**
   - 출원인: `applicant1` / `1234`
   - 심사관: `examiner1` / `5678` (심사유형 선택 필요)

> ✅ 실제 백엔드 API 연동 전까지는 이 방식으로 로그인 기능을 테스트할 수 있습니다.
