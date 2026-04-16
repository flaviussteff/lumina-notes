import React from 'react';

const Filters = ({ 
  search, onSearchChange, 
  filterType, onFilterChange, 
  sortBy, onSortByChange, 
  sortOrder, onSortOrderChange 
}) => {
  return (
    <div className="filters-bar">
      <input 
        type="text" 
        className="search-input" 
        placeholder="Search notes by title or content..." 
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      
      <div className="filter-group">
        <select value={filterType} onChange={(e) => onFilterChange(e.target.value)}>
          <option value="all">All Types</option>
          <option value="text">Text Notes</option>
          <option value="checkbox">Checklist</option>
        </select>
      </div>

      <div className="filter-group">
        <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
          <option value="modifiedAt">Last Modified</option>
          <option value="createdAt">Date Created</option>
        </select>
      </div>

      <div className="filter-group">
        <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
