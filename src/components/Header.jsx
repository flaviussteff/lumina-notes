import React from 'react';

const Header = ({ onCreateNote }) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1 className="logo">Lumina Notes</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => onCreateNote('text')}>
            + Text Note
          </button>
          <button className="btn btn-secondary" onClick={() => onCreateNote('checkbox')}>
            + Checklist
          </button>
          <button className="btn btn-secondary" onClick={() => onCreateNote('photo')}>
            + Photo
          </button>
          <button className="btn btn-secondary" onClick={() => onCreateNote('audio')}>
            + Audio
          </button>
          <button className="btn btn-secondary" onClick={() => onCreateNote('video')}>
            + Video
          </button>
          <button className="btn btn-secondary" onClick={() => onCreateNote('drawing')}>
            + Drawing
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
