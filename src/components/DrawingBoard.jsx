import React, { useRef, useState, useEffect } from 'react';

const DrawingBoard = ({ onSave }) => {
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

    // Fixed height for simplicity
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    contextRef.current = ctx;
  }, []);

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
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave({
      id: crypto.randomUUID ? crypto.randomUUID() : `draw-${Date.now()}`,
      name: `drawing-${Date.now()}.png`,
      data: dataUrl,
      type: 'image/png'
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
          style={{marginLeft: 'auto'}}
          disabled={isExporting}
        >
          {isExporting ? '✔️ Saving...' : 'Save Note'}
        </button>
      </div>

      <div className="canvas-wrapper">
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
