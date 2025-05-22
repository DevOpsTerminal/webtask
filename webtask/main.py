#!/usr/bin/env python3
"""
webtask - Main entry point
"""

import sys
import argparse
from .server import webtaskServer


def main():
    """Main entry point for WebTop"""
    parser = argparse.ArgumentParser(
        description="WebTop - A web-based system monitor inspired by htop"
    )
    parser.add_argument(
        "--host",
        default="localhost",
        help="Host to bind the server to (default: localhost)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind the server to (default: 8000)"
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Don't automatically open browser"
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"WebTop {__import__('webtop').__version__}"
    )
    
    args = parser.parse_args()
    
    try:
        server = WebTopServer(
            host=args.host,
            port=args.port,
            open_browser=not args.no_browser
        )
        server.run()
    except KeyboardInterrupt:
        print("\n👋 WebTop stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting WebTop: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()