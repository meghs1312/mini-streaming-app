const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// =============================
// Helper: Generate random token
// =============================
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// =============================
// REGISTER
// =============================
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email=?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const sessionToken = generateSessionToken();

    const [result] = await db.query(
      'INSERT INTO users(email, password, session_token) VALUES (?, ?, ?)',
      [email, hash, sessionToken]
    );

    res.json({
      message: 'User created',
      token: sessionToken,
      user: { id: result.insertId, email }
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ msg: 'Registration failed' });
  }
});

// =============================
// LOGIN
// =============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email=?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const sessionToken = generateSessionToken();

    await db.query(
      'UPDATE users SET session_token=? WHERE id=?',
      [sessionToken, user.id]
    );

    res.json({
      message: 'Login success',
      token: sessionToken,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ msg: 'Login failed' });
  }
});

// =============================
// LOGOUT
// =============================
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ msg: 'Token required' });

    const token = authHeader.split(' ')[1];

    await db.query(
      'UPDATE users SET session_token=NULL WHERE session_token=?',
      [token]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Logout failed' });
  }
});

module.exports = router;
