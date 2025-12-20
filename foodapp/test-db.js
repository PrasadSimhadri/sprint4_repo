const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
};

async function testConnection() {
    console.log('Testing MySQL connection...');
    console.log('Host:', dbConfig.host);
    console.log('User:', dbConfig.user);
    console.log('Database:', dbConfig.database);
    console.log('');

    try {
        const connection = await mysql.createConnection(dbConfig);

        console.log('MySQL connected');

        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('MySQL Version:', rows[0].version);

        console.log('Connection ID:', connection.threadId);
        console.log('Connection state: Active');

        await connection.end();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('MySQL connection failed');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n  database does not exist.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n Make sure MySQL server is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n Check  username and password');
        }

        process.exit(1);
    }
}

testConnection();
