import http.server
import socketserver
import urllib.request
import urllib.error
import webbrowser
import os
import sys

PORT = 8082
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Ensure we are serving the correct directory
web_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(web_dir)

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        ".js": "application/javascript",
        ".css": "text/css",
    })

    # Simple in-memory cache: {url: (timestamp, content, content_type)}
    api_cache = {}
    CACHE_DURATION = 60 # seconds

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Handle API proxying
        if self.path.startswith("/api/"):
            target_url = COINGECKO_API + self.path[4:] # Remove /api prefix
            
            # Check cache
            import time
            current_time = time.time()
            if target_url in self.api_cache:
                timestamp, content, content_type = self.api_cache[target_url]
                if current_time - timestamp < self.CACHE_DURATION:
                    print(f"Serving from cache: {self.path}")
                    self.send_response(200)
                    self.send_header('Content-Type', content_type)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('X-Cache', 'HIT')
                    self.end_headers()
                    self.wfile.write(content)
                    return

            print(f"Proxying: {self.path} -> {target_url}")
            
            try:
                # Create request with browser headers to avoid blocking
                req = urllib.request.Request(target_url, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json'
                })
                
                with urllib.request.urlopen(req) as response:
                    content = response.read()
                    content_type = response.headers.get('Content-Type', 'application/json')
                    
                    # Store in cache
                    self.api_cache[target_url] = (current_time, content, content_type)
                    
                    self.send_response(response.status)
                    # Forward content content-type
                    self.send_header('Content-Type', content_type)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('X-Cache', 'MISS')
                    self.end_headers()
                    self.wfile.write(content)
                    
            except urllib.error.HTTPError as e:
                print(f"API Error: {e}")
                # If rate limited and we have cache (even old), return it?
                # For now just return error
                self.send_response(e.code)
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                print(f"Proxy Error: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            # Serve static files
            super().do_GET()

print(f"Starting server at http://localhost:{PORT}")
print("API Proxy active: /api/ -> https://api.coingecko.com/api/v3/")

try:
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print("Press Ctrl+C to stop the server.")
        webbrowser.open(f"http://localhost:{PORT}")
        httpd.serve_forever()
except OSError as e:
    if e.errno == 98 or e.errno == 10048:
        print(f"Error: Port {PORT} is already in use.")
        print("Please close the other server window or wait a moment.")
    else:
        print(f"Error starting server: {e}")
except KeyboardInterrupt:
    print("\nServer stopped.")
