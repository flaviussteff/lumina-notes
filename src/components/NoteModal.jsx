import React, { useState, useEffect, useRef } from 'react';
import MediaCapture from './MediaCapture';
import DrawingBoard from './DrawingBoard';
import AttachmentList from './AttachmentList';
import MediaViewer from './MediaViewer';

const NoteModal = ({ isOpen, onClose, onSave, note, defaultType }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [type, setType] = useState('mixed');

  const [activeMediaTool, setActiveMediaTool] = useState(null); // 'photo', 'audio', 'video', 'drawing'
  const [editingDrawing, setEditingDrawing] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setDescription(note.description || '');
      setContent(note.content || '');
      setItems(note.items || []);
      setAttachments(note.attachments || []);
      setType(note.type || 'mixed');
    } else {
      setTitle('');
      setDescription('');
      setContent('');
      setItems([]);
      setAttachments([]);
      setType('mixed');
      
      // If a specific type was requested for a new note, we can pre-open that tool
      if (['photo', 'audio', 'video', 'drawing'].includes(defaultType)) {
        setActiveMediaTool(defaultType);
      }
    }
  }, [note, defaultType, isOpen]);

  const handleAddAttachment = (attachment) => {
    setAttachments(prev => [...prev, attachment]);
    setActiveMediaTool(null);
    setEditingDrawing(null);
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(prev => prev.filter(a => (a.id || a.name) !== id));
  };

  const handleEditDrawing = (att) => {
    setEditingDrawing(att);
    setActiveMediaTool('drawing');
  };

  const handleAttachmentClick = (att) => {
    if (att.type === 'image/png' || att.type === 'drawing') {
        // For drawings, we might want to edit instead of just view
        // But the requirement says "Tapping an attachment should now directly open inside your app"
        // And "The drawings should now be editable"
        // I'll show the viewer first, but add an "Edit" button in the viewer or card.
        // Actually, I'll just open the viewer for now.
        setViewingAttachment({...att, type: att.type === 'drawing' ? 'drawing' : 'photo'});
    } else {
        setViewingAttachment(att);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const noteData = {
      id: note?.id,
      title: title || 'New Note',
      description,
      content,
      items,
      attachments,
      type: 'mixed'
    };
    
    try {
      await onSave(noteData);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
      <div className="modal-content mixed-note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Create Note'}</h2>
          <button className="btn-close" onClick={onClose} disabled={isSaving}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <input 
                type="text" 
                className="title-input"
                placeholder="Title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <textarea 
                className="description-input"
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                disabled={isSaving}
              />
            </div>

            <div className="form-group section-text">
              <label>Text Content</label>
              <textarea 
                className="content-textarea"
                placeholder="Start typing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="form-group section-checklist">
              <label>Checklist</label>
              <div className="checklist-container">
                {items.map((item, index) => (
                  <div key={index} className="checklist-row">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => {
                        const newItems = [...items];
                        newItems[index].checked = !newItems[index].checked;
                        setItems(newItems);
                      }} 
                    />
                    <input 
                      type="text" 
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].text = e.target.value;
                        setItems(newItems);
                      }}
                      placeholder="List item..."
                    />
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))}>&times;</button>
                  </div>
                ))}
                <button type="button" className="btn-add-item" onClick={() => setItems([...items, { text: '', checked: false }])}>+ Add Item</button>
              </div>
            </div>

            <div className="form-group section-attachments">
              <label>Attachments</label>
              <AttachmentList 
                attachments={attachments} 
                onDelete={handleDeleteAttachment} 
                onEditDrawing={handleEditDrawing}
                onView={handleAttachmentClick}
              />
              
              <div className="attachment-tools">
                <button type="button" onClick={() => setActiveMediaTool('photo')}>📸 Photo</button>
                <button type="button" onClick={() => setActiveMediaTool('video')}>🎥 Video</button>
                <button type="button" onClick={() => setActiveMediaTool('audio')}>🎙️ Audio</button>
                <button type="button" onClick={() => setActiveMediaTool('drawing')}>🎨 Drawing</button>
              </div>

              {activeMediaTool && activeMediaTool !== 'drawing' && (
                <div className="media-tool-active">
                  <button type="button" className="btn-cancel-tool" onClick={() => setActiveMediaTool(null)}>Cancel</button>
                  <MediaCapture type={activeMediaTool} onCapture={handleAddAttachment} />
                </div>
              )}

              {activeMediaTool === 'drawing' && (
                <div className="media-tool-active">
                  <button type="button" className="btn-cancel-tool" onClick={() => {
                    setActiveMediaTool(null);
                    setEditingDrawing(null);
                  }}>Cancel Drawing</button>
                  <DrawingBoard 
                    onSave={(newDrawing) => {
                        if (editingDrawing) {
                            const targetId = editingDrawing.id || editingDrawing.name;
                            setAttachments(prev => prev.map(a => (a.id || a.name) === targetId ? newDrawing : a));
                        } else {
                            setAttachments(prev => [...prev, newDrawing]);
                        }
                        setActiveMediaTool(null);
                        setEditingDrawing(null);
                    }} 
                    initialData={editingDrawing?.data}
                    initialId={editingDrawing?.id}
                    initialName={editingDrawing?.name}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || !!activeMediaTool}>
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>

        {viewingAttachment && (
          <MediaViewer attachment={viewingAttachment} onClose={() => setViewingAttachment(null)} />
        )}
      </div>
    </div>
  );
};

export default NoteModal;
