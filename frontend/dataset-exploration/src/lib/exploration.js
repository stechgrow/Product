export const isMissing = value => value == null || (typeof value === 'string' && value.trim() === '');
export const formatNumber = value => value == null ? '—' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
export const percent = (part, total) => total ? `${(part / total * 100).toFixed(1)}%` : '0.0%';
export const displayValue = value => isMissing(value) ? 'Missing' : typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value);

export function getDuplicateIndexes(rows, columns) {
  const seen = new Set(), duplicates = new Set();
  rows.forEach((row, index) => {
    const signature = JSON.stringify(columns.map(({ key }) => isMissing(row[key]) ? null : row[key]));
    if (seen.has(signature)) duplicates.add(index);
    seen.add(signature);
  });
  return duplicates;
}

export function getColumnStats(rows, column) {
  const values = rows.map(row => row[column.key]).filter(value => !isMissing(value));
  const numeric = column.type === 'number' ? values.filter(value => typeof value === 'number' && Number.isFinite(value)).sort((a, b) => a - b) : [];
  const middle = Math.floor(numeric.length / 2);
  return {
    count: values.length, missing: rows.length - values.length, unique: new Set(values).size,
    min: numeric.length ? numeric[0] : null,
    max: numeric.length ? numeric.at(-1) : null,
    mean: numeric.length ? numeric.reduce((sum, n) => sum + n, 0) / numeric.length : null,
    median: numeric.length ? (numeric.length % 2 ? numeric[middle] : (numeric[middle - 1] + numeric[middle]) / 2) : null,
    earliest: column.type === 'date' && values.length ? [...values].sort()[0] : null,
    latest: column.type === 'date' && values.length ? [...values].sort().at(-1) : null,
  };
}

export function getDatasetStats(dataset) {
  const columns = dataset.columns.map(column => ({ ...column, ...getColumnStats(dataset.rows, column) }));
  const missing = columns.reduce((sum, column) => sum + column.missing, 0);
  const cells = dataset.rows.length * columns.length;
  return { columns, missing, cells, complete: cells - missing, duplicates: getDuplicateIndexes(dataset.rows, dataset.columns) };
}

export function getDistribution(rows, column) {
  const values = rows.map(row => row[column.key]).filter(value => !isMissing(value));
  if (!values.length) return [];
  if (column.type === 'number') {
    const numeric = values.filter(value => typeof value === 'number' && Number.isFinite(value));
    if (!numeric.length) return [];
    const min = Math.min(...numeric), max = Math.max(...numeric);
    if (min === max) return [{ label: formatNumber(min), count: numeric.length }];
    const bins = 6, width = (max - min) / bins;
    return Array.from({ length: bins }, (_, i) => ({
      label: `${formatNumber(min + i * width)}–${formatNumber(i === bins - 1 ? max : min + (i + 1) * width)}`,
      count: numeric.filter(value => Math.min(Math.floor((value - min) / width), bins - 1) === i).length,
    }));
  }
  const counts = new Map();
  values.forEach(value => {
    const label = column.type === 'date' ? String(value).slice(0, 7) : displayValue(value);
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  const groups = [...counts].map(([label, count]) => ({ label, count }));
  if (column.type === 'date') return groups.sort((a, b) => a.label.localeCompare(b.label));
  groups.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return groups.length > 7 ? [...groups.slice(0, 7), { label: 'Other values', count: groups.slice(7).reduce((sum, group) => sum + group.count, 0) }] : groups;
}

export function queryRows(dataset, { search = '', quality = 'all', sort = null } = {}) {
  const duplicates = getDuplicateIndexes(dataset.rows, dataset.columns);
  const query = search.trim().toLowerCase();
  const rows = dataset.rows.map((record, index) => ({ record, index, duplicate: duplicates.has(index) }));
  const filtered = rows.filter(({ record, duplicate }) =>
    (!query || dataset.columns.some(({ key }) => displayValue(record[key]).toLowerCase().includes(query))) &&
    (quality !== 'missing' || dataset.columns.some(({ key }) => isMissing(record[key]))) &&
    (quality !== 'duplicates' || duplicate));
  if (sort) filtered.sort((a, b) => {
    const x = a.record[sort.key], y = b.record[sort.key];
    if (isMissing(x) || isMissing(y)) return Number(isMissing(x)) - Number(isMissing(y)) || a.index - b.index;
    const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
    return (sort.direction === 'asc' ? order : -order) || a.index - b.index;
  });
  return filtered;
}

export function toCsv(rows, columns) {
  const escape = value => {
    let text = isMissing(value) ? '' : String(value);
    if (typeof value === 'string' && /^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [columns.map(column => escape(column.key)).join(','), ...rows.map(row => columns.map(({ key }) => escape(row[key])).join(','))].join('\r\n');
}

export function downloadCsv(csv, filename) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
