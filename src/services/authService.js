const crypto = require('crypto');
const { db } = require('../store/db');
const { hashPassword, verifyPassword } = require('../utils/password');

function ensure() {
  const users = db.get('users');
  let changed = false;

  if (!users.find(u => u.email === 'demo@zencheap.local')) {
    users.push({
      id: 1,
      email: 'demo@zencheap.local',
      name: 'SunJaeee',
      role: 'client',
      password: hashPassword('ChangeMe123!'),
      balance: 0,
      status: 'active'
    });
    changed = true;
  }

  if (!users.find(u => u.email === 'admin@zencheap.local')) {
    users.push({
      id: 2,
      email: 'admin@zencheap.local',
      name: 'Administrator',
      role: 'admin',
      password: hashPassword('Admin@12345'),
      balance: 0,
      status: 'active'
    });
    changed = true;
  }

  if (changed) db.save();
}

function login(email, password) {
  ensure();
  const needle = String(email || '').trim().toLowerCase();
  return db.find('users', u => {
    const emailMatch = String(u.email || '').toLowerCase() === needle;
    const nameMatch = String(u.name || '').toLowerCase() === needle;
    return (emailMatch || nameMatch) && u.status === 'active' && verifyPassword(password, u.password);
  });
}

function issue(user, secret) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    exp: Date.now() + 7 * 864e5
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function read(token, secret) {
  try {
    if (!token || typeof token !== 'string') return null;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? db.find('users', u => u.id === data.id && u.status === 'active') : null;
  } catch {
    return null;
  }
}

module.exports = { ensure, login, issue, read };
