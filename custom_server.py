#!/usr/bin/env python3
import http.server
import socketserver
import os
import urllib.parse

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
        
        # List of spectacle pages without .html extension
        spectacle_pages = [
            'spectacle-alice-chez-les-merveilles',
            'spectacle-antigone', 
            'spectacle-casse-noisette',
            'spectacle-charlotte',
            'spectacle-estevanico',
            'spectacle-le-petit-prince',
            'spectacle-leau-la',
            'spectacle-lenfant-de-larbre',
            'spectacle-simple-comme-bonjour',
            'spectacle-tara-sur-la-lune'
        ]
        
        # Check if the requested path is a spectacle page without .html
        if path in spectacle_pages:
            path = path + '.html'
        
        # Check if file exists without extension, add .html
        elif not path.endswith('.html') and not '.' in path:
            html_path = path + '.html'
            if os.path.exists(html_path):
                path = html_path
        
        # Update the path in the request
        self.path = '/' + path
        
        # Call the parent method to handle the request
        super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
