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

  const handleSubmit = (e) => {
    e.preventDefault();
    const noteData = {
      id: note?.id,
      title,
      description,
      type,
      ...(type === 'text' ? { content } : {}),
      ...(type === 'checkbox' ? { items } : {}),
      ...(['audio', 'video', 'photo', 'drawing'].includes(type) ? { attachments } : {})
    };
    onSave(noteData);
  };

  if (!isOpen) return null;

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
                  <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(index)} />
                  <input 
                    type="text" 
                    value={item.text}
                    onChange={(e) => handleUpdateItem(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                  />
                  <button type="button" className="text-danger" onClick={() => handleRemoveItem(index)}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={handleAddItem}>+ Add Item</button>
            </div>
          </div>
        );
      case 'drawing':
        return (
          <div className="form-group">
            <label className="form-label">Canvas</label>
            <DrawingBoard onSave={handleAddAttachment} />
            <AttachmentList attachments={attachments} onDelete={handleDeleteAttachment} />
          </div>
        );
      case 'audio':
      case 'video':
      case 'photo':
        return (
          <div className="form-group">
            <label className="form-label">{type.charAt(0).toUpperCase() + type.slice(1)} Attachments</label>
            <MediaCapture type={type} onCapture={handleAddAttachment} />
            <AttachmentList attachments={attachments} onDelete={handleDeleteAttachment} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h2>
          <button className="btn-secondary" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                placeholder="Note title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea 
                placeholder="Add a text description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {renderEditor()}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{note ? 'Save Changes' : 'Create Note'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
