import { query } from '@/lib/db';
const { comparePassword, generateToken } = require('@/lib/auth');

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return Response.json({
                success: false,
                message: 'Email and password are required'
            }, { status: 400 });
        }

        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        const user = users[0];

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return Response.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        const token = generateToken(user);

        return Response.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                }
            }
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Login failed',
            error: error.message
        }, { status: 500 });
    }
}
