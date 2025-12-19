import { query } from '@/lib/db';
const { getUserFromRequest } = require('@/lib/auth');

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);

        if (!user) {
            return Response.json({
                success: false,
                message: 'Not authenticated'
            }, { status: 401 });
        }

        const users = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [user.id]);

        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        }, { status: 500 });
    }
}
