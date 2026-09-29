import requests
import time
import random
from datetime import datetime
import json

URL = "http://localhost:8081/api/v1/webhooks/citizen-feedback"

# Mumbai Bounding Box
LAT_MIN, LAT_MAX = 18.9, 19.2
LNG_MIN, LNG_MAX = 72.8, 72.9

feedbacks = [
    "Road is full of potholes",
    "रस्ता खराब आहे", # Road is bad (Marathi)
    "सड़क बहुत खराब है", # Road is very bad (Hindi)
    "No water supply since yesterday",
    "कालपासून पाणी नाही", # No water since yesterday (Marathi)
    "कल से पानी नहीं आ रहा है", # Water not coming since yesterday (Hindi)
    "Clinic has no doctors available",
    "दवाखान्यात डॉक्टर नाहीत", # No doctors in clinic (Marathi)
    "अस्पताल में डॉक्टर नहीं हैं", # No doctors in hospital (Hindi)
    "Garbage not collected for a week",
    "कचरा उचलला नाही", # Garbage not picked up (Marathi)
    "कूड़ा नहीं उठाया गया है", # Garbage not picked up (Hindi)
    "School building needs repair",
    "शाळेची इमारत दुरुस्त करा", # Repair school building (Marathi)
    "स्कूल की इमारत की मरम्मत चाहिए" # School building needs repair (Hindi)
]

platforms = ["WHATSAPP_SIMULATED", "VOICE_SIMULATED", "RapidPro"]

print("Starting multilingual semantic demo simulator...")
for i in range(100):
    payload = {
        "message_id": f"sim_msg_{i}",
        "source_platform": random.choice(platforms),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "location": {
            "latitude": round(random.uniform(LAT_MIN, LAT_MAX), 6),
            "longitude": round(random.uniform(LNG_MIN, LNG_MAX), 6)
        },
        "feedback_text": random.choice(feedbacks),
        "metadata": {"priority": "high"}
    }
    
    try:
        response = requests.post(URL, json=payload, timeout=5)
        print(f"[{i+1}/100] Posted {payload['message_id']} - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[{i+1}/100] Failed to post: {e}")
        
    time.sleep(0.5)

print("Simulation complete.")
