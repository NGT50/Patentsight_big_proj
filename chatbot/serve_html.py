#!/usr/bin/env python3
"""
HTML 파일을 HTTP 서버로 제공하는 스크립트
"""
import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

def serve_html():
    """HTML 파일을 HTTP 서버로 제공"""
    
    # 현재 디렉토리를 웹 루트로 설정
    os.chdir(Path(__file__).parent)
    
    # 포트 설정 (챗봇 서버와 다른 포트 사용)
    PORT = 8080
    
    # HTTP 서버 생성
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌐 HTTP 서버가 시작되었습니다: http://localhost:{PORT}")
        print(f"📄 HTML 파일: http://localhost:{PORT}/chat_test.html")
        print("🔄 브라우저가 자동으로 열립니다...")
        print("⏹️  서버를 종료하려면 Ctrl+C를 누르세요.")
        print()
        
        # 브라우저 자동 열기
        webbrowser.open(f"http://localhost:{PORT}/chat_test.html")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 서버를 종료합니다.")
            httpd.shutdown()

if __name__ == "__main__":
    print("🚀 HTML 서버 시작 중...")
    serve_html()
