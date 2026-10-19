'use client';

import React, { useState, useMemo } from 'react';
import { Recommendation, MetricSummary, AdvisoryFilterOptions } from './types';
import { INITIAL_METRICS, INITIAL_RECOMMENDATIONS } from './mockData';
import { AdvisoryMetrics } from './AdvisoryMetrics';
import { AdvisoryFilters } from './AdvisoryFilters';
import { RecommendationCard } from './RecommendationCard';
import { InformationPanel } from './InformationPanel';
import { ExecutiveReportModal } from './ExecutiveReportModal';
import { Toast } from '../ui/Toast';

export interface AdvisorySectionProps {
  initialRecommendations?: Recommendation[];
  initialMetrics?: MetricSummary;
  className?: string;
}

export const AdvisorySection: React.FC<AdvisorySectionProps> = ({
  initialRecommendations = INITIAL_RECOMMENDATIONS,
  initialMetrics = INITIAL_METRICS,
  className = '',
}) => {
  // State
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [metrics, setMetrics] = useState<MetricSummary>(initialMetrics);
  const [selectedRecForPanel, setSelectedRecForPanel] = useState<Recommendation | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<AdvisoryFilterOptions>({
    category: 'all',
    priority: 'all',
    status: 'all',
    searchQuery: '',
  });

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3200);
  };

  // Toggle checklist items in a recommendation card
  const handleToggleAction = (recId: string, actionId: string) => {
    setRecommendations((prevRecs) =>
      prevRecs.map((rec) => {
        if (rec.id !== recId) return rec;

        const updatedActions = rec.actions.map((act) => {
          if (act.id !== actionId) return act;
          const newCompleted = !act.completed;
          if (newCompleted) {
            triggerToast('Action completed! Telemetry updated.');
            setMetrics((m) => ({ ...m, completed: m.completed + 1 }));
          } else {
            setMetrics((m) => ({ ...m, completed: Math.max(0, m.completed - 1) }));
          }
          return { ...act, completed: newCompleted };
        });

        // Also update selected recommendation if panel is open
        const updatedRec = { ...rec, actions: updatedActions };
        if (selectedRecForPanel?.id === recId) {
          setSelectedRecForPanel(updatedRec);
        }

        return updatedRec;
      })
    );
  };

  // Status Change from Information Panel
  const handleStatusChange = (recId: string, newStatus: Recommendation['status']) => {
    setRecommendations((prevRecs) =>
      prevRecs.map((rec) => {
        if (rec.id !== recId) return rec;
        return { ...rec, status: newStatus };
      })
    );
    triggerToast(`Advisory updated to "${newStatus}"`);
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Advisory telemetry synced successfully.', 'info');
    }, 600);
  };

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    recommendations.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [recommendations]);

  // Filtered recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      // Category filter
      if (filters.category !== 'all' && rec.category !== filters.category) {
        return false;
      }
      // Priority filter
      if (filters.priority !== 'all' && rec.priority !== filters.priority) {
        return false;
      }
      // Status filter
      if (filters.status !== 'all' && rec.status !== filters.status) {
        return false;
      }
      // Keyword search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(q);
        const matchesDesc = rec.description.toLowerCase().includes(q);
        const matchesActions = rec.actions.some((a) => a.label.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesActions) {
          return false;
        }
      }
      return true;
    });
  }, [recommendations, filters]);

  return (
    <div className={`page-container ${className}`}>
      {/* Header Row: Page Title + Actions */}
      <div className="page-title-row">
        <div className="page-title-wrap">
          <h1 className="page-title">Advisory</h1>
          <span className="page-subtitle-badge">Real-time Intelligence</span>
        </div>

        <div className="page-actions-group">
          {/* Filter icon button */}
          <button
            type="button"
            className="btn-ctrl-icon"
            onClick={() => {
              setFilters((f) => ({
                ...f,
                category: f.category === 'all' ? 'Revenue' : 'all',
              }));
              triggerToast('Toggled quick filter view', 'info');
            }}
            title="Filter Settings"
            aria-label="Filter Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="8" y2="18" />
            </svg>
          </button>

          {/* Refresh icon button */}
          <button
            type="button"
            className="btn-ctrl-icon"
            onClick={handleRefresh}
            title="Refresh Data"
            aria-label="Refresh Data"
            style={{
              transform: isRefreshing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.6s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>

          {/* Info icon button */}
          <button
            type="button"
            className="btn-ctrl-icon"
            onClick={() => triggerToast('Advisory engine evaluates anomalies & revenue leakage every 15 mins.', 'info')}
            title="Advisory Overview Info"
            aria-label="Advisory Info"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>

          {/* Primary CTA: Get your Report */}
          <button
            type="button"
            className="btn-get-report"
            onClick={() => setIsReportModalOpen(true)}
            id="getReportBtn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Get your Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <AdvisoryMetrics metrics={metrics} />

      {/* Subheader: Critical Advisory + Immediate Action Required Pill + Filters */}
      <AdvisoryFilters
        filters={filters}
        onFilterChange={(updated) => setFilters((f) => ({ ...f, ...updated }))}
        categories={categories}
      />

      {/* Advisory Recommendations Grid */}
      <section className="advisory-grid" aria-label="Advisory Recommendations Grid">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onToggleAction={handleToggleAction}
              onOpenDetails={(r) => setSelectedRecForPanel(r)}
            />
          ))
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>
              No advisory items match your current filter settings.
            </p>
            <button
              type="button"
              className="btn-upload"
              style={{ marginTop: '14px' }}
              onClick={() => setFilters({ category: 'all', priority: 'all', status: 'all', searchQuery: '' })}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Information Panel (Deliverable 2: slide-over details & deep telemetry) */}
      <InformationPanel
        recommendation={selectedRecForPanel}
        isOpen={Boolean(selectedRecForPanel)}
        onClose={() => setSelectedRecForPanel(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={metrics}
        onConfirmDownload={() => {
          setIsReportModalOpen(false);
          triggerToast('Downloading Executive Advisory Report PDF...');
        }}
      />

      {/* Interactive Toast Notification */}
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  );
};
