import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWith } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: { username, password } });
      loginWith(res);
      const to = (location.state && location.state.from) || '/';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="shell">
        <motion.div className="card authCard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="authLayout">
            <div className="authMain">
              <div className="authHeader">
                <div className="authTitle">Welcome back</div>
                <div className="authSubtitle">Sign in to save profile and match history</div>
              </div>

              <form className="form" onSubmit={submit}>
                <label className="label">Username</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />

                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                {error ? <div className="errorBox">{error}</div> : null}

                <button className="button primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>

                <div className="hint authHint">
                  No account? <Link className="textLink" to="/register">Create one</Link>
                </div>
              </form>
            </div>

            <div className="authSide" aria-hidden="true">
              <div className="authSideTop">
                <div className="authSideBadge">ArcadeConnect</div>
                <div className="authSideHeading">Queue smarter. Play faster.</div>
                <div className="authSideCopy">
                  Premium matchmaking UI with synchronized lobbies and competitive stats.
                </div>
              </div>
              <div className="authSideList">
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Instant lobby updates</div>
                </div>
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Track matches and performance</div>
                </div>
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Modern, responsive UI</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
