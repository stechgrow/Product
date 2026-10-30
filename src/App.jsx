
import { useEffect, useRef, useState } from 'react'
import './App.css'

const initialDocuments = [
  { id: 1, name: 'Stechgrow_Design_Team_Monthly_Record.xlsx', type: 'file', status: 'Analyzed', date: '19 Feb 2026', progress: 'Successful' },
  { id: 2, name: 'Stechgrow_Design_Team_Monthly_Record.xlsx', type: 'link', status: 'In Progress', date: '19 Feb 2026', progress: 'Successful' },
  { id: 3, name: 'Stechgrow_Design_Team_Monthly_Record.xlsx', type: 'file', status: 'Analyzed', date: '19 Feb 2026', progress: 'Successful' },
]

const MAX_SIZE = 1024 * 1024 * 1024
const ALLOWED_TYPES = ['.csv', '.xls', '.xlsx', '.json', '.txt']

function App() {
  const [files, setFiles] = useState([])
  const [documents, setDocuments] = useState(initialDocuments)
  const [selected, setSelected] = useState([])
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [link, setLink] = useState('')
  const [dark, setDark] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState('All')
  const [bannerVisible, setBannerVisible] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const fileInput = useRef(null)
  const uploadArea = useRef(null)
  const historyArea = useRef(null)
  const noticeTimer = useRef(null)

  useEffect(() => {
    return () => clearTimeout(noticeTimer.current)
  }, [])

  function notify(message) {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3500)
  }

  function chooseFiles(fileList) {
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return

    setError('')
    setStatus('idle')

    const valid = []

    for (const file of incoming) {
      const extension = '.' + (file.name.split('.').pop() || '').toLowerCase()

      if (!ALLOWED_TYPES.includes(extension)) {
        setError(`${file.name}: unsupported file type. Use CSV, XLS, XLSX, JSON or TXT.`)
        continue
      }

      if (file.size > MAX_SIZE) {
        setError(`${file.name}: the maximum file size is 1 GB.`)
        continue
      }

      valid.push(file)
    }

    if (valid.length) {
      setFiles(previous => [...previous, ...valid])
      notify(`${valid.length} file${valid.length > 1 ? 's' : ''} selected`)
    }

    if (fileInput.current) fileInput.current.value = ''
  }

  function removeFile(index) {
    setFiles(previous => previous.filter((_, i) => i !== index))
    setError('')
  }

  async function handleUpload(file) {
    if (!file) {
      setError('Please select a file before uploading.')
      return
    }

    setError('')
    setStatus('uploading')
    setProgress(0)
    setShowModal(true)

    // Temporary frontend demonstration.
    // Replace this simulation with the team's upload API when available.
    try {
      for (let value = 10; value <= 100; value += 10) {
        await new Promise(resolve => setTimeout(resolve, 180))
        setProgress(value)
      }

      setDocuments(previous => [
        {
          id: Date.now(),
          name: file.name,
          type: 'file',
          status: 'Uploaded (Demo)',
          date: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          progress: 'Local demo only',
        },
        ...previous,
      ])

      setFiles(previous => previous.filter(item => item !== file))
      setStatus('success')
      setShowModal(false)
      notify(`${file.name} processed in demo mode. No server upload occurred.`)
    } catch {
      setStatus('error')
      setShowModal(false)
      setError('The upload could not be completed. Please try again.')
    }
  }

  function toggleSelected(id) {
    setSelected(previous =>
      previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id],
    )
  }

  function deleteSelected() {
    if (!selected.length) {
      notify('Select at least one document to delete.')
      return
    }

    setDocuments(previous => previous.filter(doc => !selected.includes(doc.id)))
    setSelected([])
    notify('Selected document rows removed from this demo.')
  }

  function deleteDocument(id) {
    setDocuments(previous => previous.filter(doc => doc.id !== id))
    setSelected(previous => previous.filter(item => item !== id))
    notify('Document removed from this demo.')
  }

  function connectLink() {
    if (!link.trim()) {
      notify('Please enter a dataset link first.')
      return
    }

    try {
      const parsed = new URL(link.trim())

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Unsupported protocol')
      }

      setDocuments(previous => [
        {
          id: Date.now(),
          name: link.trim(),
          type: 'link',
          status: 'Link Added (Demo)',
          date: new Date().toLocaleDateString('en-GB'),
          progress: 'Not connected',
        },
        ...previous,
      ])

      setLink('')
      notify('Link added to the demo list. A real connection requires backend integration.')
    } catch {
      notify('Enter a valid link starting with https:// or http://')
    }
  }

  function handleCloudConnect(provider) {
    notify(`${provider} connection requires provider authentication and backend integration.`)
  }

  function handleDrop(event) {
    event.preventDefault()
    chooseFiles(event.dataTransfer.files)
  }

  const visibleDocuments = documents.filter(doc =>
    filter === 'All' ? true : doc.status.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <main className={dark ? 'app dark' : 'app light'}>
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand">
  <img
  src="/stechgrow-logo.png"
  alt="Stechgrow"
  className="brand-logo"
/>
  <button
  type="button"
  className="icon-button sidebar-collapse"
  aria-label="Collapse sidebar"
  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
>
  <span aria-hidden="true">◫</span>
</button>
          </div>
          <div className="quick-search">
            <span>⌕</span>
            <input aria-label="AI Quick Search" placeholder="AI Quick Search" onKeyDown={e => e.key === 'Enter' && notify('AI search requires backend integration.')} />
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Upload navigation">
          <button onClick={() => notify('Analysis is outside this assigned module.')}>◉ <span>Analysis</span></button>
          <button className="nav-active" onClick={() => uploadArea.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>⇧ <span>Upload New Document</span></button>
          <button onClick={() => historyArea.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>▤ <span>Upload History</span></button>

          {bannerVisible && (
            <div className="upgrade-card">
              <button className="banner-close" aria-label="Close upgrade banner" onClick={() => setBannerVisible(false)}>×</button>
              <strong>For detailed<br />analytics</strong>
              <span>Upgrade for more</span>
              <button className="upgrade-button" onClick={() => notify('Upgrade options are not configured yet.')}>Upgrade now</button>
              <span className="upgrade-mark">S</span>
            </div>
          )}

          <div className="nav-bottom">
            <button onClick={() => notify('Preferences are outside this assigned module.')}>☷ <span>Preferences</span></button>
            <button onClick={() => setDark(previous => !previous)}>◐ <span>Theme: {dark ? 'Dark' : 'Light'}</span></button>
            <button onClick={() => notify('Contact your Stechgrow administrator for support.')}>♧ <span>Help &amp; Support</span></button>
            <button onClick={() => notify('Upload settings: CSV, XLS, XLSX, JSON and TXT; maximum 1 GB.')}>⚙ <span>Settings</span></button>
          </div>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="top-actions">
            <button className="toolbar-button" disabled={!selected.length} onClick={deleteSelected}>♧ <span>Delete {selected.length ? `(${selected.length})` : ''}</span></button>
            <button className="toolbar-button" onClick={() => uploadArea.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>⇧ <span>Upload</span></button>
          </div>

          <div className="top-right">
            <button className="gradient-button" aria-label="Toggle theme" onClick={() => setDark(previous => !previous)}>✧</button>
            <button className="icon-button" aria-label="Refresh document list" onClick={() => { setFilter('All'); notify('Document list refreshed.'); }}>↻</button>
            <div className="menu-anchor">
              <button className="icon-button" aria-label="Notifications" onClick={() => { setShowNotifications(previous => !previous); setShowProfile(false); }}>♧</button>
              {showNotifications && <div className="dropdown"><strong>Notifications</strong><p>{documents.length} document rows in this demo.</p><p>{files.length} file(s) waiting to upload.</p></div>}
            </div>
            <div className="menu-anchor">
              <button className="avatar" aria-label="Profile menu" onClick={() => { setShowProfile(previous => !previous); setShowNotifications(false); }}>A<span /></button>
              {showProfile && <div className="dropdown"><strong>Stechgrow User</strong><p>Upload Flow workspace</p><button className="dropdown-action" onClick={() => { setShowProfile(false); notify('Profile settings are not configured.'); }}>Profile settings</button></div>}
            </div>
          </div>
        </header>

        <h1>Upload your data</h1>

        {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

        <div className="upload-grid">
          <section className="panel file-panel" ref={uploadArea}>
            <div className="panel-heading">
              <span className="panel-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V3" />
    <path d="m8 7 4-4 4 4" />
    <path d="M7 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" />
  </svg>
</span>
              <div><h2>Upload files</h2><p>Select or drag &amp; drop the files of your choice</p></div>
            </div>

            <div className="drop-zone" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
              {files.length === 0 ? (
                <>
                  <button className="upload-symbol" aria-label="Browse files" onClick={() => fileInput.current?.click()}>⇧</button>
                  <p>Drop your files here or <button className="text-button" onClick={() => fileInput.current?.click()}>browse</button></p>
                  <small>CSV, XLS, XLSX, JSON or TXT · Max file size up to 1 GB</small>
                </>
              ) : (
                <div className="selected-files">
                  {files.map((file, index) => (
                    <div className="file-item" key={`${file.name}-${file.lastModified}-${index}`}>
                      <span className="file-type-icon">▤</span>
                      <div className="file-info"><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(2)} MB · {file.name.split('.').pop().toUpperCase()}</small></div>
                      <button className="remove-file" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}>×</button>
                      <button className="small-upload" disabled={status === 'uploading'} onClick={() => handleUpload(file)}>Upload</button>
                    </div>
                  ))}
                  <button className="secondary-button" onClick={() => fileInput.current?.click()}>+ Add more files</button>
                </div>
              )}
              <input ref={fileInput} className="hidden-input" type="file" multiple accept=".csv,.xls,.xlsx,.json,.txt" onChange={e => chooseFiles(e.target.files)} />
            </div>
          </section>

          <section className="panel link-panel">
            <div className="panel-heading">
              <span className="panel-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13.5 8.5 15a4 4 0 0 1-5.7-5.7l3-3a4 4 0 0 1 5.7 0" />
    <path d="m14 10.5 1.5-1.5a4 4 0 0 1 5.7 5.7l-3 3a4 4 0 0 1-5.7 0" />
    <path d="m8.5 12 7-0.5" />
  </svg>
</span>
              <div><h2>Paste your link to connect</h2><p>Select or drag &amp; drop the data link</p></div>
            </div>

            <form className="link-form" onSubmit={e => { e.preventDefault(); connectLink(); }}>
              <span>↗</span>
              <input type="url" aria-label="Dataset link" placeholder="Paste your link here" value={link} onChange={e => setLink(e.target.value)} />
              <button type="submit" className="connect-button">
  Connect
</button>
            </form>

            <div className="database-area">
  <small>Connect to +50 Databases</small>

  <div className="database-buttons">
    <button
      type="button"
      onClick={() => handleCloudConnect("Drive")}
    >
      <img src="/icons/google-drivelogo.png" alt="" />
      <span>Drive</span>
    </button>

    <button
      type="button"
      onClick={() => handleCloudConnect("Dropbox")}
    >
      <img src="/icons/dropbox.webp" alt="" />
      <span>Dropbox</span>
    </button>

    <button
      type="button"
      onClick={() => handleCloudConnect("AWS")}
    >
      <img src="/icons/aws.webp" alt="" />
      <span>AWS</span>
    </button>

    <button
      type="button"
      onClick={() => handleCloudConnect("Azure")}
    >
      <img src="/icons/azure.webp" alt="" />
      <span>Azure</span>
    </button>
  </div>
</div>

          </section>
        </div>

        <section className="panel history-panel" ref={historyArea}>
          <div className="history-heading">
            <h2>Previously uploaded documents</h2>
            <div className="history-controls">
              <span>Status</span>
              <span>Date</span>
              <span>Progress</span>
              <button className="icon-button compact" aria-label="Delete selected documents" onClick={deleteSelected}>♧</button>
              <button className="icon-button compact" aria-label="Filter documents" onClick={() => setShowFilters(previous => !previous)}>☷</button>
            </div>
          </div>

          {showFilters && (
            <div className="filter-row">
              <label htmlFor="status-filter">Filter by status</label>
              <select id="status-filter" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="All">All documents</option>
                <option value="Analyzed">Analyzed</option>
                <option value="In Progress">In Progress</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Link Added">Link Added</option>
              </select>
            </div>
          )}

          <div className="document-list">
            {visibleDocuments.length === 0 ? (
              <p className="empty-state">No documents found. Upload a file to get started.</p>
            ) : visibleDocuments.map(doc => (
              <div className="document-row" key={doc.id}>
                <input type="checkbox" aria-label={`Select ${doc.name}`} checked={selected.includes(doc.id)} onChange={() => toggleSelected(doc.id)} />
                <span className="document-icon">{doc.type === 'link' ? '↗' : '▤'}</span>
                <span className="document-name" title={doc.name}>{doc.name}</span>
                <span className={`status-pill ${doc.status.toLowerCase().includes('analyzed') ? 'pink' : doc.status.toLowerCase().includes('progress') ? 'orange' : 'blue'}`}>{doc.status}</span>
                <span className="document-date">{doc.date}</span>
                <span className="document-progress">{doc.progress}</span>
                <button className="row-delete" aria-label={`Delete ${doc.name}`} onClick={() => deleteDocument(doc.id)}>×</button>
              </div>
            ))}
          </div>
          <p className="demo-note">Demo mode: initial history is sample data. New uploads are not sent to a server until the backend API is connected.</p>
        </section>
      </section>

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="loading-title">
          <div className="loading-modal">
            <div className="clean-icon">✦</div>
            <h2 id="loading-title">Cleaning your files</h2>
            <p>Processing in frontend demo mode</p>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="progress-caption"><span>{progress}%</span><span>Estimated time: a few seconds</span></div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
