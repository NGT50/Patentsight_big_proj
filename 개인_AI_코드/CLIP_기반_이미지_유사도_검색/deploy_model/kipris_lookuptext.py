import os
import requests
import xmltodict
import matplotlib.pyplot as plt
import matplotlib
from PIL import Image
from io import BytesIO

from search_faiss import get_top_k_similar_images, get_top_k_images_from_text  

# 한글 폰트 설정
matplotlib.rcParams['font.family'] = 'Malgun Gothic'
matplotlib.rcParams['axes.unicode_minus'] = False

ACCESS_KEY = "ZD7i10jq03G6zyvDIY/5yJ3qrLjRzFfkFFulzALucGA="

def get_kipris_info(application_number):
    url = "http://plus.kipris.or.kr/openapi/rest/trademarkInfoSearchService/applicationNumberSearchInfo"
    params = {
        "applicationNumber": application_number,
        "docsStart": 1,
        "accessKey": ACCESS_KEY
    }
    res = requests.get(url, params=params)
    if res.status_code != 200:
        return None
    try:
        data = xmltodict.parse(res.content)
        return data["response"]["body"]["items"]["TradeMarkInfo"]
    except:
        return None

def enrich_with_kipris_info(matches):  # matches: List of (app_num, sim)
    enriched = []
    for app_num, sim in matches:
        info = get_kipris_info(app_num)
        enriched.append({
            "application_number": app_num,
            "similarity": round(sim, 4),
            "title": info.get("Title", "") if info else "정보 없음",
            "applicant": info.get("ApplicantName", "") if info else "정보 없음",
            "image_url": info.get("ImagePath", "") if info else None
        })
    return enriched


if __name__ == "__main__":
    # 🔹 입력 받기
    query = input("🔎 검색할 이미지 경로 또는 텍스트 설명을 입력하세요:\n> ").strip()

    if os.path.exists(query):  # 이미지 검색
        print(f"📷 이미지 기반 검색: {query}")
        raw_matches = get_top_k_similar_images(query, top_k=10)
        # ✅ 유사도 필터링
        matches = [(app_num, sim) for app_num, sim in raw_matches if sim >= 0.8]
    else:  # 텍스트 검색
        print(f"📝 텍스트 기반 검색: '{query}'")
        matches = get_top_k_images_from_text(query, top_k=5)  # 필터 없이 상위 5개만

    if not matches:
        print("❗ 유사 결과 없음")
        exit()

    if os.path.exists(query):
        print(f"\n✅ 유사도 0.8 이상 결과 {len(matches)}건:")
    else:
        print(f"\n✅ 텍스트 기반 검색 결과 {len(matches)}건:")

    for app_num, sim in matches:
        print(f"  - 출원번호: {app_num}, 유사도: {sim:.4f}")


    # 🔄 이미지 시각화
    fig, axes = plt.subplots(1, len(matches), figsize=(5 * len(matches), 5))

    if len(matches) == 1:
        axes = [axes]

    for ax, (app_num, sim) in zip(axes, matches):
        info = get_kipris_info(app_num)
        if not info:
            ax.text(0.5, 0.5, "정보 없음", ha='center', va='center')
            ax.axis("off")
            continue

        title = info.get("Title", "")
        applicant = info.get("ApplicantName", "")
        try:
            res = requests.get(info["ImagePath"])
            img = Image.open(BytesIO(res.content))
            ax.imshow(img)
            ax.axis("off")
            ax.set_title(f"{title}\n출원번호: {app_num}\n{applicant}\n유사도: {sim:.4f}", fontsize=9)
        except:
            ax.text(0.5, 0.5, "이미지 로딩 실패", ha='center', va='center')
            ax.axis("off")

    plt.tight_layout()
    plt.show()
