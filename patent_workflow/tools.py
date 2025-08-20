"""External API tool wrappers."""
from __future__ import annotations
import json
from typing import List


class KIPRISTool:
    """Stub wrapper for KIPRIS patent search API."""

    def search(self, query: str) -> List[str]:
        # Placeholder implementation
        return [f"Result for {query} 1", f"Result for {query} 2"]


class GPTTool:
    """Stub wrapper for GPT-based text generation."""

    def generate(self, prompt: str) -> str:
        # Placeholder implementation
        if "Draft claim" in prompt:
            sample = {
                "log_id": "1",
                "rag_context": "context",
                "title": "Sample Title",
                "summary": "Sample summary",
                "technicalField": "tech field",
                "backgroundTechnology": "background",
                "inventionDetails": "details",
                "claims": ["claim 1", "claim 2"],
            }
            return json.dumps(sample)
        return f"Generated text based on: {prompt}"

