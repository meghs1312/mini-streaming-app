const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const videoRoutes = require('./src/routes/videos');
const oauthRoutes = require('./src/routes/oauth');

const app = express();

app.use(cors({
  origin: '*',
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/videos', videoRoutes);

db.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();

    app.listen(5000, '0.0.0.0', () => {
      console.log('🚀 Server running on http://0.0.0.0:5000');
    });
  })
  .catch(err => {
    console.error('❌ DB connection failed', err);
  });

