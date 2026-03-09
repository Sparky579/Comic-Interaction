import React, { useRef, useState, useEffect } from 'react';
import './DrawingCanvas.css';

const presetColors = ['#00d4ff', '#ff007f', '#00ffaa', '#ffff00', '#ffffff', '#000000'];

const DrawingCanvas = ({ pageId }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00d4ff');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);

  // Setup canvas on mount and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Match parent size
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    // Setup Context
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Load saved drawings for this page if any (mocking clear state on page flip)
    // In a real app we'd load from state/context via pageId
  }, [pageId]);

  // Update context when tool changes
  useEffect(() => {
    if (!contextRef.current) return;
    if (isEraser) {
        contextRef.current.globalCompositeOperation = 'destination-out';
        contextRef.current.lineWidth = brushSize * 2;
    } else {
        contextRef.current.globalCompositeOperation = 'source-over';
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, isEraser]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Save to history for Undo (naive implementation for mock)
    const canvas = canvasRef.current;
    if (canvas) {
        setHistory(prev => [...prev.slice(-9), canvas.toDataURL()]);
    }
  };

  const currentToolStyle = isEraser ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'><path d=\'M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20H20V20Z\'/></svg>") 0 24, auto' : 'crosshair';

  return (
    <>
      {/* The Transparent Drawing Canvas */}
      <canvas
        className="drawing-canvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ cursor: currentToolStyle }}
      />
      
      {/* Floating Canvas Tools Toolbar */}
      <div className="canvas-tools glass-panel">
        <button 
          className={`ct-btn ${!isEraser ? 'active' : ''}`} 
          onClick={() => setIsEraser(false)}
          title="Pen"
        >
          ✏️
        </button>
        <button 
          className={`ct-btn ${isEraser ? 'active' : ''}`} 
          onClick={() => setIsEraser(true)}
          title="Eraser"
        >
          🧹
        </button>
        
        <div className="ct-divider"></div>
        
        {/* Colors */}
        <div className="ct-colors">
          {presetColors.map(c => (
            <div 
              key={c}
              className={`ct-color ${color === c && !isEraser ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => { setColor(c); setIsEraser(false); }}
            />
          ))}
        </div>
        
        <div className="ct-divider"></div>

        {/* Action Buttons */}
        <button 
          className="ct-btn" 
          onClick={() => {
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            if(ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setHistory([]);
            }
          }}
          title="Clear All"
        >
          🗑️
        </button>
      </div>
    </>
  );
};

export default DrawingCanvas;
