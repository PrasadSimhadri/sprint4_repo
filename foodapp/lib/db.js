const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
    user: process.env.DB_USER || 'sql12812442',
    password: process.env.DB_PASSWORD || 'Hd3credBKB',
    database: process.env.DB_NAME || 'sql12812442',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000
});

async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

async function getConnection() {
    return await pool.getConnection();
}

module.exports = { pool, query, getConnection };
