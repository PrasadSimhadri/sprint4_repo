const { Pool } = require('pg');

// Supabase PostgreSQL connection
// Get connection string from: Supabase Dashboard > Settings > Database > Connection string (URI)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Converts MySQL-style ? placeholders to PostgreSQL $1, $2, $3 style
 * This allows existing queries to work without modification
 */
function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => {
        index++;
        return `$${index}`;
    });
}

/**
 * Execute a SQL query with automatic placeholder conversion
 * Compatible with the existing MySQL query interface
 */
async function query(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
}

/**
 * Get a connection from the pool for transaction support
 * Returns a connection wrapper that mimics MySQL connection interface
 */
async function getConnection() {
    const client = await pool.connect();
    
    // Wrap client to provide MySQL-compatible interface
    return {
        // Execute query with placeholder conversion
        async execute(sql, params = []) {
            const pgSql = convertPlaceholders(sql);
            const result = await client.query(pgSql, params);
            // Return in MySQL format: [rows, fields]
            return [result.rows, result.fields];
        },
        
        // Start transaction
        async beginTransaction() {
            await client.query('BEGIN');
        },
        
        // Commit transaction
        async commit() {
            await client.query('COMMIT');
        },
        
        // Rollback transaction
        async rollback() {
            await client.query('ROLLBACK');
        },
        
        // Release connection back to pool
        release() {
            client.release();
        }
    };
}

module.exports = { pool, query, getConnection };
