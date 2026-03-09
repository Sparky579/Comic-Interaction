import React from 'react';
import { stylePresets, aspectRatios, colorPalette } from '../mockData';
import './StylePanel.css';

const StylePanel = ({ activePreset, setActivePreset, aspectRatio, setAspectRatio }) => {
  return (
    <aside className="panel style-panel glass-panel">
      <div className="panel-header">
        <h2>Style Configuration</h2>
      </div>
      
      <div className="panel-content scrollable">
        {/* Reference Image */}
        <div className="reference-section">
          <div className="reference-image-container">
            <img 
              src="https://placehold.co/400x400/2a1a3a/00d4ff.png?text=Cyberpunk+Ref" 
              alt="Style Reference" 
              className="reference-image" 
            />
            <div className="overlay-gradient"></div>
          </div>
        </div>

        {/* Style Presets */}
        <div className="config-section">
          <h3>Style Preset</h3>
          <div className="preset-grid">
            {stylePresets.map(preset => (
              <button 
                key={preset.id}
                className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => setActivePreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="config-section">
          <h3>Aspect Ratio</h3>
          <div className="ratio-grid">
            {aspectRatios.map(ratio => (
              <button 
                key={ratio}
                className={`ratio-btn ${aspectRatio === ratio ? 'active' : ''}`}
                onClick={() => setAspectRatio(ratio)}
              >
                <div className="ratio-box-preview" data-ratio={ratio}></div>
                <span>{ratio}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="config-section">
          <h3>Color Palette</h3>
          <div className="palette-grid">
            {colorPalette.map((color, index) => (
              <div 
                key={index} 
                className="color-swatch hexagonal"
                style={{ backgroundColor: color }}
                title={color}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default StylePanel;
