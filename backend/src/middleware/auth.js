const db = require('../config/db');

// Middleware that authenticates using a DB-backed session token (NOT JWT)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Access token required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email FROM users WHERE session_token = ?',
      [token]
    );

    if (!rows.length) {
      return res.status(403).json({ msg: 'Invalid or expired token' });
    }

    // Attach minimal user info to the request object
    req.user = {
      id: rows[0].id,
      email: rows[0].email,
    };

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ msg: 'Authentication failed' });
  }
};

module.exports = authenticateToken;
