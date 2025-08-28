import os
import numpy as np
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

# 디바이스 설정
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# CLIP 모델 로딩
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# 이미지 폴더 및 저장 경로
# 📍 1. 처리 대상 경로 설정
image_dir = "KD_IMG/20210105/30"

embedding_dir = "embeddings_clip_design"
os.makedirs(embedding_dir, exist_ok=True)

# 임베딩 수행
for root, dirs, files in os.walk(image_dir):
    app_num_candidates = [part for part in root.split(os.sep) if part.startswith("30")]
    if not app_num_candidates:
        print(f"❗ 출원번호 추출 실패: {root}")
        continue
    app_num = app_num_candidates[-1]

    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png", ".tif", ".tiff")):
            filepath = os.path.join(root, file)
            print(f"🔍 발견한 파일: {file}")
            try:
                filestem = os.path.splitext(file)[0]
                view_id = filestem.split("-")[-1] if "-" in filestem else filestem
                output_name = f"{app_num}_{view_id}.npy"

                image = Image.open(filepath).convert("RGB")
                inputs = processor(images=image, return_tensors="pt").to(device)
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                    vector = image_features.squeeze().cpu().numpy()
                    vector = vector / np.linalg.norm(vector)

                np.save(os.path.join(embedding_dir, output_name), vector)
                print(f"✅ 저장 완료: {output_name}")
            except Exception as e:
                print(f"❌ {file} 처리 중 오류: {e}")
