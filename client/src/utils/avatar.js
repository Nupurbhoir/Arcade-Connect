function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n) => {
    const v = Math.round((n + m) * 255);
    return v.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function avatarDataUrl(seed, label) {
  const base = String(seed || 'player');
  const h = hashString(base);

  const hue = h % 360;
  const c1 = hslToHex(hue, 90, 55);
  const c2 = hslToHex((hue + 65) % 360, 90, 50);

  const initials = String(label || 'P')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c1}" stop-opacity="1"/>
      <stop offset="1" stop-color="${c2}" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="hl" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 34) rotate(35) scale(70 50)">
      <stop stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="6" y="6" width="116" height="116" rx="26" fill="url(#g)"/>
  <rect x="6" y="6" width="116" height="116" rx="26" fill="url(#hl)"/>
  <rect x="6" y="6" width="116" height="116" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.28"/>
  <text x="64" y="74" text-anchor="middle" font-family="Inter, Arial" font-size="44" font-weight="800" fill="#0B0E1A" fill-opacity="0.92">${initials}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
