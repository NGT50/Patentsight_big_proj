"""FastAPI server exposing the workflow."""
from fastapi import FastAPI

from .schema import WorkflowInput, WorkflowOutput
from .workflow import build_workflow

app = FastAPI()
workflow = build_workflow()


@app.post("/run", response_model=WorkflowOutput, response_model_exclude_none=True)
async def run_workflow(payload: WorkflowInput) -> WorkflowOutput:
    """Run the patent workflow and return aggregated results."""
    result = workflow.invoke({"query": payload.query})
    return WorkflowOutput(**result).model_dump(exclude_none=True)

