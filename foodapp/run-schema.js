const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Prasad@664',
    multipleStatements: true
};

async function runSchema() {
    console.log('Running database schema...\n');

    try {
        const connection = await mysql.createConnection(dbConfig);

        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        let sql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query('USE food_app');
        console.log('Using database: food_app');

        await connection.query(sql);

        console.log('Schema executed successfully!');

        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nTables created:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        console.log('\nRow counts:');
        const tableNames = ['users', 'menu_categories', 'menu_items', 'time_slots', 'orders', 'order_items'];
        for (const tableName of tableNames) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   - ${tableName}: ${rows[0].count} rows`);
        }

        await connection.end();
        console.log('\nDone!');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

runSchema();
