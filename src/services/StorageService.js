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
        id: crypto.randomUUID(),
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
  }
};
