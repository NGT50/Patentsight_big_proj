# Patentsight_big_proj

### 🧪 로그인 테스트용 더미 데이터 (localStorage)

프론트엔드에서 로그인 기능을 테스트하려면 아래 코드를 브라우저 개발자 도구 열고 콘솔에 복사하여 실행

```js
//붙여넣기 허용 코드 먼저 실행
allow pasting

// 출원인(applicant)과 심사관(examiner) 계정 등록
localStorage.setItem('registeredUsers', JSON.stringify({
  "applicant1": {
    id: "applicant1",
    password: "1234",
    name: "홍길동",
    email: "applicant@test.com",
    phone: "010-1234-5678",
    address: "서울시 강남구"
  },
  "examiner1": {
    id: "examiner1",
    password: "5678",
    name: "김심사",
    email: "examiner@test.com",
    phone: "010-9876-5432",
    address: "특허청"
  }
}));
```

> ✅ 실제 백엔드 API 연동 전까지는 이 방식으로 로그인 기

# Patentsight Project

This repository contains a sample structure for a patent management service. The backend is implemented with Spring Boot and organized under the `com.patentsight` package. A minimal frontend directory is also included.

## Documentation

- [Database ERD](docs/ERD.md)
- [Patent API Specification](docs/patent-api.md)

