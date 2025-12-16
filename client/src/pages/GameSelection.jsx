import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function randomId() {
  return `user_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function GameSelection() {
  const navigate = useNavigate();

  const storedUsername = localStorage.getItem('ac_username') || '';
  const storedGame = localStorage.getItem('ac_game') || 'Valorant-Style';

  const [username, setUsername] = useState(storedUsername);
  const [game, setGame] = useState(storedGame);

  const userId = useMemo(() => {
    const existing = localStorage.getItem('ac_userId');
    if (existing) return existing;
    const created = randomId();
    localStorage.setItem('ac_userId', created);
    return created;
  }, []);

  function start() {
    const clean = username.trim();
    if (!clean) return;

    localStorage.setItem('ac_username', clean);
    localStorage.setItem('ac_game', game);

    navigate(`/queue?game=${encodeURIComponent(game)}`);
  }

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

  function thumbUrl(key) {
    const id = gameThumbByKey[key] || gameThumbByKey.tactical;
    return id;
  }

  function fallbackThumbUrl(key) {
    return `https://picsum.photos/seed/${key || 'game'}/192/192.jpg`;
  }

  const games = [
    {
      id: 'Valorant-Style',
      title: 'Tactical Arena',
      subtitle: '5v5 lobby-style matchmaking',
      accent: 'a',
      image: 'tactical',
    },
    {
      id: 'Battle-Royale',
      title: 'Battle Royale',
      subtitle: 'Squads and drop-in queue',
      accent: 'b',
      image: 'battle',
    },
    {
      id: 'Racing',
      title: 'Speed Rush',
      subtitle: 'Fast-paced racing action',
      accent: 'c',
      image: 'racing',
    },
    {
      id: 'Sports',
      title: 'Sports League',
      subtitle: 'Team sports matchmaking',
      accent: 'd',
      image: 'sports',
    },
    {
      id: 'Puzzle',
      title: 'Mind Games',
      subtitle: 'Strategic puzzle battles',
      accent: 'e',
      image: 'puzzle',
    },
    {
      id: 'FPS',
      title: 'Combat Zone',
      subtitle: 'First-person shooter arena',
      accent: 'f',
      image: 'fps',
    },
    {
      id: 'Strategy',
      title: 'Command Center',
      subtitle: 'Real-time strategy warfare',
      accent: 'a',
      image: 'strategy',
    },
    {
      id: 'RPG',
      title: 'Fantasy Quest',
      subtitle: 'Co-op RPG adventures',
      accent: 'b',
      image: 'rpg',
    },
    {
      id: 'Arcade',
      title: 'Retro Arcade',
      subtitle: 'Classic arcade games',
      accent: 'c',
      image: 'arcade',
    },
    {
      id: 'Fighting',
      title: 'Fight Club',
      subtitle: '1v1 fighting tournaments',
      accent: 'd',
      image: 'fighting',
    },
    {
      id: 'Survival',
      title: 'Survival Mode',
      subtitle: 'Battle for survival',
      accent: 'e',
      image: 'survival',
    },
    {
      id: 'MOBA',
      title: 'Hero Clash',
      subtitle: '5v5 MOBA battles',
      accent: 'f',
      image: 'moba',
    },
  ];

  return (
    <div className="screen">
      <div className="shell">
        <motion.div
          className="card hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="heroHeader">
            <div>
              <div className="brand">ArcadeConnect</div>
              <div className="subtitle">Real-time matchmaking and synchronized lobbies</div>
              <div className="micro">
                Pick a mode, enter the queue, and ready up in a lobby that updates instantly.
              </div>
            </div>
            <div className="heroBadge" aria-hidden="true">
              Live
            </div>
          </div>

          <div className="gameGrid">
            {games.map((g) => {
              const selected = g.id === game;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`gameCard accent-${g.accent} ${selected ? 'selected' : ''}`}
                  onClick={() => setGame(g.id)}
                >
                  <div className="gameCardHead">
                    <div className="gameThumb" aria-hidden="true">
                      <img
                        className="gameThumbImg"
                        src={thumbUrl(g.image)}
                        alt={g.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackThumbUrl(g.image);
                        }}
                      />
                    </div>
                    <div className="gameHeadBody">
                      <div className="gameTop">
                        <div className="gameTitle">{g.title}</div>
                        <div className="gameTag">{g.id}</div>
                      </div>
                      <div className="gameSub">{g.subtitle}</div>
                    </div>
                  </div>
                  <div className="gameMeta">
                    <div className="gameActionChip">Queue</div>
                    <div className="gameActionChip">Lobby</div>
                    <div className="gameActionChip">Ready</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="form">
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />

            <div className="hint">
              Selected mode: <span className="mono">{game}</span>
            </div>

            <motion.button
              className="button primary"
              onClick={start}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Matchmaking
            </motion.button>

            <div className="hint">
              Your user id: <span className="mono">{userId}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
