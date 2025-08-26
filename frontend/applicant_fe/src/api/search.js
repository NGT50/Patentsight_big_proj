// src/api/search.js

/**
 * 유사 특허 검색 (Mock 버전 - flat 구조 변환)
 * PatentCard가 바로 쓸 수 있도록 데이터를 가공해서 반환
 */
export const searchSimilarPatents = async ({ searchQuery, top_n = 5 }) => {
  console.log("검색어:", searchQuery, " top_n:", top_n);

  // 원본 mock 데이터
  const rawPatents = [
    {
      applicationNumber: "1020120043476",
      basicInfo: {
        inventionTitle: "수술용 로봇",
        applicantName: "주식회사 고영테크놀러지|한양대학교 에리카산학협력단",
        applicationDate: "20120425",
        astrtCont: "로봇 암의 끝단부에 설치되는 말단장치의 위치에 따른 RCM 포인트를 ...",
        drawing: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf9118776b53ad305f8d058a9ca0fd3cb61e7490f1d957bcdf265297316ab471bad4e20946e715ea9a0777d3a4fce530419f0c8ed50381c45c",
        ipcNumber: "A61B 34/00|B25J 13/08",
        registerStatus: "등록"
      }
    },
    {
      applicationNumber: "1020220121028",
      basicInfo: {
        inventionTitle: "수술 로봇의 절삭 경로 플래닝 장치 및 그 방법",
        applicantName: "큐렉소 주식회사",
        applicationDate: "20220923",
        astrtCont: "본 발명은 수술 로봇의 절삭 경로 플래닝 장치 및 그 방법에 관한 것으로...",
        drawing: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfafcbc342afaea4d5870ccdf59b826823313ce68f4420ea243bfe1a59aa3a63cf317575ca5d3b0c44d3c81eaae44e69e1a0b0f47d5efaef8f",
        ipcNumber: "A61B 34/10|A61B 34/30|A61B 34/00",
        registerStatus: "등록"
      }
    },
    {
      applicationNumber: "1020220082162",
      basicInfo: {
        inventionTitle: "전계 인가 장치",
        applicantName: "삼성디스플레이 주식회사",
        applicationDate: "20201209",
        astrtCont: "전계 인가 장치가 제공된다...",
        drawing: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cfc55451d21dba040280978512582e54ce45afaa9940ea5aff4885a5d51a97b17e8f63d5fb0b66d97e88dcb00b47dc2fcbf2f9b79e2eed4430",
        ipcNumber: "G01R 31/28|G01R 1/073|G01R 1/067",
        registerStatus: "공개"
      }
    },
    {
      applicationNumber: "1020160089635",
      basicInfo: {
        inventionTitle: "수술 로봇 시스템 및 그 제어방법",
        applicantName: "(주)미래컴퍼니",
        applicationDate: "20160715",
        astrtCont: "수술 로봇 시스템 및 그 제어방법이 개시된다...",
        drawing: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf180e368476a00bc24a2bef232365eb08c1fb7f0b94653d18e8563235341c8ba820ae9f93e8040e277a67dbcd2d51ff3963c94911bdd52f42",
        ipcNumber: "A61B 34/30|A61B 34/35|A61B 34/00",
        registerStatus: "등록"
      }
    },
    {
      applicationNumber: "1020240170032",
      basicInfo: {
        inventionTitle: "수술 로봇 시스템",
        applicantName: "주식회사 로엔서지컬",
        applicationDate: "20241125",
        astrtCont: "본 발명은 수술 로봇 시스템 및 그 제어방법에 관한 것이다...",
        drawing: "http://plus.kipris.or.kr/kiprisplusws/fileToss.jsp?arg=ed43a0609e94d6e22d01c5c32ba711cf10add4f4d6d868b31d7afc1cbe6808c324cb9aa7e94b6662c6031a9109bba104d874bbb6b3bada112560a96d6112f8bc8095cb1e0fd01c16",
        ipcNumber: "A61B 34/30|A61B 34/37|A61B 34/00|A61B 17/00",
        registerStatus: "공개"
      }
    }
  ];

  // 🔹 PatentCard에서 바로 쓸 수 있도록 flat 구조로 변환
  const patents = rawPatents.map((p, idx) => ({
    id: idx + 1,
    title: p.basicInfo?.inventionTitle || "제목 없음",
    applicant: p.basicInfo?.applicantName || "N/A",
    summary: p.basicInfo?.astrtCont || "요약 정보가 없습니다.",
    image: p.basicInfo?.drawing || null,
    ipc: p.basicInfo?.ipcNumber || "N/A",
    status: p.basicInfo?.registerStatus || "N/A",
    applicationNumber: p.applicationNumber || "N/A",
    applicationDate: p.basicInfo?.applicationDate || "N/A"
  }));

  return {
    answer: `"${searchQuery}" 관련 주요 특허 ${Math.min(top_n, patents.length)}건을 찾았습니다.`,
    patents
  };
};

