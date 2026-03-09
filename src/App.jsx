import React, { useState } from 'react';
import StylePanel from './components/StylePanel';
import ComicViewer from './components/ComicViewer';
import ChatPanel from './components/ChatPanel';
import './index.css';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState(1);
  const [activePreset, setActivePreset] = useState('manga');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-icon">🖼️</div>
          <h1>AI Comic Generator</h1>
        </div>
        <div className="header-actions">
          <button className="btn-outline">+ AI chat</button>
          <div className="icon-btn">🔔</div>
          <div className="icon-btn">👤</div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="main-layout">
        <StylePanel 
          activePreset={activePreset} 
          setActivePreset={setActivePreset}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
        />
        <ComicViewer 
          activePage={activePage} 
          setActivePage={setActivePage} 
        />
        <ChatPanel />
      </main>
    </div>
  );
}

export default App;
