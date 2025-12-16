import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext.jsx';
import { playSfx } from '../utils/sfx.js';

export default function LobbyInviteModal({ open, onClose, lobbyId }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  async function copyText(v) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(String(v));
      return;
    }

    const ta = document.createElement('textarea');
    ta.value = String(v);
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/lobby/${lobbyId}`;
      await copyText(url);
      setCopied(true);
      playSfx('click');
      toast.push({ title: 'Invite link copied', message: 'Share it with friends to join this lobby', variant: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.push({ title: 'Failed to copy', message: err.message, variant: 'error' });
    }
  }

  async function handleCopyId() {
    try {
      await copyText(lobbyId);
      setCopiedId(true);
      playSfx('click');
      toast.push({ title: 'Lobby ID copied', message: 'Share it to help friends join', variant: 'success' });
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      toast.push({ title: 'Failed to copy', message: err.message, variant: 'error' });
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="modalOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modalCard" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <div className="modalHeader">
            <div className="modalTitle">Invite to Lobby</div>
            <button className="modalClose" onClick={onClose}>×</button>
          </div>

          <div className="modalBody">
            <div className="inviteInfo">
              <div className="inviteLabel">Lobby ID</div>
              <div className="inviteCode">{lobbyId}</div>
              <div className="row gap" style={{ alignItems: 'center' }}>
                <button className={`button ${copied ? 'success' : ''}`} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className={`button ${copiedId ? 'success' : ''}`} onClick={handleCopyId}>
                  {copiedId ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
            </div>

            <div className="inviteTip">
              <div className="hint">Share this link with friends to let them join your lobby directly.</div>
            </div>
          </div>

          <div className="modalFooter">
            <button className="button" onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
