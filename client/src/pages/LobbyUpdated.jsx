import LobbyDemoButton from './LobbyDemoButton.jsx';

// Add this import at the top of your Lobby.jsx file

// Replace the existing countdown timer section with this:
/*
{countdown !== null && (
  <div className="countdownTimer">
    <div className="countdownLabel">MATCH STARTING</div>
    <div className="countdownValue">{countdown}s</div>
  </div>
)}
*/

// Add this prominent demo button at the top of the lobby controls section:
/*
<LobbyDemoButton onClick={startDemo} countdown={countdown} />
*/

// Replace the existing "Start Demo" button in the lobbyActionRow with this smaller version:
/*
<motion.button className="button accent" onClick={startDemo} whileTap={{ scale: 0.98 }}>
  Quick Demo
</motion.button>
*/
