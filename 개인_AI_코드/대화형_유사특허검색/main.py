from fastapi import FastAPI, Query
from model import analyst
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Patent Search API",
    description="유사 특허 검색 API",
    version="1.0"
)

@app.get("/")
def root():
    return {"message": "Patent Search API is running"}

@app.get("/search")
def search_patent(
    query: str = Query(..., description="검색할 기술 내용"),
    top_n: int = Query(1, description="검색할 특허 개수 (1이면 단일 검색)")
):
    """
    - query: 검색할 기술 내용 또는 출원번호
    - top_n: 1이면 기존 단일 결과, 2 이상이면 다건 결과
    """
    if top_n > 1:
        return analyst.analyze_multi(query, top_n=top_n)
    else:
        return analyst.analyze(query)
