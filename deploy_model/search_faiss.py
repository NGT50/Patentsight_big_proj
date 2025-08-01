import os
import numpy as np
from PIL import Image
import torch
import faiss
from transformers import CLIPProcessor, CLIPModel, MarianMTModel, MarianTokenizer

# 설정
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
embedding_dir = "embeddings_clip"

# 모델 로딩
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 번역기 로딩 (한→영)
mt_tokenizer = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-ko-en")
mt_model = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-ko-en").to(device)

# 벡터 로딩
vectors = []
app_nums = []

for fname in os.listdir(embedding_dir):
    if fname.endswith(".npy"):
        path = os.path.join(embedding_dir, fname)
        vec = np.load(path)
        vectors.append(vec.astype("float32"))
        app_nums.append(fname.replace(".npy", ""))

vectors = np.stack(vectors)

# FAISS Index
index = faiss.IndexFlatIP(vectors.shape[1])
faiss.normalize_L2(vectors)
index.add(vectors)

# 텍스트가 한글인지 확인
def is_korean(text):
    return any('\uac00' <= char <= '\ud7a3' for char in text)

# 번역 함수 (한→영)
def translate_ko_to_en(text):
    inputs = mt_tokenizer([text], return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        translated = mt_model.generate(**inputs)
    return mt_tokenizer.decode(translated[0], skip_special_tokens=True)

# 이미지 임베딩
def embed_image(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        image_features = model.get_image_features(**inputs)
    vec = image_features.squeeze().cpu().numpy()
    return (vec / np.linalg.norm(vec)).astype("float32")

# 텍스트 임베딩 (한글이면 번역 + 잘라내기 포함)
def embed_text(text):
    if is_korean(text):
        print("📝 한글 감지됨 → 영어로 번역 중...")
        text = translate_ko_to_en(text)
        print(f"🌐 번역 결과: {text}")
    text = text[:300]  # 너무 긴 문장 자르기
    inputs = processor(text=[text], return_tensors="pt", truncation=True).to(device)
    with torch.no_grad():
        text_features = model.get_text_features(**inputs)
    vec = text_features.squeeze().cpu().numpy()
    return (vec / np.linalg.norm(vec)).astype("float32")

# 텍스트 검색
def get_top_k_images_from_text(text, top_k=5):
    input_vec = embed_text(text).reshape(1, -1)
    faiss.normalize_L2(input_vec)
    scores, indices = index.search(input_vec, top_k)
    return [(app_nums[i], float(scores[0][j])) for j, i in enumerate(indices[0])]

# 이미지 검색
def get_top_k_similar_images(image_path, top_k=5):
    input_vec = embed_image(image_path).reshape(1, -1)
    faiss.normalize_L2(input_vec)
    scores, indices = index.search(input_vec, top_k)
    return [(app_nums[i], float(scores[0][j])) for j, i in enumerate(indices[0])]
