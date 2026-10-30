const names = ['Aarav Sharma', 'Diya Patel', 'Oliver Chen', 'Priya Nair', 'Amelia Wilson', 'Arjun Rao', 'Sofia Garcia', 'Ishaan Shah', 'Mia Thompson', 'Ananya Iyer', 'Noah Kim', 'Riya Das'];
const regions = ['South', 'West', 'North', 'East'];
const customers = Array.from({ length: 236 }, (_, i) => ({
  customer_id: `CUS-${String(i + 1).padStart(4, '0')}`,
  name: names[i % names.length],
  age: i % 19 === 0 ? null : 21 + ((i * 7) % 48),
  region: i % 31 === 0 ? null : regions[i % 4],
  plan: ['Starter', 'Growth', 'Growth', 'Enterprise', 'Starter'][i % 5],
  monthly_spend: i % 23 === 0 ? null : Number((499 + ((i * 137) % 8500) + (i % 4) * 0.25).toFixed(2)),
  joined_on: i % 43 === 0 ? null : `2025-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 28).padStart(2, '0')}`,
  active: i % 7 !== 0,
}));
customers.push(...[8, 32, 71, 120].map(i => ({ ...customers[i] })));
const orders = Array.from({ length: 177 }, (_, i) => ({
  order_id: `ORD-${String(i + 1).padStart(4, '0')}`,
  product: ['Analytics seat', 'Storage add-on', 'API credits', 'Support plan', 'Team workspace'][i % 5],
  quantity: i % 29 === 0 ? null : 1 + i % 12,
  amount: i % 17 === 0 ? null : 999 + (i * 337) % 24000,
  region: regions[i % 4],
  status: i % 37 === 0 ? null : ['Completed', 'Completed', 'Pending', 'Refunded'][i % 4],
  ordered_on: `2026-${String(1 + i % 9).padStart(2, '0')}-${String(1 + i % 28).padStart(2, '0')}`,
}));
orders.push(...[12, 45, 90].map(i => ({ ...orders[i] })));
const inventory = Array.from({ length: 96 }, (_, i) => ({
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  product: ['Sensor kit', 'Edge gateway', 'Compute unit', 'Network adapter', 'Power module', 'Display panel'][i % 6],
  category: ['Sensors', 'Networking', 'Compute', 'Networking', 'Accessories', 'Accessories'][i % 6],
  stock: i % 13 === 0 ? null : (i * 17) % 180,
  unit_cost: 299 + (i * 211) % 12000,
  warehouse: i % 21 === 0 ? null : ['Bengaluru', 'Mumbai', 'Chennai'][i % 3],
}));
export const datasets = [
  { id: 'customers', name: 'Customer accounts', file: 'customer_accounts.csv', description: 'Subscription plans, customer profiles and monthly spend.', columns: [
    ['customer_id', 'string'], ['name', 'string'], ['age', 'number'], ['region', 'category'], ['plan', 'category'], ['monthly_spend', 'number'], ['joined_on', 'date'], ['active', 'boolean'],
  ], rows: customers },
  { id: 'orders', name: 'Sales orders', file: 'sales_orders.csv', description: 'Product orders, quantities and fulfilment status.', columns: [
    ['order_id', 'string'], ['product', 'category'], ['quantity', 'number'], ['amount', 'number'], ['region', 'category'], ['status', 'category'], ['ordered_on', 'date'],
  ], rows: orders },
  { id: 'inventory', name: 'Product inventory', file: 'product_inventory.csv', description: 'Stock levels, product categories and warehouse locations.', columns: [
    ['sku', 'string'], ['product', 'category'], ['category', 'category'], ['stock', 'number'], ['unit_cost', 'number'], ['warehouse', 'category'],
  ], rows: inventory },
  { id: 'empty', name: 'Empty dataset · demo state', file: 'empty_dataset.csv', description: 'An empty demo dataset with a defined schema.', columns: [['record_id', 'string'], ['value', 'number']], rows: [] },
  { id: 'unavailable', name: 'Unavailable dataset · error demo', error: true },
].map(dataset => ({ ...dataset, columns: dataset.columns?.map(([key, type]) => ({ key, type })) }));

// Simulates local loading only. No network request or backend integration.
export function loadDataset(id, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const dataset = datasets.find(item => item.id === id);
      if (!dataset || dataset.error) reject(new Error('This demo dataset is intentionally unavailable. Retry it or choose another dataset.'));
      else resolve(dataset);
    }, 350);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Loading cancelled', 'AbortError'));
    }, { once: true });
  });
}
