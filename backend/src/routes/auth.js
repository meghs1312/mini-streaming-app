const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');

const router = express.Router();

// Helper to create a random session token (NOT a JWT)
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};


// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const sessionToken = generateSessionToken();

    const [result] = await db.query(
      'INSERT INTO users(email, password, session_token) VALUES (?, ?, ?)',
      [email, hash, sessionToken]
    );

    const userId = result.insertId;

    console.log('✅ User registered:', email);
    res.json({ 
      message: 'User created',
      // Return our custom session token (not a JWT)
      token: sessionToken,
      user: { id: userId, email }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ msg: 'Registration failed', error: err.message });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email=?',
      [email]
    );

    if (!rows.length) return res.status(401).json({ msg: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password);

    if (!valid) return res.status(401).json({ msg: 'Invalid credentials' });

    const user = rows[0];

    // Generate a new session token on each successful login
    const sessionToken = generateSessionToken();
    await db.query(
      'UPDATE users SET session_token = ? WHERE id = ?',
      [sessionToken, user.id]
    );

    console.log('✅ User logged in:', email);
    res.json({ 
      message: 'Login success',
      token: sessionToken,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ msg: 'Login failed', error: err.message });
  }
});

module.exports = router;
