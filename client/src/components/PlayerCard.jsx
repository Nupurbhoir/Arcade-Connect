import { motion } from 'framer-motion';
import { avatarDataUrl } from '../utils/avatar.js';

export default function PlayerCard({ player }) {
  const ready = Boolean(player?.ready);
  const team = player?.team || 'X';
  const name = player?.username || 'Player';
  const avatar = avatarDataUrl(player?.userId || name, name);

  return (
    <motion.div
      className={`playerCard team-${team} ${ready ? 'ready' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="playerRow">
        <img className="avatar" src={avatar} alt="" />
        <div className="playerInfo">
          <div className="playerTop">
            <div className="playerName">{name}</div>
            <div className="teamTag">Team {player?.team || '-'}</div>
          </div>
          <div className="playerBottom">
            <span className="mono">{player?.userId}</span>
            <span className={`readyTag ${ready ? 'on' : ''}`}>{ready ? 'Ready' : 'Not Ready'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
