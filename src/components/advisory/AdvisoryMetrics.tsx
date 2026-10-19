'use client';

import React from 'react';
import { MetricSummary } from './types';

interface AdvisoryMetricsProps {
  metrics: MetricSummary;
}

export const AdvisoryMetrics: React.FC<AdvisoryMetricsProps> = ({ metrics }) => {
  return (
    <section className="metrics-row" aria-label="Advisory Summary Metrics">
      {/* 1. Critical Actions */}
      <div className="metric-card">
        <div className="metric-left">
          <div className="metric-icon-box critical" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span className="metric-label">Critical Actions</span>
        </div>
        <span className="metric-number">{metrics.criticalActions}</span>
      </div>

      {/* 2. Opportunities */}
      <div className="metric-card">
        <div className="metric-left">
          <div className="metric-icon-box opportunity" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
            </svg>
          </div>
          <span className="metric-label">Opportunities</span>
        </div>
        <span className="metric-number">{metrics.opportunities}</span>
      </div>

      {/* 3. Completed */}
      <div className="metric-card">
        <div className="metric-left">
          <div className="metric-icon-box completed" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="metric-label">Completed</span>
        </div>
        <span className="metric-number">{metrics.completed}</span>
      </div>

      {/* 4. Potential Impact */}
      <div className="metric-card">
        <div className="metric-left">
          <div className="metric-icon-box impact" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="4" x2="18" y2="4" />
              <line x1="6" y1="9" x2="18" y2="9" />
              <path d="M6 14h6a4 4 0 0 0 0-8H6" />
              <line x1="11" y1="14" x2="18" y2="21" />
            </svg>
          </div>
          <span className="metric-label">Potential Impact</span>
        </div>
        <span className="metric-number">{metrics.potentialImpact}</span>
      </div>
    </section>
  );
};
