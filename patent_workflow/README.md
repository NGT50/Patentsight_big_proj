# Patent Workflow Service

This directory contains a Python + LangGraph workflow for patent processing.

## Features
- Natural language query input with automatic intent & role detection
- Parallel API passthrough, document review, similarity search and claim drafting
- Review and search steps execute only when requested in the query
- Role-based claim revision for applicants and rejection reason drafting for examiners
- FastAPI server exposing a `/run` endpoint

## Usage
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the server:
   ```bash
   uvicorn patent_workflow.api:app --reload
   ```
3. Send a request with a natural-language query:
   ```bash
   # Applicant requesting review, search and claim revision
   curl -X POST http://localhost:8000/run -H 'Content-Type: application/json' \
     -d '{"query": "출원인: 문서 검토하고 유사 특허 검색 후 수정해줘"}'

   # Examiner requesting similarity search and rejection reasons
   curl -X POST http://localhost:8000/run -H 'Content-Type: application/json' \
     -d '{"query": "심사관: 유사 특허 검색하고 거절 사유 알려줘"}'
   ```

## Claim draft format

The workflow returns structured claim drafts with metadata:

```json
{
  "claim_draft": {
    "log_id": "1",
    "rag_context": "context",
    "title": "Sample Title",
    "summary": "Sample summary",
    "technicalField": "tech field",
    "backgroundTechnology": "background",
    "inventionDetails": "details",
    "claims": [
      "claim 1",
      "claim 2"
    ]
  }
}
```

## Tests
Run the test suite with:
```bash
pytest patent_workflow/tests
```

