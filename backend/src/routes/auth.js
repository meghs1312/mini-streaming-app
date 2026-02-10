const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();


// REGISTER
router.post('/register', async (req, res) => {
console.log('register invoked paina');

  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users(email, password_hash) VALUES (?, ?)',
    [email, hash]
  );

  console.log('register invoked');


  res.json({ message: 'User created' });
});


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    'SELECT * FROM users WHERE email=?',
    [email]
  );

  if (!rows.length) return res.status(401).json({ msg: 'Invalid' });

  const valid = await bcrypt.compare(password, rows[0].password_hash);

  if (!valid) return res.status(401).json({ msg: 'Invalid' });

  res.json({ message: 'Login success' });
});

module.exports = router;
