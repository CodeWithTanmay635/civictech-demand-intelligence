from pydantic import BaseModel
from typing import List, Dict, Optional

class Coordinates(BaseModel):
    latitude: float
    longitude: float
    resolution: int = 9

class Alternative(BaseModel):
    id: str
    values: Dict[str, float]

class DecisionMatrix(BaseModel):
    criteria: List[str]
    alternatives: List[Alternative]

class TopsisMetrics(BaseModel):
    distance_to_positive: float
    distance_to_negative: float
    closeness_coefficient: float

class RankedItem(BaseModel):
    id: str
    rank: int
    priority_score: float
    criteria: Dict[str, float]
    ahp_weights: Dict[str, float]
    topsis: TopsisMetrics

class SemanticRequest(BaseModel):
    text: str

class SemanticResponse(BaseModel):
    detected_language: str
    original_text: str
    normalized_text: str
    embedding: List[float]
