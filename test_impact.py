import time
import urllib.request
import json
import sys

def main():
    for _ in range(15):
        try:
            res = urllib.request.urlopen('http://localhost:8081/api/v1/projects/recommendations')
            data = json.load(res)
            if len(data) > 0:
                print("Recommendations populated")
                break
        except Exception:
            pass
        time.sleep(2)
    else:
        print("Failed to reach Spring Boot after 30s")
        sys.exit(1)

    project_id = data[0]['id']
    req = urllib.request.Request(f'http://localhost:8081/api/v1/projects/{project_id}/simulate-impact', method='POST')
    try:
        res = urllib.request.urlopen(req)
        print(json.dumps(json.load(res), indent=2))
    except Exception as e:
        print("Failed to run impact simulation:", e)
        sys.exit(1)

if __name__ == '__main__':
    main()
