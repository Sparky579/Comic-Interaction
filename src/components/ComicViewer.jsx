import React, { useState, useRef, useEffect } from 'react';
import { mockPages } from '../mockData';
import DrawingCanvas from './DrawingCanvas';
import './ComicViewer.css';

const ComicViewer = ({ activePage, setActivePage }) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const activePageData = mockPages.find(p => p.page_number === activePage) || mockPages[0];
  
  // Handle thumbnail click
  const handleThumbnailClick = (pageNumber) => {
    setActivePage(pageNumber);
    // Reset drawing mode when changing pages
    setIsDrawingMode(false);
  };

  return (
    <section className="panel comic-viewer">
      
      {/* Top Gallery Strip */}
      <div className="gallery-strip glass-panel">
        <button className="nav-arrow left">&lt;</button>
        <div className="thumbnails-container">
          {mockPages.map((page) => (
            <div 
              key={page.page_number}
              className={`thumbnail-wrapper ${activePage === page.page_number ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(page.page_number)}
            >
              <img src={page.imageUrl} alt={`Page ${page.page_number}`} className="thumbnail-img" />
            </div>
          ))}
        </div>
        <button className="nav-arrow right">&gt;</button>
      </div>

      {/* Main Comic Display Area */}
      <div className="main-comic-display glass-panel">
        {/* Floating Toolbar on left */}
        <div className="floating-toolbar">
          <button 
            className={`tool-btn ${isDrawingMode ? 'active' : ''}`}
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            title="Toggle Drawing Tools"
          >
            ✏️
          </button>
          <button className="tool-btn" title="Download">⬇️</button>
          <button className="tool-btn" title="Share">🔗</button>
        </div>

        {/* Comic Image with Canvas Overlay */}
        <div className="comic-canvas-wrapper">
          <img 
            src={activePageData.imageUrl} 
            alt={`Page ${activePageData.page_number}`} 
            className="main-comic-img" 
          />
          
          {/* Drawing Canvas Overlay */}
          {isDrawingMode && (
            <DrawingCanvas pageId={activePageData.page_number} />
          )}
        </div>
      </div>

      {/* Description Area */}
      <div className="description-area glass-panel">
        <p>{activePageData.description}</p>
      </div>

    </section>
  );
};

export default ComicViewer;
