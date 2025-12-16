// Add this at the VERY TOP of the lobbyControls div - right after lobbyHeader div closes

<div className="demoButtonContainer" style={{ 
  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '20px',
  textAlign: 'center',
  border: '2px solid #ff8c42',
  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
}}>
  <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
    🎮 DEMO MODE - CLICK TO START
  </div>
  <button 
    onClick={() => {
      console.log('🎮 SUPER VISIBLE DEMO BUTTON CLICKED!');
      alert('Demo button clicked! Check console for details.');
      // Add your startDemo() function call here
    }}
    style={{
      background: 'white',
      color: '#ff6b35',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
  >
    START DEMO NOW
  </button>
</div>
