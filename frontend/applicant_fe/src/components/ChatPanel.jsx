import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'; // 아이콘 import
import { Bot } from 'lucide-react';

const ChatPanel = ({ messages, onSendMessage, isTyping, initialLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isTyping && !initialLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[70vh] min-h-[500px]">
      <div className="flex items-center gap-2 p-4 border-b">
        <Bot className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">AI 어시스턴트</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
        {initialLoading ? (
           <div className="flex items-center justify-center h-full text-gray-500">
             AI 어시스턴트를 준비 중입니다...
           </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-lg' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-lg'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <div className="bg-gray-200 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={initialLoading ? "AI 준비 중..." : "AI에게 질문해보세요..."}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isTyping || initialLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            disabled={isTyping || initialLoading}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;