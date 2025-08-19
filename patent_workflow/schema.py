"""Pydantic models for workflow input and output."""
from typing import List, Optional
from pydantic import BaseModel


class WorkflowInput(BaseModel):
    """Input schema for the workflow."""
    query: str


class ClaimDraft(BaseModel):
    """Structured draft object returned from claim drafting."""

    log_id: Optional[str] = None
    rag_context: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    technicalField: Optional[str] = None
    backgroundTechnology: Optional[str] = None
    inventionDetails: Optional[str] = None
    claims: List[str]


class WorkflowOutput(BaseModel):
    """Aggregated workflow results."""

    api_result: Optional[str] = None
    review_result: Optional[str] = None
    similar_patents: Optional[List[str]] = None
    claim_draft: Optional[ClaimDraft] = None
    revised_claim: Optional[str] = None
    rejection_reason: Optional[str] = None
    summary: str

