'use client';

import React from 'react';
import { Recommendation } from './types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onToggleAction: (recId: string, actionId: string) => void;
  onOpenDetails: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onToggleAction,
  onOpenDetails,
}) => {
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Revenue':
        return 'badge-revenue';
      case 'Data Quality':
        return 'badge-data-quality';
      case 'Customer Retention':
        return 'badge-customer-retention';
      case 'Operations':
        return 'badge-operations';
      default:
        return 'badge-revenue';
    }
  };

  const getImpactBadgeClass = (impact: string) => {
    switch (impact) {
      case 'High Impact':
        return 'badge-high-impact';
      case 'Medium Impact':
        return 'badge-medium-impact';
      case 'Low Impact':
        return 'badge-low-impact';
      default:
        return 'badge-high-impact';
    }
  };

  const getPriorityDotClass = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'critical';
      case 'High':
        return 'high';
      case 'Medium':
        return 'medium';
      case 'Low':
        return 'low';
      default:
        return 'critical';
    }
  };

  const completedActionsCount = recommendation.actions.filter((a) => a.completed).length;

  return (
    <article className="advisory-card" data-category={recommendation.category.toLowerCase().replace(' ', '-')}>
      {/* Card Header */}
      <div className="advisory-card-header">
        <div className="advisory-card-title-group">
          <div className="advisory-priority-indicator">
            <span className={`priority-dot ${getPriorityDotClass(recommendation.priority)}`} />
            <span className="priority-text">{recommendation.priority} Priority</span>
          </div>
          <h3 className="advisory-card-title">{recommendation.title}</h3>
        </div>

        <div className="advisory-badges-group">
          <span className={`badge ${getImpactBadgeClass(recommendation.impactLevel)}`}>
            {recommendation.impactLevel}
          </span>
          <span className={`badge ${getCategoryBadgeClass(recommendation.category)}`}>
            {recommendation.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="advisory-card-desc">{recommendation.description}</p>

      {/* Recommended Actions Block */}
      <div className="recommended-actions-block">
        <div className="recommended-actions-header">
          <h4 className="recommended-actions-heading">Recommended Actions:</h4>
          <span className="actions-completion-tag">
            {completedActionsCount} of {recommendation.actions.length} resolved
          </span>
        </div>

        <ul className="action-items-list" role="list">
          {recommendation.actions.map((act) => (
            <li
              key={act.id}
              className={`action-item ${act.completed ? 'completed' : ''}`}
              onClick={() => onToggleAction(recommendation.id, act.id)}
              role="checkbox"
              aria-checked={act.completed}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggleAction(recommendation.id, act.id);
                }
              }}
            >
              <span className="action-checkbox" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>{act.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Footer: Metrics & Details Trigger */}
      <div className="advisory-card-footer">
        <div className="footer-metrics-group">
          <div className="footer-metric-item">
            <span className="footer-metric-icon green" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </span>
            <span className="footer-metric-label">Estimated Impact:</span>
            <span className="footer-metric-val">{recommendation.estimatedImpact}</span>
          </div>

          <div className="footer-metric-item">
            <span className="footer-metric-icon orange" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className="footer-metric-label">Timeline:</span>
            <span className="footer-metric-val">{recommendation.timeline}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-open-panel"
          onClick={() => onOpenDetails(recommendation)}
          title="Open Information Panel"
        >
          <span>View Diagnostics</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </article>
  );
};
