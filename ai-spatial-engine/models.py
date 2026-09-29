from pydantic import BaseModel
from typing import List

class Coordinates(BaseModel):
    latitude: float
    longitude: float
    resolution: int = 9

class Alternative(BaseModel):
    id: str
    values: List[float]

class DecisionMatrix(BaseModel):
    criteria: List[str]
    alternatives: List[Alternative]

class RankedItem(BaseModel):
    id: str
    topsis_score: float
    rank: int

class SemanticRequest(BaseModel):
    text: str

class SemanticResponse(BaseModel):
    detected_language: str
    original_text: str
    normalized_text: str
    embedding: List[float]
