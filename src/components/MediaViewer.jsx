import React from 'react';

const MediaViewer = ({ attachment, onClose }) => {
  if (!attachment) return null;

  const renderContent = () => {
    const { type, data, name } = attachment;
    
    if (type === 'drawing' || type.startsWith('image/') || type === 'photo') {
      return <img src={data} alt="Full view" className="media-viewer-img" />;
    }
    
    if (type.startsWith('video/') || type === 'video') {
      return (
        <video controls autoPlay className="media-viewer-video">
          <source src={data} type={type.includes('/') ? type : 'video/webm'} />
          Your browser does not support the video tag.
        </video>
      );
    }
    
    if (type.startsWith('audio/') || type === 'audio') {
      return (
        <div className="audio-viewer-container">
          <div className="audio-icon">🎵</div>
          <audio controls autoPlay>
            <source src={data} type={type.includes('/') ? type : 'audio/webm'} />
            Your browser does not support the audio element.
          </audio>
          <p className="attachment-name">{name || 'Audio Recording'}</p>
        </div>
      );
    }
    
    return <p>Unsupported media type: {type}</p>;
  };

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer-content" onClick={e => e.stopPropagation()}>
        <button className="media-viewer-close" onClick={onClose}>&times;</button>
        <div className="media-viewer-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
