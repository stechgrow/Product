import test from 'node:test';
import assert from 'node:assert/strict';
import { isMissing, getColumnStats, getDatasetStats, getDuplicateIndexes, getDistribution, queryRows, toCsv, percent } from './exploration.js';

const columns = [{ key: 'name', type: 'string' }, { key: 'value', type: 'number' }, { key: 'enabled', type: 'boolean' }];
const rows = [
  { name: 'Alpha', value: 10, enabled: true },
  { name: 'Beta', value: null, enabled: false },
  { name: 'Gamma', value: 2, enabled: false },
  { name: 'Alpha', value: 10, enabled: true },
  { name: 'Delta', value: 0, enabled: true },
];
const dataset = { columns, rows };

test('missing detection keeps zero and false as valid values', () => {
  for (const value of [null, undefined, '', '  ']) assert.equal(isMissing(value), true);
  for (const value of [0, false, '0', 'false']) assert.equal(isMissing(value), false);
});
test('column statistics exclude missing values and calculate an even median', () => {
  assert.deepEqual(getColumnStats(rows, columns[1]), { count: 4, missing: 1, unique: 3, min: 0, max: 10, mean: 5.5, median: 6, earliest: null, latest: null });
});
test('column statistics handle an odd median and all-missing values', () => {
  assert.equal(getColumnStats([{ value: 9 }, { value: 1 }, { value: 3 }], columns[1]).median, 3);
  const empty = getColumnStats([{ value: null }], columns[1]);
  assert.equal(empty.mean, null);
  assert.equal(empty.median, null);
  assert.equal(empty.min, null);
  assert.equal(empty.unique, 0);
  assert.equal(empty.missing, 1);
});
test('date profiles calculate chronological bounds', () => {
  const stats = getColumnStats([{ day: '2026-09-10' }, { day: null }, { day: '2025-12-11' }], { key: 'day', type: 'date' });
  assert.equal(stats.earliest, '2025-12-11');
  assert.equal(stats.latest, '2026-09-10');
});
test('duplicates compare complete rows and only count repeats after the first', () => {
  assert.deepEqual([...getDuplicateIndexes(rows, columns)], [3]);
  assert.equal(getDuplicateIndexes([{ name: 'x', value: 1 }, { name: 'x', value: 2 }], columns).size, 0);
  assert.equal(getDuplicateIndexes([{ value: null }, { value: '' }], columns).size, 1);
});
test('overview completeness is based on cells', () => {
  const stats = getDatasetStats(dataset);
  assert.equal(stats.cells, 15);
  assert.equal(stats.missing, 1);
  assert.equal(stats.complete, 14);
  assert.equal(stats.duplicates.size, 1);
  assert.equal(percent(stats.missing, stats.cells), '6.7%');
});
test('empty datasets preserve schema without inventing metrics', () => {
  const empty = { rows: [], columns };
  const stats = getDatasetStats(empty);
  assert.equal(stats.cells, 0);
  assert.equal(stats.missing, 0);
  assert.equal(stats.duplicates.size, 0);
  assert.equal(stats.columns.length, 3);
  assert.equal(percent(0, 0), '0.0%');
  assert.deepEqual(getDistribution([], columns[1]), []);
  assert.deepEqual(queryRows(empty), []);
});
test('numeric sorting is numeric and puts missing values last in either direction', () => {
  assert.deepEqual(queryRows(dataset, { sort: { key: 'value', direction: 'asc' } }).map(row => row.record.value), [0, 2, 10, 10, null]);
  assert.deepEqual(queryRows(dataset, { sort: { key: 'value', direction: 'desc' } }).map(row => row.record.value), [10, 10, 2, 0, null]);
  assert.deepEqual(rows.map(row => row.value), [10, null, 2, 10, 0]);
});
test('search is case insensitive, trimmed, and covers boolean and missing cells', () => {
  assert.equal(queryRows(dataset, { search: ' ALPHA ' }).length, 2);
  assert.equal(queryRows(dataset, { search: 'false' }).length, 2);
  assert.equal(queryRows(dataset, { search: 'missing' }).length, 1);
  assert.equal(queryRows(dataset, { search: 'does-not-exist' }).length, 0);
});
test('search and quality filters intersect and retain original row identities', () => {
  assert.deepEqual(queryRows(dataset, { quality: 'duplicates' }).map(row => row.index), [3]);
  assert.deepEqual(queryRows(dataset, { quality: 'missing' }).map(row => row.index), [1]);
  assert.equal(queryRows(dataset, { quality: 'duplicates', search: 'Beta' }).length, 0);
});
test('numeric bins count every non-missing observation once, including the maximum', () => {
  const distribution = getDistribution(rows, columns[1]);
  assert.equal(distribution.length, 6);
  assert.equal(distribution.reduce((sum, bin) => sum + bin.count, 0), 4);
  assert.equal(distribution.at(-1).count, 2);
  assert.deepEqual(getDistribution([{ value: 7 }, { value: 7 }, { value: null }], columns[1]), [{ label: '7', count: 2 }]);
});
test('categorical top values include the tail in Other values', () => {
  const distribution = getDistribution(Array.from({ length: 12 }, (_, i) => ({ name: `value-${i}` })), columns[0]);
  assert.equal(distribution.length, 8);
  assert.equal(distribution.at(-1).label, 'Other values');
  assert.equal(distribution.at(-1).count, 5);
  assert.equal(distribution.reduce((sum, group) => sum + group.count, 0), 12);
});
test('date distributions group by month and sort chronologically', () => {
  assert.deepEqual(getDistribution([{ day: '2026-02-15' }, { day: '2025-12-01' }, { day: '2026-02-01' }, { day: null }], { key: 'day', type: 'date' }), [{ label: '2025-12', count: 1 }, { label: '2026-02', count: 2 }]);
});
test('CSV keeps selected columns and row order and escapes special values', () => {
  assert.equal(toCsv([{ name: 'A, "B"\nC', value: null }, { name: '=SUM(A1)', value: 0 }], columns.slice(0, 2)), '"name","value"\r\n"A, ""B""\nC",""\r\n"\'=SUM(A1)","0"');
  assert.equal(toCsv([], [columns[1]]), '"value"');
  const sorted = queryRows(dataset, { sort: { key: 'value', direction: 'asc' }, quality: 'duplicates' });
  assert.equal(toCsv(sorted.map(row => row.record), [columns[0]]), '"name"\r\n"Alpha"');
});
