import React from 'react';

const AttachmentList = ({ attachments, onDelete }) => {
  const downloadFile = (attachment) => {
    // Helper to convert base64 to blob for stable viewing/downloading
    const base64ToBlob = (base64, mime) => {
      const parts = base64.split(',');
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mime || 'application/octet-stream' });
    };

    try {
      const blob = base64ToBlob(attachment.data, attachment.type);
      const url = URL.createObjectURL(blob);
      
      // Attempt to open in a new tab for direct viewing
      const win = window.open(url, '_blank');
      
      if (!win) {
        // Fallback: standard download if popup is blocked
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Cleanup the URL after 1 minute
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error("Viewing failed", err);
      // Fallback: simple data URL download
      const link = document.createElement('a');
      link.href = attachment.data;
      link.download = attachment.name;
      link.click();
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
