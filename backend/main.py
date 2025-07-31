from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from utils import process_pdf

app = FastAPI()

# CORS 설정: 프론트에서 접근 가능하도록 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 단계에서는 * 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    result = process_pdf(contents)
    return result
