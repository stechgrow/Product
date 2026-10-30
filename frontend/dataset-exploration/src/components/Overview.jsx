import { Rows3, Columns3, CircleAlert, Copy, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { formatNumber, percent } from '../lib/exploration.js';

export default function Overview({ dataset, stats }) {
  const types = [...new Set(dataset.columns.map(column => column.type))];
  const cards = [
    { title: 'Total rows', value: dataset.rows.length, detail: 'Records in this dataset', icon: Rows3, tone: 'purple' },
    { title: 'Total columns', value: dataset.columns.length, detail: `${types.length} data types in the schema`, icon: Columns3, tone: 'pink' },
    { title: 'Missing values', value: stats.missing, detail: `${percent(stats.missing, stats.cells)} of ${formatNumber(stats.cells)} cells`, icon: CircleAlert, tone: 'amber' },
    { title: 'Duplicate rows', value: stats.duplicates.size, detail: `${percent(stats.duplicates.size, dataset.rows.length)} · repeats after the first`, icon: Copy, tone: 'blue' },
  ];
  return <>
    <section className="dataset-overview panel" aria-labelledby="dataset-name">
      <span className="dataset-icon"><FileSpreadsheet size={24} /></span>
      <div className="dataset-info"><div className="inline-heading"><h2 id="dataset-name">{dataset.name}</h2><span className="badge purple">Demo data</span></div><p>{dataset.description}</p><span className="file-meta">{dataset.file} <span>·</span> In-memory sample <span>·</span> Amounts in INR</span></div>
      <span className="local-status"><span className="status-dot" /> Loaded locally</span>
    </section>
    <section className="stats-grid" aria-label="Dataset summary">{cards.map(({ title, value, detail, icon: Icon, tone }) => <article className={`stat-card ${tone}`} key={title}><div className="card-heading"><span>{title}</span><span className={`stat-icon ${tone}`}><Icon size={18} /></span></div><strong className="stat-value">{formatNumber(value)}</strong><p>{detail}</p><div className="stat-accent" /></article>)}</section>
    <section className="quality-strip panel" aria-label="Data quality">
      <div className="quality-heading"><CheckCircle2 size={18} /><strong>Data completeness</strong><span>{stats.cells ? percent(stats.complete, stats.cells) : 'No cells'}</span></div>
      <div className="quality-meter" role="img" aria-label={`${formatNumber(stats.complete)} populated cells and ${formatNumber(stats.missing)} missing cells`}><span style={{ width: `${stats.cells ? stats.complete / stats.cells * 100 : 0}%` }} /></div>
      <p>{formatNumber(stats.complete)} populated <span>·</span> {formatNumber(stats.missing)} missing <span>·</span> {formatNumber(stats.cells)} total cells</p>
    </section>
    <section className="quality-breakdown panel" aria-labelledby="missing-breakdown-heading">
      <div><h3 id="missing-breakdown-heading">Missing values by column</h3><p>{stats.cells ? 'Each percentage uses the full dataset row count.' : 'No records yet. Quality metrics will appear when data is available.'}</p></div>
      <div className="missing-breakdown">{stats.columns.filter(column => column.missing > 0).map(column => <div className="missing-column" key={column.key}><div><span>{column.key}</span><span>{column.missing} <small>({percent(column.missing, dataset.rows.length)})</small></span></div><div className="missing-meter" role="img" aria-label={`${column.key}: ${column.missing} missing of ${dataset.rows.length} records`}><span style={{ width: `${column.missing / dataset.rows.length * 100}%` }} /></div></div>)}{stats.cells > 0 && stats.missing === 0 && <p className="complete-message"><CheckCircle2 size={18} /> All columns are complete.</p>}</div>
    </section>
  </>;
}
