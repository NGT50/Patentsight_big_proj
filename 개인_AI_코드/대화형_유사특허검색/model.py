"""
model.py
- KIPRIS API를 호출해 단일/다건 특허 정보를 조회
- KeyBERT + Okt로 질의에서 핵심 키워드 추출
- FastAPI에서 `from model import analyst` 로 바로 사용 가능하도록 전역 analyst 생성
"""

import os
import re
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional

from dotenv import load_dotenv
from keybert import KeyBERT
from konlpy.tag import Okt


# =========================
#  KIPRIS 통합 조회 모듈
# =========================
class ComprehensivePatentSearch:
    """
    하나의 질의(출원번호 또는 자연어 제목/문장)로
    - 기본 정보
    - 인용/피인용
    - 패밀리
    를 조회해서 dict로 반환.
    또한 Top-N 다건 검색(search_multi)도 지원.
    """

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("KIPRIS API 키가 필요합니다. 환경변수 또는 인자로 전달하세요.")
        # ✅ 전달받은 키를 그대로 사용 (하드코딩 금지)
        self.api_key = api_key

        # KIPRIS 엔드포인트
        self.URLS = {
            "word_search": "http://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getWordSearch",
            "cited_info": "http://plus.kipris.or.kr/openapi/rest/CitationService/citationInfoV2",
            "citing_info": "http://plus.kipris.or.kr/openapi/rest/CitingService/citingInfo",
            "family_info": "http://plus.kipris.or.kr/kipo-api/kipi/patFamInfoSearchService/getAppNoPatFamInfoSearch",
        }

    # --- 내부 공통 요청 유틸 ---
    def _make_request(self, url: str, params: Dict) -> Optional[ET.Element]:
        """HTTP GET → XML 파싱 → 최상위 Element 반환(실패 시 None)"""
        try:
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code != 200:
                return None
            root = ET.fromstring(resp.content)
            # 대부분 응답에 item이 있음. 없으면 "데이터 없음"으로 간주
            if root.find(".//item") is None:
                return None
            return root
        except Exception:
            return None

    # --- 자연어/제목 → 대표 출원번호 1건 ---
    def _get_app_number_from_title(self, title: str) -> Optional[str]:
        params = {"word": title, "ServiceKey": self.api_key}
        root = self._make_request(self.URLS["word_search"], params)
        if root is None:
            return None
        item = root.find(".//item")
        app_num = item.findtext("applicationNumber") if item is not None else None
        return app_num.replace("-", "") if app_num else None

    # --- 자연어/제목 → 상위 N개 출원번호 ---
    def _get_top_app_numbers_from_title(self, title: str, top_n: int = 5) -> List[str]:
        """제목/자연어로 검색해 상위 N개의 출원번호 리스트 반환."""
        params = {"word": title, "ServiceKey": self.api_key}
        root = self._make_request(self.URLS["word_search"], params)
        app_numbers: List[str] = []
        if root is not None:
            for item in root.findall(".//item")[: top_n]:
                app_num = (item.findtext("applicationNumber") or "").replace("-", "")
                if app_num:
                    app_numbers.append(app_num)
        return app_numbers

    # --- 세부 조회들 ---
    def get_basic_info(self, app_number: str) -> Dict:
        """출원번호로 기본 서지 정보를 가져옴."""
        params = {"word": app_number, "ServiceKey": self.api_key}
        root = self._make_request(self.URLS["word_search"], params)
        if root is None:
            return {"error": "기본 정보를 가져오지 못했습니다."}

        item = root.find(".//item")
        if item is None:
            return {"error": "기본 정보를 가져오지 못했습니다."}

        basic_info: Dict[str, str] = {}
        for child in item:
            if child.text and child.text.strip():
                basic_info[child.tag] = child.text.strip()
        return basic_info

    def get_cited_info(self, app_number: str) -> List[str]:
        """이 특허가 인용한 문헌(선행기술) 리스트."""
        params = {"applicationNumber": app_number, "accessKey": self.api_key}
        root = self._make_request(self.URLS["cited_info"], params)
        if root is None:
            return []
        return [n.findtext("applicationNumber") for n in root.findall(".//citationInfoV2")]

    def get_citing_info(self, app_number: str) -> List[str]:
        """이 특허를 인용한 문헌(후행기술) 리스트."""
        params = {"standardCitationApplicationNumber": app_number, "accessKey": self.api_key}
        root = self._make_request(self.URLS["citing_info"], params)
        if root is None:
            return []
        return [n.findtext("applicationNumber") for n in root.findall(".//citingInfo")]

    def get_family_info(self, app_number: str) -> List[Dict[str, str]]:
        """해외 패밀리 특허 목록."""
        params = {"applicationNumber": app_number, "ServiceKey": self.api_key}
        root = self._make_request(self.URLS["family_info"], params)
        family_list: List[Dict[str, str]] = []
        if root is not None:
            for item in root.findall(".//item"):
                family_list.append(
                    {
                        "country": item.findtext("applicationCountryCode"),
                        "app_number": item.findtext("applicationNumber"),
                    }
                )
        return family_list

    # --- 결과 한 건 구성 ---
    def _build_result(self, query: str, app_number: str) -> Dict:
        """한 건(app_number)에 대해 기존 구조의 결과 dict 구성."""
        basic_info = self.get_basic_info(app_number)
        if "error" in basic_info:
            return {"error": f"{app_number} 기본 정보를 가져오지 못했습니다."}

        return {
            "main_patent_query": query,
            "applicationNumber": app_number,
            "basicInfo": basic_info,
            "citedPatents (이 특허가 참고)": self.get_cited_info(app_number),
            "citingPatents (이 특허를 참고)": self.get_citing_info(app_number),
            "patentFamily": self.get_family_info(app_number),
        }

    # --- 단일 검색 (기존 호환) ---
    def search(self, query: str) -> Dict:
        """단일 결과(대표 1건). 기존 코드와 호환되도록 유지."""
        # 숫자/하이픈이면 출원번호로 간주
        if re.match(r"^\d+[\d-]*\d+$", query):
            app_number = query.replace("-", "")
        else:
            app_number = self._get_app_number_from_title(query)

        if not app_number:
            return {"error": f"'{query}'에 해당하는 대표 특허를 찾을 수 없습니다."}

        return self._build_result(query, app_number)

    # --- 다건 검색 (Top-N) ---
    def search_multi(self, query: str, top_n: int = 5) -> List[Dict]:
        """
        하나의 질의(query)로 상위 N개 대표 특허를 찾아
        각 건의 상세/인용/피인용/패밀리를 포함한 리스트를 반환.
        """
        # 입력이 숫자형이면 출원번호 한 건만 반환
        if re.match(r"^\d+[\d-]*\d+$", query):
            app_number = query.replace("-", "")
            return [self._build_result(query, app_number)]

        # 자연어/제목이면 워드서치 Top-N
        app_numbers = self._get_top_app_numbers_from_title(query, top_n=top_n)
        if not app_numbers:
            return [{"error": f"'{query}'에 해당하는 대표 특허를 찾을 수 없습니다."}]

        # 중복 제거
        seen = set()
        unique_app_numbers = []
        for n in app_numbers:
            if n and n not in seen:
                seen.add(n)
                unique_app_numbers.append(n)

        results: List[Dict] = []
        for app_no in unique_app_numbers:
            try:
                results.append(self._build_result(query, app_no))
            except Exception:
                results.append({"error": f"{app_no} 처리 중 오류"})
        return results


# =========================
#  AI 키워드 + 컨트롤러
# =========================
class AIPatentAnalyst:
    """
    - KeyBERT + Okt로 질의 문장에서 핵심 키워드를 뽑고
    - ComprehensivePatentSearch 로 단일/다건 조회 수행
    """

    def __init__(self, service_key: str):
        model_name = "jhgan/ko-sroberta-multitask"  # KeyBERT용 sentence-transformers 모델
        self.keybert_model = KeyBERT(model_name)
        self.searcher = ComprehensivePatentSearch(api_key=service_key)
        self.okt = Okt()

    # --- 내부: 문장 → 최종 키워드 ---
    def _extract_final_keyword(self, query_sentence: str) -> Dict:
        """
        입력 문장에서 핵심 어구를 뽑아 최종 검색 키워드를 반환.
        반환: {"keyword": str} 또는 {"error": "..."}
        """
        # 1) KeyBERT로 상위 키워드/구 추출
        keywords_with_scores = self.keybert_model.extract_keywords(
            query_sentence, keyphrase_ngram_range=(1, 3), stop_words=None, top_n=10
        )
        if not keywords_with_scores:
            return {"error": "입력된 문장에서 핵심 기술 어구를 추출하지 못했습니다."}

        max_score = keywords_with_scores[0][1]
        threshold = max_score * 0.7
        selected_phrases = [kw for kw, score in keywords_with_scores if score >= threshold]

        # 2) 명사만 추출 + 중복/단건 제거 + 길이기반 정렬
        raw_keywords_text = " ".join(selected_phrases)
        filtered_nouns = self.okt.nouns(raw_keywords_text)
        unique_words = {w for w in filtered_nouns if len(w) > 1}
        final_keyword = " ".join(sorted(list(unique_words), key=len, reverse=True))

        if not final_keyword:
            return {"error": "추출된 어구에서 유효한 키워드를 찾지 못했습니다."}

        return {"keyword": final_keyword}

    # --- 단일 분석 ---
    def analyze(self, query_sentence: str) -> Dict:
        k = self._extract_final_keyword(query_sentence)
        if "error" in k:
            return k
        return self.searcher.search(k["keyword"])

    # --- 다건 분석 (Top-N) ---
    def analyze_multi(self, query_sentence: str, top_n: int = 5) -> List[Dict]:
        k = self._extract_final_keyword(query_sentence)
        if "error" in k:
            return [k]
        return self.searcher.search_multi(k["keyword"], top_n=top_n)


# =========================
#  전역 analyst (FastAPI에서 import)
# =========================
load_dotenv()
KIPRIS_API_KEY = os.getenv("KIPRIS_API_KEY")
if not KIPRIS_API_KEY:
    # FastAPI 실행 시 즉시 원인 파악이 되도록 명확하게 실패시킴
    raise RuntimeError("환경변수 KIPRIS_API_KEY 가 설정되지 않았습니다. .env 또는 OS 환경변수에 추가하세요.")

# ✅ FastAPI에서 바로 import 가능한 전역 인스턴스
analyst = AIPatentAnalyst(service_key=KIPRIS_API_KEY)
