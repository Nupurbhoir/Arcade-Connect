import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarDataUrl } from '../utils/avatar.js';

export default function Profile() {
  const { token, user, refresh } = useAuth();

  const [rank, setRank] = useState(user?.rank || 'Unranked');
  const [region, setRegion] = useState(user?.region || 'Global');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setRank(user?.rank || 'Unranked');
    setRegion(user?.region || 'Global');
  }, [user?.rank, user?.region]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      try {
        const res = await apiFetch('/api/users/me/stats', { token });
        if (!cancelled && res?.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        if (!cancelled) {
          // Use demo stats if API fails
          setStats({
            matchesPlayed: 247,
            winRate: 68,
            kdRatio: 2.4,
            currentStreak: 12,
            mvps: 89,
            hoursPlayed: 432
          });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    if (token) loadStats();
    return () => { cancelled = true; };
  }, [token]);

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        token,
        body: { rank, region },
      });
      setMessage('Profile updated');
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const avatar = avatarDataUrl(user?.userId, user?.username);

  return (
    <div className="screen">
      <div className="shell">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profileHero">
            <div className="profileAvatarContainer">
              <img className="profileAvatar" src={avatar} alt="" />
              <div className="profileStatus">● Online</div>
            </div>
            <div className="profileMainInfo">
              <div className="profileHeaderInfo">
                <div className="profileUsername">{user?.username}</div>
                <div className="profileRankBadge">
                  <span className="rankIcon">RANK</span>
                  <span className="rankText">{rank}</span>
                </div>
              </div>
              <div className="profileBio">
                <p>Gaming enthusiast | Competitive player | Team player</p>
              </div>
            </div>
          </div>

          <div className="profileStats">
            {statsLoading ? (
              <div className="hint">Loading stats...</div>
            ) : stats ? (
              <>
                <div className="statItem">
                  <div className="statIcon">M</div>
                  <div className="statInfo">
                    <div className="statLabel">Matches</div>
                    <div className="statValue">{stats.matchesPlayed || 0}</div>
                  </div>
                </div>
                <div className="statItem">
                  <div className="statIcon">WR</div>
                  <div className="statInfo">
                    <div className="statLabel">Win Rate</div>
                    <div className="statValue">{stats.winRate || 0}%</div>
                  </div>
                </div>
                <div className="statItem">
                  <div className="statIcon">KD</div>
                  <div className="statInfo">
                    <div className="statLabel">K/D Ratio</div>
                    <div className="statValue">{stats.kdRatio || 0}</div>
                  </div>
                </div>
                <div className="statItem">
                  <div className="statIcon">ST</div>
                  <div className="statInfo">
                    <div className="statLabel">Streak</div>
                    <div className="statValue">{stats.currentStreak || 0}</div>
                  </div>
                </div>
                <div className="statItem">
                  <div className="statIcon">MVP</div>
                  <div className="statInfo">
                    <div className="statLabel">MVPs</div>
                    <div className="statValue">{stats.mvps || 0}</div>
                  </div>
                </div>
                <div className="statItem">
                  <div className="statIcon">HRS</div>
                  <div className="statInfo">
                    <div className="statLabel">Hours</div>
                    <div className="statValue">{stats.hoursPlayed || 0}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="hint">No stats available</div>
            )}
          </div>

          <div className="profileAchievements">
            <div className="sectionTitle">Recent Achievements</div>
            <div className="achievementGrid">
              <div className="achievementBadge">
                <div className="achievementIcon">AWD</div>
                <div className="achievementName">First Victory</div>
              </div>
              <div className="achievementBadge">
                <div className="achievementIcon">AIM</div>
                <div className="achievementName">Sharpshooter</div>
              </div>
              <div className="achievementBadge">
                <div className="achievementIcon">SUP</div>
                <div className="achievementName">Team Player</div>
              </div>
              <div className="achievementBadge">
                <div className="achievementIcon">SPD</div>
                <div className="achievementName">Speed Demon</div>
              </div>
            </div>
          </div>

          <div className="profileRecentGames">
            <div className="sectionTitle">Recent Games</div>
            <div className="recentGameList">
              <div className="recentGameItem">
                <img className="recentGameImage" src="https://images.squarespace-cdn.com/content/v1/6452911eae14586fe9375ab1/8e672e6b-3125-4adb-a9ca-1fdd4e58eac0/TTA-SocialShare.jpg" alt="Tactical Arena" />
                <div className="recentGameInfo">
                  <div className="recentGameName">Tactical Arena</div>
                  <div className="recentGameTime">2 hours ago</div>
                </div>
                <div className="recentGameResult victory">Victory</div>
              </div>
              <div className="recentGameItem">
                <img className="recentGameImage" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPKTqQ2rz-iJ6DVOv63iXy-3_vaHdgOONokw&s" alt="Battle Royale" />
                <div className="recentGameInfo">
                  <div className="recentGameName">Battle Royale</div>
                  <div className="recentGameTime">5 hours ago</div>
                </div>
                <div className="recentGameResult defeat">Defeat</div>
              </div>
              <div className="recentGameItem">
                <img className="recentGameImage" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoteCVIgYpIBFv8sR5vtEqFReXn1e3Zv19Aw&s" alt="Speed Rush" />
                <div className="recentGameInfo">
                  <div className="recentGameName">Speed Rush</div>
                  <div className="recentGameTime">1 day ago</div>
                </div>
                <div className="recentGameResult victory">Victory</div>
              </div>
            </div>
          </div>

          <div className="profileForm">
            <div className="sectionTitle">Settings</div>
            <div className="profileSettings">
              <div className="profileSettingsGrid">
                <div className="profileField">
                  <div className="label">Rank</div>
                  <select className="select profileSelect" value={rank} onChange={(e) => setRank(e.target.value)}>
                    <option>Unranked</option>
                    <option>Bronze</option>
                    <option>Silver</option>
                    <option>Gold</option>
                    <option>Platinum</option>
                    <option>Diamond</option>
                    <option>Master</option>
                    <option>Grandmaster</option>
                  </select>
                </div>

                <div className="profileField">
                  <div className="label">Region</div>
                  <select className="select profileSelect" value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option>Global</option>
                    <option>NA East</option>
                    <option>NA West</option>
                    <option>EU West</option>
                    <option>EU East</option>
                    <option>Asia</option>
                    <option>Oceania</option>
                  </select>
                </div>
              </div>

              <div className="profileSettingsActions">
                <button className="button primary profileSaveButton" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <div className="profileSettingsMessages">
                  {message && <div className="micro profileSuccess">{message}</div>}
                  {error && <div className="micro profileError">{error}</div>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
