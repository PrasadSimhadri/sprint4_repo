'use client';

import { useState } from 'react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function resetForm() {
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess(false);
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function handleSendOTP(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setStep(2);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to reset password');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                padding: '32px',
                width: '100%',
                maxWidth: '400px',
                position: 'relative'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}
                >
                    x
                </button>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#22c55e' }}>
                            Password Reset Successful!
                        </h2>
                        <p style={{ color: '#888', marginTop: '8px' }}>
                            You can now login with your new password.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            marginBottom: '8px',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f97316, #fb923c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Reset Password
                        </h2>
                        <p style={{ color: '#888', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
                            {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
                        </p>

                        {step === 1 ? (
                            <form onSubmit={handleSendOTP}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        marginBottom: '16px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '15px'
                                    }}
                                />

                                {error && (
                                    <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{
                                    padding: '12px',
                                    background: '#2a2a2a',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    color: '#888'
                                }}>
                                    OTP sent to {email}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    autoComplete="off"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        marginBottom: '12px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '18px',
                                        textAlign: 'center',
                                        letterSpacing: '8px'
                                    }}
                                />

                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        marginBottom: '12px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '15px'
                                    }}
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        marginBottom: '16px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '15px'
                                    }}
                                />

                                {error && (
                                    <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError(''); }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        marginTop: '12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#888',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Back to email
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
