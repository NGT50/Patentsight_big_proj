import io
import re
import pdfplumber
from transformers import GPT2TokenizerFast
import openai 

client = openai.OpenAI(api_key = "")

# 📋 필수 섹션 누락 탐지
REQUIRED_SECTIONS = {
    "발명의 명칭": ["발명의 명칭", "발명의 제목"],
    "기술 분야": ["기술 분야", "기술분야","기 술 분 야"],
    "배경 기술": ["배경 기술", "종래 기술", "종래기술", "기존 기술","배 경 기 술"],
    "발명의 내용": ["발명의 내용", "해결 수단", "효과"],
    "도면의 간단한 설명": ["도면의 간단한 설명", "간단한 도면 설명", "도면 설명"],
    "발명의 실시예": ["실시예", "실시 형태", "실시 방식"],
    "청구항": ["청구항 1", "청구항1", "청구항"],
    "도면": ["도면1", "도면 1", "도1", "도면"]
}

# 📘 PDF 텍스트 추출 함수
def extract_text_from_pdf(file_bytes: bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# 🛠️ 형식 오류 탐지
def detect_format_errors(text, diagram_filenames=None):
    errors = []
    claim_lines = re.findall(r"^청구항\s*(\d+)\.", text, re.MULTILINE)
    claim_nums_int = list(map(int, claim_lines))

    if len(set(claim_nums_int)) < len(claim_nums_int):
        errors.append("❗ 청구항 번호가 중복되어 있습니다.")
    if claim_nums_int:
        expected = set(range(min(claim_nums_int), max(claim_nums_int) + 1))
        actual = set(claim_nums_int)
        missing = sorted(expected - actual)
        if missing:
            errors.append(f"❗ 청구항 번호 {missing} 이 누락되어 있습니다.")

    mentioned = set(re.findall(r"도\s*(\d+)", text))
    mentioned = set(f"도{d}" for d in mentioned)
    if diagram_filenames:
        cleaned = set(f.replace(".png", "").replace(".jpg", "") for f in diagram_filenames)
        missing_diagrams = mentioned - cleaned
        if missing_diagrams:
            errors.append(f"❗ 명세서에 언급되었으나 실제 도면이 없는 항목: {sorted(missing_diagrams)}")

    must_have = ["발명의 명칭", "도면의 간단한 설명", "발명의 상세한 설명"]
    for section in must_have:
        if section not in text:
            errors.append(f"❗ 필수 항목 '{section}' 이 누락되었습니다.")
    return errors


# 📋 필수 섹션 누락 탐지
def detect_missing_sections(text):
    missing_sections = []
    for section, keywords in REQUIRED_SECTIONS.items():
        if not any(keyword in text for keyword in keywords):
            missing_sections.append(section)
    return missing_sections

# 🔍 청구항 추출
def extract_claims(text):
    # "발명의 설명" 또는 다음 청구항 또는 문서 끝까지를 기준으로 청구항을 추출
    pattern = r"(청구항\s*\d+[^\n]*\n.*?)(?=(청구항\s*\d+|발명의\s*설명|기\s*술\s*분\s*야|$))"
    matches = re.findall(pattern, text, re.DOTALL)

    claims = [m[0].strip() for m in matches]
    claims = [c for c in claims if len(c) >= 8]
    return claims

# ✂️ 문맥 오류 탐지 (문장 단위 분할 with 슬라이딩 윈도우)
def detect_contextual_errors_with_gpt(paragraph, max_chunk_tokens=10000, stride_sentences=2):
    tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")
    sentences = re.split(r'(?<=[.다!?)])\s+', paragraph)

    chunks = []
    current_chunk = []
    current_token_len = 0

    for i, sent in enumerate(sentences):
        token_len = len(tokenizer.encode(sent))
        if current_token_len + token_len > max_chunk_tokens:
            chunks.append(" ".join(current_chunk))
            # 슬라이딩 윈도우로 앞 문장 일부 유지
            current_chunk = current_chunk[-stride_sentences:] if stride_sentences else []
            current_token_len = sum(len(tokenizer.encode(s)) for s in current_chunk)
        current_chunk.append(sent)
        current_token_len += token_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    def query_gpt(text_chunk):
        prompt = f"""
당신은 특허청에서 근무하는 숙련된 특허 심사관입니다.
아래의 문단은 특허 명세서(청구항 또는 실시예) 중 일부입니다.

당신의 임무는 다음 기준에 따라 **문맥 오류, 용어 불일치, 논리적 비약 또는 설명 부족 여부를 정밀하게 판단**하고, 각 항목에 대해 원인과 수정 제안을 제시하는 것입니다.

[검토 기준]
1. 문장의 논리적 연결이 자연스러운가? (원인 → 결과, 구성요소 → 동작 등)
2. 동일 용어가 문맥마다 다르게 쓰이진 않았는가?
3. 발명의 목적과 해결 수단이 충돌하거나 흐름상 비약이 있는가?
4. 특정 구성요소의 기능 또는 구조가 불명확하진 않은가?
5. 특정 문장이 앞뒤 문장과 의미상 충돌하지는 않는가?

[출력 형식 예시]
- 발견된 문제:
- 원인 설명:
- 수정 제안:

분석할 문단:
\"\"\"{text_chunk}\"\"\"

위 문단에 대해 문제점을 모두 찾아주세요.
문제가 전혀 없다면 잘 작성했으니 이상 없다고 알려주세요.
"""
        res = client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        return res.choices[0].message.content.strip()

    results = []
    for i, chunk in enumerate(chunks):
        print(f"  ⚙️ {i+1}/{len(chunks)} 처리 중...")
        results.append(query_gpt(chunk))

    return "\n\n".join(results)



def process_pdf(file_bytes: bytes):
    text = extract_text_from_pdf(file_bytes)
    format_errors = detect_format_errors(text)
    missing_sections = detect_missing_sections(text)
    claims = extract_claims(text)

    contextual_issues = []
    for i, claim in enumerate(claims):
        issue = detect_contextual_errors_with_gpt(claim)
        contextual_issues.append({
            "claim": f"청구항 {i+1}",
            "issue": issue
        })

    rejection_notice = generate_rejection_notice(format_errors, missing_sections, contextual_issues)

    return {
        "format_errors": format_errors,
        "missing_sections": missing_sections,
        "claims_context_issues": contextual_issues,
        "rejection_notice_draft": rejection_notice
    }

def generate_rejection_notice(format_errors, missing_sections, claims_context_issues):
    summary = ""
    if format_errors:
        summary += "📌 형식 오류:\n" + "\n".join(f"- {e}" for e in format_errors) + "\n\n"
    if missing_sections:
        summary += "📌 필수 항목 누락:\n" + "\n".join(f"- {s}" for s in missing_sections) + "\n\n"
    if claims_context_issues:
        summary += "📌 문맥 오류:\n"
        for item in claims_context_issues:
            if "이상 없" not in item["issue"]:
                summary += f"- {item['claim']}:\n  {item['issue']}\n\n"

    prompt = f"""
당신은 특허청 심사관입니다. 아래 오류 요약을 기반으로 **거절이유 통지서 초안**을 작성하세요.

[오류 요약]
{summary}

[작성 조건]
- 발명자에게 전달될 문어체 문서
- 각 오류에 대해 '이유', '관련 조항', '보완 방법' 포함
- 전체적으로 하나의 서술문 흐름 유지
"""
    res = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return res.choices[0].message.content.strip()

