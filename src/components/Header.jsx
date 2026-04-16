import React from 'react';

const Header = ({ 
  onCreateNote, 
  isSelectionMode, 
  setIsSelectionMode, 
  onExportSelected, 
  onImportFile,
  onSelectAll,
  selectedCount
}) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1 className="logo">Lumina Notes</h1>
        <div className="header-actions">
          {!isSelectionMode ? (
            <>
              <button className="btn btn-secondary" onClick={() => setIsSelectionMode(true)}>
                📦 Export
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                📥 Import
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={onImportFile} />
              </label>
              <div className="divider"></div>
              <button className="btn btn-primary" onClick={() => onCreateNote('text')}>
                + Text
              </button>
              <button className="btn btn-secondary" onClick={() => onCreateNote('checkbox')}>
                + List
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
            </>
          ) : (
            <>
              <span className="selection-count">{selectedCount} Selected</span>
              <button className="btn btn-secondary" onClick={onSelectAll}>
                Check All
              </button>
              <button className="btn btn-primary" onClick={onExportSelected}>
                Confirm Export
              </button>
              <button className="btn btn-danger" onClick={() => setIsSelectionMode(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
