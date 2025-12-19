'use client';

import { useState } from 'react';
import Menu from '@/components/Menu';

export default function Home() {
  const [cart, setCart] = useState([]);

  function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Our Menu
        </h1>
        <p style={{ fontSize: '16px', color: '#888' }}>
          Select items to add to your order
        </p>
      </section>

      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 100,
          cursor: 'pointer'
        }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>{getCartCount()} items</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{getCartTotal()}</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600
          }}>
            Select Slot
          </div>
        </div>
      )}

      <Menu onAddToCart={setCart} />
    </div>
  );
}
