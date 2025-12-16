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
    survival: 'https://xforgeassets001.xboxlive.com/pf-title-b63a0803d3653643-20ca2/7a86dbad-3f89-49ad-88f2-9f31a7454f9f/SurvivalSpecialists_Thumbnail_0.jpg',
    moba: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s'
  };

  function imageKeyFromGame(name) {
    const v = String(name || '').toLowerCase();
    if (v.includes('battle')) return 'battle';
    if (v.includes('race')) return 'racing';
    if (v.includes('arcade')) return 'arcade';
    if (v.includes('puzzle')) return 'pinball';
    return 'tactical';
  }

  function imageUrlFromKey(key) {
    const id = gameThumbByKey[key] || gameThumbByKey.tactical;
    return id;
  }

  function fallbackThumbUrl(key) {
    return `https://picsum.photos/seed/${key || 'arcade'}/256/256.jpg`;
  }

  const me = useMemo(() => {
    const players = lobby?.players || [];
    return players.find((p) => p.userId === userId) || null;
  }, [lobby?.players, userId]);

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
  }, [lobbyId, navigate, userId, username]);

  useEffect(() => {
    localStorage.setItem('ac_sfx', sfxEnabled ? '1' : '0');
  }, [sfxEnabled]);

  useEffect(() => {
    localStorage.setItem('ac_music', musicEnabled ? '1' : '0');
  }, [musicEnabled]);

  useEffect(() => {
    if (!import.meta.env?.DEV) return;
    if (seededActivityRef.current) return;
    if (activity.length) return;

    const now = Date.now();
    setActivity([
      { id: `demo_join_${now - 1000}`, type: 'join', text: 'Phoenix joined', at: now - 1000 },
      { id: `demo_join_${now - 2200}`, type: 'join', text: 'Viper joined', at: now - 2200 },
      { id: `demo_team_${now - 3800}`, type: 'team', text: 'Phoenix switched to Team A', at: now - 3800 },
      { id: `demo_ready_${now - 5200}`, type: 'ready', text: 'Viper is ready', at: now - 5200 },
      { id: `demo_ready_${now - 7400}`, type: 'ready', text: 'Phoenix is ready', at: now - 7400 },
      { id: `demo_leave_${now - 9100}`, type: 'leave', text: 'Shadow left', at: now - 9100 },
    ]);
    seededActivityRef.current = true;
  }, [activity.length]);

  useEffect(() => {
    // Auto-populate lobby with demo players for teacher demo
    if (lobby && lobby.players && lobby.players.length <= 2) {
      console.log('Starting lobby demo - current players:', lobby.players.length);
      console.log('Lobby state:', lobby);
      
      // Start countdown timer
      const countdownTime = Math.floor(Math.random() * 6) + 10; // 10-15 seconds
      setCountdown(countdownTime);
      console.log('Countdown started:', countdownTime);
      
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

      // Add demo players one by one with delays to simulate real joining
      demoPlayers.forEach((player, index) => {
        setTimeout(() => {
          console.log(`Adding demo player ${index + 1}: ${player.username}`);
          setLobby(prev => {
            const newLobby = {
              ...prev,
              players: [...(prev?.players || []), player]
            };
            console.log('Updated lobby:', newLobby);
            return newLobby;
          });
          
          // Add to activity feed
          setActivity(prev => [
            {
              id: `join_${player.userId}`,
              type: 'join',
              message: `${player.username} joined the lobby`,
              at: new Date().toISOString()
            },
            ...prev
          ].slice(0, 10));
        }, (index + 1) * 800);
      });

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Auto-start game when countdown reaches 0
            setTimeout(() => {
              // Make all players ready
              setLobby(prevLobby => ({
                ...prevLobby,
                players: prevLobby.players.map(p => ({ ...p, ready: true }))
              }));
              
              // Start game
              setTimeout(() => {
                onStartGame();
              }, 1000);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-ready some demo players after they join
      setTimeout(() => {
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
      }, 6000);
    }
  }, [lobby?.players?.length]);

  useEffect(() => {
    if (!musicEnabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    const ac = new AC();
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    gain.connect(ac.destination);

    const oscA = ac.createOscillator();
    const oscB = ac.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'triangle';
    oscA.frequency.value = 110;
    oscB.frequency.value = 220;
    oscA.connect(gain);
    oscB.connect(gain);

    if (ac.state === 'suspended') {
      ac.resume().catch(() => {});
    }

    gain.gain.exponentialRampToValueAtTime(0.012, ac.currentTime + 0.25);
    oscA.start();
    oscB.start();

    const seq = [110, 123.47, 146.83, 164.81];
    let idx = 0;
    const t = window.setInterval(() => {
      idx = (idx + 1) % seq.length;
      const base = seq[idx];
      try {
        oscA.frequency.setTargetAtTime(base, ac.currentTime, 0.08);
        oscB.frequency.setTargetAtTime(base * 2, ac.currentTime, 0.08);
      } catch {
        // ignore
      }
    }, 2200);

    return () => {
      window.clearInterval(t);
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
        oscA.stop(ac.currentTime + 0.2);
        oscB.stop(ac.currentTime + 0.2);
      } catch {
        // ignore
      }
      window.setTimeout(() => ac.close().catch(() => {}), 260);
    };
  }, [musicEnabled]);

  function toggleReady() {
    const socket = getSocket();
    socket.emit('toggleReady', { lobbyId });
    
    // For demo: simulate other players readying up
    if (readyCount >= 3) {
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
      }, 2000);

      setTimeout(() => {
        setLobby(prev => ({
          ...prev,
          players: prev.players.map(p => 
            p.userId === 'demo3' || p.userId === 'demo7' 
              ? { ...p, ready: true } 
              : p
          )
        }));
        
        setActivity(prev => [
          {
            id: 'ready_demo3',
            type: 'ready',
            message: 'Jett is ready',
            at: new Date().toISOString()
          },
          {
            id: 'ready_demo7',
            type: 'ready',
            message: 'Brimstone is ready', 
            at: new Date().toISOString()
          },
          ...prev
        ].slice(0, 10));
      }, 4000);

      // Auto-start game when all ready
      setTimeout(() => {
        setLobby(prev => ({
          ...prev,
          players: prev.players.map(p => 
            p.userId === 'demo4' 
              ? { ...p, ready: true } 
              : p
          )
        }));
        
        setActivity(prev => [
          {
            id: 'ready_demo4',
            type: 'ready',
            message: 'Sage is ready - All players ready!',
            at: new Date().toISOString()
          },
          ...prev
        ].slice(0, 10));

        // Trigger game start
        setTimeout(() => {
          onStartGame();
        }, 1000);
      }, 6000);
    }
  }

  function startDemo() {
    // Force start the demo
    console.log('Manual demo trigger activated');
    const countdownTime = Math.floor(Math.random() * 6) + 10; // 10-15 seconds
    setCountdown(countdownTime);
    
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

    // Add demo players one by one with delays to simulate real joining
    demoPlayers.forEach((player, index) => {
      setTimeout(() => {
        console.log(`Manual demo - Adding player ${index + 1}: ${player.username}`);
        setLobby(prev => ({
          ...prev,
          players: [...(prev?.players || []), player]
        }));
        
        // Add to activity feed
        setActivity(prev => [
          {
            id: `join_${player.userId}`,
            type: 'join',
            message: `${player.username} joined the lobby`,
            at: new Date().toISOString()
          },
          ...prev
        ].slice(0, 10));
      }, (index + 1) * 800);
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Auto-start game when countdown reaches 0
          setTimeout(() => {
            // Make all players ready
            setLobby(prevLobby => ({
              ...prevLobby,
              players: prevLobby.players.map(p => ({ ...p, ready: true }))
            }));
            
            // Start game
            setTimeout(() => {
              onStartGame();
            }, 1000);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-ready some demo players after they join
    setTimeout(() => {
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
    }, 6000);
  }

  function backToHome() {
    navigate('/', { replace: true });
  }

  async function copyLobbyId() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(lobbyId));
      } else {
        const ta = document.createElement('textarea');
        ta.value = String(lobbyId);
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setMessage('Lobby ID copied');
      toast.push({ title: 'Copied', message: 'Lobby ID copied to clipboard', variant: 'info' });
      playSfx('click');
      window.setTimeout(() => setMessage(''), 1800);
    } catch {
      setMessage('Could not copy lobby id');
      toast.push({ title: 'Copy failed', message: 'Could not copy lobby id', variant: 'error' });
      window.setTimeout(() => setMessage(''), 1800);
    }
  }

  function openInvite() {
    setInviteOpen(true);
    playSfx('click');
  }

  const teamA = (lobby?.players || []).filter((p) => p.team === 'A');
  const teamB = (lobby?.players || []).filter((p) => p.team === 'B');
  const totalPlayers = (lobby?.players || []).length;
  const readyCount = (lobby?.players || []).filter((p) => p.ready).length;
  const gameName = lobby?.game || 'Match';
  const readyA = teamA.filter((p) => p.ready).length;
  const readyB = teamB.filter((p) => p.ready).length;
  const teamSize = 5;
  const lobbyCapacity = teamSize * 2;
  const playersNeeded = Math.max(0, lobbyCapacity - totalPlayers);
  const readyToStart = totalPlayers === lobbyCapacity && readyCount === totalPlayers && totalPlayers > 0;
  const lobbyFillPct = lobbyCapacity ? Math.min(100, Math.round((totalPlayers / lobbyCapacity) * 100)) : 0;

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="lobbyHero" style={{ backgroundImage: `url(${bannerUrl})` }}>
            <div className="lobbyHeroOverlay">
              <div className="lobbyMarquee" aria-hidden="true">
                <div className="lobbyMarqueeTrack">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="lobbyMarqueeRow">
                      <span className="lobbyMarqueeItem">HIGH ROLLER LOBBY</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">READY UP</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">LIVE CHAT</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">NEON ARCADE</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lobbyHeroTop">
                <div className="lobbyGameInfo">
                  <div className="gameImageContainer">
                    <img
                      className="gameImage"
                      src={thumbUrl(imageKeyFromGame(lobby?.game))}
                      alt={gameName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackThumbUrl(imageKeyFromGame(lobby?.game));
                      }}
                    />
                  </div>
                  <div>
                    <div className="title">{gameName}</div>
                    <div className="subtitle">
                      Lobby ID: <span className="mono">{lobbyId}</span>
                      <span className="sep">/</span>
                      <span className="mono">{teamSize}v{teamSize}</span>
                    </div>
                  </div>
                </div>

                <div className="lobbyControls">
                  {countdown !== null && (
                    <div className="countdownTimer">
                      <div className="countdownLabel">MATCH STARTING</div>
                      <div className="countdownValue">{countdown}s</div>
                    </div>
                  )}
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
                    <motion.button className="button accent" onClick={startDemo} whileTap={{ scale: 0.98 }}>
                      Start Demo
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
              </div>

              <div className="lobbyHeroBottom">
                <div className="infoPanel">
                  <div className="infoTitle">Match Info</div>
                  <div className="infoGrid">
                    <div className="infoItem">
                      <div className="infoLabel">Mode</div>
                      <div className="infoValue">{gameName}</div>
                    </div>
                    <div className="infoItem">
                      <div className="infoLabel">Players</div>
                      <div className="infoValue">{totalPlayers || 0}/{lobbyCapacity}</div>
                    </div>
                    <div className="infoItem">
                      <div className="infoLabel">Teams</div>
                      <div className="infoValue">{teamSize}v{teamSize}</div>
                    </div>
                    <div className="infoItem">
                      <div className="infoLabel">Status</div>
                      <div className="infoValue">{readyToStart ? 'Starting' : playersNeeded ? 'Filling' : 'Waiting'}</div>
                    </div>
                    <div className="infoItem">
                      <div className="infoLabel">Progress</div>
                      <div className="infoValue">{lobbyFillPct}%</div>
                    </div>
                  </div>
                  <div className="lobbyProgressTrack" aria-hidden="true">
                    <div className="lobbyProgressFill" style={{ width: `${lobbyFillPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {message ? <div className="message">{message}</div> : null}

          <div className="divider" />

          {!lobby ? (
            <div className="lobbyLoadingNotice">
              Waiting for lobby state...
            </div>
          ) : null}

          <div className="lobbyMainGrid">
            <div className="lobbyCol">
              <div className="teamHeader">
                <div className="teamLeft">
                  <img className="teamEmblem" src={teamAUrl} alt="" />
                  <div>
                    <div className="sectionTitle">Team A</div>
                    <div className="hint">Ready {readyA}/{teamA.length}</div>
                  </div>
                </div>
              </div>
              <div className="stack">
                {teamA.map((p) => (
                  <PlayerCard key={p.userId} player={p} />
                ))}
                {Array.from({ length: Math.max(0, teamSize - teamA.length) }).map((_, idx) => (
                  <div key={`a-empty-${idx}`} className="lobbySlotEmpty">
                    <div className="lobbySlotTitle">Open Slot</div>
                    <div className="lobbySlotSub">Waiting for player</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lobbyCol">
              <div className="teamHeader">
                <div className="teamLeft">
                  <img className="teamEmblem" src={teamBUrl} alt="" />
                  <div>
                    <div className="sectionTitle">Team B</div>
                    <div className="hint">Ready {readyB}/{teamB.length}</div>
                  </div>
                </div>
              </div>
              <div className="stack">
                {teamB.map((p) => (
                  <PlayerCard key={p.userId} player={p} />
                ))}
                {Array.from({ length: Math.max(0, teamSize - teamB.length) }).map((_, idx) => (
                  <div key={`b-empty-${idx}`} className="lobbySlotEmpty">
                    <div className="lobbySlotTitle">Open Slot</div>
                    <div className="lobbySlotSub">Waiting for player</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lobbyCol">
              <div className="lobbySidePanel">
                <div className="lobbyTabs">
                  <button className={`lobbyTabBtn ${sideTab === 'chat' ? 'on' : ''}`} onClick={() => setSideTab('chat')}>
                    Chat
                  </button>
                  <button className={`lobbyTabBtn ${sideTab === 'activity' ? 'on' : ''}`} onClick={() => setSideTab('activity')}>
                    Activity
                  </button>
                  <button className={`lobbyTabBtn ${sideTab === 'match' ? 'on' : ''}`} onClick={() => setSideTab('match')}>
                    Match
                  </button>
                  <button className={`lobbyTabBtn ${sideTab === 'audio' ? 'on' : ''}`} onClick={() => setSideTab('audio')}>
                    Audio
                  </button>
                </div>

                <div className="lobbyTabBody">
                  {sideTab === 'chat' ? <LobbyChat lobbyId={lobbyId} userId={userId} username={username} /> : null}
                  {sideTab === 'activity' ? (
                    <div className="lobbyFeed">
                      <div className="lobbyTipsTitle">Activity Feed</div>
                      <div className="lobbyFeedList">
                        {activity.length ? (
                          activity.map((e) => (
                            <div key={e.id} className={`lobbyFeedItem lobbyFeed-${e.type}`}>
                              <div className="lobbyFeedText">{e.text}</div>
                              <div className="lobbyFeedTime">{new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ))
                        ) : (
                          <div className="lobbyFeedEmpty">No activity yet.</div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  {sideTab === 'match' ? (
                    <div className="lobbyMatchPanel">
                      <div className="infoPanel">
                        <div className="infoTitle">Lobby Status</div>
                        <div className="infoGrid">
                          <div className="infoItem">
                            <div className="infoLabel">Players</div>
                            <div className="infoValue">{totalPlayers}/{lobbyCapacity}</div>
                          </div>
                          <div className="infoItem">
                            <div className="infoLabel">Ready</div>
                            <div className="infoValue">{readyCount}/{totalPlayers || 0}</div>
                          </div>
                          <div className="infoItem">
                            <div className="infoLabel">Team A</div>
                            <div className="infoValue">{teamA.length}/{teamSize}</div>
                          </div>
                          <div className="infoItem">
                            <div className="infoLabel">Team B</div>
                            <div className="infoValue">{teamB.length}/{teamSize}</div>
                          </div>
                          <div className="infoItem">
                            <div className="infoLabel">Next</div>
                            <div className="infoValue">{playersNeeded ? `Need ${playersNeeded} players` : readyToStart ? 'Starting' : 'Ready check'}</div>
                          </div>
                        </div>
                        <div className="lobbyProgressTrack" aria-hidden="true">
                          <div className="lobbyProgressFill" style={{ width: `${lobbyFillPct}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {sideTab === 'audio' ? (
                    <div className="lobbyTips">
                      <div className="lobbyTipsTitle">Audio & Tips</div>
                      <div className="lobbyAudioGrid">
                        <div className="lobbyAudioRow">
                          <div>
                            <div className="lobbyAudioLabel">Lobby Music</div>
                            <div className="lobbyAudioHint">Ambient background music (local only)</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" checked={musicEnabled} onChange={(e) => setMusicEnabled(e.target.checked)} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="lobbyAudioRow">
                          <div>
                            <div className="lobbyAudioLabel">Sound Effects</div>
                            <div className="lobbyAudioHint">Clicks, match start, chat pings</div>
                          </div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={sfxEnabled}
                              onChange={(e) => {
                                const next = e.target.checked;
                                setSfxEnabled(next);
                                if (next) playSfx('click');
                              }}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="lobbyTipsBody">
                        <div className="lobbyTip">Use Invite to bring friends into the same lobby.</div>
                        <div className="lobbyTip">Ready up when your team is full to start faster.</div>
                        <div className="lobbyTip">If chat shows Offline, wait a moment for reconnection.</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <LobbyInviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} lobbyId={lobbyId} />
      <LobbyNotifications socket={getSocket()} />
    </div>
  );
}
