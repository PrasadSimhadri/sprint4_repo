const mysql = require('mysql2/promise');

// MySQL Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Prasad@664',
    database: 'food_app'
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

        // Get server info
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log('MySQL Version:', rows[0].version);

        // Check connection status
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
            console.log('\n  database "food_app" does not exist.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n Make sure MySQL server is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n Check  username and password');
        }

        process.exit(1);
    }
}

testConnection();
