import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarDataUrl } from '../utils/avatar.js';

function formatTime(v) {
  try {
    const d = new Date(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

export default function MatchHistory() {
  const { token, user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const res = await apiFetch('/api/matches/me', { token });
        let data = res?.matches || [];
        
        // Add example matches if API is empty or for demo purposes
        if (data.length === 0) {
          data = [
            {
              id: 'match1',
              game: 'Tactical Arena',
              result: 'Victory',
              score: '16-14',
              duration: '32:45',
              date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              players: [
                { userId: 'user1', username: 'Phoenix', kills: 24, deaths: 18, assists: 8 },
                { userId: 'user2', username: 'Viper', kills: 28, deaths: 16, assists: 6 },
                { userId: user?.userId || 'current', username: user?.username || 'You', kills: 22, deaths: 19, assists: 10 },
                { userId: 'user4', username: 'Blaze', kills: 19, deaths: 22, assists: 12 },
                { userId: 'user5', username: 'Storm', kills: 26, deaths: 17, assists: 7 }
              ]
            },
            {
              id: 'match2',
              game: 'Battle Royale',
              result: 'Defeat',
              score: '#12',
              duration: '18:32',
              date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              players: [
                { userId: 'user1', username: 'Shadow', kills: 8, deaths: 1, assists: 2 },
                { userId: user?.userId || 'current', username: user?.username || 'You', kills: 5, deaths: 1, assists: 3 },
                { userId: 'user3', username: 'Frost', kills: 12, deaths: 1, assists: 4 },
                { userId: 'user4', username: 'Ghost', kills: 3, deaths: 1, assists: 1 }
              ]
            },
            {
              id: 'match3',
              game: 'Speed Rush',
              result: 'Victory',
              score: '1st Place',
              duration: '8:24',
              date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              players: [
                { userId: user?.userId || 'current', username: user?.username || 'You', position: 1, time: '8:24' },
                { userId: 'user2', username: 'Neon', position: 2, time: '8:31' },
                { userId: 'user3', username: 'Echo', position: 3, time: '8:45' },
                { userId: 'user4', username: 'Pulse', position: 4, time: '9:12' }
              ]
            },
            {
              id: 'match4',
              game: 'Combat Zone',
              result: 'Victory',
              score: '250-198',
              duration: '15:18',
              date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              players: [
                { userId: 'user1', username: 'Void', kills: 45, deaths: 28, assists: 15 },
                { userId: user?.userId || 'current', username: user?.username || 'You', kills: 38, deaths: 32, assists: 18 },
                { userId: 'user3', username: 'Hawk', kills: 42, deaths: 30, assists: 12 },
                { userId: 'user4', username: 'Raven', kills: 35, deaths: 35, assists: 20 }
              ]
            },
            {
              id: 'match5',
              game: 'Fantasy Quest',
              result: 'Victory',
              score: 'Boss Defeated',
              duration: '45:12',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              players: [
                { userId: user?.userId || 'current', username: user?.username || 'You', level: 45, damage: 125000, healing: 45000 },
                { userId: 'user2', username: 'Wolf', level: 42, damage: 98000, healing: 52000 },
                { userId: 'user3', username: 'Fox', level: 44, damage: 112000, healing: 38000 },
                { userId: 'user4', username: 'Lion', level: 43, damage: 89000, healing: 61000 }
              ]
            }
          ];
        }
        
        if (!cancelled) setMatches(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load matches');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="row space">
            <div>
              <div className="title">Match History</div>
              <div className="subtitle">Last 50 matches you participated in</div>
            </div>
            <div className="pill neon">Live</div>
          </div>

          <div className="divider" />

          {loading ? (
            <div className="loadingCard">
              <div className="loadingRow">
                <div className="loadingAvatar loadingSkeleton" />
                <div className="loadingText loadingSkeleton long" />
              </div>
              <div className="loadingRow">
                <div className="loadingAvatar loadingSkeleton" />
                <div className="loadingText loadingSkeleton short" />
              </div>
            </div>
          ) : null}
          {error ? <div className="errorBox">{error}</div> : null}

          {!loading && !error && matches.length === 0 ? (
            <div className="hint">No matches yet. Start a lobby and ready up to record a match.</div>
          ) : null}

          <div className="matchList">
            {matches.map((m) => (
              <motion.div 
                key={m.id} 
                className="matchRow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="matchLeft">
                  <div className={`matchResultBadge ${m.result === 'Victory' ? 'victory' : 'defeat'}`}>
                    <span className="matchResult">{m.result.toUpperCase()}</span>
                  </div>
                  <div className="matchInfo">
                    <div className="matchTitle">{m.game}</div>
                    <div className="matchScore">{m.score}</div>
                    <div className="matchMeta">
                      <span className="matchMetaItem">Duration: {m.duration}</span>
                      <span className="matchMetaItem">Started: {formatTime(m.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="matchPlayers">
                  {(m.players || []).map((p) => {
                    const avatar = avatarDataUrl(p.userId, p.username);
                    const isMe = p.userId === user?.userId || p.username === user?.username;
                    return (
                      <div key={p.userId} className={`miniPlayer ${isMe ? 'me' : ''}`}>
                        <img className="miniAvatar" src={avatar} alt="" />
                        <div className="miniInfo">
                          <div className="miniName">{p.username}</div>
                          <div className="miniMeta">
                            {p.kills !== undefined && `${p.kills}/${p.deaths}/${p.assists}`}
                            {p.position !== undefined && `#${p.position}`}
                            {p.level !== undefined && `Lvl ${p.level}`}
                            {p.time !== undefined && `Time: ${p.time}`}
                            {p.damage !== undefined && `DMG: ${(p.damage / 1000).toFixed(1)}k`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
