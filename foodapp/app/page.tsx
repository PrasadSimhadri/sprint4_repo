export default function Home() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <section style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Order Delicious Food
        </h1>
        <p style={{ fontSize: '18px', color: '#888', marginBottom: '32px' }}>
          Select your time slot and order your favorite meals
        </p>
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>1</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Browse Menu</h3>
          <p style={{ color: '#888', fontSize: '14px' }}>Explore our delicious menu items</p>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>2</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Pick a Slot</h3>
          <p style={{ color: '#888', fontSize: '14px' }}>Choose your preferred pickup time</p>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>3</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Place Order</h3>
          <p style={{ color: '#888', fontSize: '14px' }}>Confirm and receive email confirmation</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Loading menu and time slots...
        </p>
      </div>
    </div>
  );
}
