import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Link({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `navLink ${isActive ? 'active' : ''}`}
      end={to === '/'}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthed, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function onLogout() {
    logout();
    setOpen(false);
    navigate('/', { replace: true });
  }

  function go(to) {
    setOpen(false);
    navigate(to);
  }

  return (
    <header className="nav">
      <div className="navInner">
        <div className="navLeft">
          <div className="brandMark" onClick={() => go('/')} role="button" tabIndex={0}>
            <div className="logoWrap">
              <Logo size={22} />
            </div>
            <div className="brandText">ArcadeConnect</div>
          </div>
          <nav className="navLinks">
            <Link to="/">Home</Link>
            <Link to="/play">Play</Link>
            <Link to="/lobby-demo">Demo</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/matches">Match History</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>

        <div className="navRight">
          <button className="navHamburger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
          {isAuthed ? (
            <>
              <div className="navUser">{user?.username || 'Player'}</div>
              <button className="button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>

      {open ? (
        <>
          <div className="navOverlay" onClick={() => setOpen(false)} />
          <div className="navDrawer">
            <div className="navDrawerTop">
              <div className="navDrawerTitle">Navigation</div>
              <button className="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="navDrawerLinks">
              <NavLink to="/" className="drawerLink" onClick={() => setOpen(false)} end>
                Home
              </NavLink>
              <NavLink to="/play" className="drawerLink" onClick={() => setOpen(false)}>
                Play
              </NavLink>
              <NavLink to="/lobby-demo" className="drawerLink" onClick={() => setOpen(false)}>
                Demo
              </NavLink>
              <NavLink to="/leaderboard" className="drawerLink" onClick={() => setOpen(false)}>
                Leaderboard
              </NavLink>
              <NavLink to="/matches" className="drawerLink" onClick={() => setOpen(false)}>
                Match History
              </NavLink>
              <NavLink to="/profile" className="drawerLink" onClick={() => setOpen(false)}>
                Profile
              </NavLink>
            </div>

            <div className="divider" />

            {isAuthed ? (
              <div className="navDrawerBottom">
                <div className="hint">Signed in as {user?.username || 'Player'}</div>
                <button className="button primary" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="navDrawerBottom">
                <button className="button primary" onClick={() => go('/login')}>
                  Login
                </button>
                <button className="button" onClick={() => go('/register')}>
                  Register
                </button>
              </div>
            )}
          </div>
        </>
      ) : null}
    </header>
  );
}
