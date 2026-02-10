const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Sanju@2004',
  database: 'mini_streaming_app'
});
