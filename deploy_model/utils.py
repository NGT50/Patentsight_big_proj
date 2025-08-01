# 🔧 utils.py
from collections import defaultdict
import requests
import xmltodict

def extract_app_number(full_id: str) -> str:
    return full_id.split("_")[0]

def group_and_rank(matches, sim_threshold=0.8, top_k=5, extract_id_fn=extract_app_number):
    grouped = defaultdict(list)
    for full_id, sim in matches:
        if sim >= sim_threshold:
            group_key = extract_id_fn(full_id)
            grouped[group_key].append((full_id, sim))
    
    ranked = sorted(grouped.items(), key=lambda x: max(s for _, s in x[1]), reverse=True)
    return ranked[:top_k]

def get_kipris_info_trademark(application_number: str):
    url = "http://plus.kipris.or.kr/openapi/rest/trademarkInfoSearchService/applicationNumberSearchInfo"
    params = {
        "applicationNumber": application_number,
        "docsStart": 1,
        "accessKey": "ZD7i10jq03G6zyvDIY/5yJ3qrLjRzFfkFFulzALucGA="
    }
    res = requests.get(url, params=params)
    if res.status_code != 200:
        return None
    try:
        data = xmltodict.parse(res.content)
        return data["response"]["body"]["items"]["TradeMarkInfo"]
    except:
        return None

def get_kipris_info_design(application_number: str):
    url = "http://plus.kipris.or.kr/openapi/rest/designInfoSearchService/applicationNumberSearchInfo"
    params = {
        "applicationNumber": application_number,
        "accessKey": "ZD7i10jq03G6zyvDIY/5yJ3qrLjRzFfkFFulzALucGA="
    }
    res = requests.get(url, params=params)
    if res.status_code != 200:
        return None
    try:
        data = xmltodict.parse(res.content)
        info = data["response"]["body"]["items"]["DesignInfo"]
        if isinstance(info, list):
            info = info[0]
        return {
            "Title": info.get("articleName", ""),
            "ApplicantName": info.get("applicantName", ""),
            "ImagePath": info.get("imagePathLarge", "")
        }
    except Exception as e:
        print(f"❌ [utils] 디자인 정보 파싱 실패: {e}")
        return None


def enrich_with_info(matches, kind='trademark'):
    if kind == 'trademark':
        get_info = get_kipris_info_trademark
    elif kind == 'design':
        get_info = get_kipris_info_design
    else:
        raise ValueError("kind는 'trademark' 또는 'design'이어야 합니다.")

    enriched = []
    for app_num, sim in matches:
        info = get_info(app_num)
        enriched.append({
            "application_number": app_num,
            "similarity": round(sim, 4),
            "title": info.get("Title", "") if info else "정보 없음",
            "applicant": info.get("ApplicantName", "") if info else "정보 없음",
            "image_url": info.get("ImagePath", "") if info else None
        })
    return enriched
