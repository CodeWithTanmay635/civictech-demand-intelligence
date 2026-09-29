CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE citizen_feedback (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    source_platform VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    feedback_text TEXT NOT NULL,
    embedding vector(384) -- Assuming a 384-dimensional embedding like all-MiniLM-L6-v2
);
