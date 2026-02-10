const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt');

const router = express.Router();


// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users(email, password) VALUES (?, ?)',
      [email, hash]
    );

    const userId = result.insertId;
    const token = generateToken(userId, email);

    console.log('✅ User registered:', email);
    res.json({ 
      message: 'User created',
      token,
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
    const token = generateToken(user.id, user.email);

    console.log('✅ User logged in:', email);
    res.json({ 
      message: 'Login success',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ msg: 'Login failed', error: err.message });
  }
});

module.exports = router;
