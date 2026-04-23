const DB_KEY = 'notes_app_db';

export const StorageService = {
  // Mock network latency for realism
  _delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Internal: Retrieve everything directly from localStorage string
  _getAll() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Internal: Save exact array back to localStorage string
  _saveAll(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  /**
   * Primary query method that prevents memory overload in React
   * Retrieves data directly from local storage, filters/sorts, and returns slice.
   */
  async getNotes({
    search = '',
    filterType = 'all',
    sortBy = 'modifiedAt', // 'createdAt' or 'modifiedAt'
    sortOrder = 'desc', // 'asc' or 'desc'
    page = 1,
    limit = 6
  } = {}) {
    await this._delay();
    
    // We only load the full list inside the service (not standard React state)
    let allNotes = this._getAll();

    // 1. Filtering
    allNotes = allNotes.filter(note => {
      // Type Filter
      if (filterType !== 'all' && note.type !== filterType) {
        return false;
      }
      
      // Search Filter
      if (search) {
        const q = search.toLowerCase();
        const inTitle = note.title && note.title.toLowerCase().includes(q);
        const inDescription = note.description && note.description.toLowerCase().includes(q);
        let inContent = false;
        
        if (note.type === 'text') {
          inContent = note.content && note.content.toLowerCase().includes(q);
        } else if (note.type === 'checkbox') {
          inContent = note.items && note.items.some(item => item.text.toLowerCase().includes(q));
        } else if (['audio', 'video', 'photo', 'drawing'].includes(note.type)) {
          // Check attachment names if they exist
          inContent = note.attachments && note.attachments.some(att => att.name && att.name.toLowerCase().includes(q));
        }
        
        if (!inTitle && !inDescription && !inContent) return false;
      }
      return true;
    });

    // 2. Sorting
    allNotes.sort((a, b) => {
      const dateA = new Date(a[sortBy]).getTime();
      const dateB = new Date(b[sortBy]).getTime();
      
      if (dateA < dateB) return sortOrder === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 3. Paginate / limit
    const totalCount = allNotes.length;
    const startIndex = (page - 1) * limit;
    const paginatedNotes = allNotes.slice(startIndex, startIndex + limit);

    return {
      notes: paginatedNotes,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  },

  async getNoteById(id) {
    await this._delay();
    const allNotes = this._getAll();
    return allNotes.find(n => n.id === id) || null;
  },

  async saveNote(noteData) {
    await this._delay();
    const allNotes = this._getAll();
    const now = new Date().toISOString();

    if (noteData.id) {
      // Update existing note
      const index = allNotes.findIndex(n => n.id === noteData.id);
      if (index !== -1) {
        allNotes[index] = { ...allNotes[index], ...noteData, modifiedAt: now };
      }
    } else {
      // Create new note
      const newNote = {
        ...noteData,
        id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        modifiedAt: now
      };
      allNotes.unshift(newNote); // Put newest on top by default
    }

    this._saveAll(allNotes);
    return true;
  },

  async deleteNote(id) {
    await this._delay();
    let allNotes = this._getAll();
    allNotes = allNotes.filter(n => n.id !== id);
    this._saveAll(allNotes);
    return true;
  },

  /**
   * Task 3: Export specific notes by ID
   */
  async exportNotes(ids) {
    await this._delay();
    const allNotes = this._getAll();
    const toExport = allNotes.filter(n => ids.includes(n.id));
    return toExport;
  },

  /**
   * Task 7: Merge multiple notes into one
   */
  async mergeNotes(ids, newTitle) {
    await this._delay();
    const allNotes = this._getAll();
    const toMerge = allNotes.filter(n => ids.includes(n.id));
    
    if (toMerge.length < 2) return false;

    // Simple concatenation on new lines
    const descriptions = toMerge.map(n => n.description).filter(Boolean).join('\n');
    
    // Simple concatenation on new lines
    const contents = toMerge.map(n => n.content).filter(Boolean).join('\n\n');
    
    // Combine items and attachments
    const allItems = toMerge.flatMap(n => n.items || []);
    const allAttachments = toMerge.flatMap(n => n.attachments || []);

    const mergedNote = {
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `note-merged-${Date.now()}`,
      title: newTitle,
      description: descriptions,
      content: contents,
      items: allItems,
      attachments: allAttachments,
      type: 'mixed',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    const remainingNotes = allNotes.filter(n => !ids.includes(n.id));
    remainingNotes.unshift(mergedNote);
    this._saveAll(remainingNotes);
    return mergedNote;
  },

  async importNotes(importedNotes) {
    await this._delay();
    const localNotes = this._getAll();
    const summary = { imported: 0, updated: 0, skipped: 0 };

    importedNotes.forEach(impNote => {
      const existingById = localNotes.find(n => n.id === impNote.id);
      const existingByTitle = localNotes.find(n => n.title === impNote.title && n.type === impNote.type);
      const match = existingById || existingByTitle;

      if (match) {
        const hasChanges = 
          match.title !== impNote.title ||
          match.description !== impNote.description ||
          match.content !== impNote.content ||
          JSON.stringify(match.items) !== JSON.stringify(impNote.items) ||
          JSON.stringify(match.attachments) !== JSON.stringify(impNote.attachments);
        
        const isNewer = new Date(impNote.modifiedAt || 0).getTime() > new Date(match.modifiedAt || 0).getTime();

        if (hasChanges || isNewer) {
          const targetId = match.id;
          Object.assign(match, impNote);
          if (!existingById) match.id = targetId;
          summary.updated++;
        } else {
          summary.skipped++;
        }
      } else {
        localNotes.unshift({ ...impNote });
        summary.imported++;
      }
    });

    this._saveAll(localNotes);
    return summary;
  }
};
