'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function Header() {
    const { user, loading, logout } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    function handleLogout() {
        logout();
        setShowLogoutConfirm(false);
    }

    return (
        <>
            <header style={{
                background: '#1a1a1a',
                borderBottom: '1px solid #2a2a2a',
                padding: '16px 0',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 20px'
                }}>
                    <Link href="/" style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #f97316, #fb923c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textDecoration: 'none'
                    }}>
                        FoodApp
                    </Link>

                    <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>Menu</Link>

                        {!loading && user && (
                            <>
                                <Link href="/orders" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>My Orders</Link>
                                {(user.role === 'admin' || user.role === 'staff') && (
                                    <Link href="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
                                )}
                            </>
                        )}

                        {loading ? (
                            <span style={{ color: '#666', fontSize: '14px' }}>...</span>
                        ) : user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    fontSize: '13px',
                                    color: '#888',
                                    padding: '6px 12px',
                                    background: '#2a2a2a',
                                    borderRadius: '20px'
                                }}>
                                    {user.name}
                                    {user.role !== 'customer' && (
                                        <span style={{
                                            marginLeft: '6px',
                                            fontSize: '11px',
                                            color: '#f97316',
                                            textTransform: 'uppercase'
                                        }}>
                                            ({user.role})
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'transparent',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#888',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}
                            >
                                Login
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

            {showLogoutConfirm && (
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
                        textAlign: 'center',
                        maxWidth: '360px'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
                            Confirm Logout
                        </h3>
                        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
                            Are you sure you want to logout?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                style={{
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#888',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '12px 24px',
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
