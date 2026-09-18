const fs = require('fs');
const path = require('path');

const initial = {
  users: [],
  products: [],
  services: [],
  orders: [],
  tickets: [],
  notifications: [],
  transactions: [],
  activity: [],
  cart: [],
  settings: {
    siteName: 'ZenCheap Cloud',
    currency: 'VND',
    maintenance: false
  }
};

const baseFile = path.join(__dirname, '../../data/db.json');
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
const writableFile = isVercel
  ? path.join('/tmp', 'zencheap-db.json')
  : baseFile;

function cloneInitial() {
  return JSON.parse(JSON.stringify(initial));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function normalize(value) {
  const data = value && typeof value === 'object' ? value : {};
  return {
    ...cloneInitial(),
    ...data,
    users: Array.isArray(data.users) ? data.users : [],
    products: Array.isArray(data.products) ? data.products : [],
    services: Array.isArray(data.services) ? data.services : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    tickets: Array.isArray(data.tickets) ? data.tickets : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    activity: Array.isArray(data.activity) ? data.activity : [],
    cart: Array.isArray(data.cart) ? data.cart : [],
    settings: { ...cloneInitial().settings, ...(data.settings || {}) }
  };
}

function load() {
  // On Vercel, prefer a warm-instance writable copy when one exists,
  // otherwise read the bundled seed database from the deployment.
  return normalize(readJson(writableFile) || readJson(baseFile) || cloneInitial());
}

let state = load();

function save() {
  // Vercel's deployment filesystem is read-only. Write to /tmp instead.
  // A later invocation may start from the bundled seed again, which is
  // acceptable for the demo store until a real persistent DB is connected.
  try {
    fs.mkdirSync(path.dirname(writableFile), { recursive: true });
    const temp = `${writableFile}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(temp, writableFile);
    return true;
  } catch (error) {
    // Never make a successful login fail just because the store cannot be written.
    if (!isVercel) throw error;
    return false;
  }
}

const db = {
  get(key) {
    return state[key];
  },
  set(key, value) {
    state[key] = value;
    save();
    return value;
  },
  add(key, value) {
    if (!Array.isArray(state[key])) state[key] = [];
    state[key].push(value);
    save();
    return value;
  },
  find(key, predicate) {
    return (state[key] || []).find(predicate);
  },
  filter(key, predicate) {
    return (state[key] || []).filter(predicate);
  },
  save,
  reload() {
    state = load();
    return state;
  }
};

module.exports = { db };
