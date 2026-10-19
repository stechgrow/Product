'use client';

import React from 'react';
import { AdvisoryFilterOptions } from './types';

interface AdvisoryFiltersProps {
  filters: AdvisoryFilterOptions;
  onFilterChange: (updated: Partial<AdvisoryFilterOptions>) => void;
  categories: string[];
}

export const AdvisoryFilters: React.FC<AdvisoryFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  return (
    <div className="section-header-row">
      {/* Left: Title & Immediate Action Required pill */}
      <div className="section-header-left">
        <h2 className="section-title">Critical Advisory</h2>
        <div className="pill-alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Immediate Action Required</span>
        </div>
      </div>

      {/* Right: Filters & Search */}
      <div className="section-header-right">
        {/* Real-time search inside advisory */}
        <div className="filter-search-box">
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search advisory..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            aria-label="Filter recommendations"
          />
        </div>

        {/* Priority Filter */}
        <select
          className="dropdown-filter-btn"
          value={filters.priority}
          onChange={(e) => onFilterChange({ priority: e.target.value })}
          aria-label="Filter by Priority"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category Filter */}
        <select
          className="dropdown-filter-btn"
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          aria-label="Filter by Category"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
