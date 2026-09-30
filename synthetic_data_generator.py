import h3
import random
import csv
import psycopg2
import os

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

DB_URL = os.getenv(
    "DATABASE_URL",
    "dbname=civictech user=postgres password=password host=127.0.0.1 port=5432"
)

MUMBAI_LAT = 19.0760
MUMBAI_LNG = 72.8777
RADIUS = 0.2  # degrees roughly

# Generate hexes around Mumbai
print("Generating hexes...")
hexes = h3.grid_disk(h3.latlng_to_cell(MUMBAI_LAT, MUMBAI_LNG, 9), 15)

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

print("Inserting demographic data...")
cur.execute("TRUNCATE TABLE demographic_data RESTART IDENTITY CASCADE;")
for h in hexes:
    pop = random.randint(1000, 50000)
    vul = random.uniform(0.1, 0.9)
    cur.execute("INSERT INTO demographic_data (h3index, population, vulnerability_score) VALUES (%s, %s, %s)", (h, pop, vul))

print("Inserting infrastructure data...")
cur.execute("TRUNCATE TABLE infrastructure_data RESTART IDENTITY CASCADE;")
categories = ["TRANSPORT", "WATER", "HEALTH", "EDUCATION"]
for h in hexes:
    for cat in categories:
        cap = random.uniform(50, 100)
        cond = random.uniform(0.2, 0.9)
        cur.execute("INSERT INTO infrastructure_data (h3index, category, capacity, condition_score) VALUES (%s, %s, %s, %s)", (h, cat, cap, cond))

print("Inserting public investment data...")
cur.execute("TRUNCATE TABLE public_investment RESTART IDENTITY CASCADE;")
for h in hexes:
    for cat in categories:
        if random.random() > 0.5:
            planned = random.uniform(100000, 5000000)
            spent = planned * random.uniform(0.0, 1.0)
            cur.execute("INSERT INTO public_investment (h3index, category, planned_budget, spent_budget) VALUES (%s, %s, %s, %s)", (h, cat, planned, spent))

conn.commit()
cur.close()
conn.close()
print("Synthetic data generated and inserted successfully.")
