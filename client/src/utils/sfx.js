let ctx;

function getCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone({ freq = 440, type = 'sine', duration = 0.12, gain = 0.05 }) {
  const ac = getCtx();
  if (!ac) return;

  if (ac.state === 'suspended') {
    ac.resume().catch(() => {});
  }

  const osc = ac.createOscillator();
  const g = ac.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  g.gain.value = 0.0001;
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);

  osc.connect(g);
  g.connect(ac.destination);

  osc.start();
  osc.stop(ac.currentTime + duration + 0.02);
}

export function playSfx(name) {
  const enabled = localStorage.getItem('ac_sfx') !== '0';
  if (!enabled) return;

  if (name === 'match_found') {
    tone({ freq: 880, type: 'triangle', duration: 0.09, gain: 0.06 });
    window.setTimeout(() => tone({ freq: 1175, type: 'triangle', duration: 0.11, gain: 0.06 }), 70);
    return;
  }

  if (name === 'start') {
    tone({ freq: 523.25, type: 'sine', duration: 0.08, gain: 0.05 });
    window.setTimeout(() => tone({ freq: 659.25, type: 'sine', duration: 0.08, gain: 0.05 }), 70);
    window.setTimeout(() => tone({ freq: 783.99, type: 'sine', duration: 0.10, gain: 0.05 }), 140);
    return;
  }

  if (name === 'click') {
    tone({ freq: 740, type: 'square', duration: 0.04, gain: 0.03 });
    return;
  }

  if (name === 'chat') {
    tone({ freq: 660, type: 'triangle', duration: 0.05, gain: 0.03 });
    return;
  }

  tone({ freq: 520, type: 'sine', duration: 0.06, gain: 0.03 });
}
