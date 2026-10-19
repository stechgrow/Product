'use client';

import React, { useEffect } from 'react';
import { MetricSummary } from './types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: MetricSummary;
  onConfirmDownload: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onConfirmDownload,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-backdrop ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-report-title"
    >
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 id="modal-report-title" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-main)' }}>
            Executive Advisory Synthesis
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#9295A0', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '20px' }}>
          Your synthesized Q4 Advisory intelligence pack has been generated with{' '}
          <strong style={{ color: '#FFFFFF' }}>{metrics.criticalActions} critical action items</strong>,{' '}
          <strong style={{ color: '#FFFFFF' }}>{metrics.opportunities} growth opportunities</strong>, and a projected net
          financial recovery impact of <strong style={{ color: 'var(--c-green)' }}>{metrics.potentialImpact}</strong>.
        </p>

        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Audited Pillars</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>Revenue & Data Quality</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Status</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-green)' }}>Ready for Export</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} className="btn-upload" style={{ padding: '10px 18px' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDownload}
            className="btn-get-report"
            style={{ padding: '10px 20px' }}
          >
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
