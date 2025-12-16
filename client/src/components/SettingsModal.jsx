import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ open, onClose }) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const v = localStorage.getItem('ac_sfx');
    if (v !== null) return v !== '0';
    const legacy = localStorage.getItem('ac_sounds');
    if (legacy !== null) return legacy !== 'false';
    return true;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('ac_theme') || 'neon-cyan');

  function saveSounds(v) {
    setSoundEnabled(v);
    localStorage.setItem('ac_sfx', v ? '1' : '0');
    localStorage.setItem('ac_sounds', v ? 'true' : 'false');
  }

  function saveTheme(v) {
    setTheme(v);
    localStorage.setItem('ac_theme', v);
    document.body.setAttribute('data-theme', v);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="modalOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modalCard" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          <div className="modalHeader">
            <div className="modalTitle">Settings</div>
            <button className="modalClose" onClick={onClose}>×</button>
          </div>

          <div className="modalBody">
            <div className="settingGroup">
              <div className="settingLabel">Sound Effects</div>
              <div className="settingHint">Toggle UI sound effects (match found, clicks, chat)</div>
              <label className="switch">
                <input type="checkbox" checked={soundEnabled} onChange={(e) => saveSounds(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settingGroup">
              <div className="settingLabel">Theme</div>
              <div className="settingHint">Choose your neon color palette</div>
              <select className="select" value={theme} onChange={(e) => saveTheme(e.target.value)}>
                <option value="neon-cyan">Neon Cyan</option>
                <option value="neon-purple">Neon Purple</option>
                <option value="emerald">Emerald</option>
                <option value="red">Red</option>
              </select>
            </div>

            <div className="settingGroup">
              <div className="settingLabel">Language</div>
              <div className="settingHint">Display language (coming soon)</div>
              <select className="select" disabled>
                <option>English</option>
              </select>
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
