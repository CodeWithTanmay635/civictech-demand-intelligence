# Demand Intelligence Demo Runbook

## Services and Ports
| Service | Technology | Port | Directory |
|---------|-----------|------|-----------|
| PostgreSQL | Native Database | 5432 | N/A |
| Spatial Engine | Python / FastAPI | 8000 | `ai-spatial-engine/` |
| Core API | Java / Spring Boot | 8081 | `core-api/` |
| Frontend | React / Vite | 5173 | `frontend-dashboard/` |

## Startup Commands (Exact Order)

1. **Database:** Ensure PostgreSQL is running locally on port 5432 and the `civictech` database is created.
   ```bash
   # If database doesn't exist yet:
   psql -U postgres -c "CREATE DATABASE civictech;"
   ```
2. **Spatial Engine (FastAPI):**
   ```bash
   cd "ai-spatial-engine"
   python -m uvicorn main:app --reload --port 8000
   ```
3. **Core API (Spring Boot):**
   ```bash
   cd "core-api"
   mvn spring-boot:run
   ```
4. **Frontend Dashboard (Vite):**
   ```bash
   cd "frontend-dashboard"
   npm run dev
   # OR: node node_modules/vite/bin/vite.js
   ```

## API Endpoints
* **Webhook Ingestion:** `POST http://localhost:8081/api/v1/webhooks/citizen-feedback`
* **Hotspots Retrieval:** `GET http://localhost:8081/api/v1/hotspots`

## Frontend URL
* `http://localhost:5173`

## Sample Webhook Payload
Submit this payload to simulate a citizen feedback event in Mumbai, India:
```json
{
  "message_id": "mumbai_feedback_1",
  "source_platform": "X",
  "timestamp": "2026-09-29T22:06:00Z",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "feedback_text": "Need better infrastructure in this area.",
  "category": "INFRASTRUCTURE"
}
```
**Expected Response:** `202 Accepted` with body `"Payload accepted for processing"`

## Known Prototype Limitations
1. **Docker Isolation:** Currently uses the native Windows PostgreSQL instead of the provided Docker image (`civictech-postgres`) due to a port conflict that could not be resolved without Administrator privileges.
2. **Vector Embeddings:** The `pgvector` extension and vector embedding logic are temporarily bypassed in the code (`CitizenFeedback.java` has the embedding column commented out). The H3 hexagon spatial indexing is still working perfectly.
3. **API Performance:** The Spring Boot API synchronously queries the FastAPI engine inside a loop for each feedback entry during `GET /hotspots`, which works for the demo but should be replaced with batch queries or asynchronous pre-computation in production.
4. **Error Handling:** If FastAPI spatial endpoints are unavailable, Spring Boot will silently ignore the H3 binning process for the given records.
