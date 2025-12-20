const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
