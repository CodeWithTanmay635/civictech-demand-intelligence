import requests
import json
import sys

URL = "http://localhost:8081/api/v1/projects/recommendations"

def fetch_and_verify(iteration):
    print(f"\n--- RUN {iteration} ---")
    try:
        res = requests.get(URL)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print("Failed to fetch data:", e)
        return None
        
    print("\nTOP PRIORITY ZONES")
    print(f"{'Rank':<5} | {'H3':<16} | {'Demand':<6} | {'Vuln':<5} | {'Infra Def':<9} | {'Inv Gap':<7} | {'TOPSIS':<6}")
    print("-" * 75)
    
    first_item = data[0]
    
    # 1. Verify AHP weights sum to 1
    weights = first_item["ahp_weights"]
    w_sum = sum(weights.values())
    print(f"\n[Verification] AHP Weights Sum: {w_sum:.4f} (Expected ~1.0)")
    print(f"[Verification] AHP Weights: {json.dumps(weights, indent=2)}")
    
    for item in data[:5]:
        c = item["criteria"]
        t = item["topsis"]
        print(f"{item['rank']:<5} | {item['h3_index']:<16} | {c['citizen_demand']:<6.2f} | {c['vulnerability']:<5.2f} | {c['infrastructure_deficit']:<9.2f} | {c['investment_gap']:<7.2f} | {item['priority_score']:<6.4f}")
        
    # Verify bounds of distances
    d_pos = first_item['topsis']['distance_to_positive']
    d_neg = first_item['topsis']['distance_to_negative']
    print(f"\n[Verification] Rank 1 Distances: D+={d_pos:.4f}, D-={d_neg:.4f}")
    
    # Verify rankings are deterministic
    rank_order = [d["h3_index"] for d in data]
    return rank_order

if __name__ == "__main__":
    ranks1 = fetch_and_verify(1)
    if ranks1 is None:
        sys.exit(1)
    ranks2 = fetch_and_verify(2)
    
    if ranks1 == ranks2:
        print("\n[Verification] DETERMINISM CHECK PASSED: Top rankings remained exactly the same across runs.")
    else:
        print("\n[Verification] DETERMINISM CHECK FAILED: Rankings changed between runs.")
