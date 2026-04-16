import React, { useState, useEffect } from 'react';

const NoteModal = ({ isOpen, onClose, onSave, note, defaultType }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState([]);
  const [type, setType] = useState(defaultType);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setType(note.type);
      if (note.type === 'text') {
        setContent(note.content || '');
      } else {
        setItems(note.items || []);
      }
    } else {
      setTitle('');
      setType(defaultType);
      setContent('');
      setItems([]);
    }
  }, [note, defaultType, isOpen]);

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
      type,
      ...(type === 'text' ? { content } : { items })
    };
    onSave(noteData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : `Create New ${type === 'text' ? 'Text Note' : 'Checklist'}`}</h2>
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

            {type === 'text' ? (
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea 
                  className="editor-textarea"
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Checklist Items</label>
                <div className="checklist-editor">
                  {items.map((item, index) => (
                    <div key={index} className="checklist-editor-item">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => handleToggleItem(index)}
                      />
                      <input 
                        type="text" 
                        value={item.text}
                        placeholder="Item text..."
                        onChange={(e) => handleUpdateItem(index, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddItem();
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="text-danger" 
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAddItem}
                    style={{ marginTop: '0.5rem' }}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
