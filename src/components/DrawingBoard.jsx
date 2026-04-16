import React, { useRef, useState, useEffect, useCallback } from 'react';

const DrawingBoard = ({ onSave }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  
  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Buffer canvas for shape previews
  const bufferCanvasRef = useRef(document.createElement('canvas'));
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = size;
    contextRef.current = context;

    // Fill white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    saveState();
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      contextRef.current.lineWidth = size;
      contextRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      
      // If eraser, we actually want to draw with white on our white background 
      // instead of standard destination-out which makes it transparent
      if (tool === 'eraser') {
        contextRef.current.globalCompositeOperation = 'source-over';
        contextRef.current.strokeStyle = '#FFFFFF';
      }
    }
  }, [color, size, tool]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const img = new Image();
      img.src = history[prevIndex];
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        setHistoryIndex(prevIndex);
      };
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const img = new Image();
      img.src = history[nextIndex];
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        contextRef.current.drawImage(img, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
        setHistoryIndex(nextIndex);
      };
    }
  };

  const getEventPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const pos = getEventPos(e);
    setStartPos(pos);
    
    if (tool === 'pencil' || tool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(pos.x, pos.y);
    }
    
    // Copy current canvas to buffer for shape previewing
    bufferCanvasRef.current.width = canvasRef.current.width;
    bufferCanvasRef.current.height = canvasRef.current.height;
    bufferCanvasRef.current.getContext('2d').drawImage(canvasRef.current, 0, 0);
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getEventPos(e);

    if (tool === 'pencil' || tool === 'eraser') {
      contextRef.current.lineTo(pos.x, pos.y);
      contextRef.current.stroke();
    } else {
      // Shape preview: restore from buffer first
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      contextRef.current.drawImage(bufferCanvasRef.current, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);
      
      contextRef.current.beginPath();
      if (tool === 'rectangle') {
        contextRef.current.rect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        contextRef.current.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      } else if (tool === 'line') {
        contextRef.current.moveTo(startPos.x, startPos.y);
        contextRef.current.lineTo(pos.x, pos.y);
      }
      contextRef.current.stroke();
    }
  };

  const endDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      saveState();
    }
  };

  const handleExport = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave({
      name: `drawing-${Date.now()}.png`,
      data: dataUrl,
      type: 'image/png'
    });
  };

  return (
    <div className="drawing-board">
      <div className="drawing-toolbar">
        <div className="tool-group">
          <button 
            type="button"
            className={`btn ${tool === 'pencil' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('pencil')} title="Pencil"
          >
            ✏️
          </button>
          <button 
            type="button"
            className={`btn ${tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('eraser')} title="Eraser"
          >
            🧽
          </button>
        </div>

        <div className="tool-group">
          <button 
            type="button"
            className={`btn ${tool === 'line' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('line')} title="Line"
          >
            /
          </button>
          <button 
            type="button"
            className={`btn ${tool === 'rectangle' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('rectangle')} title="Rectangle"
          >
            ▭
          </button>
          <button 
            type="button"
            className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('circle')} title="Circle"
          >
            ◯
          </button>
        </div>

        <div className="tool-group">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser'}
          />
          <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
            <option value="2">Thin</option>
            <option value="5">Medium</option>
            <option value="10">Thick</option>
            <option value="20">Extra Thick</option>
          </select>
        </div>

        <div className="tool-group">
          <button type="button" className="btn btn-secondary" onClick={undo} disabled={historyIndex <= 0}>↩️</button>
          <button type="button" className="btn btn-secondary" onClick={redo} disabled={historyIndex >= history.length - 1}>↪️</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            contextRef.current.fillStyle = 'white';
            contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            saveState();
          }}>🗑️</button>
        </div>
        
        <button type="button" className="btn btn-primary" onClick={handleExport} style={{marginLeft: 'auto'}}>
          Add to Note
        </button>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>
    </div>
  );
};

export default DrawingBoard;
