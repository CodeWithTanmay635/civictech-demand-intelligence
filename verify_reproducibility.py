import subprocess
import psycopg2

DB_URL = "dbname=civictech user=postgres password=password host=127.0.0.1 port=5432"

def get_stats():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    stats = {}
    
    cur.execute("SELECT COUNT(*), SUM(population), SUM(vulnerability_score) FROM demographic_data;")
    row = cur.fetchone()
    stats['demo'] = {'count': row[0], 'sum_pop': row[1], 'sum_vul': round(row[2], 5) if row[2] else 0}

    cur.execute("SELECT COUNT(*), SUM(capacity), SUM(condition_score) FROM infrastructure_data;")
    row = cur.fetchone()
    stats['infra'] = {'count': row[0], 'sum_cap': round(row[1], 5) if row[1] else 0, 'sum_cond': round(row[2], 5) if row[2] else 0}

    cur.execute("SELECT COUNT(*), SUM(planned_budget), SUM(spent_budget) FROM public_investment;")
    row = cur.fetchone()
    stats['invest'] = {'count': row[0], 'sum_planned': round(row[1], 5) if row[1] else 0, 'sum_spent': round(row[2], 5) if row[2] else 0}
    
    conn.close()
    return stats

print("Running generator first time...")
subprocess.run(["python", "synthetic_data_generator.py"], check=True)
stats1 = get_stats()

print("Running generator second time...")
subprocess.run(["python", "synthetic_data_generator.py"], check=True)
stats2 = get_stats()

print("\n--- RESULTS ---")
print("Run 1 Stats:", stats1)
print("Run 2 Stats:", stats2)

if stats1 == stats2:
    print("SUCCESS: Both runs are identical!")
else:
    print("FAILURE: Runs do not match!")
