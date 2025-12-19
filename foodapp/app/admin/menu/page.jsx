'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminMenuPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();
    const [menu, setMenu] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const emptyItem = {
        name: '',
        description: '',
        price: '',
        category_id: 1,
        preparation_time: 15,
        is_vegetarian: true,
        is_available: true
    };

    const [formData, setFormData] = useState(emptyItem);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
            } else {
                fetchMenu();
            }
        }
    }, [user, loading]);

    async function fetchMenu() {
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            if (data.success) {
                setMenu(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch menu:', error);
        } finally {
            setMenuLoading(false);
        }
    }

    async function handleSave() {
        if (!formData.name || !formData.price) {
            alert('Name and price are required');
            return;
        }

        setSaving(true);
        try {
            const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
            const method = editingItem ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });

            const data = await res.json();
            if (data.success) {
                fetchMenu();
                closeModal();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    }

    async function toggleAvailability(item) {
        try {
            await fetch(`/api/menu/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_available: !item.is_available })
            });
            fetchMenu();
        } catch (error) {
            alert('Failed to update');
        }
    }

    function openEditModal(item) {
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category_id: item.category_id,
            preparation_time: item.preparation_time,
            is_vegetarian: item.is_vegetarian,
            is_available: item.is_available
        });
        setEditingItem(item);
        setShowAddModal(true);
    }

    function openAddModal() {
        setFormData(emptyItem);
        setEditingItem(null);
        setShowAddModal(true);
    }

    function closeModal() {
        setShowAddModal(false);
        setEditingItem(null);
        setFormData(emptyItem);
    }

    if (loading || menuLoading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

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
                    Menu Management
                </h1>
                <button
                    onClick={openAddModal}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600
                    }}
                >
                    + Add New Dish
                </button>
            </div>

            {menu.map(category => (
                <div key={category.id} style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f97316', marginBottom: '16px' }}>
                        {category.name}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {category.items.map(item => (
                            <div
                                key={item.id}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    opacity: item.is_available ? 1 : 0.5
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: '14px',
                                                height: '14px',
                                                border: `2px solid ${item.is_vegetarian ? '#22c55e' : '#ef4444'}`,
                                                borderRadius: '3px',
                                                position: 'relative'
                                            }}
                                        >
                                            <span style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '6px',
                                                height: '6px',
                                                background: item.is_vegetarian ? '#22c55e' : '#ef4444',
                                                borderRadius: item.is_vegetarian ? '50%' : '0',
                                                clipPath: item.is_vegetarian ? 'none' : 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                            }}></span>
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '15px' }}>{item.name}</span>
                                    </div>
                                    <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '14px' }}>₹{item.price}</span>
                                </div>

                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', lineHeight: 1.4 }}>
                                    {item.description}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#666' }}>{item.preparation_time} mins</span>
                                    {!item.is_available && (
                                        <span style={{
                                            fontSize: '10px',
                                            background: '#ef4444',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            UNAVAILABLE
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button
                                        onClick={() => toggleAvailability(item)}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: 'transparent',
                                            border: `1px solid ${item.is_available ? '#ef4444' : '#22c55e'}`,
                                            borderRadius: '6px',
                                            color: item.is_available ? '#ef4444' : '#22c55e',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {item.is_available ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(item)}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: '#2a2a2a',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showAddModal && (
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
                        padding: '28px',
                        width: '100%',
                        maxWidth: '480px'
                    }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
                            {editingItem ? 'Edit Dish' : 'Add New Dish'}
                        </h2>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <input
                                type="text"
                                placeholder="Dish Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    padding: '12px 16px',
                                    background: '#0f0f0f',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '15px'
                                }}
                            />

                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                style={{
                                    padding: '12px 16px',
                                    background: '#0f0f0f',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '15px',
                                    resize: 'none'
                                }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    style={{
                                        padding: '12px 16px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '15px'
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Prep Time (mins)"
                                    value={formData.preparation_time}
                                    onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                                    style={{
                                        padding: '12px 16px',
                                        background: '#0f0f0f',
                                        border: '1px solid #2a2a2a',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                                style={{
                                    padding: '12px 16px',
                                    background: '#0f0f0f',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '15px'
                                }}
                            >
                                {menu.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', gap: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_vegetarian}
                                        onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '14px' }}>Vegetarian</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '14px' }}>Available</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '8px',
                                    color: '#888',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
