import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api.js';
import { avatarDataUrl } from '../utils/avatar.js';
import bannerUrl from '../assets/lobby-banner.svg';

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function formatInt(n) {
  try {
    return Number(n || 0).toLocaleString();
  } catch {
    return String(n || 0);
  }
}

function deriveStats(seed, matchesPlayed) {
  const h = hashString(String(seed || 'seed'));
  const credits = 3200 + (matchesPlayed || 0) * 240 + (h % 900);
  const k = 5 + (h % 21);
  const d = 3 + ((h >> 5) % 17);
  const a = 4 + ((h >> 9) % 26);
  const streak = 1 + ((h >> 13) % 12);
  const obj = 20 + ((h >> 17) % 340);
  const damage = 22000 + ((h >> 3) % 140000);
  const shielding = ((h >> 7) % 90000);
  const healing = ((h >> 11) % 260000);
  return {
    credits,
    kda: `${k}/${d}/${a}`,
    streak,
    obj,
    damage,
    shielding,
    healing,
  };
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leaderboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [rank, setRank] = useState('');
  const [sort, setSort] = useState('matchesPlayed');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('page', String(page));
        if (q.trim()) params.set('q', q.trim());
        if (region) params.set('region', region);
        if (rank) params.set('rank', rank);
        if (sort) params.set('sort', sort);
        if (order) params.set('order', order);

        const res = await apiFetch(`/api/leaderboard?${params.toString()}`);
        let data = res?.leaderboard || [];
        
        // Add example data if API is empty or for demo purposes
        if (data.length === 0 && import.meta.env.DEV) {
          data = [
            { userId: 'ex1', username: 'Phoenix', matchesPlayed: 342, rank: 'Diamond', region: 'NA' },
            { userId: 'ex2', username: 'Viper', matchesPlayed: 298, rank: 'Platinum', region: 'EU' },
            { userId: 'ex3', username: 'Shadow', matchesPlayed: 276, rank: 'Gold', region: 'ASIA' },
            { userId: 'ex4', username: 'Blaze', matchesPlayed: 254, rank: 'Gold', region: 'Global' },
            { userId: 'ex5', username: 'Storm', matchesPlayed: 231, rank: 'Silver', region: 'EU' },
            { userId: 'ex6', username: 'Frost', matchesPlayed: 209, rank: 'Silver', region: 'NA' },
            { userId: 'ex7', username: 'Ghost', matchesPlayed: 187, rank: 'Bronze', region: 'ASIA' },
            { userId: 'ex8', username: 'Neon', matchesPlayed: 165, rank: 'Bronze', region: 'Global' },
            { userId: 'ex9', username: 'Echo', matchesPlayed: 143, rank: 'Unranked', region: 'Global' },
          ].map((r, idx) => ({ position: idx + 1, ...r }));
        }

        if (!cancelled) {
          setRows(data);
          setTotal(Number(res?.total || (Array.isArray(data) ? data.length : 0)));
          setTotalPages(Number(res?.totalPages || 1));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load leaderboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit, page, q, region, rank, sort, order, refreshKey]);

  const showPodium =
    page === 1 &&
    !q.trim() &&
    !region &&
    !rank &&
    sort === 'matchesPlayed' &&
    order === 'desc' &&
    rows.length > 0;
  const podium = showPodium ? rows.slice(0, 3) : [];

  function setAndReset(setter, value) {
    setPage(1);
    setter(value);
  }

  function resetControls() {
    setPage(1);
    setQ('');
    setRegion('');
    setRank('');
    setSort('matchesPlayed');
    setOrder('desc');
    setLimit(25);
    setRefreshKey((v) => v + 1);
  }

  return (
    <div className="screen">
      <div className="shell wide">
        <motion.div className="card scoreboardCard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="scoreboardHero" style={{ backgroundImage: `url(${bannerUrl})` }}>
            <div className="scoreboardHeroOverlay">
              <div className="scoreboardTop">
                <div>
                  <div className="scoreboardTitle">Leaderboard</div>
                  <div className="scoreboardSub">
                    Top players by matches played
                    <span className="sep">/</span>
                    <span className="mono">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="scoreboardActions">
                  <button className="button" type="button" onClick={() => setRefreshKey((v) => v + 1)}>Refresh</button>
                  <button className="button primary" type="button" onClick={() => (window.location.href = '/play')}>Play</button>
                </div>
              </div>

              <div className="scoreboardTabs">
                {['Leaderboard', 'Scoreboard'].map((t) => {
                  const key = t.toLowerCase();
                  const active = key === tab;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`tab ${active ? 'active' : ''}`}
                      onClick={() => setTab(key)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="scoreboardBody">
            <div className="leaderboardControls">
              <div className="leaderboardControlsTop">
                <div className="leaderboardLeft">
                  <div className="subtitle">Players: {formatInt(total)}</div>
                  <div className="pill neon">Live</div>
                </div>
                <div className="leaderboardTopActions">
                  <button className="button" type="button" onClick={resetControls}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="leaderboardControlsGrid">
                <input
                  className="input leaderboardControl leaderboardSearch"
                  value={q}
                  placeholder="Search player"
                  onChange={(e) => setAndReset(setQ, e.target.value)}
                />
                <select className="input leaderboardControl" value={region} onChange={(e) => setAndReset(setRegion, e.target.value)}>
                  <option value="">All Regions</option>
                  <option value="Global">Global</option>
                  <option value="NA">NA</option>
                  <option value="EU">EU</option>
                  <option value="ASIA">ASIA</option>
                </select>
                <select className="input leaderboardControl" value={rank} onChange={(e) => setAndReset(setRank, e.target.value)}>
                  <option value="">All Ranks</option>
                  <option value="Unranked">Unranked</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Immortal">Immortal</option>
                  <option value="Radiant">Radiant</option>
                </select>
                <select className="input leaderboardControl" value={sort} onChange={(e) => setAndReset(setSort, e.target.value)}>
                  <option value="matchesPlayed">Sort: Matches</option>
                  <option value="username">Sort: Username</option>
                  <option value="rank">Sort: Rank</option>
                  <option value="region">Sort: Region</option>
                </select>
                <select className="input leaderboardControl" value={order} onChange={(e) => setAndReset(setOrder, e.target.value)}>
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
                <select className="input leaderboardControl" value={limit} onChange={(e) => setAndReset(setLimit, Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="divider" />

            {loading ? (
              <div className="loadingCard">
                <div className="loadingRow">
                  <div className="loadingAvatar loadingSkeleton" />
                  <div className="loadingText loadingSkeleton short" />
                </div>
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

            {!loading && !error && podium.length ? (
              <div className="leaderboardPodium">
                {podium.map((p) => {
                  const img = avatarDataUrl(p.userId || p.username, p.username);
                  return (
                    <div key={p.userId || p.username} className={`leaderboardPodiumCard p${p.position || 0}`}>
                      <div className="leaderboardPodiumRank">#{p.position || ''}</div>
                      <img className="leaderboardPodiumAvatar" src={img} alt="" />
                      <div className="leaderboardPodiumName">{p.username}</div>
                      <div className="leaderboardPodiumMeta">
                        {formatInt(p.matchesPlayed)} matches
                        <span className="sep">/</span>
                        <span>{p.rank || 'Unranked'}</span>
                        <span className="sep">/</span>
                        <span>{p.region || 'Global'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {!loading && !error && rows.length === 0 ? (
              <div className="emptyState">
                <div className="title">No leaderboard data yet</div>
                <div className="subtitle">Play a match to appear on the leaderboard.</div>
                <div className="row">
                  <button className="button primary" type="button" onClick={() => (window.location.href = '/play')}>
                    Go to Play
                  </button>
                </div>
              </div>
            ) : null}

            <div className="scoreTableWrap">
              <div className="scoreTable">
                <div className="scoreHeader">
                  <div className="cChamp">#</div>
                  <div className="cPlayer">Player</div>
                  <div className="cCredits right">Matches</div>
                  {tab === 'scoreboard' ? (
                    <>
                      <div className="cKDA right">K/D/A</div>
                      <div className="cStreak right">Streak</div>
                      <div className="cObj right">Objective</div>
                      <div className="cDmg right">Damage</div>
                      <div className="cShield right">Shield</div>
                      <div className="cHeal right">Healing</div>
                    </>
                  ) : (
                    <>
                      <div className="cKDA right">Rank</div>
                      <div className="cStreak right">Region</div>
                      <div className="cObj right">User</div>
                      <div className="cDmg right">—</div>
                      <div className="cShield right">—</div>
                      <div className="cHeal right">—</div>
                    </>
                  )}
                </div>

                {rows.map((r, idx) => {
                  const img = avatarDataUrl(r.userId || r.username, r.username);
                  const s = deriveStats(r.userId || r.username, r.matchesPlayed || 0);
                  const team = idx < Math.ceil(rows.length / 2) ? 'a' : 'b';
                  return (
                    <div key={`${r.userId || r.username}-${idx}`} className={`scoreRow team-${team}`}>
                      <div className="cChamp">
                        <div className="leaderboardRowRank">{r.position || idx + 1}</div>
                      </div>
                      <div className="cPlayer">
                        <img className="scoreAvatar" src={img} alt="" />
                        <div className="scoreName">{r.username}</div>
                        <div className="scoreMeta">
                          <span className="mono">{r.userId}</span>
                          <span className="sep">/</span>
                          <span>{r.rank || 'Unranked'}</span>
                          <span className="sep">/</span>
                          <span>{r.region || 'Global'}</span>
                        </div>
                      </div>
                      <div className="cCredits right"><span className="scoreNum">{formatInt(r.matchesPlayed || 0)}</span></div>
                      {tab === 'scoreboard' ? (
                        <>
                          <div className="cKDA right"><span className="scoreNum">{s.kda}</span></div>
                          <div className="cStreak right"><span className="scoreNum">{s.streak}</span></div>
                          <div className="cObj right"><span className="scoreNum">{s.obj}</span></div>
                          <div className="cDmg right"><span className="scoreNum">{formatInt(s.damage)}</span></div>
                          <div className="cShield right"><span className="scoreNum">{formatInt(s.shielding)}</span></div>
                          <div className="cHeal right"><span className="scoreNum">{formatInt(s.healing)}</span></div>
                        </>
                      ) : (
                        <>
                          <div className="cKDA right"><span className="scoreNum">{r.rank || 'Unranked'}</span></div>
                          <div className="cStreak right"><span className="scoreNum">{r.region || 'Global'}</span></div>
                          <div className="cObj right"><span className="scoreNum mono">{String(r.userId || '').slice(0, 10)}</span></div>
                          <div className="cDmg right"><span className="scoreNum">—</span></div>
                          <div className="cShield right"><span className="scoreNum">—</span></div>
                          <div className="cHeal right"><span className="scoreNum">—</span></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="scoreFooter">
              <div className="leaderboardPager">
                <button className="button" type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Prev
                </button>
                <div className="hint mono">
                  Page {page} / {totalPages}
                </div>
                <button
                  className="button"
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
