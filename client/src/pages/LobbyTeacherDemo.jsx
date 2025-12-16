import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlayerCard from '../components/PlayerCard.jsx';
import { avatarDataUrl } from '../utils/avatar.js';
import { apiFetch } from '../utils/api.js';
import bannerUrl from '../assets/lobby-banner.svg';
import teamAUrl from '../assets/team-a.svg';
import teamBUrl from '../assets/team-b.svg';

export default function LobbyTeacherDemo() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState('');
  const [sideTab, setSideTab] = useState('chat');

  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', userId: 'demo2', username: 'Viper', text: 'Ready for the demo?', createdAt: new Date(Date.now() - 60_000).toISOString() },
    { id: 'm2', userId: 'demo1', username: 'Phoenix', text: 'Yes! Click START DEMO and watch it auto-fill.', createdAt: new Date(Date.now() - 45_000).toISOString() },
  ]);
  const [chatText, setChatText] = useState('');
  const chatListRef = useRef(null);

  const [activity, setActivity] = useState([
    { id: 'a1', type: 'system', text: 'Teacher mode: this page works without a real lobby.', at: Date.now() - 35_000 },
    { id: 'a2', type: 'hint', text: 'Click START DEMO to auto-fill teams and start a countdown.', at: Date.now() - 18_000 },
  ]);

  const [mongoLeaders, setMongoLeaders] = useState([]);

  const teamSize = 5;
  const lobbyId = 'TEACHER-DEMO';
  const gameName = 'Valorant-Style';

  const teamA = useMemo(() => players.filter((p) => p.team === 'A'), [players]);
  const teamB = useMemo(() => players.filter((p) => p.team === 'B'), [players]);

  const readyCount = useMemo(() => players.filter((p) => p.ready).length, [players]);
  const readyA = useMemo(() => teamA.filter((p) => p.ready).length, [teamA]);
  const readyB = useMemo(() => teamB.filter((p) => p.ready).length, [teamB]);

  const me = useMemo(() => players[0] || null, [players]);

  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/leaderboard?limit=10&page=1');
        const list = Array.isArray(res?.leaderboard) ? res.leaderboard : [];
        if (cancelled) return;
        setMongoLeaders(list);
        if (list.length) addActivity('db', `Loaded ${list.length} players from MongoDB leaderboard`);
        else addActivity('db', 'MongoDB leaderboard returned 0 players (will use demo fallback)');
      } catch {
        if (cancelled) return;
        setMongoLeaders([]);
        addActivity('db', 'MongoDB leaderboard unavailable (will use demo fallback)');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      setMessage('Match starting...');
      window.setTimeout(() => navigate('/game-demo'), 600);
      return;
    }

    const t = window.setTimeout(() => setCountdown((v) => (typeof v === 'number' ? v - 1 : v)), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, navigate]);

  function resetDemo() {
    setPlayers([]);
    setCountdown(null);
    setMessage('');
    setActivity([
      { id: `a_reset_${Date.now()}`, type: 'system', text: 'Demo reset. Click START DEMO again.', at: Date.now() },
    ]);
  }

  function addActivity(type, text) {
    setActivity((prev) => [{ id: `${type}_${Date.now()}_${Math.random().toString(16).slice(2)}`, type, text, at: Date.now() }, ...prev].slice(0, 18));
  }

  function sendChat() {
    const clean = String(chatText || '').trim();
    if (!clean) return;
    setChatMessages((prev) =>
      prev.concat({ id: `m_${Date.now()}`, userId: 'teacher', username: 'You', text: clean.slice(0, 220), createdAt: new Date().toISOString() })
    );
    setChatText('');
  }

  function startDemo() {
    const fallbackPlayers = [
      { userId: 'demo1', username: 'Phoenix' },
      { userId: 'demo2', username: 'Viper' },
      { userId: 'demo3', username: 'Jett' },
      { userId: 'demo4', username: 'Sage' },
      { userId: 'demo5', username: 'Reyna' },
      { userId: 'demo6', username: 'Omen' },
      { userId: 'demo7', username: 'Brimstone' },
      { userId: 'demo8', username: 'Cypher' },
      { userId: 'demo9', username: 'Sova' },
      { userId: 'demo10', username: 'Killjoy' },
    ];

    const base = mongoLeaders.length
      ? mongoLeaders.slice(0, 10).map((p, i) => ({ userId: String(p.userId || `db${i + 1}`), username: String(p.username || `Player ${i + 1}`) }))
      : fallbackPlayers;

    const demoPlayers = base.map((p, idx) => ({
      userId: p.userId,
      username: p.username,
      team: idx < 5 ? 'A' : 'B',
      ready: false,
    }));

    setMessage('Demo started: auto-filling lobby...');
    setPlayers(demoPlayers);
    addActivity('system', 'Demo started: lobby auto-filled');
    for (const p of demoPlayers) addActivity('join', `${p.username} joined Team ${p.team}`);

    const countdownTime = 12;
    setCountdown(countdownTime);
    addActivity('countdown', `Countdown started: ${countdownTime}s`);

    window.setTimeout(() => {
      setPlayers((prev) =>
        prev.map((p) =>
          ['demo1', 'demo2', 'demo6', 'demo7'].includes(String(p.userId)) ? { ...p, ready: true } : p
        )
      );
      addActivity('ready', 'Phoenix is ready');
      addActivity('ready', 'Viper is ready');
      addActivity('ready', 'Omen is ready');
      addActivity('ready', 'Brimstone is ready');
      setChatMessages((prev) =>
        prev.concat({ id: `m_${Date.now()}_r`, userId: 'demo6', username: 'Omen', text: 'All set. Waiting on the rest.', createdAt: new Date().toISOString() })
      );
    }, 1200);

    window.setTimeout(() => {
      setPlayers((prev) => prev.map((p) => ({ ...p, ready: true })));
      setMessage('All players ready. Match will start automatically.');
      addActivity('ready', 'All players ready');
      setChatMessages((prev) =>
        prev.concat({ id: `m_${Date.now()}_s`, userId: 'demo1', username: 'Phoenix', text: 'Everyone ready — starting soon!', createdAt: new Date().toISOString() })
      );
    }, 3500);
  }

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="lobbyHero" style={{ backgroundImage: `url(${bannerUrl})` }}>
            <div className="lobbyHeroOverlay">
              <div className="lobbyMarquee" aria-hidden="true">
                <div className="lobbyMarqueeTrack">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="lobbyMarqueeRow">
                      <span className="lobbyMarqueeItem">TEACHER DEMO</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">AUTO-FILL TEAMS</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">READY UP</span>
                      <span className="lobbyMarqueeSep" />
                      <span className="lobbyMarqueeItem">COUNTDOWN</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lobbyHeroTop">
                <div className="lobbyGameInfo">
                  <div>
                    <div className="title">Lobby Demo</div>
                    <div className="subtitle">
                      <span className="pill neon">Teacher Mode</span>
                      <span className="sep">/</span>
                      Game: <span className="mono">{gameName}</span>
                      <span className="sep">/</span>
                      Lobby: <span className="mono">{lobbyId}</span>
                      <span className="sep">/</span>
                      <span className="mono">{teamSize}v{teamSize}</span>
                    </div>
                  </div>
                </div>

                <div className="lobbyControls">
                  <div className="demoButtonContainer">
                    {countdown !== null ? (
                      <div className="countdownTimer">
                        <div className="countdownLabel">MATCH STARTING</div>
                        <div className="countdownValue">{countdown}s</div>
                      </div>
                    ) : null}

                    <motion.button
                      className="button demoButton"
                      type="button"
                      onClick={startDemo}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <span className="demoButtonText">START DEMO</span>
                      <div className="demoButtonSubtext">Auto-fill lobby & start game</div>
                    </motion.button>
                  </div>

                  <div className="lobbyChipRow">
                    <div className="lobbyChip">
                      <div className="lobbyChipLabel">READY</div>
                      <div className="lobbyChipValue">{readyCount}/{players.length || 0}</div>
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
                    <button className="button" type="button" onClick={resetDemo}>Reset</button>
                    <button className="button" type="button" onClick={() => navigate('/play')}>Back</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          {message ? (
            <div className="lobbyMessage">
              <div className="message">{message}</div>
            </div>
          ) : null}

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

          <div className="lobbySidebar">
            <div className="sidebarHeader">
              <div className="tabs">
                <button className={`tab ${sideTab === 'chat' ? 'active' : ''}`} type="button" onClick={() => setSideTab('chat')}>
                  Chat
                </button>
                <button className={`tab ${sideTab === 'activity' ? 'active' : ''}`} type="button" onClick={() => setSideTab('activity')}>
                  Activity
                </button>
              </div>
            </div>

            <div className="sidebarContent">
              {sideTab === 'chat' ? (
                <motion.div className="chatPanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="chatHeader">
                    <div>
                      <div className="chatTitle">Demo Chat</div>
                      <div className="chatSub">Standalone (no real lobby required)</div>
                    </div>
                    <div className="pill pillReady">Online</div>
                  </div>

                  <div className="chatList" ref={chatListRef}>
                    {chatMessages.map((m) => {
                      const mine = m.userId === 'teacher';
                      const img = avatarDataUrl(m.userId || m.username, m.username);
                      return (
                        <div key={m.id} className={`chatMsg ${mine ? 'mine' : ''}`}>
                          <img className="chatAvatar" src={img} alt="" />
                          <div className="chatBubble">
                            <div className="chatMeta">
                              <span className="chatName">{m.username}</span>
                            </div>
                            <div className="chatText">{m.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="chatComposer">
                    <textarea
                      className="chatInput"
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      placeholder="Type here (demo)..."
                      rows={2}
                    />
                    <button className="button primary" type="button" onClick={sendChat}>
                      Send
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {sideTab === 'activity' ? (
                <motion.div className="chatPanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="chatHeader">
                    <div>
                      <div className="chatTitle">Activity</div>
                      <div className="chatSub">Demo timeline</div>
                    </div>
                    <div className="pill neon">Live</div>
                  </div>

                  <div className="chatList">
                    {activity.map((a) => (
                      <div key={a.id} className="chatMsg">
                        <div className="chatBubble" style={{ width: '100%' }}>
                          <div className="chatMeta">
                            <span className="chatName">{String(a.type).toUpperCase()}</span>
                          </div>
                          <div className="chatText">{a.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="chatComposer">
                    <button className="button" type="button" onClick={resetDemo}>
                      Clear / Reset
                    </button>
                    <button className="button primary" type="button" onClick={startDemo}>
                      Run Demo
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
