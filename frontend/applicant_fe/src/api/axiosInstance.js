import axios from 'axios';

const instance = axios.create({
  // AWS 서버의 주소와 포트 번호를 baseURL로 설정합니다.
  baseURL: 'http://3.26.101.212:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;

//'http://3.26.101.212:8000', 