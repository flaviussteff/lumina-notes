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

  const renderPreview = () => {
    if (note.type === 'text') {
      return <p>{note.content || 'No content...'}</p>;
    }
    
    if (note.type === 'checkbox') {
      return (
        <div className="note-checkbox-list">
          {(note.items || []).slice(0, 3).map((item, index) => (
            <div key={index} className={`note-checkbox-item ${item.checked ? 'checked' : ''}`}>
              <span>{item.checked ? '☑' : '☐'}</span>
              <span>{item.text}</span>
            </div>
          ))}
          {note.items && note.items.length > 3 && (
            <div className="note-checkbox-item" style={{ fontSize: '0.8rem', opacity: 0.5 }}>
              +{note.items.length - 3} more items
            </div>
          )}
        </div>
      );
    }

    // Media and Drawing Previews
    if (['audio', 'video', 'photo', 'drawing'].includes(note.type) && note.attachments?.length > 0) {
      const firstAtt = note.attachments[0];
      return (
        <div className="note-media-preview">
          {note.type === 'audio' ? (
            <div className="attachment-preview" style={{width: '100%', height: '60px', borderRadius: '8px'}}>🎵 Audio Recording</div>
          ) : (
            <img src={firstAtt.data} alt="Preview" className="attachment-preview" style={{width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px'}} />
          )}
          {note.description && (
            <p style={{fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
              {note.description}
            </p>
          )}
          {note.attachments.length > 1 && (
            <span style={{fontSize: '0.75rem', opacity: 0.5}}>+{note.attachments.length - 1} more files</span>
          )}
        </div>
      );
    }

    return note.description ? <p>{note.description}</p> : <p className="text-muted">No content...</p>;
  };

  return (
    <div className="note-card" onClick={() => onEdit(note)}>
      <div className="note-header">
        <h3 className="note-title">{note.title || 'Untitled'}</h3>
        <span className="note-type-badge">{note.type}</span>
      </div>

      <div className="note-content-preview">
        {renderPreview()}
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
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
