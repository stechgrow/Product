import { Database, PanelLeft, LayoutDashboard, Activity, ChartNoAxesCombined, Table2, Columns3, ShieldCheck, X } from 'lucide-react';

export default function Sidebar({ collapsed, onCollapse, mobileOpen, onClose }) {
  return <>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
    <aside id="workspace-navigation" className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Workspace navigation" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? true : undefined}>
      <div className="brand-panel">
        <a href="#overview" className="brand" aria-label="Stechgrow dataset overview" onClick={onClose}><img className="brand-logo" src="/assets/stechgrow-logo.svg" alt="Stechgrow" /></a>
        <button className="icon-button collapse-control" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}><PanelLeft size={18} /></button>
        <button className="icon-button mobile-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>
        <a className="brand-shortcut" href="#preview" onClick={onClose}><Database size={20} /><span>Explore your datasets</span></a>
      </div>
      <div className="nav-panel">
        <span className="nav-label">WORKSPACE</span>
        <div className="module-label" title="Dashboard belongs to the main Stechgrow OS"><LayoutDashboard size={18} /><span>Dashboard<small>Main workspace</small></span></div>
        <a className="nav-item selected" href="#overview" onClick={onClose} aria-label="Dataset Exploration" title="Dataset Exploration" aria-current="page"><Database size={24} /><span>Dataset Exploration</span></a>
        <nav aria-label="Dataset sections" className="section-nav">
          <a className="nav-item" href="#overview" onClick={onClose} aria-label="Overview and quality" title="Overview and quality"><ShieldCheck size={20} /><span>Overview & quality</span></a>
          <a className="nav-item" href="#columns" onClick={onClose} aria-label="Column explorer" title="Column explorer"><Columns3 size={20} /><span>Column explorer</span></a>
          <a className="nav-item" href="#preview" onClick={onClose} aria-label="Dataset preview" title="Dataset preview"><Table2 size={20} /><span>Dataset preview</span></a>
        </nav>
        <div className="nav-divider" /><span className="nav-label">TEAM MODULES</span>
        <div className="module-label" title="Separate screen owned by Bhoomi"><Activity size={18} /><span>Automated EDA<small>Bhoomi · separate module</small></span></div>
        <div className="module-label" title="Separate screen owned by Nishita"><ChartNoAxesCombined size={18} /><span>Data Analysis<small>Nishita · separate module</small></span></div>
        <div className="sidebar-bottom"><span className="avatar">AA</span><span className="profile-text">Aditya Arakkal<small>Dataset Exploration</small></span><span className="status-dot" /></div>
      </div>
    </aside>
  </>;
}
