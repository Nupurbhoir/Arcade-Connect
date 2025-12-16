import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
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
      const res = await apiFetch('/api/auth/register', { method: 'POST', body: { username, password } });
      loginWith(res);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
                <div className="authTitle">Create your account</div>
                <div className="authSubtitle">Track rank, region, and match history across every mode</div>
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
                  autoComplete="new-password"
                />

                {error ? <div className="errorBox">{error}</div> : null}

                <button className="button primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>

                <div className="hint authHint">
                  Already have an account? <Link className="textLink" to="/login">Login</Link>
                </div>
              </form>
            </div>

            <div className="authSide" aria-hidden="true">
              <div className="authSideTop">
                <div className="authSideBadge">ArcadeConnect</div>
                <div className="authSideHeading">Build your profile.</div>
                <div className="authSideCopy">
                  Save your rank, region, and stats—then bring your identity into every lobby.
                </div>
              </div>
              <div className="authSideList">
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Persistent profile & settings</div>
                </div>
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Match history and performance</div>
                </div>
                <div className="authSideItem">
                  <div className="authDot" />
                  <div>Instant queue → lobby flow</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
