# search_api.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from search_faiss import get_top_k_similar_images, get_top_k_images_from_text
from search_faiss_design import (
    get_top_k_similar_images as design_image_search_func,
    get_top_k_images_from_text as design_text_search_func
)
from kipris_lookuptext import enrich_with_kipris_info
from kipris_design import get_design_info
import shutil
import os
from fastapi.responses import JSONResponse
import base64
from utils import (
    group_and_rank, 
    enrich_with_info, 
    extract_app_number
)


app = FastAPI()
# CORS 설정 (React 연동 시 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시엔 ["http://localhost:3000"]처럼 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/search/trademark/image")
async def trademark_image_search(file: UploadFile = File(...)):
    with open("temp.png", "wb") as f:
        f.write(await file.read())

    raw_matches = get_top_k_similar_images("temp.png", top_k=30)
    grouped = group_and_rank(raw_matches, sim_threshold=0.8, top_k=5)
    matches = [(k, max(sim for _, sim in v)) for k, v in grouped]
    enriched = enrich_with_info(matches, kind='trademark')

    with open("temp.png", "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    return JSONResponse(content={
        "input_image": f"data:image/png;base64,{image_base64}",
        "results": enriched
    })



@app.post("/search/trademark/text")
async def trademark_text_search(text: str = Form(...)):
    raw_matches = get_top_k_images_from_text(text, top_k=10)
    grouped = group_and_rank(raw_matches, sim_threshold=0.0, top_k=5)
    matches = [(k, max(sim for _, sim in v)) for k, v in grouped]
    enriched = enrich_with_info(matches, kind='trademark')
    return {"results": enriched}



@app.post("/search/design/image")
async def design_image_search(file: UploadFile = File(...)):
    with open("temp.png", "wb") as f:
        f.write(await file.read())

    raw_matches = design_image_search_func("temp.png", top_k=30)
    grouped = group_and_rank(raw_matches, sim_threshold=0.8, top_k=5)
    matches = [(k, max(sim for _, sim in v)) for k, v in grouped]
    enriched = enrich_with_info(matches, kind='design')

    with open("temp.png", "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")

    return JSONResponse(content={
        "input_image": f"data:image/png;base64,{image_base64}",
        "results": enriched
    })



@app.post("/search/design/text")
async def design_text_search(text: str = Form(...)):
    raw_matches = design_text_search_func(text, top_k=10)
    grouped = group_and_rank(raw_matches, sim_threshold=0.0, top_k=5)
    matches = [(k, max(sim for _, sim in v)) for k, v in grouped]
    enriched = enrich_with_info(matches, kind='design')
    return {"results": enriched}
