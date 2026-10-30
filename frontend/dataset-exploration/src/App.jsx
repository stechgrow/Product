import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Database, Menu, RefreshCw, Download, CircleAlert, LoaderCircle, ArrowUpRight } from 'lucide-react';
import { datasets, loadDataset } from './data/datasets.js';
import { getDatasetStats, toCsv, downloadCsv } from './lib/exploration.js';
import Sidebar from './components/Sidebar.jsx';
import Overview from './components/Overview.jsx';
import DatasetPreview from './components/DatasetPreview.jsx';

const ColumnExplorer = lazy(() => import('./components/ColumnExplorer.jsx'));

function Explorer({ dataset }) {
  const stats = useMemo(() => getDatasetStats(dataset), [dataset]);
  const [selectedKey, setSelectedKey] = useState(() => dataset.columns.find(column => column.type === 'number')?.key || dataset.columns[0]?.key);
  return <><Overview dataset={dataset} stats={stats} /><Suspense fallback={<div className="panel empty-state section-block" role="status">Loading column explorer…</div>}><ColumnExplorer dataset={dataset} columns={stats.columns} selectedKey={selectedKey} onSelect={setSelectedKey} /></Suspense><DatasetPreview dataset={dataset} selectedKey={selectedKey} /></>;
}

export default function App() {
  const [datasetId, setDatasetId] = useState('customers');
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState({ status: 'loading', dataset: null, error: '' });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    loadDataset(datasetId, controller.signal).then(dataset => setResult({ status: 'ready', dataset, error: '' })).catch(error => {
      if (error.name !== 'AbortError') setResult({ status: 'error', dataset: null, error: error.message });
    });
    return () => controller.abort();
  }, [datasetId, request]);
  useEffect(() => {
    if (!mobileOpen) return;
    const navigation = document.getElementById('workspace-navigation');
    const focusable = () => [...navigation.querySelectorAll('a[href], button:not(:disabled)')].filter(node => node.getClientRects().length);
    focusable()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = event => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const controls = focusable();
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const wideScreen = window.matchMedia('(min-width: 1024px)');
    const closeOnResize = () => { if (wideScreen.matches) setMobileOpen(false); };
    wideScreen.addEventListener('change', closeOnResize);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('keydown', close);
      wideScreen.removeEventListener('change', closeOnResize);
      document.body.style.overflow = previousOverflow;
      menuButton.current?.focus();
    };
  }, [mobileOpen]);
  const reload = () => { setResult({ status: 'loading', dataset: null, error: '' }); setRequest(value => value + 1); };
  const selectDataset = event => {
    if (event.target.value === datasetId) return;
    setResult({ status: 'loading', dataset: null, error: '' });
    setDatasetId(event.target.value);
  };
  const dataset = result.dataset;
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to dataset exploration</a>
    <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(value => !value)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <main id="main-content" className="main-area" tabIndex={-1} inert={mobileOpen ? true : undefined}>
      <header className="topbar"><button ref={menuButton} className="icon-button mobile-menu" onClick={() => setMobileOpen(value => !value)} aria-label="Toggle workspace navigation" aria-expanded={mobileOpen} aria-controls="workspace-navigation"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><Database size={18} /><strong>Dataset Exploration</strong></div><span className="environment-badge"><span className="status-dot" /> Demo workspace</span></header>
      <section id="overview" className="page-heading" aria-labelledby="page-title"><div><span className="eyebrow">WORKSPACE / DATASETS</span><h1 id="page-title">Dataset Exploration</h1><p>Explore your records. Understand their structure, values and quality.</p></div><button className="primary-button" disabled={!dataset} onClick={() => downloadCsv(toCsv(dataset.rows, dataset.columns), dataset.file)}><Download size={18} /> Export dataset</button></section>
      <div className="dataset-selector-row"><div className="selector-label"><span className="selector-icon"><Database size={18} /></span><div><label htmlFor="dataset-selector">Active dataset</label><small>Choose a demo to explore</small></div></div><select id="dataset-selector" value={datasetId} onChange={selectDataset}>{datasets.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><button className="icon-button refresh-button" aria-label="Reload demo dataset" onClick={reload} disabled={result.status === 'loading'}><RefreshCw size={17} /></button></div>
      <div className="demo-notice"><span className="badge purple">DEMO</span><p>Realistic sample records. All metrics are calculated locally from the selected dataset.</p><a href="#preview">Explore records <ArrowUpRight size={14} /></a></div>
      <div aria-busy={result.status === 'loading'}>
        {result.status === 'loading' && <section className="panel loading-state" role="status"><LoaderCircle className="spinner" size={30} /><h2>Loading your demo dataset</h2><p>Preparing local records and column profiles…</p><div className="skeleton-grid" aria-hidden="true"><span /><span /><span /><span /></div></section>}
        {result.status === 'error' && <section className="panel error-state" role="alert"><span className="error-icon"><CircleAlert size={27} /></span><h2>Dataset couldn’t be loaded</h2><p>{result.error}</p><div><button className="primary-button" onClick={reload}><RefreshCw size={16} />Retry demo</button><button className="secondary-button" onClick={() => { setResult({ status: 'loading', dataset: null, error: '' }); setDatasetId('customers'); }}>Use customer accounts</button></div></section>}
        {result.status === 'ready' && dataset && <Explorer key={`${datasetId}-${request}`} dataset={dataset} />}
      </div>
      <footer className="footer-note"><span><span className="status-dot" /> Dataset Exploration <span>·</span> Aditya’s module</span><span>Frontend demo · No backend or AI analysis</span></footer>
    </main>
  </div>;
}
