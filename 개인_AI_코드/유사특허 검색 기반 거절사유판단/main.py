# main.py

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse   # ✅ JSONResponse → PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from korpat_utils import (
    embed_exam_text,
    search_korpat,
    extract_similar_sentences,
    generate_office_action_combined,  
    extract_text_from_json
)

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 시엔 특정 origin만 허용 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze(text: str):
    """
    텍스트로 유사특허를 검색합니다.
    
    Args:
        text: 분석할 특허 텍스트
    
    Returns:
        의견 제출 통지서 (텍스트)
    """
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="텍스트가 비어있습니다.")
        
        # 텍스트 임베딩
        embedding = embed_exam_text(text)
        
        # 유사특허 검색
        similar = search_korpat(embedding)
        
        # 유사 문장 추출
        matches = extract_similar_sentences(text, similar)
        
        # 의견 제출 통지서 생성
        opinion = generate_office_action_combined(
            matches_with_pairs=None,
            similar_matches=matches
        )
        
        # ✅ opinion만 텍스트로 반환
        return PlainTextResponse(content=opinion)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류가 발생했습니다: {str(e)}")

@app.post("/analyze-json")
async def analyze_json(patent_data: dict):
    """
    JSON 형식의 특허 데이터로 유사특허를 검색합니다.
    
    Args:
        patent_data: 특허 데이터 JSON 객체
    
    Returns:
        의견 제출 통지서 (텍스트)
    """
    try:
        # JSON에서 텍스트 추출
        exam_text = extract_text_from_json(patent_data)
        
        if not exam_text.strip():
            raise HTTPException(status_code=400, detail="JSON 데이터에서 유효한 텍스트를 추출할 수 없습니다.")
        
        # 텍스트 임베딩
        embedding = embed_exam_text(exam_text)
        
        # 유사특허 검색
        similar = search_korpat(embedding)
        
        # 유사 문장 추출
        matches = extract_similar_sentences(exam_text, similar)
        
        # 의견 제출 통지서 생성
        opinion = generate_office_action_combined(
            matches_with_pairs=None,
            similar_matches=matches
        )
        
        # ✅ opinion만 텍스트로 반환
        return PlainTextResponse(content=opinion)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류가 발생했습니다: {str(e)}")
