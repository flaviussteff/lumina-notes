import React, { useRef, useState, useEffect } from 'react';

const DrawingBoard = ({ onSave, initialData, initialId, initialName }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = 400;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear with white first
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = initialData;
    }
    
    contextRef.current = ctx;
  }, [initialData]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const start = (e) => {
    const { x, y } = getPos(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    contextRef.current.lineWidth = size;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stop = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleExport = () => {
    setIsExporting(true);
    const canvas = canvasRef.current;
    
    // Create a temporary canvas for scaling
    const exportCanvas = document.createElement('canvas');
    const MAX_WIDTH = 1024;
    const scale = Math.min(1, MAX_WIDTH / canvas.width);
    
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;
    
    const ctx = exportCanvas.getContext('2d');
    // Fill background with white (since we're using JPEG)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.8);
    onSave({
      id: initialId || (crypto.randomUUID ? crypto.randomUUID() : `draw-${Date.now()}`),
      name: initialName || `drawing-${Date.now()}.jpg`,
      data: dataUrl,
      type: 'image/jpeg'
    });

    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="simple-drawing-board">
      <div className="drawing-toolbar-minimal">
        <div className="tool-toggle">
          <button
            type="button"
            className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
          >✏️ Pen</button>
          <button
            type="button"
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
          >🧽 Eraser</button>
        </div>

        <div className="tool-settings">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === 'eraser'} />
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value="2">Thin</option>
            <option value="5">Normal</option>
            <option value="12">Thick</option>
            <option value="30">Marker</option>
          </select>
        </div>

        <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>

        <button
          type="button"
          className={`btn ${isExporting ? 'btn-success' : 'btn-primary'}`}
          onClick={handleExport}
          style={{ marginLeft: 'auto' }}
          disabled={isExporting}
        >
          {isExporting ? '✔️ Applying...' : 'Done Drawing'}
        </button>
      </div>

      <div className="canvas-wrapper" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
      </div>
    </div>
  );
};

export default DrawingBoard;
