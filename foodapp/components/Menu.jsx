'use client';

import { useState, useEffect } from 'react';

export default function Menu({ onAddToCart, initialCart = [] }) {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(initialCart);

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        setCart(initialCart);
    }, [initialCart]);

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
            setLoading(false);
        }
    }

    function addToCart(item) {
        const existing = cart.find(c => c.id === item.id);
        let newCart;
        if (existing) {
            newCart = cart.map(c =>
                c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            );
        } else {
            newCart = [...cart, { ...item, quantity: 1 }];
        }
        setCart(newCart);
        if (onAddToCart) onAddToCart(newCart);
    }

    function removeFromCart(itemId) {
        const existing = cart.find(c => c.id === itemId);
        let newCart;
        if (existing && existing.quantity > 1) {
            newCart = cart.map(c =>
                c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
            );
        } else {
            newCart = cart.filter(c => c.id !== itemId);
        }
        setCart(newCart);
        if (onAddToCart) onAddToCart(newCart);
    }

    function getCartQuantity(itemId) {
        const item = cart.find(c => c.id === itemId);
        return item ? item.quantity : 0;
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ color: '#888' }}>Loading menu...</div>
            </div>
        );
    }

    return (
        <div>
            {menu.map(category => (
                <div key={category.id} style={{ marginBottom: '40px' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        color: '#f97316'
                    }}>
                        {category.name}
                    </h2>
                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        {category.description}
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {category.items.map(item => (
                            <div
                                key={item.id}
                                style={{
                                    background: '#1a1a1a',
                                    border: '1px solid #2a2a2a',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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
                                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{item.name}</h3>
                                    </div>
                                    <span style={{
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        color: '#22c55e'
                                    }}>
                                        ₹{item.price}
                                    </span>
                                </div>

                                <p style={{
                                    color: '#888',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                    lineHeight: '1.4'
                                }}>
                                    {item.description}
                                </p>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {item.preparation_time} mins
                                    </span>

                                    {getCartQuantity(item.id) > 0 ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            background: '#2a2a2a',
                                            borderRadius: '8px',
                                            padding: '4px 8px'
                                        }}>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#f97316',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                -
                                            </button>
                                            <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                                                {getCartQuantity(item.id)}
                                            </span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: '#f97316',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid #f97316',
                                                background: 'transparent',
                                                color: '#f97316',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
