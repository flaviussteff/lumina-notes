import React from 'react';

const AttachmentList = ({ attachments, onDelete, onEditDrawing, onView }) => {
  const getPreview = (attachment) => {
    if (attachment.type.startsWith('image/') || attachment.type === 'drawing') {
      return <img src={attachment.data} alt={attachment.name} className="attachment-preview" />;
    }
    if (attachment.type.startsWith('video/')) {
      return attachment.thumbnail ? <img src={attachment.thumbnail} alt="video thumb" className="attachment-preview" /> : <div className="attachment-preview">🎥</div>;
    }
    if (attachment.type.startsWith('audio/')) {
      return <div className="attachment-preview">🎵</div>;
    }
    return <div className="attachment-preview">📄</div>;
  };

  return (
    <div className="attachment-list">
      {attachments.map((att) => {
        const isDrawing = att.type === 'drawing' || (att.name && att.name.includes('drawing'));
        
        return (
          <div key={att.id || att.name} className="attachment-item" onClick={() => onView(att)} style={{cursor: 'pointer'}}>
            {getPreview(att)}
            <span className="attachment-name" title={att.name}>{att.name}</span>
            <div className="attachment-actions">
              {isDrawing && (
                <button 
                  type="button"
                  className="btn-edit-drawing"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDrawing(att);
                  }}
                >
                  Edit
                </button>
              )}
              <button 
                type="button"
                className="text-danger" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(att.id || att.name);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentList;
