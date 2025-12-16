import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSocket } from '../utils/socket.js';
import PlayerCard from '../components/PlayerCard.jsx';
import LobbyChat from '../components/LobbyChat.jsx';
import LobbyNotifications from '../components/LobbyNotifications.jsx';
import LobbyInviteModal from '../components/LobbyInviteModal.jsx';
import bannerUrl from '../assets/lobby-banner.svg';
import teamAUrl from '../assets/team-a.svg';
import teamBUrl from '../assets/team-b.svg';
import { useToast } from '../context/ToastContext.jsx';
import { playSfx } from '../utils/sfx.js';

export default function Lobby() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const username = localStorage.getItem('ac_username') || '';
  const userId = localStorage.getItem('ac_userId') || '';

  const [lobby, setLobby] = useState(null);
  const [message, setMessage] = useState('');
  const [sideTab, setSideTab] = useState('chat');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activity, setActivity] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const prevPlayersRef = useRef([]);
  const seededActivityRef = useRef(false);

  const [musicEnabled, setMusicEnabled] = useState(() => localStorage.getItem('ac_music') !== '0');
  const [sfxEnabled, setSfxEnabled] = useState(() => localStorage.getItem('ac_sfx') !== '0');

  const gameThumbByKey = {
    tactical: 'https://images.squarespace-cdn.com/content/v1/6452911eae14586fe9375ab1/8e672e6b-3125-4adb-a9ca-1fdd4e58eac0/TTA-SocialShare.jpg',
    battle: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s',
    racing: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoteCVIgYpIBFv8sR5vtEqFReXn1e3Zv19Aw&s',
    sports: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCAhboVMls22oiWPe8Z81Wh2E4hT0arQM5jw&s',
    puzzle: 'https://static-perf1.zupee.com/blog-images/uploads/2022/03/brain-games-mind-teasers.webp',
    fps: 'https://www.gamespot.com/a/uploads/scale_landscape/123/1239113/4492451-gameslikecallofduty2025.jpg',
    strategy: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3LDOloxQdRID_FMQLHJwp156WrY8hh3NYdg&s',
    rpg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVQwQwVyj1ws25okqT_qetfXAW1UcQ-YSoUA&s',
    arcade: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnbL4LVb30f3xqe98vOB8ioaFqqhC1D1JV5A&s',
    fighting: 'https://xboxmedia.ign.com/xbox/image/article/566/566197/fight-club-20041115041935330-000.jpg?width=1280&height=720&fit=bounds&format=jpg&auto=webp&quality=80',
    survival: 'https://xforgeassets001.xboxlive.com/pf-title-b63a0803d3653643-20ca2/7a86dbad-3f89-49ad-88f2-9f31a7454f9f9f/SurvivalSpecialists_Thumbnail_0.jpg',
    moba: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s'
  };

  function imageKeyFromGame(name) {
    const key = name?.toLowerCase().replace(/[^a-z]/g, '');
    return gameThumbByKey[key] || gameThumbByKey.arcade;
  }

  function gameNameFromKey(key) {
    const names = {
      tactical: 'Tactical Arena',
      battle: 'Battle Royale',
      racing: 'Speed Rush',
      sports: 'Sports League',
      puzzle: 'Fantasy Quest',
      fps: 'FPS Combat',
      strategy: 'Command & Conquer',
      rpg: 'Dragon Quest',
      arcade: 'Retro Arcade',
      fighting: 'Fight Club',
      survival: 'Survival Mode',
      moba: 'Mobile Arena'
    };
    return names[key] || 'Unknown Game';
  }

  const gameName = useMemo(() => gameNameFromKey(lobby?.game), [lobby?.game]);
  const gameThumb = useMemo(() => imageKeyFromGame(lobby?.game), [lobby?.game]);

  const teamSize = useMemo(() => {
    if (!lobby?.players?.length) return 5;
    const teamACount = lobby.players.filter(p => p.team === 'A').length;
    const teamBCount = lobby.players.filter(p => p.team === 'B').length;
    return Math.max(teamACount, teamBCount);
  }, [lobby?.players]);

  const me = useMemo(() => {
    if (!lobby?.players?.length || !userId) return null;
    return lobby.players.find((p) => p.userId === userId) || null;
  }, [lobby?.players, userId]);

  const teamA = useMemo(() => lobby?.players?.filter(p => p.team === 'A') || [], [lobby?.players]);
  const teamB = useMemo(() => lobby?.players?.filter(p => p.team === 'B') || [], [lobby?.players]);

  const lobbyCapacity = teamSize * 2;
  const totalPlayers = lobby?.players?.length || 0;
  const readyCount = lobby?.players?.filter(p => p.ready).length || 0;
  const readyA = teamA.filter(p => p.ready).length;
  const readyB = teamB.filter(p => p.ready).length;
  const playersNeeded = Math.max(0, lobbyCapacity - totalPlayers);

  const readyToStart = totalPlayers === lobbyCapacity && readyCount === totalPlayers && totalPlayers > 0;

  function openInvite() {
    setInviteOpen(true);
  }

  async function copyLobbyId() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(lobbyId));
        toast.push({ title: 'Copied', message: 'Lobby ID copied to clipboard', variant: 'success' });
      } else {
        const ta = document.createElement('textarea');
        ta.value = String(lobbyId);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast.push({ title: 'Copied', message: 'Lobby ID copied to clipboard', variant: 'success' });
      }
      if (sfxEnabled) playSfx('click');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.push({ title: 'Error', message: 'Failed to copy lobby ID', variant: 'error' });
    }
  }

  function toggleReady() {
    const socket = getSocket();
    socket.emit('toggleReady', { lobbyId });
  }

  function startDemo() {
    console.log('🎮 STARTING DEMO - Manual trigger activated!');
    
    // Start countdown immediately
    const countdownTime = Math.floor(Math.random() * 6) + 10; // 10-15 seconds
    setCountdown(countdownTime);
    console.log('⏰ Countdown started:', countdownTime + ' seconds');
    
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

    // Add demo players immediately
    console.log('👥 Adding demo players to lobby...');
    setLobby(prev => {
      const newLobby = {
        ...prev,
        players: [...(prev?.players || []), ...demoPlayers]
      };
      console.log('✅ Updated lobby with demo players:', newLobby);
      return newLobby;
    });

    // Add activity feed entries
    const newActivity = demoPlayers.map(player => ({
      id: `join_${player.userId}`,
      type: 'join',
      message: `${player.username} joined the lobby`,
      at: new Date().toISOString()
    }));
    
    setActivity(prev => [...newActivity, ...prev].slice(0, 10));

    // Auto-ready some players after 3 seconds
    setTimeout(() => {
      console.log('🟢 Auto-readying demo players...');
      setLobby(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.userId === 'demo1' || p.userId === 'demo5' || p.userId === 'demo9' 
            ? { ...p, ready: true } 
            : p
        )
      }));
      
      setActivity(prev => [
        {
          id: 'ready_demo1',
          type: 'ready',
          message: 'Phoenix is ready',
          at: new Date().toISOString()
        },
        {
          id: 'ready_demo5', 
          type: 'ready',
          message: 'Reyna is ready',
          at: new Date().toISOString()
        },
        ...prev
      ].slice(0, 10));
    }, 3000);

    // Auto-ready more players after 5 seconds
    setTimeout(() => {
      setLobby(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.userId === 'demo2' || p.userId === 'demo6' || p.userId === 'demo8' 
            ? { ...p, ready: true } 
            : p
        )
      }));
      
      setActivity(prev => [
        {
          id: 'ready_demo2',
          type: 'ready',
          message: 'Viper is ready',
          at: new Date().toISOString()
        },
        {
          id: 'ready_demo6',
          type: 'ready', 
          message: 'Omen is ready',
          at: new Date().toISOString()
        },
        ...prev
      ].slice(0, 10));
    }, 5000);

    // Auto-ready final players and start game after 7 seconds
    setTimeout(() => {
      console.log('🚀 Starting game from demo...');
      setLobby(prev => ({
        ...prev,
        players: prev.players.map(p => ({ ...p, ready: true }))
      }));
      
      setActivity(prev => [
        {
          id: 'ready_all',
          type: 'ready',
          message: 'All players ready - Game starting!',
          at: new Date().toISOString()
        },
        ...prev
      ].slice(0, 10));

      // Navigate to game demo after 1 second
      setTimeout(() => {
        console.log('🎮 Navigating to game demo...');
        navigate('/game-demo');
      }, 1000);
    }, 7000);
  }

  function backToHome() {
    navigate('/', { replace: true });
  }

  useEffect(() => {
    if (!lobbyId) {
      navigate('/', { replace: true });
      return;
    }

    if (!username || !userId) {
      navigate('/', { replace: true });
      return;
    }

    const socket = getSocket();

    function onLobbyState(next) {
      const prevPlayers = prevPlayersRef.current || [];
      const prevById = new Map(prevPlayers.map((p) => [p.userId, p]));
      const nextPlayers = Array.isArray(next?.players) ? next.players : [];
      const nextById = new Map(nextPlayers.map((p) => [p.userId, p]));

      const events = [];
      for (const p of nextPlayers) {
        if (!prevById.has(p.userId)) {
          events.push({ type: 'join', text: `${p.username || 'Player'} joined`, at: Date.now() });
        } else {
          const prev = prevById.get(p.userId);
          if (Boolean(prev?.ready) !== Boolean(p.ready)) {
            events.push({ type: 'ready', text: `${p.username || 'Player'} ${p.ready ? 'is ready' : 'is not ready'}`, at: Date.now() });
          }
          if (prev?.team !== p.team) {
            events.push({ type: 'team', text: `${p.username || 'Player'} switched to Team ${p.team}`, at: Date.now() });
          }
        }
      }
      for (const p of prevPlayers) {
        if (!nextById.has(p.userId)) {
          events.push({ type: 'leave', text: `${p.username || 'Player'} left`, at: Date.now() });
        }
      }

      if (events.length) {
        setActivity((prev) => {
          const nextList = events
            .map((e) => ({ id: `${e.type}_${e.at}_${Math.random().toString(16).slice(2)}`, ...e }))
            .concat(prev);
          return nextList.slice(0, 24);
        });
      }

      prevPlayersRef.current = nextPlayers;
      setLobby(next);
    }

    function onStartGame() {
      setMessage('All players are ready. Match starting...');
      toast.push({ title: 'Match starting', message: 'All players are ready', variant: 'success' });
      playSfx('start');
      
      // Navigate to a demo game page after 2 seconds
      setTimeout(() => {
        navigate('/game-demo');
      }, 2000);
    }

    function onErrorMessage(payload) {
      setMessage(payload?.message || 'Something went wrong');
    }

    socket.on('lobbyState', onLobbyState);
    socket.on('startGame', onStartGame);
    socket.on('errorMessage', onErrorMessage);

    socket.emit('joinLobby', { lobbyId, userId, username });

    return () => {
      socket.off('lobbyState', onLobbyState);
      socket.off('startGame', onStartGame);
      socket.off('errorMessage', onErrorMessage);
    };
  }, [lobbyId, navigate, username, userId]);

  useEffect(() => {
    const now = Date.now();
    if (activity.length === 0 && !seededActivityRef.current) {
      setActivity([
        { id: `demo_join_${now - 100}`, type: 'join', text: 'Phoenix joined', at: now - 100 },
        { id: `demo_join_${now - 2200}`, type: 'join', text: 'Viper joined', at: now - 2200 },
        { id: `demo_team_${now - 3800}`, type: 'team', text: 'Phoenix switched to Team A', at: now - 3800 },
        { id: `demo_ready_${now - 5200}`, type: 'ready', text: 'Viper is ready', at: now - 5200 },
        { id: `demo_ready_${now - 7400}`, type: 'ready', text: 'Phoenix is ready', at: now - 7400 },
        { id: `demo_leave_${now - 9100}`, type: 'leave', text: 'Shadow left', at: now - 9100 },
      ]);
      seededActivityRef.current = true;
    }
  }, [activity.length]);

  useEffect(() => {
    const socket = getSocket();
    const music = new Audio('/music/lobby-music.mp3');
    music.loop = true;
    music.volume = 0.15;
    if (musicEnabled) {
      music.play().catch(() => {});
    }

    return () => {
      if (musicEnabled) {
        music.pause();
        music.currentTime = 0;
      }
      window.setTimeout(() => ac.close().catch(() => {}), 260);
    };
  }, [musicEnabled]);

  if (!lobby) {
    return (
      <div className="screen">
        <div className="shell wide">
          <div className="card">
            <div className="loading">Loading lobby...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="lobbyHeader">
            <div className="lobbyBanner">
              <img src={bannerUrl} alt="Lobby Banner" />
            </div>
            <div className="lobbyInfo">
              <div className="title">{gameName}</div>
              <div className="subtitle">
                Lobby ID: <span className="mono">{lobbyId}</span>
                <span className="sep">/</span>
                <span className="mono">{teamSize}v{teamSize}</span>
              </div>
            </div>
          </div>

          <div className="lobbyControls">
            {/* PROMINENT DEMO BUTTON */}
            <div className="demoButtonContainer">
              {countdown !== null && (
                <div className="countdownTimer">
                  <div className="countdownLabel">MATCH STARTING</div>
                  <div className="countdownValue">{countdown}s</div>
                </div>
              )}
              
              <motion.button 
                className="button demoButton" 
                onClick={startDemo} 
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="demoButtonText">🎮 START DEMO</span>
                <div className="demoButtonSubtext">Auto-fill lobby & start game</div>
              </motion.button>
            </div>

            <div className="lobbyChipRow">
              <div className="lobbyChip">
                <div className="lobbyChipLabel">READY</div>
                <div className="lobbyChipValue">{readyCount}/{totalPlayers || 0}</div>
              </div>
              <div className="lobbyChip teamA">
                <div className="lobbyChipLabel">TEAM A</div>
                <div className="lobbyChipValue">{readyA}/{teamA.length}</div>
              </div>
              <div className="lobbyChip teamB">
                <div className="lobbyChipLabel">TEAM B</div>
                <div className="lobbyChipValue">{readyB}/{teamB.length}</div>
              </div>
              <div className={`lobbyStatus ${me?.ready ? 'on' : ''}`}>{me?.ready ? 'Ready' : 'Not Ready'}</div>
            </div>

            <div className="lobbyActionRow">
              <motion.button className={`button primary lobbyReadyBtn ${me?.ready ? 'on' : ''}`} onClick={toggleReady} whileTap={{ scale: 0.98 }}>
                {me?.ready ? 'Ready ✓' : 'Ready Up'}
              </motion.button>
              <motion.button className="button" onClick={openInvite} whileTap={{ scale: 0.98 }}>
                Invite
              </motion.button>
              <motion.button className="button" onClick={copyLobbyId} whileTap={{ scale: 0.98 }}>
                Copy ID
              </motion.button>
              <motion.button className="button" onClick={backToHome} whileTap={{ scale: 0.98 }}>
                Exit
              </motion.button>
            </div>
          </div>

          <div className="lobbyTeams">
            <div className="teamSection">
              <div className="teamHeader">
                <img src={teamAUrl} alt="Team A" />
                <div className="teamName">TEAM A</div>
              </div>
              <div className="teamSlots">
                {teamA.map((player, index) => (
                  <PlayerCard key={player.userId} player={player} index={index} me={me} />
                ))}
                {Array.from({ length: Math.max(0, teamSize - teamA.length) }).map((_, index) => (
                  <PlayerCard key={`empty-a-${index}`} player={null} index={index} me={me} />
                ))}
              </div>
            </div>

            <div className="teamSection">
              <div className="teamHeader">
                <img src={teamBUrl} alt="Team B" />
                <div className="teamName">TEAM B</div>
              </div>
              <div className="teamSlots">
                {teamB.map((player, index) => (
                  <PlayerCard key={player.userId} player={player} index={index} me={me} />
                ))}
                {Array.from({ length: Math.max(0, teamSize - teamB.length) }).map((_, index) => (
                  <PlayerCard key={`empty-b-${index}`} player={null} index={index} me={me} />
                ))}
              </div>
            </div>
          </div>

          {message && (
            <div className="lobbyMessage">
              <div className="message">{message}</div>
            </div>
          )}

          <div className="lobbySidebar">
            <div className="sidebarHeader">
              <div className="tabs">
                <button 
                  className={`tab ${sideTab === 'chat' ? 'active' : ''}`} 
                  onClick={() => setSideTab('chat')}
                >
                  Chat
                </button>
                <button 
                  className={`tab ${sideTab === 'notifications' ? 'active' : ''}`} 
                  onClick={() => setSideTab('notifications')}
                >
                  Activity
                </button>
                <button 
                  className={`tab ${sideTab === 'audio' ? 'active' : ''}`} 
                  onClick={() => setSideTab('audio')}
                >
                  Audio
                </button>
              </div>
            </div>

            <div className="sidebarContent">
              {sideTab === 'chat' ? <LobbyChat /> : null}
              {sideTab === 'notifications' ? <LobbyNotifications activity={activity} /> : null}
              {sideTab === 'audio' ? (
                <div className="audioSettings">
                  <div className="setting">
                    <label className="checkboxLabel">
                      <input 
                        type="checkbox" 
                        checked={musicEnabled} 
                        onChange={(e) => {
                          setMusicEnabled(e.target.checked);
                          localStorage.setItem('ac_music', e.target.checked ? '1' : '0');
                        }}
                      />
                      Music
                    </label>
                  </div>
                  <div className="setting">
                    <label className="checkboxLabel">
                      <input 
                        type="checkbox" 
                        checked={sfxEnabled} 
                        onChange={(e) => {
                          setSfxEnabled(e.target.checked);
                          localStorage.setItem('ac_sfx', e.target.checked ? '1' : '0');
                        }}
                      />
                      Sound Effects
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {inviteOpen && <LobbyInviteModal onClose={() => setInviteOpen(false)} lobbyId={lobbyId} />}
        </motion.div>
      </div>
    </div>
  );
}
