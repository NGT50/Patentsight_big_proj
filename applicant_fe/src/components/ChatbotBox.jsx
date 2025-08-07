// src/components/ChatBotBox.jsx

import React, { useState } from 'react';
import { sendMessageToChatSession } from '../api/patents';

const ChatBotBox = ({ sessionId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', content: '안녕하세요! 무엇을 도와드릴까요?' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendMessageToChatSession(sessionId, input);
      const botMessage = { sender: 'bot', content: res.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', content: '❌ GPT 응답 실패' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
      <h3>🧠 GPT 도우미</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: msg.sender === 'user' ? '#d1eaff' : '#eee',
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="GPT에게 질문해보세요..."
          style={{ flex: 1 }}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  );
};

export default ChatBotBox;
