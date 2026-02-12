require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

async function test() {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL?.substring(0, 50) + '...');
        
        // Test connection
        const res1 = await pool.query('SELECT NOW() as time');
        console.log('✓ Connected! Server time:', res1.rows[0].time);
        
        // Check tables
        const res2 = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('✓ Tables:', res2.rows.map(r => r.table_name));
        
        // Check menu data
        const res3 = await pool.query('SELECT COUNT(*) as count FROM menu_categories');
        console.log('✓ Menu categories count:', res3.rows[0].count);
        
        const res4 = await pool.query('SELECT COUNT(*) as count FROM menu_items');
        console.log('✓ Menu items count:', res4.rows[0].count);
        
    } catch (err) {
        console.error('✗ Error:', err.code, err.message);
        console.error('Full error:', err);
    } finally {
        await pool.end();
    }
}

test();
