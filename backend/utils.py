import io
import re
import pdfplumber
from transformers import GPT2TokenizerFast
import openai
from typing import Dict, List
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
import operator
from langchain_core.tools import tool


client = openai.OpenAI(api_key = "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")
# TypedDict를 사용하여 에이전트의 '상태' 또는 '기억'의 구조를 정의합니다.
class AgentState(TypedDict):
    # 'messages' 키에는 대화 기록이 리스트 형태로 저장됩니다.
    # operator.add는 새 메시지가 들어올 때마다 기존 리스트에 추가하는 역할을 합니다.
    messages: Annotated[List[BaseMessage], operator.add]
    
    # 현재 대화의 대상이 되는 특허 문서의 전체 내용을 저장합니다.
    patent_document: dict


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

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """PDF 바이트 데이터에서 전체 텍스트를 추출합니다."""
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def detect_format_errors(text: str, diagram_filenames=None) -> List[str]:
    """텍스트에서 규칙 기반 형식 오류를 탐지합니다."""
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

def detect_missing_sections(text: str) -> List[str]:
    """텍스트에서 필수 섹션 전체가 누락되었는지 탐지합니다."""
    missing_sections = []
    for section, keywords in REQUIRED_SECTIONS.items():
        if not any(keyword in text for keyword in keywords):
            missing_sections.append(section)
    return missing_sections

def extract_claims(text: str) -> List[str]:
    """텍스트에서 개별 청구항을 추출합니다."""
    pattern = r"(청구항\s*\d+[^\n]*\n.*?)(?=(청구항\s*\d+|발명의\s*설명|기\s*술\s*분\s*야|$))"
    matches = re.findall(pattern, text, re.DOTALL)
    claims = [m[0].strip() for m in matches]
    return [c for c in claims if len(c) >= 8]

def detect_contextual_errors_with_gpt(paragraph: str, max_chunk_tokens=10000, stride_sentences=2) -> str:
    """GPT를 사용하여 문단의 문맥 오류를 탐지합니다."""
    tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")
    sentences = re.split(r'(?<=[.다!?)])\s+', paragraph)

    chunks = []
    current_chunk = []
    current_token_len = 0
    for sent in sentences:
        token_len = len(tokenizer.encode(sent))
        if current_token_len + token_len > max_chunk_tokens:
            chunks.append(" ".join(current_chunk))
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
        try:
            res = client.chat.completions.create(
                model="gpt-4.1",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            return res.choices[0].message.content.strip()
        except Exception as e:
            print(f"GPT API 호출 중 에러 발생: {e}")
            return "GPT 분석 중 오류가 발생했습니다."

    results = []
    for i, chunk in enumerate(chunks):
        print(f"   ⚙️ 청크 {i+1}/{len(chunks)} GPT 분석 처리 중...")
        results.append(query_gpt(chunk))
    return "\n\n".join(results)

# -----------------------------------------------------------------------------
# API를 위한 메인 기능 함수 (구조 개선)
# -----------------------------------------------------------------------------

def parse_pdf_to_json(file_bytes: bytes) -> Dict:
    """(기능 1) PDF를 파싱하여 구조화된 JSON으로 반환합니다."""
    text = extract_text_from_pdf(file_bytes)
    
    def find_section(keywords, content, end_keywords):
        end_pattern = '|'.join(end_keywords) if end_keywords else '$'
        pattern = f"({'|'.join(keywords)})(.*?)(?=({end_pattern}))"
        match = re.search(pattern, content, re.DOTALL)
        return match.group(2).strip() if match else ""

    all_keywords = [kw for kws in REQUIRED_SECTIONS.values() for kw in kws]
    
    invention_content = find_section(REQUIRED_SECTIONS["발명의 내용"], text, REQUIRED_SECTIONS["도면의 간단한 설명"] + REQUIRED_SECTIONS["청구항"])
    
    parsed_data = {
        "title": find_section(REQUIRED_SECTIONS["발명의 명칭"], text, all_keywords),
        "technicalField": find_section(REQUIRED_SECTIONS["기술 분야"], text, all_keywords),
        "backgroundTechnology": find_section(REQUIRED_SECTIONS["배경 기술"], text, all_keywords),
        "inventionDetails": {
            "problemToSolve": find_section(REQUIRED_SECTIONS.get("해결하려는 과제", []), invention_content, REQUIRED_SECTIONS.get("과제의 해결 수단", []) + REQUIRED_SECTIONS.get("발명의 효과", [])),
            "solution": find_section(REQUIRED_SECTIONS.get("과제의 해결 수단", []), invention_content, REQUIRED_SECTIONS.get("발명의 효과", [])),
            "effect": find_section(REQUIRED_SECTIONS.get("발명의 효과", []), invention_content, []),
        },
        "summary": "", # 요약은 별도 로직이 필요합니다.
        "drawingDescription": find_section(REQUIRED_SECTIONS["도면의 간단한 설명"], text, all_keywords),
        "claims": extract_claims(text),
    }
    return parsed_data

def validate_document_from_json(doc_data: dict) -> Dict:
    """(기능 2) JSON 형식의 문서를 받아 AI로 검증하고 결과를 반환합니다."""
    
    # JSON 데이터를 하나의 텍스트로 재구성
    full_text_parts = []
    if doc_data.get('title'): full_text_parts.append(f"발명의 명칭\n{doc_data.get('title')}")
    if doc_data.get('technicalField'): full_text_parts.append(f"기술 분야\n{doc_data.get('technicalField')}")
    if doc_data.get('backgroundTechnology'): full_text_parts.append(f"배경 기술\n{doc_data.get('backgroundTechnology')}")
    if doc_data.get('drawingDescription'): full_text_parts.append(f"도면의 간단한 설명\n{doc_data.get('drawingDescription')}")
    full_text_parts.extend(doc_data.get('claims', []))
    full_text = "\n\n".join(full_text_parts)
    
    format_errors = detect_format_errors(full_text)
    missing_sections = detect_missing_sections(full_text)
    
    contextual_issues = []
    claims = doc_data.get('claims', [])
    for i, claim_text in enumerate(claims):
        if not claim_text.strip(): continue
        
        print(f"🔍 청구항 {i+1} GPT 분석 중...")
        analysis = detect_contextual_errors_with_gpt(claim_text)
        
        issue = {
            "id": f'err_ce_{i+1}', "claim": f"청구항 {i+1}", "claimIndex": i,
            "field": "claims", "analysis": analysis,
        }
        
        suggestion_match = re.search(r"\[?수정 제안\]?:\s*(.*)", analysis, re.DOTALL)
        if suggestion_match:
            issue["suggestion"] = suggestion_match.group(1).strip()
        
        contextual_issues.append(issue)
        
    return {
        "formatErrors": [{"id": f"err_fe_{i+1}", "message": msg, "field": "claims"} for i, msg in enumerate(format_errors)],
        "missingSections": [{"id": f"err_ms_{i+1}", "message": msg, "field": "backgroundTechnology"} for i, msg in enumerate(missing_sections)],
        "contextualErrors": contextual_issues
    }


# utils.py

def generate_full_draft_from_title(title: str) -> Dict:
    """GPT를 사용하여 제목만으로 전체 문서 초안을 생성합니다."""
    
    # 프롬프트를 수정하여, 응답이 반드시 JSON 형식이어야 함을 명확히 지시합니다.
    prompt = f"""
당신은 베테랑 특허 변리사입니다. 주어진 '발명의 명칭'을 바탕으로, 특허 명세서의 나머지 항목들에 대한 상세한 초안을 작성해주세요.
각 항목은 전문적이고 논리적으로 작성되어야 합니다.
다른 설명 없이, 반드시 아래와 같은 JSON 객체 형식으로만 응답해주세요.

[발명의 명칭]
{title}

[요구되는 JSON 형식]
{{
  "technicalField": "...",
  "backgroundTechnology": "...",
  "inventionDetails": {{
    "problemToSolve": "...",
    "solution": "...",
    "effect": "..."
  }},
  "summary": "...",
  "drawingDescription": "...",
  "claims": ["...", "..."]
}}
"""
    try:
        res = client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}],
            # response_format 파라미터를 제거하여 호환성을 높입니다.
            temperature=0.5
        )
        import json
        # GPT 응답이 JSON 문자열이므로, 이를 파싱하여 파이썬 딕셔너리로 변환
        generated_content = res.choices[0].message.content
        return json.loads(generated_content)
    except Exception as e:
        print(f"GPT 초안 생성 중 에러 발생: {e}")
        raise e
    

# @tool 데코레이터를 붙여 이 함수가 AI 에이전트가 사용할 수 있는 '도구'임을 명시합니다.
@tool
def specific_section_validation_tool(patent_document: dict, claim_index: int) -> str:
    """
    특허 문서의 특정 청구항 하나의 문제점(문맥 오류, 용어 불일치, 논리적 비약 등)을 심층적으로 분석하고 설명합니다.
    사용자가 '청구항 1번 검토해줘', '3번 청구항에 무슨 문제 있어?' 와 같이 특정 청구항을 지목하여 분석이나 오류 확인을 요청할 때 사용하세요.
    'claim_index'는 분석할 청구항의 번호입니다. (예: 1, 2, 3)
    """
    print(f"--- 도구 실행: specific_section_validation_tool (청구항 인덱스: {claim_index}) ---")
    try:
        # claim_index는 1부터 시작하므로, 리스트 인덱스를 위해 1을 빼줍니다.
        claim_text = patent_document['claims'][claim_index - 1]
    except (IndexError, KeyError, TypeError):
        return f"오류: {claim_index}번 청구항을 문서에서 찾을 수 없습니다. 문서에 청구항이 올바르게 포함되어 있는지 확인해주세요."
    
    if not claim_text or not claim_text.strip():
        return f"{claim_index}번 청구항의 내용이 비어있습니다."

    # 기존에 구현된 GPT 기반 문맥 오류 분석 함수를 재사용합니다.
    return detect_contextual_errors_with_gpt(claim_text)

@tool
def document_validation_tool(patent_document: dict) -> dict:
    """
    현재 대화 상태에 있는 특허 문서 전체의 문제점을 종합적으로 검증합니다. 
    사용자가 '전체 검토', '문제점 찾아줘' 등 포괄적인 검토를 요청할 때 사용하세요.
    이 도구는 별도의 인자가 필요하지 않습니다.
    """
    print("--- 도구 실행: document_validation_tool ---")
    # utils.py에 이미 있는 함수를 직접 호출합니다.
    return validate_document_from_json(patent_document)

@tool
def text_refinement_tool(patent_document: dict, claim_index: int, instruction: str) -> str:
    """
    특허 문서의 특정 청구항을 주어진 지시사항에 맞게 재작성합니다.
    사용자가 '청구항 1번 수정해줘' 와 같이 특정 번호를 언급하며 수정을 요청할 때 사용하세요.
    'claim_index'는 청구항의 번호(예: 1, 2, 3)입니다.
    """
    print(f"--- 도구 실행: text_refinement_tool (청구항 인덱스: {claim_index}) ---")

    # 도구가 직접 문서에서 원본 텍스트를 찾아옵니다.
    try:
        # claim_index는 1부터 시작하므로, 리스트 인덱스를 위해 1을 빼줍니다.
        original_text = patent_document['claims'][claim_index - 1]
    except (IndexError, KeyError):
        return "오류: 해당 번호의 청구항을 문서에서 찾을 수 없습니다."

    prompt = f"""당신은 최고의 특허 변리사입니다. 아래의 원본 텍스트를 다음 지시사항에 맞게 수정하여, 수정된 '청구항 전문'만 간결하게 반환해주세요.
    
    [지시사항]: {instruction}
    
    [원본 텍스트]:
    {original_text}
    
    [수정된 청구항 전문]:
    """
    
    response = client.chat.completions.create(
        model="gpt-4.1", # gpt-4.1 보다 최신/상위 모델 사용 권장
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()

tools = [document_validation_tool, text_refinement_tool, specific_section_validation_tool]