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

  const renderAttachments = () => {
    if (!note.attachments || note.attachments.length === 0) return null;

    return (
      <div className="note-attachments-preview">
        <div className="attachment-grid-compact">
          {note.attachments.map((att, i) => {
            const isImage = att.type === 'drawing' || att.type === 'photo' || att.type.startsWith('image/');
            const isVideo = att.type === 'video' || att.type.startsWith('video/');
            const isAudio = att.type === 'audio' || att.type.startsWith('audio/');
            
            return (
              <div key={att.id || i} className="attachment-item-mini">
                {isImage ? (
                  <img src={att.data} alt="preview" />
                ) : isVideo ? (
                  att.thumbnail ? <img src={att.thumbnail} alt="video thumb" /> : <div className="media-placeholder">🎥</div>
                ) : (
                  <div className="media-placeholder">🎵</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
        <span className="note-type-badge">{note.type === 'mixed' ? 'Mixed' : note.type}</span>
      </div>

      <div className="note-content-preview">
        {note.description && <p className="description-text-preview">{note.description}</p>}
        {note.content && <p className="content-text-preview">{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>}
        
        {note.items && note.items.length > 0 && (
          <div className="note-checkbox-list">
            {note.items.slice(0, 3).map((item, index) => (
              <div key={index} className={`note-checkbox-item ${item.checked ? 'checked' : ''}`}>
                <span>{item.checked ? '☑' : '☐'}</span>
                <span>{item.text}</span>
              </div>
            ))}
            {note.items.length > 3 && (
              <div className="more-items">+{note.items.length - 3} more</div>
            )}
          </div>
        )}

        {renderAttachments()}
      </div>

      <div className="note-footer">
        <div className="note-metadata">
          <p>Modified: {formatDate(note.modifiedAt)}</p>
        </div>
        {!isSelectionMode && (
          <div className="note-actions">
            <button 
              className="btn-danger btn-sm" 
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
