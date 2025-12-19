'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function OrderCard({ order, updating, updateStatus, formatTime, getStatusColor, getUrgencyColor }) {
    const [expanded, setExpanded] = useState(false);
    const itemsToShow = expanded ? order.items : order.items?.slice(0, 2);
    const hasMore = order.items?.length > 2;

    return (
        <div
            style={{
                background: '#1a1a1a',
                border: order.needsAction ? `2px solid ${getUrgencyColor(order.urgency)}` : '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '16px',
                height: expanded ? 'auto' : '220px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>
                        {order.order_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {order.user_name} - {formatTime(order.start_time)}
                    </div>
                    {order.minsToPickup !== undefined && (
                        <div style={{
                            fontSize: '11px',
                            color: getUrgencyColor(order.urgency),
                            marginTop: '2px',
                            fontWeight: 600
                        }}>
                            {order.minsToPickup <= 0 ? 'PICKUP NOW' :
                                order.minsToPickup >= 60
                                    ? `${Math.floor(order.minsToPickup / 60)}h ${order.minsToPickup % 60}m`
                                    : `${order.minsToPickup}m to pickup`}
                        </div>
                    )}
                </div>
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    {order.status.replace('_', ' ')}
                </span>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', marginBottom: '12px' }}>
                {itemsToShow?.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#ccc', marginBottom: '2px' }}>
                        {item.quantity}x {item.item_name}
                    </div>
                ))}
                {hasMore && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f97316',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: 0,
                            marginTop: '4px'
                        }}
                    >
                        {expanded ? 'Show less' : `+${order.items.length - 2} more items`}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {order.status === 'confirmed' && (
                    <button
                        onClick={() => updateStatus(order.id, 'in_making')}
                        disabled={updating === order.id}
                        style={{
                            padding: '6px 12px',
                            background: order.suggestedStatus === 'in_making' ? '#f59e0b' : 'transparent',
                            border: order.suggestedStatus === 'in_making' ? 'none' : '1px solid #f59e0b',
                            borderRadius: '6px',
                            color: order.suggestedStatus === 'in_making' ? '#fff' : '#f59e0b',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: order.suggestedStatus === 'in_making' ? 600 : 400
                        }}
                    >
                        Making
                    </button>
                )}
                {(order.status === 'confirmed' || order.status === 'in_making') && (
                    <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        disabled={updating === order.id}
                        style={{
                            padding: '6px 12px',
                            background: order.suggestedStatus === 'ready' ? '#22c55e' : 'transparent',
                            border: order.suggestedStatus === 'ready' ? 'none' : '1px solid #22c55e',
                            borderRadius: '6px',
                            color: order.suggestedStatus === 'ready' ? '#fff' : '#22c55e',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: order.suggestedStatus === 'ready' ? 600 : 400
                        }}
                    >
                        Ready
                    </button>
                )}
                <button
                    onClick={() => updateStatus(order.id, 'picked_up')}
                    disabled={updating === order.id}
                    style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid #22c55e',
                        borderRadius: '6px',
                        color: '#22c55e',
                        cursor: 'pointer',
                        fontSize: '11px'
                    }}
                >
                    Picked
                </button>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [autoUpdating, setAutoUpdating] = useState(false);
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!loading) {
            if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
                router.push('/');
            } else {
                fetchOrders();
            }
        }
    }, [user, loading]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
            if (!autoUpdating) {
                fetchTimingInfo();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [autoUpdating]);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
                fetchTimingInfo();
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    }

    async function fetchTimingInfo() {
        try {
            const res = await fetch('/api/orders/auto-update', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prevOrders => {
                    return prevOrders.map(order => {
                        const timing = data.data.find(t => t.id === order.id);
                        if (timing) {
                            return { ...order, ...timing };
                        }
                        return order;
                    });
                });
            }
        } catch (error) {
            console.error('Failed to fetch timing:', error);
        }
    }

    async function runAutoUpdate() {
        setAutoUpdating(true);
        try {
            const res = await fetch('/api/orders/auto-update', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                alert(`Updated ${data.data.length} order(s) automatically`);
                fetchOrders();
            } else {
                alert('No orders needed updating');
            }
        } catch (error) {
            alert('Failed to run auto-update');
        } finally {
            setAutoUpdating(false);
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

    function getUrgencyColor(urgency) {
        switch (urgency) {
            case 'critical': return '#ef4444';
            case 'high': return '#f59e0b';
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Kitchen Dashboard
                </h1>
                <button
                    onClick={runAutoUpdate}
                    disabled={autoUpdating}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: autoUpdating ? 0.7 : 1
                    }}
                >
                    {autoUpdating ? 'Updating...' : 'Auto-Update Statuses'}
                </button>
            </div>

            <div style={{
                padding: '12px 16px',
                background: '#1a1a1a',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '13px',
                color: '#888'
            }}>
                <strong style={{ color: '#f97316' }}>Auto Rules:</strong>
                <span style={{ marginLeft: '12px' }}>15min → Making</span>
                <span style={{ marginLeft: '16px' }}>2min → Ready</span>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#f97316' }}>
                    Active Orders ({activeOrders.length})
                </h2>

                {activeOrders.length === 0 ? (
                    <p style={{ color: '#888' }}>No active orders</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {activeOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                updating={updating}
                                updateStatus={updateStatus}
                                formatTime={formatTime}
                                getStatusColor={getStatusColor}
                                getUrgencyColor={getUrgencyColor}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#888' }}>
                    Completed ({completedOrders.length})
                </h2>

                {completedOrders.length === 0 ? (
                    <p style={{ color: '#666' }}>No completed orders</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {completedOrders.slice(0, 9).map(order => (
                            <div
                                key={order.id}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    opacity: 0.6
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{order.order_number}</span>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        background: `${getStatusColor(order.status)}20`,
                                        color: getStatusColor(order.status),
                                        fontSize: '10px',
                                        fontWeight: 500
                                    }}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                    {order.user_name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
