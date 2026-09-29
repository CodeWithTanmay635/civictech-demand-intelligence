import h3
import numpy as np

def get_h3_index(lat: float, lng: float, resolution: int = 9) -> str:
    return h3.latlng_to_cell(lat, lng, resolution)

def calculate_ahp_weights(criteria_names):
    # Deterministic AHP Pairwise Comparison Matrix for 4 criteria
    # Order: citizen_demand, vulnerability, infrastructure_deficit, investment_gap
    # Demand is strongly preferred, then Vuln, etc.
    pcm = np.array([
        [1.0,  2.0,  3.0,  4.0],
        [1/2,  1.0,  2.0,  3.0],
        [1/3,  1/2,  1.0,  2.0],
        [1/4,  1/3,  1/2,  1.0]
    ])
    
    # Standard AHP weight calculation
    col_sums = pcm.sum(axis=0)
    normalized_pcm = pcm / col_sums
    weights = normalized_pcm.mean(axis=1)
    
    # Map to criteria names
    # Assuming input matrix.criteria defines the exact names used.
    # We will map them defensively.
    default_order = ["citizen_demand", "vulnerability", "infrastructure_deficit", "investment_gap"]
    
    result_weights = {}
    for i, crit in enumerate(default_order):
        result_weights[crit] = float(weights[i])
        
    return result_weights

def run_prioritization(matrix) -> list:
    results = []
    if not matrix.alternatives:
        return results
        
    criteria_list = matrix.criteria
    ahp_weights = calculate_ahp_weights(criteria_list)
    weight_vector = np.array([ahp_weights.get(c, 0.25) for c in criteria_list])
    
    # 1. Construct decision matrix (n x m)
    n = len(matrix.alternatives)
    m = len(criteria_list)
    raw_matrix = np.zeros((n, m))
    
    for i, alt in enumerate(matrix.alternatives):
        for j, crit in enumerate(criteria_list):
            raw_matrix[i, j] = alt.values.get(crit, 0.0)
            
    # 2. Normalize the decision matrix (Vector normalization)
    col_norms = np.sqrt((raw_matrix ** 2).sum(axis=0))
    # Avoid division by zero
    col_norms[col_norms == 0] = 1.0
    norm_matrix = raw_matrix / col_norms
    
    # 3. Apply AHP weights
    weighted_matrix = norm_matrix * weight_vector
    
    # 4. Calculate Ideal Solutions (All criteria are BENEFIT criteria)
    pis = weighted_matrix.max(axis=0)
    nis = weighted_matrix.min(axis=0)
    
    # 5. Calculate distances and Closeness Coefficient
    for i, alt in enumerate(matrix.alternatives):
        d_pos = np.sqrt(((weighted_matrix[i] - pis) ** 2).sum())
        d_neg = np.sqrt(((weighted_matrix[i] - nis) ** 2).sum())
        
        c_score = 0.0
        if d_pos + d_neg > 0:
            c_score = d_neg / (d_pos + d_neg)
            
        results.append({
            "id": alt.id,
            "rank": 0,
            "priority_score": float(c_score),
            "criteria": alt.values,
            "ahp_weights": ahp_weights,
            "topsis": {
                "distance_to_positive": float(d_pos),
                "distance_to_negative": float(d_neg),
                "closeness_coefficient": float(c_score)
            }
        })
        
    # Rank by priority_score descending
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    
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
