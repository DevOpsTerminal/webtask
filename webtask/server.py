"""
webtask HTTP Server
"""

import os
import webbrowser
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class webtaskHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler for WebTop"""

    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        static_dir = Path(__file__).parent / "static"
        super().__init__(*args, directory=str(static_dir), **kwargs)

    def end_headers(self):
        # Add custom headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress default logging for cleaner output
        pass


class WebTopServer:
    """WebTop server wrapper"""

    def __init__(self, host="localhost", port=8000, open_browser=True):
        self.host = host
        self.port = port
        self.open_browser = open_browser
        self.server = None

    def run(self):
        """Start the WebTop server"""
        try:
            self.server = HTTPServer((self.host, self.port), WebTopHandler)
            url = f"http://{self.host}:{self.port}"

            print(f"🚀 Starting WebTop server at {url}")
            print("📊 WebTop is running! Press Ctrl+C to stop.")

            if self.open_browser:
                # Open browser after a small delay
                threading.Timer(1.0, lambda: webbrowser.open(url)).start()

            self.server.serve_forever()

        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"❌ Port {self.port} is already in use. Try a different port with --port")
            else:
                raise
        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        """Stop the server"""
        if self.server:
            print("\n🛑 Stopping WebTop server...")
            self.server.shutdown()
            self.server.server_close()