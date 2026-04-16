import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/StorageService';
import Header from './components/Header';
import Filters from './components/Filters';
import NoteGrid from './components/NoteGrid';
import NoteModal from './components/NoteModal';

function App() {
  const [notes, setNotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('modifiedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNoteType, setNewNoteType] = useState('text');

  // Selection State (Task 3)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await StorageService.getNotes({
        search,
        filterType,
        sortBy,
        sortOrder,
        page,
        limit
      });
      
      setNotes(result.notes);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterType, sortBy, sortOrder]);

  const handleCreateNote = (type) => {
    setNewNoteType(type);
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    if (isSelectionMode) {
      toggleSelectNote(note.id);
      return;
    }
    setEditingNote(note);
    setIsModalOpen(false); // Close first just in case
    setTimeout(() => {
      setEditingNote(note);
      setIsModalOpen(true);
    }, 0);
  };

  const handleDeleteNote = async (id) => {
    if (isSelectionMode) return;
    if (window.confirm('Are you sure you want to delete this note?')) {
      await StorageService.deleteNote(id);
      fetchNotes();
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      await StorageService.saveNote(noteData);
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        alert('Storage is full! Your video recording might be too large for the browser (5MB limit). Try deleting some old notes or recording a shorter video.');
      } else {
        alert('An unexpected error occurred while saving. Please try again.');
      }
    }
  };

  // Task 3: Selection Handlers
  const toggleSelectNote = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notes.map(n => n.id));
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one note to export.');
      return;
    }
    
    const data = await StorageService.exportNotes(selectedIds);
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina_notes_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          alert('Invalid export file format.');
          return;
        }
        
        const summary = await StorageService.importNotes(importedData);
        alert(`Import Complete!\n- New: ${summary.imported}\n- Updated: ${summary.updated}\n- Skipped: ${summary.skipped}`);
        fetchNotes();
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to parse the import file. Make sure it is a valid Lumina Notes export.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="app-container">
      <Header 
        onCreateNote={handleCreateNote} 
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        onExportSelected={handleExportSelected}
        onImportFile={handleImportFile}
        onSelectAll={handleSelectAll}
        selectedCount={selectedIds.length}
      />
      
      <Filters 
        search={search} onSearchChange={setSearch}
        filterType={filterType} onFilterChange={setFilterType}
        sortBy={sortBy} onSortByChange={setSortBy}
        sortOrder={sortOrder} onSortOrderChange={setSortOrder}
      />

      <NoteGrid 
        notes={notes} 
        loading={loading} 
        onEdit={handleEditNote} 
        onDelete={handleDeleteNote}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectNote}
      />

      {totalCount > notes.length && (
        <div className="load-more-container">
          <p className="text-muted">Showing {notes.length} of {totalCount} notes</p>
          {/* Pagination could go here if needed, but per-page limit is active */}
          {page * limit < totalCount && (
            <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>
              Next Page
            </button>
          )}
          {page > 1 && (
            <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} style={{marginLeft: '10px'}}>
              Previous Page
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <NoteModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNote}
          note={editingNote}
          defaultType={newNoteType}
        />
      )}
    </div>
  );
}

export default App;
