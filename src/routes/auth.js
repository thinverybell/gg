const express = require('express');
const router = express.Router();
const { login, issue } = require('../services/authService');

router.get('/login', (req, res) => {
  res.render('auth/login', {
    error: null,
    next: typeof req.query.next === 'string' ? req.query.next : '/'
  });
});

router.post('/login', (req, res) => {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');
    const user = login(email, password);

    if (!user) {
      return res.status(401).render('auth/login', {
        error: 'Tài khoản hoặc mật khẩu không đúng.',
        next: typeof req.body.next === 'string' ? req.body.next : '/'
      });
    }

    const secret = process.env.SESSION_SECRET || 'change-this-session-secret';
    res.cookie('zc_session', issue(user, secret), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
      maxAge: 7 * 864e5,
      path: '/'
    });

    const next = typeof req.body.next === 'string' && req.body.next.startsWith('/')
      ? req.body.next
      : '/';
    return res.redirect(next);
  } catch (error) {
    console.error('[AUTH] Login failed:', error);
    return res.status(500).render('auth/login', {
      error: 'Không thể đăng nhập lúc này. Vui lòng thử lại.',
      next: '/'
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('zc_session', { path: '/' });
  res.redirect('/login');
});

module.exports = router;
