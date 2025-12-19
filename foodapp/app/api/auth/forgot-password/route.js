import { query } from '@/lib/db';
const { sendOTPEmail } = require('@/lib/email');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return Response.json({
                success: false,
                message: 'Email is required'
            }, { status: 400 });
        }

        const users = await query('SELECT id, name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'No account found with this email'
            }, { status: 404 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await query(
            'UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?',
            [otp, expiresAt, email]
        );

        await sendOTPEmail(email, users[0].name, otp);

        return Response.json({
            success: true,
            message: 'OTP sent to your email'
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to send OTP',
            error: error.message
        }, { status: 500 });
    }
}
