// Optional browser verification. Keep Playwright outside application dependencies.
import test, { before, beforeEach, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { datasets } from '../src/data/datasets.js';
import { getDatasetStats, queryRows, toCsv, percent } from '../src/lib/exploration.js';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const artifactDir = process.env.BROWSER_ARTIFACT_DIR || 'artifacts/browser';
const customers = datasets.find(dataset => dataset.id === 'customers');
let browser, context, page, errors;

before(async () => {
  await mkdir(artifactDir, { recursive: true });
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
});
beforeEach(async () => {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  page = await context.newPage();
  page.setDefaultTimeout(5000);
  errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') errors.push(`${message.type()}: ${message.text()}`); });
  page.on('response', response => { if (response.url().startsWith(baseURL) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(baseURL);
  await page.locator('.column-profile').waitFor();
  await page.evaluate(() => document.fonts.ready);
});
afterEach(async () => {
  await context?.close();
  assert.deepEqual(errors, [], 'No browser errors, warnings, or failed asset responses');
});
after(async () => { await browser?.close(); });

async function choose(id) {
  await page.getByLabel('Active dataset', { exact: true }).selectOption(id);
  if (id === 'unavailable') await page.getByRole('heading', { name: 'Dataset couldn’t be loaded' }).waitFor();
  else await page.getByRole('heading', { name: datasets.find(dataset => dataset.id === id).name, exact: true }).waitFor();
}
async function rowIds() { return (await page.locator('.preview-table tbody th').allTextContents()).map(Number); }
async function verifyRecords(dataset, options = {}, pageIndex = 1, size = 10) {
  const expected = queryRows(dataset, options);
  assert.match(await page.locator('.preview-context [role="status"]').innerText(), new RegExp(`^${expected.length} of ${dataset.rows.length} records`));
  assert.deepEqual(await rowIds(), expected.slice((pageIndex - 1) * size, pageIndex * size).map(row => row.index + 1));
}

// Each test uses a fresh browser context; assertions exercise rendered behavior.
test('initial render, loading, exact Figma tokens, fonts and branding', async () => {
  assert.equal(await page.title(), 'Stechgrow OS — Dataset Exploration');
  const style = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    rootBackground: getComputedStyle(document.documentElement).backgroundColor,
    panel: getComputedStyle(document.querySelector('.panel')).backgroundColor,
    font: getComputedStyle(document.body).fontFamily,
    fontLoaded: document.fonts.check('500 20px Urbanist'),
    images: [...document.images].every(image => image.complete && image.naturalWidth > 0),
  }));
  assert.equal(style.rootBackground, 'rgb(17, 17, 17)');
  assert.equal(style.panel, 'rgb(30, 30, 30)');
  assert.match(style.font, /Urbanist/);
  assert.equal(style.fontLoaded, true);
  assert.equal(style.images, true);
  await page.getByRole('button', { name: 'Reload demo dataset' }).click();
  await page.getByRole('heading', { name: 'Loading your demo dataset' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Export dataset', exact: true }).isDisabled(), true);
  await page.locator('.column-profile').waitFor();
  await verifyRecords(customers);
});

test('all datasets show verified summary, completeness and missing breakdown', async () => {
  for (const dataset of datasets.filter(dataset => !dataset.error)) {
    await choose(dataset.id);
    const stats = getDatasetStats(dataset);
    assert.deepEqual(await page.locator('.stat-value').allTextContents(), [dataset.rows.length, dataset.columns.length, stats.missing, stats.duplicates.size].map(String));
    assert.equal(await page.locator('.quality-heading > span').innerText(), stats.cells ? percent(stats.complete, stats.cells) : 'No cells');
    assert.equal(await page.locator('.missing-column').count(), stats.columns.filter(column => column.missing > 0).length);
    for (const column of stats.columns.filter(column => column.missing > 0)) {
      assert.match(await page.locator('.missing-column').filter({ hasText: column.key }).innerText(), new RegExp(`${column.missing} \\(${percent(column.missing, dataset.rows.length).replace('.', '\\.')}\\)`));
    }
    await verifyRecords(dataset);
  }
});

test('column selection, samples, numerical statistics, dates and distribution values', async () => {
  for (const key of ['monthly_spend', 'joined_on', 'active']) {
    await page.locator('.column-item').filter({ has: page.locator('strong', { hasText: new RegExp(`^${key}$`) }) }).click();
    assert.equal(await page.locator('.profile-heading h3').innerText(), key);
    assert.equal(await page.locator(`.column-item.active strong`).innerText(), key);
    assert.equal(await page.locator('.sample-values span').count() > 0, true);
    assert.match(await page.locator('.preview-table thead .selected-column').innerText(), new RegExp(key));
    const column = getDatasetStats(customers).columns.find(column => column.key === key);
    const dd = await page.locator('.column-stats dd').allTextContents();
    assert.equal(dd[0], String(column.unique));
    assert.equal(dd[1], String(column.count));
    await page.locator('.distribution-values summary').click();
    const counts = (await page.locator('.distribution-table tbody tr td:last-child').allTextContents()).map(text => Number(text.replaceAll(',', '')));
    assert.equal(counts.reduce((sum, count) => sum + count, 0), column.count);
    await page.locator('.distribution-values summary').click();
  }
  assert.deepEqual(await page.locator('.sample-values span').allTextContents(), ['False', 'True']);
});

test('column search, type filtering, no-results and reset', async () => {
  await page.getByRole('textbox', { name: 'Search columns' }).fill('spend');
  assert.equal(await page.locator('.column-item').count(), 1);
  await page.getByLabel('Column data type').selectOption('date');
  await page.getByText('No matching columns', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Reset column filters' }).click();
  assert.equal(await page.locator('.column-item').count(), 8);
  await page.getByLabel('Column data type').selectOption('number');
  assert.equal(await page.locator('.column-item').count(), 2);
});

test('search, sorting, pagination and page sizes combine correctly', async () => {
  await page.getByRole('button', { name: 'Next page' }).click();
  await verifyRecords(customers, {}, 2);
  await page.getByLabel('Rows per page').selectOption('25');
  await verifyRecords(customers, {}, 1, 25);
  const sort = page.getByRole('button', { name: 'monthly_spend number', exact: true });
  await sort.click();
  await verifyRecords(customers, { sort: { key: 'monthly_spend', direction: 'asc' } }, 1, 25);
  await sort.click();
  await verifyRecords(customers, { sort: { key: 'monthly_spend', direction: 'desc' } }, 1, 25);
  await page.getByRole('textbox', { name: 'Search dataset rows' }).fill(' GROWTH ');
  await verifyRecords(customers, { search: ' GROWTH ', sort: { key: 'monthly_spend', direction: 'desc' } }, 1, 25);
  await page.getByLabel('Filter rows by quality').selectOption('missing');
  await verifyRecords(customers, { search: ' GROWTH ', quality: 'missing', sort: { key: 'monthly_spend', direction: 'desc' } }, 1, 25);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await verifyRecords(customers, {}, 1, 25);
});

test('empty search results, missing cells and exact repeated-row identities', async () => {
  await page.getByLabel('Search dataset rows').fill('no-such-record-xyz');
  await page.getByText('No matching records', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Next page' }).isDisabled(), true);
  assert.equal(await page.getByRole('button', { name: 'Previous page' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Clear row search' }).click();
  await page.getByLabel('Filter rows by quality').selectOption('missing');
  await verifyRecords(customers, { quality: 'missing' });
  assert.ok(await page.locator('.preview-table .null-value').count() > 0);
  await page.getByLabel('Filter rows by quality').selectOption('duplicates');
  assert.deepEqual(await rowIds(), [237, 238, 239, 240]);
  assert.equal(await page.locator('.preview-table .badge.pink').count(), 4);
});

test('column visibility retains one column, searches hidden columns and clears hidden sorts', async () => {
  await page.getByRole('button', { name: 'age number', exact: true }).click();
  await page.locator('.column-visibility summary').click();
  const checkboxes = page.locator('.column-visibility input');
  await page.getByRole('checkbox', { name: 'name', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'age', exact: true }).uncheck();
  assert.equal(await page.locator('.preview-table th[aria-sort="ascending"]').count(), 0);
  await page.locator('.column-visibility summary').click();
  await page.getByLabel('Search dataset rows').fill('AARAV');
  await verifyRecords(customers, { search: 'AARAV' });
  await page.locator('.column-visibility summary').click();
  for (const checkbox of await checkboxes.all()) if (await checkbox.isChecked() && !await checkbox.isDisabled()) await checkbox.uncheck();
  assert.equal(await page.locator('.column-visibility input:checked').count(), 1);
  assert.equal(await page.locator('.column-visibility input:disabled').count(), 1);
  await page.getByRole('button', { name: 'Show all columns' }).click();
  assert.equal(await page.locator('.column-visibility input:checked').count(), 8);
});

test('dataset switching resets stale pagination, search, sort, selected and visible columns', async () => {
  await page.getByLabel('Rows per page').selectOption('50');
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('textbox', { name: 'Search dataset rows' }).fill('Growth');
  await page.getByRole('button', { name: 'age number', exact: true }).click();
  await page.locator('.column-visibility summary').click();
  await page.getByRole('checkbox', { name: 'region', exact: true }).uncheck();
  await choose('orders');
  await page.locator('.column-profile').waitFor();
  assert.equal(await page.getByLabel('Rows per page').inputValue(), '10');
  assert.equal(await page.getByLabel('Search dataset rows').inputValue(), '');
  assert.equal((await page.locator('.column-visibility summary').innerText()).replace(/\s+/g, ' '), 'Columns 7/7');
  assert.equal(await page.locator('.profile-heading h3').innerText(), 'quantity');
  await verifyRecords(datasets.find(dataset => dataset.id === 'orders'));
  // Rapid changes must not allow the older local request to replace the final selection.
  await page.getByLabel('Active dataset', { exact: true }).selectOption('customers');
  await page.getByLabel('Active dataset', { exact: true }).selectOption('inventory');
  await page.getByRole('heading', { name: 'Product inventory', exact: true }).waitFor();
  assert.equal(await page.locator('.stat-value').first().innerText(), '96');
});

test('error, retry, recovery and empty dataset states', async () => {
  await choose('unavailable');
  assert.equal(await page.getByRole('button', { name: 'Export dataset', exact: true }).isDisabled(), true);
  await page.getByRole('button', { name: 'Retry demo' }).click();
  await page.getByRole('heading', { name: 'Loading your demo dataset' }).waitFor();
  await page.getByRole('heading', { name: 'Dataset couldn’t be loaded' }).waitFor();
  await page.getByRole('button', { name: 'Use customer accounts' }).click();
  await page.locator('.column-profile').waitFor();
  await verifyRecords(customers);
  await choose('empty');
  await page.getByText('This dataset has no records', { exact: true }).waitFor();
  await page.getByText('No values to chart', { exact: true }).waitFor();
  assert.equal(await page.locator('.quality-heading > span').innerText(), 'No cells');
});

test('full and filtered CSV downloads preserve data, sort and visible schema', async () => {
  let downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export dataset', exact: true }).click();
  let download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'customer_accounts.csv');
  assert.equal(await readFile(await download.path(), 'utf8'), '\uFEFF' + toCsv(customers.rows, customers.columns));
  await page.getByLabel('Filter rows by quality').selectOption('duplicates');
  await page.getByRole('button', { name: 'age number', exact: true }).click();
  await page.locator('.column-visibility summary').click();
  await page.getByRole('checkbox', { name: 'name', exact: true }).uncheck();
  await page.locator('.column-visibility summary').click();
  downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export view', exact: true }).click();
  download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'customers_filtered.csv');
  const expected = queryRows(customers, { quality: 'duplicates', sort: { key: 'age', direction: 'asc' } });
  assert.equal(await readFile(await download.path(), 'utf8'), '\uFEFF' + toCsv(expected.map(row => row.record), customers.columns.filter(column => column.key !== 'name')));
});

test('responsive desktop, tablet and mobile have no page overflow and usable tables', async () => {
  for (const width of [1920, 1440, 1280, 1024, 1023, 834, 768, 700, 390, 360, 320]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1080 });
    await page.getByLabel('Column data type').selectOption('number');
    assert.equal(await page.locator('.column-item').count(), 2, `Column controls remain usable at ${width}px`);
    await page.getByLabel('Column data type').selectOption('all');
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const geometry = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth, table: document.querySelector('.table-scroll').getBoundingClientRect().width, tableContent: document.querySelector('.table-scroll').scrollWidth }));
    assert.ok(geometry.page <= geometry.width, `No page overflow at ${width}px: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.table > 0);
    if (width < 700) assert.ok(geometry.tableContent > geometry.table, 'Narrow tables scroll within their own region');
    if ([1920, 1440, 768, 390, 320].includes(width)) await page.screenshot({ path: join(artifactDir, `dataset-exploration-${width}.png`), fullPage: true });
  }
  await page.getByRole('button', { name: 'Next page' }).click();
  await verifyRecords(customers, {}, 2);
});

test('keyboard skip link, visible focus, sidebar collapse and mobile focus trap', async () => {
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  assert.equal(await page.getByRole('link', { name: 'Column explorer', exact: true }).getAttribute('aria-label'), 'Column explorer');
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'Toggle workspace navigation' });
  await menu.click();
  await page.getByRole('dialog', { name: 'Workspace navigation' }).waitFor();
  assert.equal(await page.evaluate(() => document.querySelector('main').inert), true);
  assert.equal(await page.evaluate(() => document.activeElement.className), 'brand');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Dataset preview');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'brand');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Toggle workspace navigation');
  assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
  await menu.click();
  await page.getByRole('link', { name: 'Column explorer', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  await menu.click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => !document.querySelector('main').inert);
});
