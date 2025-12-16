import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSocket } from '../utils/socket.js';
import { useToast } from '../context/ToastContext.jsx';
import { playSfx } from '../utils/sfx.js';

export default function MatchmakingQueue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const game = searchParams.get('game') || localStorage.getItem('ac_game') || 'Valorant-Style';
  const username = localStorage.getItem('ac_username') || '';
  const userId = localStorage.getItem('ac_userId') || '';

  const [queueLength, setQueueLength] = useState(0);
  const [queueByGame, setQueueByGame] = useState({});
  const [status, setStatus] = useState('Idle');
  const [connected, setConnected] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const required = 10;
  const teamSize = required / 2;

  const etaSeconds = useMemo(() => {
    const inMode = Number(queueByGame?.[game] || 0);
    const remaining = Math.max(0, required - inMode);
    return remaining * 8;
  }, [game, queueByGame, required]);

  useEffect(() => {
    if (!username || !userId) {
      navigate('/', { replace: true });
      return;
    }

    const socket = getSocket();

    function onConnect() {
      setConnected(true);
      toast.push({ title: 'Connection restored', message: 'Reconnected to matchmaking service', variant: 'success' });
    }

    function onDisconnect() {
      setConnected(false);
      toast.push({ title: 'Reconnecting', message: 'Trying to reconnect...', variant: 'warning' });
    }

    function onQueueUpdate(data) {
      setQueueLength(Number(data?.length || 0));
      setQueueByGame(data?.byGame || {});
    }

    function onLobbyCreated(lobby) {
      if (!lobby?.id) return;
      localStorage.setItem('ac_lobbyId', lobby.id);
      toast.push({ title: 'Match found', message: 'Joining lobby...', variant: 'success' });
      playSfx('match_found');
      navigate(`/lobby/${lobby.id}`);
    }

    socket.on('queueUpdate', onQueueUpdate);
    socket.on('lobbyCreated', onLobbyCreated);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setConnected(Boolean(socket.connected));

    setStatus('Searching');
    socket.emit('joinQueue', { userId, username, game });

    return () => {
      socket.off('queueUpdate', onQueueUpdate);
      socket.off('lobbyCreated', onLobbyCreated);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [game, navigate, userId, username]);

  const inThisGame = Number(queueByGame?.[game] || 0);
  const filled = Math.min(required, inThisGame);
  const progress = filled / required;

  const tips = [
    'Tip: Ready up instantly to start faster.',
    'Tip: Stable connections reduce lobby desync.',
    'Tip: Use a consistent username across sessions.',
    'Tip: Queueing the same mode matches you quicker.',
    'Tip: Your lobby updates in real time as players join.',
  ];

  const modes = ['Valorant-Style', 'Battle-Royale', 'Racing', 'Arcade'];

  const ringSize = 118;
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = c * progress;

  function slotLabel(i) {
    if (i < filled) return 'Locked';
    return 'Searching';
  }

  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 4200);
    return () => clearInterval(t);
  }, [tips.length]);

  function leave() {
    const socket = getSocket();
    socket.emit('leaveQueue');
    setStatus('Idle');
    navigate('/', { replace: true });
  }

  return (
    <div className="screen">
      <div className="shell">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="queueHUD">
            <div className="queueHUDTop">
              <div>
                <div className="title">Searching</div>
                <div className="subtitle">Mode: {game} / {teamSize}v{teamSize}</div>
              </div>
              <div className="row gap">
                <div className={`pill ${connected ? 'pillReady' : ''}`}>{connected ? 'Online' : 'Offline'}</div>
                <div className="pill neon">{status}</div>
              </div>
            </div>

            <div className="queueHUDMid">
              <div className="ringWrap" aria-hidden="true">
                <svg width={ringSize} height={ringSize} viewBox="0 0 120 120" className="ring">
                  <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.14)" strokeWidth="10" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r={r}
                    stroke="rgba(56,214,255,0.85)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${dash} ${c - dash}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="ringCenter">
                  <div className="ringValue">{filled}/{required}</div>
                  <div className="ringLabel">Players</div>
                </div>
              </div>

              <div className="slots">
                {Array.from({ length: required }).map((_, i) => (
                  <div key={i} className={`slot ${i < filled ? 'filled' : ''}`}>
                    <div className="slotDot" />
                    <div className="slotText">{slotLabel(i)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="queueHUDStats">
              <div className="stat">
                <div className="statLabel">Total queue</div>
                <div className="statValue">{queueLength}</div>
              </div>
              <div className="stat">
                <div className="statLabel">This mode</div>
                <div className="statValue">{inThisGame}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Estimated wait</div>
                <div className="statValue">{etaSeconds}s</div>
              </div>
            </div>

            <div className="modePanel">
              <div className="modePanelTop">
                <div className="sectionTitle">Mode Popularity</div>
                <div className="pill">Live</div>
              </div>
              <div className="modeRows">
                {modes.map((m) => {
                  const count = Number(queueByGame?.[m] || 0);
                  const active = m === game;
                  return (
                    <div key={m} className={`modeRow ${active ? 'active' : ''}`}>
                      <div className="modeName">{m}</div>
                      <div className="modeCount">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="divider" />

            <div className="row space">
              <div className="hint">{tips[tipIndex]}</div>
              <motion.button className="button" onClick={leave} whileTap={{ scale: 0.98 }}>
                Leave Queue
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
