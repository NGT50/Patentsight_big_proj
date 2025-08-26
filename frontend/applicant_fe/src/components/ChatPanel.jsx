import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Bot } from 'lucide-react';

const ChatPanel = ({ messages, onSendMessage, isTyping, initialLoading, onApplySuggestion }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

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

  const ClaimsReviewMessage = ({ msg }) => (
    <div className="max-w-full lg:max-w-xl px-4 py-3 rounded-2xl shadow-sm bg-gray-200 text-gray-800 rounded-bl-lg">
      <p className="whitespace-pre-wrap text-sm font-semibold mb-4">{msg.header}</p>
      <div className="space-y-4 bg-white/50 p-3 rounded-lg">
        {msg.reviews.map(review => (
          <div key={review.claimNumber} className="border-b border-gray-300 pb-3 last:border-b-0">
            <h4 className="font-bold text-sm mb-1">【청구항 {review.claimNumber}】</h4>
            <p className="whitespace-pre-wrap text-xs text-gray-600 mb-2"><strong className="text-red-600">문제점:</strong> {review.problem}</p>
            <div className="bg-green-50 p-2 rounded">
              <p className="whitespace-pre-wrap text-xs"><strong className="text-green-700">✍️ 수정안:</strong> {review.suggestion}</p>
              <button
                onClick={() => onApplySuggestion(review.action)}
                className="flex items-center gap-1.5 mt-2 px-2.5 py-1 text-xs font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition-all shadow-sm"
              >
                <CheckCircleIcon className="w-3.5 h-3.5" />
                이 수정안 적용
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
          messages.map((msg, index) => {
            if (msg.messageType === 'CLAIMS_REVIEW') {
              return (
                <div key={index} className="flex flex-col items-start gap-2">
                  <ClaimsReviewMessage msg={msg} onApplySuggestion={onApplySuggestion} />
                </div>
              );
            }

            return (
              <div key={index} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-lg'
                    : 'bg-gray-200 text-gray-800 rounded-bl-lg'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
                {msg.sender === 'ai' && msg.action && (
                  <button
                    onClick={() => onApplySuggestion(msg.action)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all shadow-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    이대로 수정하기
                  </button>
                )}
              </div>
            );
          })
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