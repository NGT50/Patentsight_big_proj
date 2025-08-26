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
        astrtCont: "로봇 암의 끝단부에 설치되는 말단장치의 위치에 따른 RCM 포인트를 상기 말단장치 상에 사용자가 육안으로 확인할 수 있도록 가변적으로 표시해 줄 수 있는 수술 로봇이 개시된다. 상기 수술 로봇은 말단장치의 위치가 변경되더라도 상기 RCM 포인트 표시수단에 의해 상기 말단장치 상에 RCM 포인트가 가변적으로 표시되어 사용자가 상기 말단장치 상의 RCM 포인트를 육안으로 직접 확인할 수 있다. 따라서, 수술 시 상기 말단장치와 환자의 절개부와의 간섭 현상을 방지하기 위한 상기 RCM 포인트를 환자의 절개 부위와 일치시키는 작업을 매우 용이하고 신속하게 할 수 있어 로봇 수술 시 상기 수술 로봇의 세팅 시간을 대폭 줄일 수 있으므로 전체 수술시간까지도 줄일 수 있는 효과가 있다.",
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
        astrtCont: "본 발명은 수술 로봇의 절삭 경로 플래닝 장치 및 그 방법에 관한 것으로, 본 발명에 따른 수술로봇의 절삭 경로 플래닝 방법은, 수술대상 뼈의 3D 모델을 기초로 수술대상 뼈에 설치될 임플란트의 위치 및 자세를 결정하는 단계; 상기 임플란트의 설치를 위하여 절삭이 필요한 상기 수술대상 뼈의 절삭면을 결정하는 단계; 상기 절삭면에 대하여 수술로봇이 절삭을 시작하는 절삭 시작 위치와 상기 절삭 시작 위치에서의 상기 수술로봇의 진입 방향을 결정하는 단계; 상기 절삭 시작 위치와 상기 진입 방향을 기초로 상기 수술로봇에 의한 절삭 경로가 정의될 수 있는 최대 영역을 설정하는 단계; 상기 절삭면이 절삭된 상태가 가상으로 반영된 변형 3D 모델을 생성하는 단계; 및 상기 변형 3D 모델을 기초로 상기 최대 영역의 범위 내에서 상기 절삭 시작 위치로부터 시작되는 상기 수술로봇의 절삭 경로를 생성하는 단계를 포함한다. 이를 통하여, 환자에 따른 뼈의 다양성을 고려한 환자 맞춤형 절삭 경로를 자동으로 생성함으로써 수술 효과를 더욱 향상시킬 수 있다.",
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
        astrtCont: "전계 인가 장치는 스테이지, 및 상기 스테이지의 일 측에 구비되는 전계 인가 모듈을 포함하되, 상기 전계 인가 모듈은, 프로브 헤드, 상기 프로브 헤드의 제1 면 상에 배치되는 적어도 하나의 프로브 핀, 상기 프로브 헤드와 제1 방향으로 이격되어 배치되는 가이드 플레이트, 및 상기 프로브 헤드와 상기 가이드 플레이트 사이에 배치되며, 상기 프로브 헤드와 상기 가이드 플레이트를 상호 체결하고 폴딩시키는 체결부를 포함한다.",
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
        astrtCont: "수술 로봇 시스템 및 그 제어방법이 개시된다. 수술 부위에 삽입되어 수술에 필요한 동작을 수행하는 인스트루먼트(instrument)와, 인스트루먼트의 작동을 제어하는 제어부를 포함하는 수술 로봇 시스템으로서, 제어부는 탐색 모드(search mode) 또는 작용 모드(action mode)에서 작동되고, 탐색 모드일 때 제어부는, 인스트루먼트에 가해지는 외력을 센싱할 수 있도록 인스트루먼트의 작동을 제어하며, 작용 모드일 때 제어부는, 인스트루먼트가 수술에 필요한 동작을 수행하도록 인스트루먼트의 작동을 제어하는 것을 특징으로 하는 수술 로봇 시스템은, 최소침습 복강경 수술용 로봇에서 인스트루먼트를 제어하는 방식을 탐색 모드와 작용 모드로 구분하여, 탐색 모드시 수술 부위 및 체내 조직 부위와 인스트루먼트가 접촉하는 상호 작용 과정에서 인스트루먼트에 작용하는 반력을 측정하여, 그 정도를 스코프 화면 상에 표시하거나 마스터 콘솔에 측정된 반력을 피드백시켜 집도의가 이를 감지할 수 있도록 할 수 있다.",
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
        astrtCont: "본 발명은 수술 로봇 시스템 및 그 제어방법에 관한 것이다. 본 발명의 수술 로봇 시스템은 복수의 수술기구를 구동시키는 제어 정보가 포함된 데이터그램 커맨드를 송신하는 분배 모듈, 상기 데이터그램 커맨드를 수신하여 제1 구동신호를 출력하고 터미널 모듈로 송신하는 컨티뉴엄 모듈, 및 상기 데이터그램 커맨드를 수신하여 제2 구동신호를 출력하는 터미널 모듈을 포함한다. 또한, 본 발명은 가동 플랫폼에 장착되는 병진 모듈과, 상기 병진 모듈에 장착되어 스트로크 구간 내에서 병진 운동하는 복수의 구동 모듈을 포함하는 모듈러 매니퓰레이터 어셈블리를 제공한다. 상기 구동 모듈에는 오버튜브 모듈과 수술기구 모듈이 장착되며, 수술기구는 오버튜브로 관입되어 가이드된다. 오버튜브와 수술기구가 단일 어셈블리로 통합되어 공간 효율성이 증대되며, 수술기구 교체시에도 별도의 제어 패킷 변경이 불필요하여 시스템의 안정성이 향상될 수 있다.",
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
    inventor: p.basicInfo?.applicantName || "출원인 정보 없음",   // ✅ 키 이름을 applicant 로 변경
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

