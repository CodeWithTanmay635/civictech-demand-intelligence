import http.server
import socketserver
import json
import urllib.parse

class MockAIHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        req = json.loads(post_data)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        if self.path == '/api/v1/spatial/h3-index':
            self.wfile.write(json.dumps({"h3_index": "89283082803ffff"}).encode())
        elif self.path == '/api/v1/ai/prioritize':
            # returns a list of items based on request alternatives
            alts = req.get("alternatives", [])
            resp = []
            for i, alt in enumerate(alts):
                resp.append({
                    "id": alt["id"],
                    "rank": i+1,
                    "priority_score": 0.9,
                    "criteria": alt.get("values", {}),
                    "topsis": {}
                })
            self.wfile.write(json.dumps(resp).encode())
        else:
            self.wfile.write(b'{}')

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "ok"}')

with socketserver.TCPServer(("", 8000), MockAIHandler) as httpd:
    print("serving at port", 8000)
    httpd.serve_forever()
