'use client';

import React, { useEffect } from 'react';
import { Recommendation } from './types';

interface InformationPanelProps {
  recommendation: Recommendation | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (recId: string, newStatus: Recommendation['status']) => void;
}

export const InformationPanel: React.FC<InformationPanelProps> = ({
  recommendation,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !recommendation) return null;

  const analysis = recommendation.detailedAnalysis;

  return (
    <div
      className={`info-panel-backdrop ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      <div className="info-panel-drawer">
        {/* Header */}
        <div className="info-panel-header">
          <div className="info-panel-title-wrap">
            <div className="advisory-priority-indicator">
              <span className={`priority-dot ${recommendation.priority.toLowerCase()}`} />
              <span className="priority-text">{recommendation.priority} Priority Advisory</span>
            </div>
            <h2 id="panel-title" className="info-panel-title">
              {recommendation.title}
            </h2>
            <div className="advisory-badges-group">
              <span className="badge badge-high-impact">{recommendation.impactLevel}</span>
              <span className="badge badge-revenue">{recommendation.category}</span>
              <span className="badge badge-status">{recommendation.status}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-close-panel"
            onClick={onClose}
            aria-label="Close Information Panel"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="info-panel-body">
          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="metric-card" style={{ padding: '16px' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-dim)', display: 'block' }}>Risk Index</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: analysis && analysis.riskScore > 70 ? 'var(--c-red)' : 'var(--c-yellow)' }}>
                  {analysis?.riskScore || 75}/100
                </span>
              </div>
            </div>

            <div className="metric-card" style={{ padding: '16px' }}>
              <div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-dim)', display: 'block' }}>Financial Impact</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-green)' }}>
                  {recommendation.estimatedImpact}
                </span>
              </div>
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div className="info-panel-section">
            <h3 className="info-section-title">Root Cause Diagnostics</h3>
            <div className="info-section-content">
              {analysis?.rootCause || recommendation.description}
            </div>
          </div>

          {/* Affected Business Segments */}
          {analysis?.affectedSegments && (
            <div className="info-panel-section">
              <h3 className="info-section-title">Affected Segments & Systems</h3>
              <div className="info-tags-list">
                {analysis.affectedSegments.map((seg, i) => (
                  <span key={i} className="info-tag">
                    {seg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* KPI Variance / Telemetry Table */}
          {analysis?.metricsTrend && analysis.metricsTrend.length > 0 && (
            <div className="info-panel-section">
              <h3 className="info-section-title">Telemetry & Metric Variance</h3>
              <table className="telemetry-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current</th>
                    <th>Target</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.metricsTrend.map((m, i) => (
                    <tr key={i}>
                      <td>{m.label}</td>
                      <td>{m.current}</td>
                      <td>{m.target}</td>
                      <td className={m.variance.startsWith('-') ? 'variance-negative' : 'variance-positive'}>
                        {m.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommended Action Items Breakdown */}
          <div className="info-panel-section">
            <h3 className="info-section-title">Action Item Delegation & Timeline</h3>
            <div className="recommended-actions-block">
              <ul className="action-items-list">
                {recommendation.actions.map((act) => (
                  <li key={act.id} className="action-item" style={{ cursor: 'default' }}>
                    <span className={`action-checkbox ${act.completed ? 'completed' : ''}`}>
                      {act.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 1, stroke: '#0E1711' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <span style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{act.label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        Owner: {act.assignedTo || 'Unassigned'} • Due: {act.dueDate || recommendation.timeline}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Mitigations */}
          {analysis?.suggestedMitigation && (
            <div className="info-panel-section">
              <h3 className="info-section-title">Strategic Mitigations</h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#B5B9C5', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.suggestedMitigation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Owner & Detection Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-dim)', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <span>Lead: {analysis?.owner || 'Advisory Intelligence Engine'}</span>
            <span>Detected: {analysis?.detectionDate || 'Recent'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="info-panel-footer">
          <button type="button" className="btn-upload" onClick={onClose}>
            Close Panel
          </button>
          {onStatusChange && (
            <button
              type="button"
              className="btn-get-report"
              onClick={() => {
                const nextStatus = recommendation.status === 'Completed' ? 'Immediate Action Required' : 'Completed';
                onStatusChange(recommendation.id, nextStatus);
                onClose();
              }}
            >
              {recommendation.status === 'Completed' ? 'Re-open Advisory' : 'Mark Advisory Resolved'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
