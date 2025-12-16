import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSocket } from '../utils/socket.js';
import { useToast } from '../context/ToastContext.jsx';
import { playSfx } from '../utils/sfx.js';

export default function GameDemo() {
  const navigate = useNavigate();
  const toast = useToast();
  const [gameState, setGameState] = useState('loading');
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [timeLeft, setTimeLeft] = useState(120);
  const [players, setPlayers] = useState([]);
  const [gameMode, setGameMode] = useState('');

  useEffect(() => {
    // Get game info from localStorage
    const game = localStorage.getItem('ac_game') || 'Tactical Arena';
    const username = localStorage.getItem('ac_username') || 'Player';
    const userId = localStorage.getItem('ac_userId') || '';

    setGameMode(game);

    // Simulate game loading
    setTimeout(() => {
      setGameState('playing');
      playSfx('start');
      
      // Simulate players
      setPlayers([
        { name: username, team: 'A', isMe: true },
        { name: 'Phoenix', team: 'A' },
        { name: 'Viper', team: 'A' },
        { name: 'Jett', team: 'A' },
        { name: 'Sage', team: 'A' },
        { name: 'Reyna', team: 'B' },
        { name: 'Omen', team: 'B' },
        { name: 'Brimstone', team: 'B' },
        { name: 'Cypher', team: 'B' },
        { name: 'Sova', team: 'B' }
      ]);

      // Start game timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate scoring
      const scoreInterval = setInterval(() => {
        setScore((prev) => {
          const newScore = { ...prev };
          if (Math.random() > 0.6) {
            newScore.teamA += Math.floor(Math.random() * 3) + 1;
          }
          if (Math.random() > 0.6) {
            newScore.teamB += Math.floor(Math.random() * 3) + 1;
          }
          return newScore;
        });
      }, 3000);

      return () => {
        clearInterval(timer);
        clearInterval(scoreInterval);
      };
    }, 2000);
  }, []);

  function endGame() {
    setGameState('ended');
    playSfx('complete');
    
    const winner = score.teamA > score.teamB ? 'Team A' : 'Team B';
    toast.push({ 
      title: 'Game Over!', 
      message: `${winner} wins with ${Math.max(score.teamA, score.teamB)} points!`, 
      variant: 'success' 
    });

    // Auto-redirect after 5 seconds
    setTimeout(() => {
      navigate('/lobby');
    }, 5000);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (gameState === 'loading') {
    return (
      <div className="screen">
        <div className="shell wide">
          <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gameDemoLoading">
              <div className="loading" />
              <div className="title">Loading Game...</div>
              <div className="subtitle">Preparing {gameMode} match</div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const winner = score.teamA > score.teamB ? 'Team A' : 'Team B';
    const winnerScore = Math.max(score.teamA, score.teamB);
    
    return (
      <div className="screen">
        <div className="shell wide">
          <motion.div className="card gameDemoResult" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="gameDemoResultHeader">
              <div className="title">Game Over!</div>
              <div className="subtitle">{winner} Wins!</div>
            </div>
            <div className="gameDemoFinalScore">
              <div className="scoreTeam">
                <div className="scoreLabel">Team A</div>
                <div className="scoreValue">{score.teamA}</div>
              </div>
              <div className="scoreSeparator">VS</div>
              <div className="scoreTeam">
                <div className="scoreLabel">Team B</div>
                <div className="scoreValue">{score.teamB}</div>
              </div>
            </div>
            <div className="gameDemoStats">
              <div className="stat">Final Score: {winnerScore}</div>
              <div className="stat">Game Mode: {gameMode}</div>
              <div className="stat">Players: {players.length}</div>
            </div>
            <div className="gameDemoActions">
              <button className="button primary" onClick={() => navigate('/play')}>
                Play Again
              </button>
              <button className="button" onClick={() => navigate('/lobby')}>
                Back to Lobby
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div className="card gameDemo" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="gameDemoHeader">
            <div className="gameDemoInfo">
              <div className="title">{gameMode}</div>
              <div className="subtitle">Live Match</div>
            </div>
            <div className="gameDemoTimer">
              <div className="timerValue">{formatTime(timeLeft)}</div>
              <div className="timerLabel">Time Left</div>
            </div>
          </div>

          <div className="gameDemoScore">
            <div className="scoreTeam">
              <div className="scoreLabel">Team A</div>
              <div className="scoreValue">{score.teamA}</div>
            </div>
            <div className="scoreSeparator">VS</div>
            <div className="scoreTeam">
              <div className="scoreLabel">Team B</div>
              <div className="scoreValue">{score.teamB}</div>
            </div>
          </div>

          <div className="gameDemoPlayers">
            <div className="playersSection">
              <div className="sectionTitle">Team A</div>
              <div className="playersList">
                {players.filter(p => p.team === 'A').map((player, idx) => (
                  <div key={idx} className={`playerSlot ${player.isMe ? 'me' : ''}`}>
                    <div className="playerName">{player.name} {player.isMe && '(You)'}</div>
                    <div className="playerStatus">Active</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="playersSection">
              <div className="sectionTitle">Team B</div>
              <div className="playersList">
                {players.filter(p => p.team === 'B').map((player, idx) => (
                  <div key={idx} className="playerSlot">
                    <div className="playerName">{player.name}</div>
                    <div className="playerStatus">Active</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gameDemoActions">
            <button className="button" onClick={() => navigate('/lobby')}>
              Leave Game
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
