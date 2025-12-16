// COPY THIS CODE AND PASTE IT INTO YOUR LOBBY.JSX FILE
// Paste this right after the lobbyHeader div closes (around line 615)

<div style={{
  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '20px',
  textAlign: 'center',
  border: '2px solid #ff8c42',
  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
  position: 'relative',
  zIndex: 1000
}}>
  <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
    🎮 DEMO MODE ACTIVATED
  </div>
  <button 
    onClick={() => {
      console.log('🎮 SUPER VISIBLE DEMO BUTTON CLICKED!');
      alert('Demo button clicked! Check console for details.');
      // Call startDemo() function here
      if (typeof startDemo === 'function') {
        startDemo();
      } else {
        console.log('startDemo function not found');
        // Manually trigger demo sequence
        const demoPlayers = [
          { userId: 'demo1', username: 'Phoenix', team: 'A', ready: false },
          { userId: 'demo2', username: 'Viper', team: 'A', ready: false },
          { userId: 'demo3', username: 'Jett', team: 'A', ready: false },
          { userId: 'demo4', username: 'Sage', team: 'A', ready: false },
          { userId: 'demo5', username: 'Reyna', team: 'B', ready: false },
          { userId: 'demo6', username: 'Omen', team: 'B', ready: false },
          { userId: 'demo7', username: 'Brimstone', team: 'B', ready: false },
          { userId: 'demo8', username: 'Cypher', team: 'B', ready: false },
          { userId: 'demo9', username: 'Sova', team: 'B', ready: false }
        ];
        
        console.log('Adding demo players to lobby...');
        setLobby(prev => ({
          ...prev,
          players: [...(prev?.players || []), ...demoPlayers]
        }));
        
        setCountdown(10);
        setTimeout(() => navigate('/game-demo'), 3000);
      }
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
    🚀 START DEMO NOW
  </button>
</div>
