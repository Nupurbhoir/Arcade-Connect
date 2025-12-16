import { motion } from 'framer-motion';

export default function LobbyDemoButton({ onClick, countdown }) {
  return (
    <div className="demoButtonContainer">
      {countdown !== null && (
        <div className="countdownTimer">
          <div className="countdownLabel">MATCH STARTING</div>
          <div className="countdownValue">{countdown}s</div>
        </div>
      )}
      
      <motion.button 
        className="button demoButton" 
        onClick={onClick} 
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="demoButtonText">🎮 START DEMO</span>
        <div className="demoButtonSubtext">Auto-fill lobby & start game</div>
      </motion.button>
    </div>
  );
}
