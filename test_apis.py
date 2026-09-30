import requests
import json

base_url = "http://127.0.0.1:8081/api/v1"
endpoints = [
    "/hotspots",
    "/layers/demographics",
    "/layers/infrastructure",
    "/layers/investments",
    "/projects/recommendations"
]

print("Starting API Test\n")
for ep in endpoints:
    url = f"{base_url}{ep}"
    print(f"Testing {ep}...")
    try:
        r = requests.get(url, timeout=30)
        status = r.status_code
        try:
            data = r.json()
            count = len(data) if isinstance(data, list) else 1
            sample = json.dumps(data[0]) if isinstance(data, list) and count > 0 else json.dumps(data)
        except Exception as e:
            count = 0
            sample = r.text[:200]
            
        print(f"Status: {status}")
        print(f"Record Count: {count}")
        print(f"First Record: {sample[:300]}...")
    except Exception as e:
        print(f"Exception: {e}")
    print("-" * 50)
