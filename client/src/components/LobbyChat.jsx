import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getSocket } from '../utils/socket.js';
import { avatarDataUrl } from '../utils/avatar.js';
import { useToast } from '../context/ToastContext.jsx';
import { playSfx } from '../utils/sfx.js';

function formatTime(v) {
  try {
    const d = new Date(v);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function LobbyChat({ lobbyId, userId, username }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const toast = useToast();

  const listRef = useRef(null);

  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      toast.push({ title: 'Chat online', message: 'Connected', variant: 'success', timeoutMs: 1400 });
    }

    function onDisconnect() {
      setConnected(false);
      toast.push({ title: 'Chat offline', message: 'Reconnecting...', variant: 'warning', timeoutMs: 1600 });
    }

    function onHistory(payload) {
      if (payload?.lobbyId !== lobbyId) return;
      setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
    }

    function onMessage(msg) {
      if (msg?.lobbyId !== lobbyId) return;
      setMessages((prev) => {
        const next = prev.concat(msg);
        if (next.length > 60) return next.slice(next.length - 60);
        return next;
      });

      if (msg?.userId !== userId) {
        playSfx('chat');
      }
    }

    setConnected(Boolean(socket.connected));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('lobbyChatHistory', onHistory);
    socket.on('lobbyMessage', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('lobbyChatHistory', onHistory);
      socket.off('lobbyMessage', onMessage);
    };
  }, [lobbyId, socket]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function send() {
    const clean = text.trim();
    if (!clean) return;

    socket.emit('sendLobbyMessage', {
      lobbyId,
      userId,
      username,
      text: clean,
    });

    setText('');
    playSfx('click');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <motion.div className="chatPanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="chatHeader">
        <div>
          <div className="chatTitle">Lobby Chat</div>
          <div className="chatSub">{connected ? 'Connected' : 'Reconnecting...'}</div>
        </div>
        <div className={`pill ${connected ? 'pillReady' : ''}`}>{connected ? 'Online' : 'Offline'}</div>
      </div>

      <div className="chatList" ref={listRef}>
        {messages.map((m) => {
          const mine = m.userId === userId;
          const img = avatarDataUrl(m.userId || m.username, m.username);
          return (
            <div key={m.id} className={`chatMsg ${mine ? 'mine' : ''}`}>
              <img className="chatAvatar" src={img} alt="" />
              <div className="chatBubble">
                <div className="chatMeta">
                  <span className="chatName">{m.username}</span>
                  <span className="chatTime">{formatTime(m.createdAt)}</span>
                </div>
                <div className="chatText">{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chatComposer">
        <textarea
          className="chatInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          rows={2}
        />
        <button className="button primary" onClick={send}>
          Send
        </button>
      </div>
    </motion.div>
  );
}
