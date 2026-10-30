import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Columns3, Download, ChevronLeft, ChevronRight, X, Table2 } from 'lucide-react';
import { displayValue, isMissing, formatNumber, queryRows, toCsv, downloadCsv } from '../lib/exploration.js';

export default function DatasetPreview({ dataset, selectedKey }) {
  const [search, setSearch] = useState('');
  const [quality, setQuality] = useState('all');
  const [sort, setSort] = useState(null);
  const [visible, setVisible] = useState(dataset.columns.map(column => column.key));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const columns = dataset.columns.filter(column => visible.includes(column.key));
  const rows = useMemo(() => queryRows(dataset, { search, quality, sort }), [dataset, search, quality, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const reset = () => { setSearch(''); setQuality('all'); setSort(null); setPage(1); };
  const changeSort = key => {
    setSort(sort?.key === key ? (sort.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' });
    setPage(1);
  };
  const toggleColumn = key => {
    setVisible(previous => previous.includes(key) ? previous.filter(item => item !== key) : [...previous, key]);
    if (sort?.key === key) { setSort(null); setPage(1); }
  };
  return <section id="preview" className="section-block" aria-labelledby="preview-heading">
    <div className="section-heading"><div><span className="eyebrow">GET CLOSER TO YOUR DATA</span><h2 id="preview-heading">Dataset preview</h2><p>Search records, sort values and explore individual rows.</p></div><button className="secondary-button" onClick={() => downloadCsv(toCsv(rows.map(row => row.record), columns), `${dataset.id}_filtered.csv`)} disabled={!rows.length}><Download size={16} /><span>Export view</span></button></div>
    <div className="panel table-panel">
      <div className="table-toolbar"><label className="search-field row-search"><Search size={17} /><input aria-label="Search dataset rows" placeholder="Search all columns…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />{search && <button className="clear-search" onClick={() => { setSearch(''); setPage(1); }} aria-label="Clear row search"><X size={15} /></button>}</label><label className="quality-select"><span className="sr-only">Filter rows by quality</span><select aria-label="Filter rows by quality" value={quality} onChange={event => { setQuality(event.target.value); setPage(1); }}><option value="all">All records</option><option value="missing">Rows with missing values</option><option value="duplicates">Repeated rows (after first)</option></select></label><details className="column-visibility"><summary><Columns3 size={16} /> Columns <span>{columns.length}/{dataset.columns.length}</span></summary><fieldset><legend>Visible preview columns</legend>{dataset.columns.map(column => <label key={column.key}><input type="checkbox" checked={visible.includes(column.key)} disabled={visible.length === 1 && visible.includes(column.key)} onChange={() => toggleColumn(column.key)} />{column.key}</label>)}<button className="text-button" type="button" onClick={() => setVisible(dataset.columns.map(column => column.key))}>Show all columns</button></fieldset></details></div>
      <div className="preview-context"><span role="status">{formatNumber(rows.length)} of {formatNumber(dataset.rows.length)} records <span>·</span> Search includes hidden columns</span>{(search || quality !== 'all' || sort) && <button className="text-button" onClick={reset}>Reset view</button>}</div>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Dataset records; scroll horizontally for additional columns"><table className="preview-table"><caption className="sr-only">{dataset.name} preview. Missing cells are labelled Missing. Repeated rows are labelled Repeat. The selected column is highlighted.</caption><thead><tr><th scope="col" className="row-number">Row</th>{columns.map(column => <th key={column.key} scope="col" className={selectedKey === column.key ? 'selected-column' : ''} aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}><button className="sort-button" onClick={() => changeSort(column.key)} title="Cycle ascending, descending and original order"><span>{column.key}<small>{column.type}</small></span>{sort?.key === column.key ? sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : <ArrowUpDown size={13} />}</button></th>)}<th scope="col">Row quality</th></tr></thead><tbody>{rows.slice(start, start + pageSize).map(({ record, index, duplicate }) => <tr key={index}><th scope="row" className="row-number">{index + 1}</th>{columns.map(column => <td key={column.key} className={selectedKey === column.key ? 'selected-column' : ''}>{isMissing(record[column.key]) ? <span className="null-value">Missing</span> : <span className={column.type === 'number' ? 'numeric-cell' : ''}>{column.type === 'number' ? formatNumber(record[column.key]) : displayValue(record[column.key])}</span>}</td>)}<td>{duplicate ? <span className="badge pink">Repeat</span> : dataset.columns.some(column => isMissing(record[column.key])) ? <span className="badge amber">Missing cells</span> : <span className="quality-clean">Complete</span>}</td></tr>)}</tbody></table></div>
      {!rows.length && <div className="empty-state"><Table2 size={30} /><strong>{dataset.rows.length ? 'No matching records' : 'This dataset has no records'}</strong><p>{dataset.rows.length ? 'Try another search or reset the quality filter.' : 'Choose a populated demo dataset to explore records.'}</p>{dataset.rows.length > 0 && <button className="secondary-button" onClick={reset}>Reset view</button>}</div>}
      <div className="pagination"><label>Rows per page <select aria-label="Rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}</select></label><span className="page-range" role="status">{rows.length ? `${start + 1}–${Math.min(start + pageSize, rows.length)}` : '0'} of {formatNumber(rows.length)}</span><div className="page-buttons"><button className="icon-button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button><span>Page {currentPage} of {pages}</span><button className="icon-button" aria-label="Next page" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button></div></div>
      <p className="table-footnote">Export view includes all matching rows in the current sort order and only visible columns. Row quality prioritises repeats, then missing cells.</p>
    </div>
  </section>;
}
