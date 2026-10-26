'use client';

import React, { useState, useRef, useEffect } from 'react';

interface UploadFileItem {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: 'queued' | 'uploading' | 'completed';
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (message: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [datasetCategory, setDatasetCategory] = useState('revenue');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: UploadFileItem[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: f,
      name: f.name,
      size: formatFileSize(f.size),
      progress: 100,
      status: 'queued',
    }));
    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUploadSubmit = () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    // Simulate progress and ingestion processing
    setTimeout(() => {
      setIsUploading(false);
      const fileNames = selectedFiles.map((f) => f.name).join(', ');
      onUploadSuccess(
        `Successfully uploaded ${selectedFiles.length} file(s) for Advisory ingestion: ${fileNames}`
      );
      setSelectedFiles([]);
      onClose();
    }, 900);
  };

  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="modal-box upload-modal-box">
        {/* Header */}
        <div className="upload-modal-header">
          <div className="upload-modal-title-group">
            <div className="upload-icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h3 id="upload-modal-title" className="upload-modal-title">
                Upload Dataset or Telemetry
              </h3>
              <p className="upload-modal-subtitle">
                Select telemetry spreadsheets, transaction logs, or BI data from your PC
              </p>
            </div>
          </div>
          <button
            type="button"
            className="upload-modal-close-btn"
            onClick={onClose}
            aria-label="Close upload modal"
            disabled={isUploading}
          >
            ✕
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.json,.parquet,.pdf,.txt"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />

          <div className="dropzone-center">
            <div className="dropzone-cloud-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                <polyline points="12 12 12 16" />
                <polyline points="9 15 12 12 15 15" />
              </svg>
            </div>

            <div className="dropzone-text-group">
              <span className="dropzone-main-text">
                Drag and drop your files here, or{' '}
                <span className="dropzone-highlight">Browse from your PC</span>
              </span>
              <span className="dropzone-sub-text">
                Supported formats: CSV, XLSX, JSON, PARQUET, PDF (Max file size 50 MB)
              </span>
            </div>

            <button
              type="button"
              className="btn-browse-pc"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Browse PC / Local Files</span>
            </button>
          </div>
        </div>

        {/* Dataset Ingestion Category */}
        <div className="upload-category-selector">
          <label htmlFor="dataset-category-select" className="upload-category-label">
            Target Advisory Ingestion Pipeline:
          </label>
          <select
            id="dataset-category-select"
            className="dropdown-filter-btn upload-category-select"
            value={datasetCategory}
            onChange={(e) => setDatasetCategory(e.target.value)}
          >
            <option value="revenue">Advisory Financial Metrics & Subscription ARR</option>
            <option value="data-quality">Transaction Records & Data Quality Validation</option>
            <option value="customer-retention">Customer Churn & Enterprise Onboarding Telemetry</option>
            <option value="operations">Cloud Cluster & Compute Infrastructure Logs</option>
          </select>
        </div>

        {/* Selected Files List Preview */}
        {selectedFiles.length > 0 && (
          <div className="upload-files-preview-section">
            <div className="upload-files-header">
              <span className="upload-files-count">
                Selected Files ({selectedFiles.length})
              </span>
              <button
                type="button"
                className="btn-clear-files"
                onClick={() => setSelectedFiles([])}
              >
                Clear all
              </button>
            </div>

            <ul className="upload-files-list">
              {selectedFiles.map((item) => (
                <li key={item.id} className="upload-file-item">
                  <div className="file-item-left">
                    <div className="file-item-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="file-item-details">
                      <span className="file-item-name" title={item.name}>
                        {item.name}
                      </span>
                      <span className="file-item-size">{item.size} • Ready for Ingestion</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-remove-file"
                    onClick={() => removeFile(item.id)}
                    aria-label={`Remove file ${item.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="upload-modal-footer">
          <button
            type="button"
            className="btn-upload upload-modal-cancel"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-get-report upload-modal-submit"
            onClick={handleUploadSubmit}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <svg className="spin-loader" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Processing Ingestion...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload & Ingest ({selectedFiles.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
