import React, { useState, useRef, useEffect } from 'react';
import { mockChatHistory, mockAiResponses } from '../mockData';
import './ChatPanel.css';

const ChatPanel = () => {
  const [messages, setMessages] = useState(mockChatHistory);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const randomResponse = mockAiResponses[Math.floor(Math.random() * mockAiResponses.length)];
      const newAiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: randomResponse
      };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <aside className="panel chat-panel glass-panel">
      <div className="panel-header chat-header">
        <div className="chat-title">
          <span className="ai-status-indicator online"></span>
          <h2>AI Chat</h2>
        </div>
        <button className="chat-menu-btn">•••</button>
      </div>
      
      <div className="chat-messages scrollable">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'ai' && <div className="avatar ai-avatar">🤖</div>}
            <div className={`message-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
            {msg.sender === 'user' && <div className="avatar user-avatar">👤</div>}
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper ai">
            <div className="avatar ai-avatar">🤖</div>
            <div className="message-bubble ai typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-input-form">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Text message input..." 
            className="chat-input"
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!inputValue.trim() || isTyping}
          >
            send
          </button>
        </form>
      </div>
    </aside>
  );
};

export default ChatPanel;
