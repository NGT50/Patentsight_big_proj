from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from korpat_utils import embed_exam_text, search_korpat, extract_similar_sentences, generate_office_action_filtered, extract_text_from_json

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze(text: str):
    """
    텍스트로 유사특허를 검색하고 결과를 텍스트 형식으로 반환합니다.
    """
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="텍스트가 비어있습니다.")
        
        embedding = embed_exam_text(text)
        similar = search_korpat(embedding)
        matches = extract_similar_sentences(text, similar)
        opinion = generate_office_action_filtered(matches)

        # key-value 텍스트 변환
        text_output = (
            f"분석 성공 여부: True\n"
            f"분석 텍스트:\n{text}\n\n"
            f"유사 특허:\n{similar}\n\n"
            f"유사 문장:\n{matches}\n\n"
            f"의견 제출 통지서:\n{opinion}\n"
        )
        return PlainTextResponse(content=text_output)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류가 발생했습니다: {str(e)}")


@app.post("/analyze-json")
async def analyze_json(patent_data: dict):
    """
    JSON 형식의 특허 데이터로 유사특허를 검색하고 결과를 텍스트 형식으로 반환합니다.
    """
    try:
        exam_text = extract_text_from_json(patent_data)

        if not exam_text.strip():
            raise HTTPException(status_code=400, detail="JSON 데이터에서 유효한 텍스트를 추출할 수 없습니다.")
        
        embedding = embed_exam_text(exam_text)
        similar = search_korpat(embedding)
        matches = extract_similar_sentences(exam_text, similar)
        opinion = generate_office_action_filtered(matches)

        text_output = (
            f"분석 성공 여부: True\n"
            f"추출된 텍스트:\n{exam_text}\n\n"
            f"유사 특허:\n{similar}\n\n"
            f"유사 문장:\n{matches}\n\n"
            f"의견 제출 통지서:\n{opinion}\n"
        )
        return PlainTextResponse(content=text_output)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류가 발생했습니다: {str(e)}")
