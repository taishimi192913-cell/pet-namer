/**
 * MEDVi 風: 足跡トレイル + カーソル（index のみ main.js から import）
 */
const TRAIL_INTERVAL_MS = 95;
const TRAIL_FADE_MS = 900;
const PARTICLE_INTERVAL_MS = 150;
const PARTICLE_FADE_MS = 800;

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

function randomParticleColor() {
  const from = [0, 113, 227];
  const to = [224, 206, 170];
  const ratio = Math.random();
  const rgb = from.map((value, index) => Math.round(value + (to[index] - value) * ratio));
  return `rgb(${rgb.join(', ')})`;
}

function initFootprintTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.hero-section')) return;

  let last = 0;
  let lastParticle = 0;
  const onMove = (e) => {
    const now = performance.now();
    if (now - last >= TRAIL_INTERVAL_MS) {
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
    }

    if (now - lastParticle >= PARTICLE_INTERVAL_MS) {
      lastParticle = now;

      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.setProperty('--particle-color', randomParticleColor());
      document.body.appendChild(particle);
      window.setTimeout(() => particle.remove(), PARTICLE_FADE_MS);
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
}

function initHeroBackgroundParallax() {
  const decor = document.querySelector('.hero-background-decor');
  const hero = document.querySelector('.hero-section');
  if (!decor || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let raf = 0;
  const update = () => {
    raf = 0;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = Math.round((window.scrollY || window.pageYOffset || 0) * 0.5);
    decor.style.transform = `translate3d(0, ${offset}px, 0)`;
  };

  const requestUpdate = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
}

function initDiagnoseButtonRebound() {
  const button = document.getElementById('btnDiagnose');
  if (!button) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const play = () => {
    button.classList.remove('btn-diagnose--rebound');
    void button.offsetWidth;
    button.classList.add('btn-diagnose--rebound');
  };

  button.addEventListener('pointerdown', play, { passive: true });
  button.addEventListener('animationend', () => {
    button.classList.remove('btn-diagnose--rebound');
  });
}

function initResultSectionReveal() {
  const resultSection = document.getElementById('resultSection');
  if (!resultSection) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    resultSection.classList.add('result-section--visible');
    return;
  }

  if (!('IntersectionObserver' in window)) {
    resultSection.classList.add('result-section--visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !resultSection.hidden) {
        resultSection.classList.add('result-section--visible');
      }
    }
  }, { threshold: 0.15 });

  observer.observe(resultSection);
}

function initSectionScrollNarrative() {
  const sections = Array.from(document.querySelectorAll('.section'));
  if (!sections.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach((section) => section.classList.add('section--in-view'));
    return;
  }

  sections.forEach((section) => section.classList.add('section-reveal-ready'));

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('section--in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('section--in-view');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  sections.forEach((section) => observer.observe(section));
}

function initMobileDiagnosisCta() {
  const hero = document.querySelector('.hero-section');
  const target = document.getElementById('stepSpecies');
  if (!hero || !target || document.querySelector('.mobile-diagnosis-cta')) return;

  const cta = document.createElement('a');
  cta.className = 'mobile-diagnosis-cta';
  cta.href = '#stepSpecies';
  cta.textContent = '今すぐ無料診断';
  document.body.appendChild(cta);

  let raf = 0;
  const update = () => {
    raf = 0;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const hasPassedHero = hero.getBoundingClientRect().bottom <= 0;
    cta.classList.toggle('is-visible', isMobile && hasPassedHero);
  };

  const requestUpdate = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
}

initFootprintTrail();
initHeroBackgroundParallax();
initDiagnoseButtonRebound();
initResultSectionReveal();
initSectionScrollNarrative();
initMobileDiagnosisCta();
