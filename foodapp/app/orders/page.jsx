'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
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

    async function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setCancelling(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to cancel order');
        } finally {
            setCancelling(null);
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

    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    function canCancel(order) {
        if (['cancelled', 'ready', 'picked_up'].includes(order.status)) return false;
        const deadline = new Date(order.cancellation_deadline);
        return new Date() < deadline;
    }

    function getRemainingCancelTime(order) {
        if (!canCancel(order)) return null;
        const deadline = new Date(order.cancellation_deadline);
        const remaining = Math.max(0, Math.floor((deadline - new Date()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    if (!user) return null;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '32px',
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ color: '#888', marginBottom: '20px' }}>No orders yet</p>
                    <a
                        href="/"
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            borderRadius: '8px',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        Order Now
                    </a>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {orders.map(order => (
                        <div
                            key={order.id}
                            style={{
                                background: '#1a1a1a',
                                border: '1px solid #2a2a2a',
                                borderRadius: '12px',
                                padding: '20px',
                                opacity: order.status === 'cancelled' ? 0.6 : 1
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                                        {order.order_number}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#888' }}>
                                        {formatDate(order.slot_date)} at {formatTime(order.start_time)}
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
                                        {item.quantity}x {item.item_name} - ₹{item.subtotal}
                                    </div>
                                ))}
                                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 600, color: '#22c55e' }}>
                                    Total: ₹{order.total_amount}
                                </div>
                            </div>

                            {canCancel(order) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => cancelOrder(order.id)}
                                        disabled={cancelling === order.id}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'transparent',
                                            border: '1px solid #ef4444',
                                            borderRadius: '6px',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }}
                                    >
                                        {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                    <span style={{ fontSize: '12px', color: '#888' }}>
                                        Cancel within: {getRemainingCancelTime(order)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
