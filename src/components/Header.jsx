import React from 'react';

const Header = ({ 
  onCreateNote, 
  isSelectionMode, 
  setIsSelectionMode, 
  onExportSelected, 
  onSelectAll,
  onMergeSelected,
  onImport,
  selectedCount
}) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset
    }
  };

  return (
    <header className="header">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json"
        onChange={handleFileChange}
      />
      <div className="header-top">
        <h1 className="logo">Lumina Notes</h1>
        <div className="header-actions">
          {!isSelectionMode ? (
            <>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                📥 Import
              </button>
              <button className="btn btn-secondary" onClick={() => setIsSelectionMode(true)}>
                📦 Select
              </button>
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
              <button className="btn btn-success" onClick={onMergeSelected} disabled={selectedCount < 2}>
                🔗 Merge
              </button>
              <button className="btn btn-primary" onClick={onExportSelected} disabled={selectedCount === 0}>
                📦 Export
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
