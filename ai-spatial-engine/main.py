from fastapi import FastAPI
from models import Coordinates, DecisionMatrix, RankedItem
from services import get_h3_index, run_prioritization

app = FastAPI(title="AI & Spatial Microservice")

@app.post("/api/v1/spatial/h3-index")
async def compute_h3_index(coords: Coordinates):
    h3_index = get_h3_index(coords.latitude, coords.longitude, coords.resolution)
    return {"h3_index": h3_index}

@app.post("/api/v1/ai/prioritize", response_model=list[RankedItem])
async def prioritize_infrastructure(matrix: DecisionMatrix):
    results = run_prioritization(matrix)
    return results
