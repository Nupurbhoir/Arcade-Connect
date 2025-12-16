import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Landing from './pages/landing.jsx';
import GameSelection from './pages/GameSelection.jsx';
import MatchmakingQueue from './pages/MatchmakingQueue.jsx';
import Lobby from './pages/Lobby.jsx';
import LobbyTeacherDemo from './pages/LobbyTeacherDemo.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import MatchHistory from './pages/MatchHistory.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import GameDemo from './pages/GameDemo.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<GameSelection />} />
        <Route path="/queue" element={<MatchmakingQueue />} />
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        <Route path="/lobby-demo" element={<LobbyTeacherDemo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/game-demo" element={<GameDemo />} />

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/matches" element={<MatchHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
