#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.parse
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # If path is empty, serve index.html
        if not path or path == '/':
            path = 'index.html'
        else:
            # If path doesn't have .html extension, try adding .html
            if not path.endswith('.html'):
                html_path = path + '.html'
                if os.path.exists(html_path):
                    path = html_path
        
        # Update the path for the parent class
        self.path = '/' + path
        
        # Call the parent class method
        super().do_GET()

PORT = 8080
Handler = CustomHTTPRequestHandler

# Kill any existing server on port 8080
try:
    import subprocess
    subprocess.run(['lsof', '-ti:8080'], capture_output=True, text=True, check=True)
    subprocess.run(['kill', '-9'] + subprocess.run(['lsof', '-ti:8080'], capture_output=True, text=True).stdout.strip().split('\n'), check=True)
except:
    pass

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print("Clean URLs enabled - you can access pages without .html extension")
    httpd.serve_forever()
