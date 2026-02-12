'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const router = useRouter();
    const [mode, setMode] = useState(initialMode);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const { login, register } = useAuth();

    function resetForm() {
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setError('');
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    function switchMode(newMode) {
        resetForm();
        setMode(newMode);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const result = await login(email, password);
                if (result.success) {
                    resetForm();
                    onClose();
                    // Redirect admin users to admin dashboard
                    if (result.data.user.role === 'admin') {
                        router.push('/admin');
                    }
                } else {
                    setError(result.message);
                }
            } else {
                const result = await register(name, email, password, phone);
                if (result.success) {
                    const loginResult = await login(email, password);
                    if (loginResult.success) {
                        resetForm();
                        onClose();
                    }
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <>
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

                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        marginBottom: '24px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f97316, #fb923c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    <form onSubmit={handleSubmit} autoComplete="off">
                        {mode === 'register' && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="off"
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
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="new-email"
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
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                marginBottom: mode === 'login' ? '8px' : '12px',
                                background: '#0f0f0f',
                                border: '1px solid #2a2a2a',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '15px'
                            }}
                        />

                        {mode === 'login' && (
                            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => { handleClose(); setShowForgotPassword(true); }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f97316',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {mode === 'register' && (
                            <input
                                type="tel"
                                placeholder="Phone (optional)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="off"
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
                        )}

                        {error && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '14px',
                                marginBottom: '12px',
                                textAlign: 'center'
                            }}>
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
                            {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#888'
                    }}>
                        {mode === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => switchMode('register')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f97316',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => switchMode('login')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f97316',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </>
    );
}
