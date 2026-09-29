import h3
import numpy as np

def get_h3_index(lat: float, lng: float, resolution: int = 9) -> str:
    return h3.latlng_to_cell(lat, lng, resolution)

def run_prioritization(matrix) -> list:
    results = []
    if not matrix.alternatives:
        return results
        
    num_criteria = len(matrix.criteria)
    weights = [1/num_criteria] * num_criteria
    impacts = ["+"] * num_criteria 

    # Mock score calculation. In real life we would use topsisx instance
    for i, alt in enumerate(matrix.alternatives):
        score = float(np.mean(alt.values)) if alt.values else 0.5
        results.append({
            "id": alt.id,
            "topsis_score": score,
            "rank": i + 1
        })
        
    results.sort(key=lambda x: x["topsis_score"], reverse=True)
    
    for i, res in enumerate(results):
        res["rank"] = i + 1
        
    return results

try:
    from langdetect import detect
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError:
    model = None

def analyze_semantics(text: str) -> dict:
    detected_lang = "en"
    try:
        if model is not None:
            detected_lang = detect(text)
    except:
        detected_lang = "unknown"
    
    normalized = text.lower().strip()
    
    embedding = []
    if model is not None:
        embedding = model.encode(text).tolist()
    else:
        embedding = [0.0] * 384
        
    return {
        "detected_language": detected_lang,
        "original_text": text,
        "normalized_text": normalized,
        "embedding": embedding
    }
