import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterTop">
          <div className="siteFooterLead">
            <div className="siteFooterKicker">ArcadeConnect</div>
            <div className="siteFooterHeadline">Match. Ready. Play.</div>
            <div className="siteFooterCopy">
              Real-time matchmaking and synchronized lobbies built for fast sessions and competitive squads.
            </div>
            <div className="siteFooterCtas">
              <Link className="button primary" to="/play">Start a match</Link>
              <Link className="button" to="/leaderboard">View leaderboard</Link>
            </div>
          </div>

          <div className="siteFooterLinks">
            <div className="siteFooterCol">
              <div className="siteFooterTitle">Product</div>
              <Link to="/play" className="siteFooterLink">Play</Link>
              <Link to="/queue" className="siteFooterLink">Queue</Link>
              <Link to="/lobby" className="siteFooterLink">Lobby</Link>
              <Link to="/leaderboard" className="siteFooterLink">Leaderboard</Link>
            </div>
            <div className="siteFooterCol">
              <div className="siteFooterTitle">Account</div>
              <Link to="/profile" className="siteFooterLink">Profile</Link>
              <Link to="/matches" className="siteFooterLink">Match history</Link>
              <Link to="/profile" className="siteFooterLink">Settings</Link>
            </div>
            <div className="siteFooterCol">
              <div className="siteFooterTitle">Support</div>
              <a href="https://discord.gg/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterLink">Help</a>
              <a href="https://github.com/arcadeconnect/issues" target="_blank" rel="noopener noreferrer" className="siteFooterLink">Report a bug</a>
              <a href="mailto:support@arcadeconnect.com" className="siteFooterLink">Contact</a>
            </div>
            <div className="siteFooterCol">
              <div className="siteFooterTitle">Community</div>
              <a href="https://discord.gg/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterLink">Discord</a>
              <a href="https://x.com/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterLink">X</a>
              <a href="https://youtube.com/@arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterLink">YouTube</a>
            </div>
          </div>
        </div>

        <div className="siteFooterBottom">
          <div className="siteFooterMeta">
            <span className="siteFooterSmall">© {new Date().getFullYear()} ArcadeConnect</span>
            <span className="siteFooterDot">•</span>
            <a href="/privacy" className="siteFooterSmallLink">Privacy</a>
            <span className="siteFooterDot">•</span>
            <a href="/terms" className="siteFooterSmallLink">Terms</a>
          </div>
          <div className="siteFooterSocial">
            <a href="https://discord.gg/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterSocialBtn" aria-label="Discord">D</a>
            <a href="https://x.com/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterSocialBtn" aria-label="X">X</a>
            <a href="https://github.com/arcadeconnect" target="_blank" rel="noopener noreferrer" className="siteFooterSocialBtn" aria-label="GitHub">G</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
