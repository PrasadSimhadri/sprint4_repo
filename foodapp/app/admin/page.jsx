'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
                router.push('/');
            } else {
                fetchOrders();
            }
        }
    }, [user, loading]);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    }

    async function updateStatus(orderId, newStatus) {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    function getStatusColor(status) {
        switch (status) {
            case 'pending': return '#888';
            case 'confirmed': return '#3b82f6';
            case 'in_making': return '#f59e0b';
            case 'ready': return '#22c55e';
            case 'picked_up': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#888';
        }
    }

    if (loading || ordersLoading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return null;
    }

    const activeOrders = orders.filter(o => !['picked_up', 'cancelled'].includes(o.status));
    const completedOrders = orders.filter(o => ['picked_up', 'cancelled'].includes(o.status));

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '32px',
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Kitchen Dashboard
            </h1>

            <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#f97316' }}>
                    Active Orders ({activeOrders.length})
                </h2>

                {activeOrders.length === 0 ? (
                    <p style={{ color: '#888' }}>No active orders</p>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {activeOrders.map(order => (
                            <div
                                key={order.id}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                                            {order.order_number}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#888' }}>
                                            {order.user_name} - {formatTime(order.start_time)}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        background: `${getStatusColor(order.status)}20`,
                                        color: getStatusColor(order.status),
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '14px', color: '#ccc', marginBottom: '4px' }}>
                                            {item.quantity}x {item.item_name}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {order.status !== 'confirmed' && order.status !== 'in_making' && order.status !== 'ready' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'confirmed')}
                                            disabled={updating === order.id}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Confirm
                                        </button>
                                    )}
                                    {order.status !== 'in_making' && order.status !== 'ready' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'in_making')}
                                            disabled={updating === order.id}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#f59e0b',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Start Making
                                        </button>
                                    )}
                                    {order.status !== 'ready' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'ready')}
                                            disabled={updating === order.id}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#22c55e',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            Mark Ready
                                        </button>
                                    )}
                                    <button
                                        onClick={() => updateStatus(order.id, 'picked_up')}
                                        disabled={updating === order.id}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'transparent',
                                            border: '1px solid #22c55e',
                                            borderRadius: '6px',
                                            color: '#22c55e',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        Picked Up
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#888' }}>
                    Completed Orders ({completedOrders.length})
                </h2>

                {completedOrders.length === 0 ? (
                    <p style={{ color: '#666' }}>No completed orders</p>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {completedOrders.slice(0, 10).map(order => (
                            <div
                                key={order.id}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    opacity: 0.6,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: 600 }}>{order.order_number}</span>
                                    <span style={{ color: '#888', marginLeft: '12px' }}>{order.user_name}</span>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    background: `${getStatusColor(order.status)}20`,
                                    color: getStatusColor(order.status),
                                    fontSize: '12px',
                                    fontWeight: 500
                                }}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
