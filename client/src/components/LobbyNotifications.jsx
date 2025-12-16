import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LobbyNotifications.css';

export default function LobbyNotifications({ socket }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onLobbyNotification = (n) => {
      setNotes((prev) => [...prev.slice(-4), { ...n, id: `${n.timestamp}-${n.userId}` }]);
    };
    socket.on('lobbyNotification', onLobbyNotification);
    return () => socket.off('lobbyNotification', onLobbyNotification);
  }, [socket]);

  useEffect(() => {
    if (notes.length === 0) return;
    const t = setTimeout(() => setNotes((prev) => prev.slice(1)), 4800);
    return () => clearTimeout(t);
  }, [notes]);

  return (
    <div className="lobbyNotifications">
      <AnimatePresence>
        {notes.map((n) => (
          <motion.div
            key={n.id}
            className="lobbyNote"
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ duration: 0.22 }}
          >
            <span className={`lobbyNoteIcon ${n.type}`} />
            <span className="lobbyNoteText">
              <b>{n.username}</b> {n.type === 'join' ? 'joined' : n.type === 'leave' ? 'left' : n.type === 'ready' ? 'is ready' : 'is not ready'}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
