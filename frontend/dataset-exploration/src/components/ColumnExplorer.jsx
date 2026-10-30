import { useMemo, useState } from 'react';
import { Search, Hash, Type, CalendarDays, ToggleLeft, ChevronRight, ChartColumn } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { displayValue, formatNumber, isMissing, percent, getDistribution } from '../lib/exploration.js';

export const typeIcons = { number: Hash, string: Type, category: Type, date: CalendarDays, boolean: ToggleLeft };

export default function ColumnExplorer({ dataset, columns, selectedKey, onSelect }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const column = columns.find(item => item.key === selectedKey);
  const filtered = columns.filter(item => item.key.toLowerCase().includes(search.trim().toLowerCase()) && (type === 'all' || type === item.type));
  const distribution = useMemo(() => column ? getDistribution(dataset.rows, column) : [], [dataset, column]);
  const samples = useMemo(() => column ? [...new Set(dataset.rows.map(row => row[column.key]).filter(value => !isMissing(value)))].slice(0, 4) : [], [dataset, column]);
  const types = [...new Set(columns.map(item => item.type))];
  const reset = () => { setSearch(''); setType('all'); };
  return <section id="columns" className="section-block" aria-labelledby="column-explorer-heading">
    <div className="section-heading"><div><span className="eyebrow">UNDERSTAND YOUR FEATURES</span><h2 id="column-explorer-heading">Column explorer</h2><p>Select a column to explore its values and distribution.</p></div><span className="section-counter">{columns.length} columns</span></div>
    <div className="explorer-grid">
      <div className="panel column-list-panel">
        <div className="column-tools"><label className="search-field"><Search size={16} /><input aria-label="Search columns" placeholder="Find a column…" value={search} onChange={event => setSearch(event.target.value)} /></label><label className="sr-only" htmlFor="column-type">Column data type</label><select id="column-type" value={type} onChange={event => setType(event.target.value)}><option value="all">All data types</option>{types.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="column-list" aria-label="Columns">{filtered.map(item => {
          const Icon = typeIcons[item.type] || Type;
          return <button key={item.key} className={`column-item ${selectedKey === item.key ? 'active' : ''}`} aria-pressed={selectedKey === item.key} onClick={() => onSelect(item.key)}><span className={`column-type-icon ${item.type}`}><Icon size={16} /></span><span className="column-label"><strong>{item.key}</strong><small>{item.type} <span>·</span> {formatNumber(item.unique)} unique</small></span>{item.missing > 0 && <span className="missing-count" title={`${item.missing} missing values`}>{item.missing} missing</span>}<ChevronRight size={15} /></button>;
        })}{!filtered.length && <div className="empty-state compact"><Search size={24} /><strong>No matching columns</strong><p>Try another name or data type.</p><button className="text-button" onClick={reset}>Reset column filters</button></div>}</div>
        <div className="list-footer" role="status">{filtered.length} of {columns.length} columns shown</div>
      </div>
      {column && <article className="panel column-profile" aria-label={`Profile for ${column.key}`}>
        <div className="profile-heading"><div><span className="eyebrow">SELECTED COLUMN</span><h3>{column.key}</h3></div><span className="badge purple">{column.type}</span></div>
        <dl className="column-stats"><div><dt>Unique values</dt><dd>{formatNumber(column.unique)}</dd></div><div><dt>Non-missing</dt><dd>{formatNumber(column.count)}</dd></div><div><dt>Missing</dt><dd className={column.missing ? 'amber-text' : ''}>{formatNumber(column.missing)} <small>({percent(column.missing, dataset.rows.length)})</small></dd></div></dl>
        {column.type === 'number' && <dl className="numeric-stats">{[['Minimum', column.min], ['Maximum', column.max], ['Mean', column.mean], ['Median', column.median]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatNumber(value)}</dd></div>)}</dl>}
        {column.type === 'date' && <dl className="numeric-stats date-stats"><div><dt>Earliest date</dt><dd>{column.earliest || '—'}</dd></div><div><dt>Latest date</dt><dd>{column.latest || '—'}</dd></div></dl>}
        <div className="sample-values"><h4>Sample values</h4><div>{samples.length ? samples.map((value, index) => <span key={index}>{displayValue(value)}</span>) : <span>No populated values</span>}</div></div>
        <div className="distribution-heading"><h4><ChartColumn size={17} />{column.type === 'number' ? 'Value distribution' : column.type === 'date' ? 'Records by month' : 'Value frequency'}</h4><span>Missing values excluded</span></div>
        {distribution.length ? <>
          <div className="distribution-chart" role="img" aria-label={`Distribution of ${column.key}. Counts are available in the distribution values table.`}><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} margin={{ top: 12, right: 8, bottom: 4, left: -12 }} accessibilityLayer><CartesianGrid stroke="#383838" vertical={false} strokeDasharray="3 4" /><XAxis dataKey="label" tick={{ fill: '#b3b3b3', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={20} /><YAxis allowDecimals={false} tick={{ fill: '#b3b3b3', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#ffffff06' }} contentStyle={{ background: '#2c2c2c', border: '1px solid #535353', borderRadius: 10, color: '#fff' }} itemStyle={{ color: '#b5b5ff' }} /><Bar dataKey="count" name="Records" fill="#5353f6" radius={[5, 5, 0, 0]} maxBarSize={48} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
          <details className="distribution-values"><summary>View distribution values</summary><p>{column.type === 'number' ? 'Bins include the lower bound and exclude the upper bound; the final bin includes both.' : column.type === 'date' ? 'Dates grouped by calendar month.' : 'The seven most frequent values are shown individually; remaining values are grouped.'}</p><div className="distribution-table"><table><caption className="sr-only">Distribution of {column.key}</caption><thead><tr><th scope="col">{column.type === 'number' ? 'Range' : 'Value'}</th><th scope="col">Records</th></tr></thead><tbody>{distribution.map((group, index) => <tr key={index}><td>{group.label}</td><td>{formatNumber(group.count)}</td></tr>)}</tbody></table></div></details>
        </> : <div className="empty-state compact"><ChartColumn size={28} /><strong>No values to chart</strong><p>This column has no populated values.</p></div>}
        <p className="profile-note">Calculated across all {formatNumber(dataset.rows.length)} records. Preview filters do not change this profile.</p>
      </article>}
    </div>
  </section>;
}
