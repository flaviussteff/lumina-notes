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
  const [newNoteType, setNewNoteType] = useState('mixed');

  // Selection State
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
    setIsModalOpen(true);
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
        alert('Storage full! Please delete some notes or large attachments (drawings/photos) to save more.');
      } else {
        alert('Failed to save note. Please check your data.');
      }
    }
  };

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

  const handleMergeSelected = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 notes to merge.');
      return;
    }

    const newTitle = window.prompt('Enter a title for the combined note:', 'Merged Note');
    if (newTitle === null) return; // Cancelled

    try {
      await StorageService.mergeNotes(selectedIds, newTitle || 'Merged Note');
      setIsSelectionMode(false);
      setSelectedIds([]);
      fetchNotes();
      alert('Notes merged successfully!');
    } catch (err) {
      console.error('Merge failed:', err);
      alert('Failed to merge notes.');
    }
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;
    const data = await StorageService.exportNotes(selectedIds);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setIsSelectionMode(false);
    setSelectedIds([]);
  };


  const handleImport = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) {
          alert('Invalid export file format.');
          return;
        }
        const summary = await StorageService.importNotes(importedData);
        alert(`Import Complete!\nNew: ${summary.imported}\nUpdated: ${summary.updated}\nSkipped: ${summary.skipped}`);
        fetchNotes();
      } catch (err) {
        console.error('Import failed:', err);
        alert('Failed to import notes. Check if the file is a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <Header 
        onCreateNote={handleCreateNote} 
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        onExportSelected={handleExportSelected}
        onSelectAll={handleSelectAll}
        onMergeSelected={handleMergeSelected}
        onImport={handleImport}
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
          <div className="pagination-controls">
            {page > 1 && <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)}>Prev</button>}
            <span className="page-info">Page {page}</span>
            {page * limit < totalCount && <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>Next</button>}
          </div>
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
