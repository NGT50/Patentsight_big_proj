import os
import requests
import xmltodict
import matplotlib.pyplot as plt
import matplotlib
from PIL import Image
from io import BytesIO
from collections import defaultdict

from search_faiss_design import get_top_k_similar_images, get_top_k_images_from_text

ACCESS_KEY = "ZD7i10jq03G6zyvDIY/5yJ3qrLjRzFfkFFulzALucGA="

# 한글 폰트 설정
matplotlib.rcParams['font.family'] = 'Malgun Gothic'
matplotlib.rcParams['axes.unicode_minus'] = False


def extract_app_number(full_id):
    return full_id.split("_")[0]  # full_id: 출원번호_기타값


def get_design_info(app_number):
    url = "http://plus.kipris.or.kr/openapi/rest/designInfoSearchService/applicationNumberSearchInfo"
    params = {
        "applicationNumber": app_number,
        "accessKey": ACCESS_KEY
    }
    try:
        res = requests.get(url, params=params)
        data = xmltodict.parse(res.content)

        result = data["response"]["body"]["items"]["DesignInfo"]
        if isinstance(result, list):
            return result[0]
        return result
    except Exception as e:
        print(f"❌ API 실패: {e}")
        return None


if __name__ == "__main__":
    query = input("🔎 검색할 이미지 경로 또는 텍스트 설명을 입력하세요:\n> ").strip()

    is_image_query = os.path.exists(query)

    if is_image_query:
        print(f"📷 이미지 기반 검색: {query}")
        raw_matches = get_top_k_similar_images(query, top_k=30)
        filtered_matches = [(full_id, sim) for full_id, sim in raw_matches if sim >= 0.8]
    else:
        print(f"📝 텍스트 기반 검색: '{query}'")
        filtered_matches = get_top_k_images_from_text(query, top_k=5)  # 필터 없이 상위 5개만

    if not filtered_matches:
        print("❗ 유사 결과 없음")
        exit()

    # 출원번호 단위로 그룹화
    grouped = defaultdict(list)
    for full_id, sim in filtered_matches:
        app_number = extract_app_number(full_id)
        grouped[app_number].append((full_id, sim))

    # 출원번호별 최고 유사도 기준 정렬
    ranked = sorted(grouped.items(), key=lambda x: max(s for _, s in x[1]), reverse=True)

    # 상위 5개만 선택
    ranked = ranked[:5]

    if not ranked:
        print("❗ 조건을 만족하는 유사 디자인이 없습니다.")
        exit()

    print(f"\n✅ 출원번호 기준 검색 결과 {len(ranked)}건:")
    for app_number, entries in ranked:
        best_img, best_sim = max(entries, key=lambda x: x[1])
        print(f"  - 출원번호: {app_number}, 대표 이미지: {best_img}, 최고 유사도: {best_sim:.4f}")

    # 시각화
    fig, axes = plt.subplots(1, len(ranked), figsize=(5 * len(ranked), 5))
    if len(ranked) == 1:
        axes = [axes]

    for ax, (app_number, entries) in zip(axes, ranked):
        best_img_id, best_sim = max(entries, key=lambda x: x[1])
        info = get_design_info(app_number)

        if not info or "imagePathLarge" not in info:
            ax.text(0.5, 0.5, "이미지 없음", ha='center', va='center')
            ax.axis("off")
            continue

        try:
            res = requests.get(info["imagePathLarge"])
            img = Image.open(BytesIO(res.content))
            ax.imshow(img)
            ax.axis("off")

            article = info.get("articleName", "명칭 없음")
            applicant = info.get("applicantName", "출원인 없음")
            appdate = info.get("applicationDate", "날짜 없음")

            ax.set_title(
                f"{app_number}\n{article} / {applicant}\n출원일: {appdate}\n유사도: {best_sim:.4f}",
                fontsize=9
            )
        except Exception as e:
            ax.text(0.5, 0.5, "이미지 로딩 실패", ha='center', va='center')
            ax.axis("off")

    plt.tight_layout()
    plt.show()
