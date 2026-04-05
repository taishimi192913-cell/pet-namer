/**
 * MEDVi 風: 足跡トレイル + カーソル（index のみ main.js から import）
 */
const TRAIL_INTERVAL_MS = 95;
const TRAIL_FADE_MS = 900;

const trailSvgs = [
  // 犬・猫 肉球
  '<svg width="42" height="42" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="22" rx="9" ry="7" fill="#f07d5a" opacity="0.22"/><circle cx="9" cy="12" r="3" fill="#f07d5a" opacity="0.2"/><circle cx="15" cy="8" r="3" fill="#f07d5a" opacity="0.2"/><circle cx="23" cy="12" r="3" fill="#f07d5a" opacity="0.2"/><circle cx="11" cy="6" r="2.5" fill="#f07d5a" opacity="0.18"/></svg>',
  // うさぎ（長めの足跡ペア）
  '<svg width="48" height="36" viewBox="0 0 48 36" aria-hidden="true"><ellipse cx="14" cy="22" rx="10" ry="6" fill="#6bc5b8" opacity="0.2" transform="rotate(-12 14 22)"/><ellipse cx="34" cy="18" rx="10" ry="6" fill="#6bc5b8" opacity="0.2" transform="rotate(8 34 18)"/></svg>',
  // 鳥（三爪）
  '<svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 24 L10 10 M16 24 L16 8 M16 24 L22 10" stroke="#e8b84b" stroke-width="2.2" stroke-linecap="round" opacity="0.35"/></svg>',
  // ハムスター（小さめ肉球）
  '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="20" rx="7" ry="5" fill="#ec8fa3" opacity="0.22"/><circle cx="11" cy="12" r="2.2" fill="#ec8fa3" opacity="0.2"/><circle cx="16" cy="9" r="2.2" fill="#ec8fa3" opacity="0.2"/><circle cx="21" cy="12" r="2.2" fill="#ec8fa3" opacity="0.2"/></svg>',
];

function initFootprintTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.hero-section')) return;

  let last = 0;
  const onMove = (e) => {
    const now = performance.now();
    if (now - last < TRAIL_INTERVAL_MS) return;
    last = now;

    const el = document.createElement('div');
    el.className = 'footprint-trail';
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    el.style.setProperty('--ft-rot', `${(Math.random() * 50 - 25).toFixed(1)}deg`);
    el.innerHTML = trailSvgs[Math.floor(Math.random() * trailSvgs.length)];
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), TRAIL_FADE_MS);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
}

initFootprintTrail();
