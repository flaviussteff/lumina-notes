import React from 'react';
import NoteCard from './NoteCard';

const NoteGrid = ({ notes, loading, onEdit, onDelete, isSelectionMode, selectedIds, onToggleSelect }) => {
  if (loading && notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="spinner"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <h2>No notes found</h2>
        <p>Try adjusting your search or create a new note to get started.</p>
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map(note => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onEdit={onEdit} 
          onDelete={onDelete}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.includes(note.id)}
          onToggleSelect={() => onToggleSelect(note.id)}
        />
      ))}
    </div>
  );
};

export default NoteGrid;
