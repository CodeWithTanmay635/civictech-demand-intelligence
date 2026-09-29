import requests
import time
import random
from datetime import datetime
import json

URL = "http://localhost:8081/api/v1/webhooks/citizen-feedback"

# Bounding box around San Francisco
LAT_MIN, LAT_MAX = 37.7, 37.8
LNG_MIN, LNG_MAX = -122.5, -122.3

feedbacks = [
    "Pothole completely destroying cars on Main St.",
    "No streetlights working here for weeks.",
    "Water main break causing flooding.",
    "Traffic lights are down at the intersection.",
    "Power outage in this entire block."
]

print("Starting demo simulator...")
for i in range(500):
    payload = {
        "message_id": f"sim_msg_{i}",
        "source_platform": "RapidPro",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {
            "latitude": round(random.uniform(LAT_MIN, LAT_MAX), 6),
            "longitude": round(random.uniform(LNG_MIN, LNG_MAX), 6)
        },
        "feedback_text": random.choice(feedbacks),
        "metadata": {"priority": "high"}
    }
    
    try:
        response = requests.post(URL, json=payload, timeout=2)
        print(f"[{i+1}/500] Posted {payload['message_id']} - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[{i+1}/500] Failed to post: {e}")
        
    time.sleep(0.05) # Rapidly post

print("Simulation complete.")
