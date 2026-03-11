import React, { useEffect, useRef, useState } from 'react';
import {
  sendGeminiMessage,
  getStoredApiKey,
  getStoredModel,
  setStoredApiKey,
  setStoredModel,
  AVAILABLE_MODELS,
} from '../geminiClient';
import './ChatPanel.css';

const SYSTEM_GREETING = {
  id: 'system-0',
  sender: 'ai',
  text: 'Hi! I can help you review and discuss the comic pages. Ask me anything about the current dataset.',
};

const ChatPanel = ({ activeDataset, activePage }) => {
  const [messages, setMessages] = useState([SYSTEM_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [model, setModel] = useState(() => getStoredModel());
  const [customModel, setCustomModel] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const isConfigured = apiKey.trim().length > 0;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping) return;

    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    setError('');

    const newUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build context-aware prompt
      const contextPrefix = `[Context: The user is reviewing comic dataset "${activeDataset.label}" — ${activeDataset.summary}. They are currently on page ${activePage}.]\n\n`;
      const userTextWithContext =
        updatedMessages.length <= 2
          ? contextPrefix + text
          : text;

      const aiText = await sendGeminiMessage(
        messages.filter((m) => m.id !== 'system-0'),
        userTextWithContext,
        { apiKey, model }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
        },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${err.message}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSaveSettings = () => {
    const finalModel = customModel.trim() || model;
    setStoredApiKey(apiKey);
    setStoredModel(finalModel);
    setModel(finalModel);
    setCustomModel('');
    setShowSettings(false);
  };

  const isKnownModel = AVAILABLE_MODELS.some((m) => m.id === model);

  return (
    <aside className="panel chat-panel glass-panel">
      <div className="panel-header chat-header">
        <div className="chat-title">
          <span className={`ai-status-indicator ${isConfigured ? 'online' : 'offline'}`}></span>
          <div>
            <h2>Chat</h2>
          </div>
        </div>
        <button
          type="button"
          className="chat-settings-btn"
          onClick={() => setShowSettings(true)}
          title="API Settings"
        >
          ⚙️
        </button>
      </div>

      <div className="notes-summary">
        <p className="notes-title">Page {activePage}</p>
        {!isConfigured && (
          <p className="config-hint">
            Click ⚙️ to set your Gemini API key
          </p>
        )}
      </div>

      <div className="chat-messages scrollable">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'ai' && <div className="avatar ai-avatar">AI</div>}
            <div className={`message-bubble ${msg.sender} ${msg.id.startsWith('error') ? 'error' : ''}`}>
              <p>{msg.text}</p>
            </div>
            {msg.sender === 'user' && <div className="avatar user-avatar">ME</div>}
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper ai">
            <div className="avatar ai-avatar">AI</div>
            <div className="message-bubble ai typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-input-form">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConfigured ? 'Type a message... (Enter to send)' : 'Set API key first...'}
            className="chat-input"
            rows="2"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputValue.trim() || isTyping}
          >
            Send
          </button>
        </form>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="chat-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="chat-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Gemini API Settings</h3>
              <button
                type="button"
                className="settings-close-btn"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>

            <div className="settings-form">
              <div className="settings-field">
                <label>API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="settings-input"
                />
                <span className="settings-hint">
                  Get your key from{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                    AI Studio
                  </a>
                </span>
              </div>

              <div className="settings-field">
                <label>Model</label>
                <select
                  value={isKnownModel ? model : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomModel(model);
                    } else {
                      setModel(e.target.value);
                      setCustomModel('');
                    }
                  }}
                  className="settings-select"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                  <option value="__custom__">Custom model...</option>
                </select>
              </div>

              {(!isKnownModel || customModel) && (
                <div className="settings-field">
                  <label>Custom Model ID</label>
                  <input
                    type="text"
                    value={customModel || (!isKnownModel ? model : '')}
                    onChange={(e) => {
                      setCustomModel(e.target.value);
                      setModel(e.target.value);
                    }}
                    placeholder="e.g. gemini-3.1-pro-preview"
                    className="settings-input"
                  />
                </div>
              )}

              <div className="settings-actions">
                <button
                  type="button"
                  className="settings-cancel-btn"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="settings-save-btn"
                  onClick={handleSaveSettings}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatPanel;
