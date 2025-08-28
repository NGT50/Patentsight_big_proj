from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import openai
import os
from dotenv import load_dotenv

# 1) 환경 변수 로드
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# 2) FastAPI 초기화
app = FastAPI()

# 2-1) CORS 설정 (React, Spring Boot에서 접근 가능)
origins = [
    "http://localhost:3000",  # React 로컬
    "http://localhost:8080",  # Spring Boot 로컬
    "*"                       # 필요 시 전체 허용 (보안상 실제 배포에서는 제한 권장)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3) SBERT 모델 로드
try:
    sbert_model = SentenceTransformer("./model/ko_sbert_nli")
except Exception as e:
    raise RuntimeError(f"SBERT 모델 로드 실패: {e}")

# 4) IPC 데이터 로드
try:
    df = pd.read_csv("./ipc_dataset.csv")
    df["subclass"] = df["ipc"].str.extract(r"^([A-Z]\d{2}[A-Z]?)")
    df["maingroup"] = df["ipc"]
    df["desc_full"] = df["maingroup"] + " " + df["desc_kr"]
except Exception as e:
    raise RuntimeError(f"IPC 데이터 로드 실패: {e}")

# 5) 입력 데이터 모델 정의
class ClaimInput(BaseModel):
    claim: str

# 6) 서버 상태 확인용 엔드포인트
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "FastAPI server is running"}

# 7) API 엔드포인트
@app.post("/predict")
def predict_ipc(data: ClaimInput):
    claim = data.claim

    try:
        # 1️⃣ GPT로 subclass 후보 3개 예측
        response = openai.chat.completions.create(
            model="ft:gpt-3.5-turbo-0125:personal::Bwjsx7ZE",
            messages=[
                {"role": "system", "content": "청구항을 보고 IPC subclass를 예측하세요. 가능성이 높은 3개의 subclass를 콤마로 구분하여 출력하세요."},
                {"role": "user", "content": claim}
            ],
            temperature=0.0,
        )

        subclass_candidates = (
            response.choices[0].message.content.strip().replace(" ", "").split(",")
        )

        # 2️⃣ SBERT로 유사도 계산
        filtered_df = df[df["subclass"].isin(subclass_candidates)].copy()
        if filtered_df.empty:
            raise HTTPException(status_code=404, detail="예측된 subclass 후보와 일치하는 데이터가 없습니다.")

        claim_emb = sbert_model.encode(claim, convert_to_tensor=True)

        filtered_df["score"] = filtered_df["desc_full"].apply(
            lambda x: util.cos_sim(claim_emb, sbert_model.encode(str(x), convert_to_tensor=True)).item()
        )

        top_match = filtered_df.sort_values("score", ascending=False).head(5)

        # 3️⃣ 결과 반환
        return {
            "gpt_subclass_candidates": subclass_candidates,
            "top_ipc_results": top_match[["maingroup", "desc_kr", "score"]].to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"예측 중 오류 발생: {str(e)}")
