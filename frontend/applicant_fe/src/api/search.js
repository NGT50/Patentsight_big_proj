// src/api/search.js

/**
 * 유사 특허 검색 (Mock 버전)
 * 실제 API 호출 대신, 시연용 더미 데이터 리턴
 */
export const searchSimilarPatents = async ({ searchQuery, top_n = 5 }) => {
  console.log("검색어:", searchQuery, " top_n:", top_n);

  return {
    answer: `"${searchQuery}" 관련 주요 특허 ${top_n}건을 찾았습니다.`,
    patents: [
      {
        "main_patent_query": "로봇 수술",
        "applicationNumber": "1020120043476",
        "basicInfo": {
          "applicantName": "주식회사 고영테크놀러지|한양대학교 에리카산학협력단",
          "applicationDate": "20120425",
          "applicationNumber": "1020120043476",
          "astrtCont": "로봇 암의 끝단부에 설치되는 말단장치의 위치에 따른 RCM 포인트를 ...",
          "bigDrawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=2ba38663aa11ff0f6ca91af6061a2e00e39169ffdb046a746289945156314fd14ac4165bad530977313756f23dc8e2e9f9452944a1f7a0cc6b51a458d6c02420b3cbc77a525b9961",
          "drawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf9118776b53ad305f8d058a9ca0fd3cb61e7490f1d957bcdf265297316ab471bad4e20946e715ea9a0777d3a4fce530419f0c8ed50381c45c",
          "inventionTitle": "수술용 로봇",
          "ipcNumber": "A61B 34/00|B25J 13/08",
          "publicationDate": "20130912",
          "registerDate": "20130906",
          "registerNumber": "1013079510000",
          "registerStatus": "등록"
        },
        "citedPatents": [],
        "citingPatents": [],
        "patentFamily": []
      },
      {
        "main_patent_query": "로봇 수술",
        "applicationNumber": "1020220121028",
        "basicInfo": {
          "applicantName": "큐렉소 주식회사",
          "applicationDate": "20220923",
          "applicationNumber": "1020220121028",
          "astrtCont": "본 발명은 수술 로봇의 절삭 경로 플래닝 장치 및 그 방법에 관한 것으로...",
          "bigDrawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=6c650beb4cee9ce4122b704b88878c93fe118eaf6a2d9404afdc20679c5146386534dde4747188977cb65e9d003e4307d9d3d66c0662a4f1203c2d36c9e638d92c16c6b7a3659901",
          "drawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfafcbc342afaea4d5870ccdf59b826823313ce68f4420ea243bfe1a59aa3a63cf317575ca5d3b0c44d3c81eaae44e69e1a0b0f47d5efaef8f",
          "inventionTitle": "수술 로봇의 절삭 경로 플래닝 장치 및 그 방법",
          "ipcNumber": "A61B 34/10|A61B 34/30|A61B 34/00",
          "openDate": "20240401",
          "openNumber": "1020240041681",
          "publicationDate": "20250804",
          "registerDate": "20250729",
          "registerNumber": "1028415960000",
          "registerStatus": "등록"
        },
        "citedPatents": [],
        "citingPatents": [],
        "patentFamily": [
          { "country": "CN", "app_number": "202380068362" },
          { "country": "EP", "app_number": "23868591" },
          { "country": "KR", "app_number": "2023014301" }
        ]
      },
      {
        "main_patent_query": "로봇 수술",
        "applicationNumber": "1020220082162",
        "basicInfo": {
          "applicantName": "삼성디스플레이 주식회사",
          "applicationDate": "20201209",
          "applicationNumber": "1020200171573",
          "astrtCont": "전계 인가 장치가 제공된다...",
          "bigDrawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=6c650beb4cee9ce4122b704b88878c93d28b6847834d0bebd0481ca4166436d0151db919ef7e039036434969b7a5df871b79a676005e7293b2e9bd7071b2da2dd4822c0273190d9c",
          "drawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfc55451d21dba040280978512582e54ce45afaa9940ea5aff4885a5d51a97b17e8f63d5fb0b66d97e88dcb00b47dc2fcbf2f9b79e2eed4430",
          "inventionTitle": "전계 인가 장치",
          "ipcNumber": "G01R 31/28|G01R 1/073|G01R 1/067",
          "openDate": "20220617",
          "openNumber": "1020220082162",
          "registerStatus": "공개"
        },
        "citedPatents": [],
        "citingPatents": [],
        "patentFamily": []
      },
      {
        "main_patent_query": "로봇 수술",
        "applicationNumber": "1020160089635",
        "basicInfo": {
          "applicantName": "(주)미래컴퍼니",
          "applicationDate": "20160715",
          "applicationNumber": "1020160089635",
          "astrtCont": "수술 로봇 시스템 및 그 제어방법이 개시된다...",
          "bigDrawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=2ba38663aa11ff0f6ca91af6061a2e00f7ee4d42fdf8b14b03126d9925316eaf1181d0d0e8d8599e71fbdddf1c3e05882f8d5a51483165c84b06705c44d4f2ee8eec6f9bf7ee6532",
          "drawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf180e368476a00bc24a2bef232365eb08c1fb7f0b94653d18e8563235341c8ba820ae9f93e8040e277a67dbcd2d51ff3963c94911bdd52f42",
          "inventionTitle": "수술 로봇 시스템 및 그 제어방법",
          "ipcNumber": "A61B 34/30|A61B 34/35|A61B 34/00",
          "publicationDate": "20160808",
          "registerDate": "20160801",
          "registerNumber": "1016459690000",
          "registerStatus": "등록"
        },
        "citedPatents": [],
        "citingPatents": [],
        "patentFamily": []
      },
      {
        "main_patent_query": "로봇 수술",
        "applicationNumber": "1020240170032",
        "basicInfo": {
          "applicantName": "주식회사 로엔서지컬",
          "applicationDate": "20241125",
          "applicationNumber": "1020240170032",
          "astrtCont": "본 발명은 수술 로봇 시스템 및 그 제어방법에 관한 것이다...",
          "bigDrawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=6c650beb4cee9ce4122b704b88878c936e4618879a672b2f6f0c09125aa36c994b7186aebf53f8d65366db9a32dc889ad84a009b20238fb674081232927d47253f4a1308994bf806",
          "drawing": "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf10add4f4d6d868b31d7afc1cbe6808c324cb9aa7e94b6662c6031a9109bba104d874bbb6b3bada112560a96d6112f8bc8095cb1e0fd01c16",
          "inventionTitle": "수술 로봇 시스템",
          "ipcNumber": "A61B 34/30|A61B 34/37|A61B 34/00|A61B 17/00",
          "openDate": "20250602",
          "openNumber": "1020250078369",
          "registerStatus": "공개"
        },
        "citedPatents": [],
        "citingPatents": [],
        "patentFamily": [
          { "country": "KR", "app_number": "2024018793" }
        ]
      }
    ]
  };
};
