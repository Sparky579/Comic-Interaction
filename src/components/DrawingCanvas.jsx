import React, { useEffect, useRef, useState } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = ({
  pageId,
  imageUrl,
  alt,
  isDrawingMode,
  isEraser,
  color,
  brushSize,
  drawingTool = 'pen',
  canvasRef: externalCanvasRef,
}) => {
  const internalCanvasRef = useRef(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Save current drawing
      const imageData = canvas.width > 0 && canvas.height > 0
        ? canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
        : null;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      // Restore drawing if possible
      if (imageData) {
        context.putImageData(imageData, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [pageId, canvasRef]);

  useEffect(() => {
    if (!contextRef.current) return;

    if (isEraser) {
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineWidth = brushSize * 2;
    } else {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.strokeStyle = color;
      contextRef.current.fillStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, isEraser]);

  const startDrawing = ({ nativeEvent }) => {
    if (!isDrawingMode || !contextRef.current) return;

    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;
    const canvas = canvasRef.current;

    if (drawingTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        ctx.font = `${Math.max(brushSize * 3, 14)}px 'IBM Plex Sans', sans-serif`;
        ctx.fillText(text, offsetX, offsetY);
      }
      return;
    }

    if (drawingTool === 'rect' || drawingTool === 'circle') {
      setStartPos({ x: offsetX, y: offsetY });
      // Save canvas state for preview
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    if (drawingTool === 'pen' || drawingTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    }

    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;
    const canvas = canvasRef.current;

    if (drawingTool === 'pen' || drawingTool === 'eraser') {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (drawingTool === 'rect' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const w = offsetX - startPos.x;
      const h = offsetY - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    } else if (drawingTool === 'circle' && snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      const rx = Math.abs(offsetX - startPos.x) / 2;
      const ry = Math.abs(offsetY - startPos.y) / 2;
      const cx = (startPos.x + offsetX) / 2;
      const cy = (startPos.y + offsetY) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;

    if (drawingTool === 'pen' || drawingTool === 'eraser') {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
    setSnapshot(null);
  };

  return (
    <div className="drawing-workbench">
      <div className="comic-canvas-wrapper">
        <img src={imageUrl} alt={alt} className="main-comic-img" />
        <canvas
          className={`drawing-canvas ${isDrawingMode ? 'enabled' : 'disabled'}`}
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
