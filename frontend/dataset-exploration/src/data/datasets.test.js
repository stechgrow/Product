import test from 'node:test';
import assert from 'node:assert/strict';
import { datasets, loadDataset } from './datasets.js';
import { getDatasetStats, getDistribution } from '../lib/exploration.js';

test('demo datasets have the documented record counts and exact repeated rows', () => {
  for (const [id, count, columnCount, missing, duplicates] of [['customers', 240, 8, 38, 4], ['orders', 180, 7, 23, 3], ['inventory', 96, 6, 13, 0]]) {
    const dataset = datasets.find(item => item.id === id);
    assert.equal(dataset.rows.length, count);
    const stats = getDatasetStats(dataset);
    assert.equal(dataset.columns.length, columnCount);
    assert.equal(stats.missing, missing);
    assert.equal(stats.duplicates.size, duplicates);
    for (const column of stats.columns) {
      assert.equal(column.count + column.missing, count);
      const distribution = getDistribution(dataset.rows, column);
      assert.equal(distribution.reduce((sum, item) => sum + item.count, 0), column.count);
    }
    assert.equal(stats.complete + stats.missing, dataset.rows.length * dataset.columns.length);
    for (const row of dataset.rows) assert.deepEqual(Object.keys(row), dataset.columns.map(column => column.key));
  }
});
test('local loader returns the selected dataset', async () => {
  const dataset = await loadDataset('orders', new AbortController().signal);
  assert.equal(dataset.id, 'orders');
  assert.equal(dataset.rows.length, 180);
});
test('unavailable demo loader exposes the explicit error state', async () => {
  await assert.rejects(loadDataset('unavailable', new AbortController().signal), /intentionally unavailable/);
});
test('switching datasets can cancel pending loading', async () => {
  const controller = new AbortController();
  const pending = loadDataset('customers', controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});
