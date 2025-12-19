import { query } from '@/lib/db';
const { hashPassword } = require('@/lib/auth');

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return Response.json({
                success: false,
                message: 'Email, OTP, and new password are required'
            }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return Response.json({
                success: false,
                message: 'Password must be at least 6 characters'
            }, { status: 400 });
        }

        const users = await query(
            'SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        const user = users[0];

        if (user.reset_otp !== otp) {
            return Response.json({
                success: false,
                message: 'Invalid OTP'
            }, { status: 400 });
        }

        if (new Date() > new Date(user.reset_otp_expires)) {
            return Response.json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            }, { status: 400 });
        }

        const hashedPassword = await hashPassword(newPassword);

        await query(
            'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?',
            [hashedPassword, email]
        );

        return Response.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        return Response.json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        }, { status: 500 });
    }
}
