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
      
      // If page > 1, we might want to append if we were doing infinite scroll,
      // but the requirement "only load specific array needed" suggests pagination.
      // We'll replace the state with the current page's notes.
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
    setEditingNote(note);
    setIsModalOpen(false); // Close first just in case
    setTimeout(() => {
      setEditingNote(note);
      setIsModalOpen(true);
    }, 0);
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await StorageService.deleteNote(id);
      fetchNotes();
    }
  };

  const handleSaveNote = async (noteData) => {
    await StorageService.saveNote(noteData);
    setIsModalOpen(false);
    fetchNotes();
  };

  return (
    <div className="app-container">
      <Header onCreateNote={handleCreateNote} />
      
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
