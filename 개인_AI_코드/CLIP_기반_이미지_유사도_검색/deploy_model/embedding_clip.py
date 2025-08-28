import os
import numpy as np
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# 디바이스 설정
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# CLIP 모델 및 프로세서 로딩
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 이미지 폴더 및 임베딩 저장 폴더
image_dir = "Design_sample/4.XML/3020180030717/B012/XML/M001"
embedding_dir = "embeddings_clip_design"
os.makedirs(embedding_dir, exist_ok=True)

# 임베딩 수행
for root, dirs, files in os.walk(image_dir):
    for file in files:
        print(f"🔍 발견한 파일: {file}")
        if file.lower().endswith((".jpg", ".jpeg", ".png", ".tif", ".tiff")):
            filepath = os.path.join(root, file)
            try:
                # 출원번호 추출
                #app_num = os.path.splitext(file)[0].split("_")[0]
                app_num = os.path.splitext(file)[0].split("-")[0]

                # 이미지 로딩 및 전처리
                image = Image.open(filepath).convert("RGB")
                inputs = processor(images=image, return_tensors="pt").to(device)

                # 임베딩 추출
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                    vector = image_features.squeeze().cpu().numpy()
                    vector = vector / np.linalg.norm(vector)

                # 저장
                np.save(os.path.join(embedding_dir, f"{app_num}.npy"), vector)
                print(f"✅ 저장 완료: {app_num}")
            except Exception as e:
                print(f"❌ {file} 처리 중 오류: {e}")
