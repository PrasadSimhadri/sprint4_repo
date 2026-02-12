import { query } from '@/lib/db';
const { hashPassword } = require('@/lib/auth');
const { sendWelcomeEmail } = require('@/lib/email');

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, phone } = body;

        if (!name || !email || !password) {
            return Response.json({
                success: false,
                message: 'Name, email and password are required'
            }, { status: 400 });
        }

        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return Response.json({
                success: false,
                message: 'Email already registered'
            }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const result = await query(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?) RETURNING id',
            [name, email, hashedPassword, phone || null, 'customer']
        );

        sendWelcomeEmail(email, name);

        return Response.json({
            success: true,
            message: 'Registration successful! Welcome email sent.',
            data: { id: result[0].id, name, email, role: 'customer' }
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Registration failed',
            error: error.message
        }, { status: 500 });
    }
}
