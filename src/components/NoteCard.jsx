import React from 'react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-card" onClick={() => onEdit(note)}>
      <div className="note-header">
        <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
        <span className="note-type-badge">{note.type === 'text' ? 'Text' : 'Checklist'}</span>
      </div>

      <div className="note-content-preview">
        {note.type === 'text' ? (
          <p>{note.content || 'No content...'}</p>
        ) : (
          <div className="note-checkbox-list">
            {(note.items || []).slice(0, 4).map((item, index) => (
              <div key={index} className={`note-checkbox-item ${item.checked ? 'checked' : ''}`}>
                <span>{item.checked ? '☑' : '☐'}</span>
                <span>{item.text}</span>
              </div>
            ))}
            {note.items && note.items.length > 4 && (
              <div className="note-checkbox-item" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                +{note.items.length - 4} more items
              </div>
            )}
          </div>
        )}
      </div>

      <div className="note-footer">
        <div className="note-metadata">
          <p>Created: {formatDate(note.createdAt)}</p>
          <p>Modified: {formatDate(note.modifiedAt)}</p>
        </div>
        <div className="note-actions">
          <button 
            className="btn-danger" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            title="Delete Note"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
