import sys
from pathlib import Path

from fastapi.testclient import TestClient

# Ensure root path is importable
sys.path.append(str(Path(__file__).resolve().parents[2]))

from patent_workflow.api import app


def test_applicant_flow():
    client = TestClient(app)
    resp = client.post(
        "/run",
        json={"query": "출원인: 문서 검토하고 유사 특허 검색 후 수정해줘"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"] == "Workflow complete."
    assert "review_result" in data
    assert "similar_patents" in data
    assert "claim_draft" in data and isinstance(data["claim_draft"].get("claims"), list)
    assert "revised_claim" in data
    assert "rejection_reason" not in data


def test_examiner_flow():
    client = TestClient(app)
    resp = client.post(
        "/run",
        json={"query": "심사관: 유사 특허 검색하고 거절 사유 알려줘"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"] == "Workflow complete."
    assert "rejection_reason" in data
    assert "claim_draft" in data and isinstance(data["claim_draft"].get("claims"), list)
    assert "review_result" not in data
    assert "revised_claim" not in data
