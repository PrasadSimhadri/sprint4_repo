'use client';

import { useState } from 'react';
import Menu from '@/components/Menu';
import SlotPicker from '@/components/SlotPicker';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  available: number;
}

export default function Home() {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState(1);
  const [showEditCart, setShowEditCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; slotTime: string } | null>(null);

  function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  async function reserveSlot(slotId: number) {
    try {
      await fetch('/api/slots/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, action: 'reserve' })
      });
    } catch (error) {
      console.error('Failed to reserve slot:', error);
    }
  }

  async function releaseSlot(slotId: number) {
    try {
      await fetch('/api/slots/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, action: 'release' })
      });
    } catch (error) {
      console.error('Failed to release slot:', error);
    }
  }

  async function handleSelectSlot(slot: Slot) {
    if (selectedSlot && selectedSlot.id !== slot.id) {
      await releaseSlot(selectedSlot.id);
    }
    await reserveSlot(slot.id);
    setSelectedSlot(slot);
  }

  function proceedToSlots() {
    if (cart.length > 0) {
      setStep(2);
    }
  }

  async function backToMenu() {
    if (selectedSlot) {
      await releaseSlot(selectedSlot.id);
      setSelectedSlot(null);
    }
    setStep(1);
    setShowEditCart(false);
  }

  function updateCartItem(itemId: number, change: number) {
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    setCart(newCart);
  }

  function removeFromCart(itemId: number) {
    setCart(cart.filter(item => item.id !== itemId));
  }

  function formatTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  function handlePlaceOrderClick() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedSlot || cart.length === 0) return;
    setShowConfirmModal(true);
  }

  async function confirmAndPlaceOrder() {
    if (!selectedSlot || cart.length === 0) return;

    setOrderLoading(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();

      if (data.success) {
        setOrderSuccess({
          orderNumber: data.data.orderNumber,
          slotTime: data.data.slotTime
        });
        setCart([]);
        setSelectedSlot(null);
        setStep(1);
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  }

  if (orderSuccess) {
    return (
      <div style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
          color: '#fff'
        }}>
          ✓
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '16px',
          color: '#22c55e'
        }}>
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          Your order confirmation has been sent to your email.
        </p>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#888' }}>Order Number</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f97316' }}>
              {orderSuccess.orderNumber}
            </div>
          </div>
          <div>
            <span style={{ color: '#888' }}>Pickup Time</span>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>
              {orderSuccess.slotTime}
            </div>
          </div>
        </div>

        <button
          onClick={() => setOrderSuccess(null)}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '150px' }}>
      <section style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {step === 1 ? 'Our Menu' : 'Select Time Slot'}
        </h1>
        <p style={{ fontSize: '16px', color: '#888' }}>
          {step === 1 ? 'Select items to add to your order' : 'Choose your pickup time'}
        </p>
      </section>

      {step === 2 && (
        <button
          onClick={backToMenu}
          style={{
            marginBottom: '24px',
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Back to Menu
        </button>
      )}

      {step === 1 ? (
        <Menu onAddToCart={setCart} />
      ) : (
        <SlotPicker onSelectSlot={handleSelectSlot} selectedSlot={selectedSlot} />
      )}

      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: showEditCart ? '380px' : 'auto',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {showEditCart && (
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '16px',
              borderBottom: '1px solid #2a2a2a'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Edit Order</h3>
                <button
                  onClick={() => setShowEditCart(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  x
                </button>
              </div>

              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #2a2a2a'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#22c55e' }}>₹{item.price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => updateCartItem(item.id, -1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#2a2a2a',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItem(item.id, 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#f97316',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginLeft: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>{getCartCount()} items</div>
              <div style={{ fontSize: '22px', fontWeight: 700, marginRight: '10px' }}>₹{getCartTotal()}</div>
              {selectedSlot && (
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                  Slot #{selectedSlot.id} - {formatTime(selectedSlot.startTime)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {step === 2 && (
                <button
                  onClick={() => setShowEditCart(!showEditCart)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {showEditCart ? 'Done' : 'Edit'}
                </button>
              )}

              {step === 1 ? (
                <button
                  onClick={proceedToSlots}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Select Slot
                </button>
              ) : selectedSlot ? (
                <button
                  onClick={handlePlaceOrderClick}
                  disabled={orderLoading}
                  style={{
                    background: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    color: '#f97316',
                    cursor: orderLoading ? 'not-allowed' : 'pointer',
                    opacity: orderLoading ? 0.7 : 1
                  }}
                >
                  {orderLoading ? 'Placing...' : 'Place Order'}
                </button>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  Pick a slot
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && selectedSlot && (
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
            maxWidth: '420px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Confirm Your Order
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #2a2a2a',
                color: '#888',
                fontSize: '14px'
              }}>
                <span>Pickup Time</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>
                  {formatTime(selectedSlot.startTime)}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>
                Order Items
              </h4>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    fontSize: '14px'
                  }}
                >
                  <span>{item.quantity}x {item.name}</span>
                  <span style={{ color: '#22c55e' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderTop: '1px solid #2a2a2a',
              fontSize: '18px',
              fontWeight: 700
            }}>
              <span>Total</span>
              <span style={{ color: '#22c55e' }}>₹{getCartTotal()}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAndPlaceOrder}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600
                }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}