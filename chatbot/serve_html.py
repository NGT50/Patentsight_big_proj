#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import json
import urllib.parse
from pathlib import Path
import threading
import time

class ChatbotHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/chat':
            # POST 요청 처리
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # JSON 데이터 파싱
                data = json.loads(post_data.decode('utf-8'))
                user_message = data.get('message', '')
                session_id = data.get('session_id', 'default')
                
                # 챗봇 API 호출 (실제로는 여기서 LangGraph 챗봇을 호출)
                bot_response = self.get_chatbot_response(user_message, session_id)
                
                # 응답 전송
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                
                response_data = {
                    'response': bot_response,
                    'timestamp': time.time()
                }
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_data = {'error': str(e)}
                self.wfile.write(json.dumps(error_data).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        # CORS preflight 요청 처리
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_chatbot_response(self, user_message, session_id):
        """챗봇 응답 생성 (실제로는 LangGraph API 호출)"""
        # 실제 구현에서는 여기서 LangGraph 챗봇 API를 호출
        # 지금은 간단한 응답으로 대체
        
        if '안녕' in user_message or 'hello' in user_message.lower():
            return "안녕하세요! 특허 문서 점검, 유사특허 검색, 청구항 초안, 거절 사유 초안 중 무엇을 도와드릴까요?"
        elif '문제' in user_message or '오류' in user_message or '검토' in user_message:
            return "문서 점검을 요청하셨네요! 특허 문서의 형식/문맥 오류를 검사해드리겠습니다. 문서 내용을 입력해주세요."
        elif '유사' in user_message or '검색' in user_message:
            return "유사 특허 검색을 요청하셨네요! 검색하고 싶은 특허 내용을 입력해주세요."
        elif '청구항' in user_message or '초안' in user_message:
            return "청구항 초안 생성을 요청하셨네요! 발명의 내용을 입력해주세요."
        elif '거절' in user_message or '거부' in user_message:
            return "거절사유 분석을 요청하셨네요! 분석할 특허 문서를 입력해주세요."
        else:
            return "죄송합니다. 특허 문서 점검, 유사특허 검색, 청구항 초안, 거절 사유 초안 중 어떤 기능을 원하시나요?"

def create_chatbot_html():
    """챗봇 HTML 파일 생성"""
    html_content = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>특허 챗봇</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .chat-container {
            width: 90%;
            max-width: 800px;
            height: 80vh;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }
        
        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
        .message.bot {
            justify-content: flex-start;
        }
        
        .message-content {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
            line-height: 1.4;
        }
        
        .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message.bot .message-content {
            background: white;
            color: #333;
            border: 1px solid #e0e0e0;
            border-bottom-left-radius: 4px;
        }
        
        .message-time {
            font-size: 0.7em;
            color: #999;
            margin-top: 5px;
        }
        
        .chat-input {
            padding: 20px;
            background: white;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        
        .chat-input input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }
        
        .chat-input input:focus {
            border-color: #667eea;
        }
        
        .chat-input button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s;
        }
        
        .chat-input button:hover {
            transform: translateY(-2px);
        }
        
        .chat-input button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .typing-indicator {
            display: none;
            padding: 12px 16px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            color: #666;
            font-style: italic;
        }
        
        .quick-actions {
            padding: 15px 20px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .quick-action-btn {
            padding: 8px 16px;
            background: white;
            border: 1px solid #667eea;
            color: #667eea;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .quick-action-btn:hover {
            background: #667eea;
            color: white;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            🤖 특허 챗봇 어시스턴트
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="message bot">
                <div class="message-content">
                    안녕하세요! 특허 문서 점검, 유사특허 검색, 청구항 초안, 거절 사유 초안 중 무엇을 도와드릴까요?
                    <div class="message-time">지금</div>
                </div>
            </div>
        </div>
        
        <div class="quick-actions">
            <button class="quick-action-btn" onclick="sendQuickMessage('문서 점검해줘')">📋 문서 점검</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('유사 특허 검색해줘')">🔍 유사 특허</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('청구항 초안 만들어줘')">✍️ 청구항 초안</button>
            <button class="quick-action-btn" onclick="sendQuickMessage('거절사유 분석해줘')">⚠️ 거절사유</button>
        </div>
        
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="메시지를 입력하세요..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()" id="sendButton">전송</button>
        </div>
    </div>

    <script>
        let sessionId = 'session_' + Date.now();
        
        function addMessage(content, isUser = false) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            
            const time = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${content}
                    <div class="message-time">${time}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTypingIndicator() {
            const messagesContainer = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="message-content typing-indicator">
                    챗봇이 응답을 작성 중입니다...
                </div>
            `;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // 사용자 메시지 표시
            addMessage(message, true);
            input.value = '';
            
            // 전송 버튼 비활성화
            const sendButton = document.getElementById('sendButton');
            sendButton.disabled = true;
            
            // 타이핑 표시
            showTypingIndicator();
            
            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        session_id: sessionId
                    })
                });
                
                const data = await response.json();
                
                // 타이핑 표시 제거
                hideTypingIndicator();
                
                if (data.error) {
                    addMessage('죄송합니다. 오류가 발생했습니다: ' + data.error);
                } else {
                    addMessage(data.response);
                }
                
            } catch (error) {
                hideTypingIndicator();
                addMessage('죄송합니다. 서버와 연결할 수 없습니다. 챗봇 서버가 실행 중인지 확인해주세요.');
                console.error('Error:', error);
            }
            
            // 전송 버튼 활성화
            sendButton.disabled = false;
        }
        
        function sendQuickMessage(message) {
            document.getElementById('messageInput').value = message;
            sendMessage();
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        // 페이지 로드 시 입력 필드에 포커스
        window.onload = function() {
            document.getElementById('messageInput').focus();
        };
    </script>
</body>
</html>
    """
    
    with open('chatbot_interface.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

def serve_html():
    os.chdir(Path(__file__).parent)
    
    # 챗봇 HTML 파일 생성
    create_chatbot_html()
    
    PORT = 8080
    Handler = ChatbotHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🤖 특허 챗봇 서버가 시작되었습니다!")
        print(f"🌐 브라우저에서 http://localhost:{PORT}/chatbot_interface.html 을 열어주세요")
        print(f"💡 챗봇 API 서버도 함께 실행해야 합니다 (python run_chatbot.py)")
        print(f"⏹️  서버를 중지하려면 Ctrl+C를 누르세요")
        
        # 브라우저 자동 열기
        webbrowser.open(f"http://localhost:{PORT}/chatbot_interface.html")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 서버가 중지되었습니다.")
            httpd.shutdown()

if __name__ == "__main__":
    serve_html()
