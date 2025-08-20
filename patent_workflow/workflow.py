"""LangGraph workflow definition."""
from __future__ import annotations
import json
from typing import List, TypedDict

from langgraph.graph import END, StateGraph

from .tools import GPTTool, KIPRISTool
from .schema import ClaimDraft


class PatentState(TypedDict, total=False):
    query: str
    role: str
    wants_revision: bool
    needs_review: bool
    needs_search: bool
    api_result: str
    review_result: str
    similar_patents: List[str]
    claim_draft: ClaimDraft
    similarity: float
    revised_claim: str
    rejection_reason: str
    summary: str


def intent_router(state: PatentState) -> dict:
    """Determine user intent and desired processing steps."""
    q = state["query"]
    lower = q.lower()
    role = "examiner" if ("심사관" in q or "examiner" in lower) else "applicant"
    wants_revision = any(k in q for k in ["수정", "거절"])
    needs_review = any(k in q for k in ["검토", "오류", "형식"])
    needs_search = any(k in q for k in ["유사", "검색"])
    return {
        "role": role,
        "wants_revision": wants_revision,
        "needs_review": needs_review,
        "needs_search": needs_search,
    }


def api_passthrough(state: PatentState) -> dict:
    return {"api_result": f"Echo: {state['query']}"}


def document_review(state: PatentState) -> dict:
    if not state.get("needs_review"):
        return {}
    return {"review_result": "No issues found."}


def similar_patent_search(state: PatentState) -> dict:
    if not state.get("needs_search"):
        return {}
    tool = KIPRISTool()
    return {"similar_patents": tool.search(state["query"])}


def claim_draft_generation(state: PatentState) -> dict:
    tool = GPTTool()
    raw = tool.generate(f"Draft claim for {state['query']}")
    try:
        data = json.loads(raw)
    except Exception:
        # Fallback structure if the tool does not return JSON
        data = {
            "log_id": None,
            "rag_context": None,
            "title": None,
            "summary": raw,
            "technicalField": None,
            "backgroundTechnology": None,
            "inventionDetails": None,
            "claims": [raw],
        }
    return {"claim_draft": ClaimDraft(**data)}


def compare_similarity(state: PatentState) -> dict:
    # Dummy similarity computation
    return {"similarity": 0.3}


def route_by_role(state: PatentState) -> str:
    similarity_low = state.get("similarity", 0) < 0.5
    role = state.get("role")
    wants_revision = state.get("wants_revision", False)
    if similarity_low and wants_revision:
        if role == "applicant":
            return "revise"
        if role == "examiner":
            return "reject"
    return "final"


def revise_claim(state: PatentState) -> dict:
    tool = GPTTool()
    return {"revised_claim": tool.generate("Revise claim based on feedback")}


def rejection_reason(state: PatentState) -> dict:
    tool = GPTTool()
    return {"rejection_reason": tool.generate("Potential rejection reasons")}


def final_summary(state: PatentState) -> dict:
    return {"summary": "Workflow complete."}


def build_workflow():
    """Compile and return the LangGraph workflow."""
    graph = StateGraph(PatentState)

    graph.add_node("intent_router", intent_router)
    graph.add_node("api_passthrough", api_passthrough)
    graph.add_node("document_review", document_review)
    graph.add_node("similar_patent_search", similar_patent_search)
    graph.add_node("claim_draft_generation", claim_draft_generation)
    graph.add_node("compare_similarity", compare_similarity)
    graph.add_node("revise_claim", revise_claim)
    graph.add_node("rejection_reason", rejection_reason)
    graph.add_node("finalize", final_summary)

    graph.set_entry_point("intent_router")

    # Parallel steps after intent routing
    graph.add_edge("intent_router", "api_passthrough")
    graph.add_edge("intent_router", "document_review")
    graph.add_edge("intent_router", "similar_patent_search")
    graph.add_edge("intent_router", "claim_draft_generation")

    # Join parallel steps
    graph.add_edge("api_passthrough", "compare_similarity")
    graph.add_edge("document_review", "compare_similarity")
    graph.add_edge("similar_patent_search", "compare_similarity")
    graph.add_edge("claim_draft_generation", "compare_similarity")

    # Conditional revision flow
    graph.add_conditional_edges("compare_similarity", route_by_role, {"revise": "revise_claim", "reject": "rejection_reason", "final": "finalize"})
    graph.add_edge("revise_claim", "finalize")
    graph.add_edge("rejection_reason", "finalize")

    graph.add_edge("finalize", END)

    return graph.compile()

