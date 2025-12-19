'use client';

import { useState, useEffect } from 'react';

export default function SlotPicker({ onSelectSlot, selectedSlot }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSlots();
    }, []);

    async function fetchSlots() {
        try {
            const res = await fetch('/api/slots');
            const data = await res.json();
            if (data.success) {
                setSlots(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function getSlotStyles(slot) {
        if (slot.isDisabled) {
            return {
                background: 'linear-gradient(135deg, #f06161ff, #dc2626)',
                border: '2px solid #ef4444',
                opacity: 0.5
            };
        }
        if (slot.status === 'full') {
            return {
                background: 'linear-gradient(135deg, #f07c7cff, #e17474ff)',
                border: '2px solid #ef4444',
                opacity: 0.5
            };
        }
        if (slot.status === 'almost_full') {
            return {
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: '2px solid #f59e0b'
            };
        }
        return {
            background: 'linear-gradient(135deg, #0c6c2fff, #059439ff)',
            border: '2px solid #6b8274ff'
        };
    }

    const groupedSlots = slots.reduce((acc, slot) => {
        const dateKey = slot.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {});

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ color: '#888' }}>Loading time slots...</div>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '20px',
                color: '#fff'
            }}>
                Select Pickup Time
            </h2>

            <div style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '32px',
                flexWrap: 'wrap',
                padding: '16px',
                background: '#1a1a1a',
                borderRadius: '12px',
                border: '1px solid #2a2a2a'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '32px',
                        height: '20px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)'
                    }}></span>
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '32px',
                        height: '20px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                    }}></span>
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>Almost Full</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '32px',
                        height: '20px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        opacity: 0.5
                    }}></span>
                    <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>Full / Passed</span>
                </div>
            </div>

            {Object.keys(groupedSlots).length === 0 ? (
                <p style={{ color: '#888' }}>No slots available</p>
            ) : (
                Object.entries(groupedSlots).map(([date, dateSlots]) => (
                    <div key={date} style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            marginBottom: '16px',
                            color: '#f97316'
                        }}>
                            {formatDate(date)}
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '14px'
                        }}>
                            {dateSlots.map(slot => {
                                const styles = getSlotStyles(slot);
                                const isSelected = selectedSlot?.id === slot.id;

                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => !slot.isDisabled && onSelectSlot && onSelectSlot(slot)}
                                        disabled={slot.isDisabled}
                                        style={{
                                            padding: '18px 14px',
                                            borderRadius: '12px',
                                            border: isSelected ? '3px solid #fff' : styles.border,
                                            background: styles.background,
                                            cursor: slot.isDisabled ? 'not-allowed' : 'pointer',
                                            opacity: styles.opacity || 1,
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: isSelected ? '0 8px 25px rgba(249, 115, 22, 0.4)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.7)',
                                            marginBottom: '4px',
                                            fontWeight: 500
                                        }}>
                                            Slot #{slot.id}
                                        </div>
                                        <div style={{
                                            fontSize: '17px',
                                            fontWeight: 700,
                                            color: '#fff',
                                            marginBottom: '6px'
                                        }}>
                                            {formatTime(slot.startTime)}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: 'rgba(255,255,255,0.9)',
                                            fontWeight: 600
                                        }}>
                                            {slot.isDisabled
                                                ? (slot.status === 'full' ? 'FULL' : 'PASSED')
                                                : `${slot.available} slots left`
                                            }
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
