import React, { useState, useEffect } from 'react';
import MediaCapture from './MediaCapture';
import DrawingBoard from './DrawingBoard';
import AttachmentList from './AttachmentList';

const NoteModal = ({ isOpen, onClose, onSave, note, defaultType }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [type, setType] = useState(defaultType);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setDescription(note.description || '');
      setType(note.type);
      if (note.type === 'text') {
        setContent(note.content || '');
      } else if (note.type === 'checkbox') {
        setItems(note.items || []);
      } else {
        setAttachments(note.attachments || []);
      }
    } else {
      setTitle('');
      setDescription('');
      setType(defaultType);
      setContent('');
      setItems([]);
      setAttachments([]);
    }
    setIsSaving(false);
  }, [note, defaultType, isOpen]);

  const handleAddAttachment = (attachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments.filter(a => (a.id || a.name) !== id));
  };

  const handleAddItem = () => {
    setItems([...items, { text: '', checked: false }]);
  };

  const handleUpdateItem = (index, text) => {
    const newItems = [...items];
    newItems[index].text = text;
    setItems(newItems);
  };

  const handleToggleItem = (index) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const noteData = {
      id: note?.id,
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Note`,
      description,
      type,
      ...(type === 'text' ? { content } : {}),
      ...(type === 'checkbox' ? { items } : {}),
      ...(['audio', 'video', 'photo', 'drawing'].includes(type) ? { attachments } : {})
    };
    
    try {
      await onSave(noteData);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const handleAutoSave = async (newAttachment) => {
    if (isSaving) return;
    setIsSaving(true);
    
    // Create current data snapshot
    const noteData = {
      id: note?.id,
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Note`,
      description,
      type,
      attachments: [...attachments, newAttachment]
    };
    
    try {
      await onSave(noteData);
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditor = () => {
    switch (type) {
      case 'text':
        return (
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea 
              className="editor-textarea"
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSaving}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div className="form-group">
            <label className="form-label">Checklist Items</label>
            <div className="checklist-editor">
              {items.map((item, index) => (
                <div key={index} className="checklist-editor-item">
                  <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(index)} disabled={isSaving} />
                  <input 
                    type="text" 
                    value={item.text}
                    onChange={(e) => handleUpdateItem(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                    disabled={isSaving}
                  />
                  <button type="button" className="text-danger" onClick={() => handleRemoveItem(index)} disabled={isSaving}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={handleAddItem} disabled={isSaving}>+ Add Item</button>
            </div>
          </div>
        );
      case 'drawing':
        return (
          <div className="form-group">
            <label className="form-label">Canvas</label>
            <DrawingBoard onSave={handleAutoSave} />
            <AttachmentList attachments={attachments} onDelete={handleDeleteAttachment} />
          </div>
        );
      case 'audio':
      case 'video':
      case 'photo':
        return (
          <div className="form-group">
            <label className="form-label">{type.charAt(0).toUpperCase() + type.slice(1)} Attachments</label>
            <MediaCapture type={type} onCapture={handleAutoSave} />
            <AttachmentList attachments={attachments} onDelete={handleDeleteAttachment} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h2>
          <button className="btn-secondary" onClick={onClose} disabled={isSaving}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ opacity: isSaving ? 0.6 : 1, pointerEvents: isSaving ? 'none' : 'auto' }}>
            {isSaving && (
              <div className="saving-overlay" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.1)', zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', borderRadius: 'inherit'
              }}>
                <div className="saving-card" style={{ background: 'var(--bg-secondary)', padding: '1rem 2rem', borderRadius: '12px', boxShadow: 'var(--shadow-xl)' }}>
                  ⏳ Saving Note...
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                placeholder="Note title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea 
                placeholder="Add a text description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={isSaving}
              />
            </div>

            {renderEditor()}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Processing...' : (note ? 'Save Changes' : 'Create Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
