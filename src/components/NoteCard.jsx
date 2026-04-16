import React from 'react';

const NoteCard = ({ note, onEdit, onDelete, isSelectionMode, isSelected, onToggleSelect }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelect();
    } else {
      onEdit(note);
    }
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
    const hasAttachments = ['audio', 'video', 'photo', 'drawing'].includes(note.type) && note.attachments?.length > 0;
    
    if (hasAttachments) {
      const typeCount = note.attachments.length;
      const typeLabel = note.type === 'drawing' ? 'Drawing' : note.type.charAt(0).toUpperCase() + note.type.slice(1);
      
      return (
        <div className="note-media-preview">
          <div className="note-attachment-grid">
            {note.attachments.slice(0, 2).map((att, i) => (
              <div key={i} className="mini-preview">
                {note.type === 'audio' ? '🎵' : 
                 note.type === 'video' ? '🎥' : 
                 note.type === 'drawing' ? <img src={att.data} alt="thumb" /> :
                 <img src={att.data} alt="thumb" />}
              </div>
            ))}
            {typeCount > 2 && <div className="mini-preview-more">+{typeCount - 2}</div>}
          </div>
          
          <div className="note-description-summary">
            <span className="attachment-count-tag">{typeCount} {typeLabel}{typeCount > 1 ? 's' : ''}</span>
            {note.description && <p className="description-text">{note.description}</p>}
          </div>
        </div>
      );
    }

    return note.description ? <p>{note.description}</p> : <p className="text-muted">No content...</p>;
  };

  return (
    <div className={`note-card ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      {isSelectionMode && (
        <div className="selection-indicator">
          {isSelected ? '✅' : '⚪'}
        </div>
      )}
      
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
        {!isSelectionMode && (
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
        )}
      </div>
    </div>
  );
};

export default NoteCard;
