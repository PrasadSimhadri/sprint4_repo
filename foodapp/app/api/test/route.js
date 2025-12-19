const { query } = require('@/lib/db');

export async function GET() {
    try {
        const result = await query('SELECT 1 as connected');
        return Response.json({
            success: true,
            message: 'Database connected successfully',
            data: result
        });
    } catch (error) {
        return Response.json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        }, { status: 500 });
    }
}
