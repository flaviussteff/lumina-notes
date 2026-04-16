import React from 'react';

const AttachmentList = ({ attachments, onDelete }) => {
  const downloadFile = (attachment) => {
    // Attempt to open in a new tab for direct viewing
    const win = window.open();
    if (win) {
      win.document.write(`
        <html>
          <head><title>${attachment.name}</title></head>
          <body style="margin:0; background: #0f1115; display:flex; align-items:center; justify-content:center;">
            ${attachment.type.startsWith('image/') ? `<img src="${attachment.data}" style="max-width:100%; max-height:100%; object-fit:contain;" />` : 
              attachment.type.startsWith('video/') ? `<video src="${attachment.data}" controls style="max-width:100%; max-height:100%;" />` :
              `<embed src="${attachment.data}" width="100%" height="100%" />`}
          </body>
        </html>
      `);
      win.document.close();
    } else {
      // Fallback: standard download
      const link = document.createElement('a');
      link.href = attachment.data;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getPreview = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      return <img src={attachment.data} alt={attachment.name} className="attachment-preview" />;
    }
    if (attachment.type.startsWith('video/')) {
      return <video src={attachment.data} className="attachment-preview" />;
    }
    if (attachment.type.startsWith('audio/')) {
      return <div className="attachment-preview">🎵</div>;
    }
    return <div className="attachment-preview">📄</div>;
  };

  return (
    <div className="attachment-list">
      {attachments.map((att) => (
        <div key={att.id || att.name} className="attachment-item" onClick={() => downloadFile(att)} style={{cursor: 'pointer'}}>
          {getPreview(att)}
          <span className="attachment-name" title={att.name}>{att.name}</span>
          <div className="attachment-actions">
            <button 
              type="button"
              className="text-danger" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(att.id || att.name);
              }}
              style={{fontSize: '0.7rem'}}
            >
              Delete
            </button>
            <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Download</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
