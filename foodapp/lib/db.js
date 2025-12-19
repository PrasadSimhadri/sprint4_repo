const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Prasad@664',
    database: process.env.DB_NAME || 'food_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function query(sql, params) {
    const [results] = await pool.execute(sql, params);
    return results;
}

async function getConnection() {
    return await pool.getConnection();
}

module.exports = { pool, query, getConnection };
