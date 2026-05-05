let mainBooted = false;

if ('BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const prompted = localStorage.getItem('sippomi_pwa_prompted');
    if (prompted === 'true') return;
    localStorage.setItem('sippomi_pwa_prompted', 'true');
    const banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <span>シッポミをホーム画面に追加すると、すぐに名前診断が開けます</span>
      <button class="pwa-banner__btn" type="button">追加する</button>
      <button class="pwa-banner__close" type="button" aria-label="閉じる">&times;</button>
    `;
    const addBtn = banner.querySelector('.pwa-banner__btn');
    addBtn.addEventListener('click', () => {
      e.prompt();
      e.userChoice.then(() => banner.remove());
    });
    banner.querySelector('.pwa-banner__close').addEventListener('click', () => banner.remove());
    document.body.prepend(banner);
    window.setTimeout(() => banner.classList.add('pwa-banner--visible'), 100);
  });
}

function installPwaStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .pwa-banner {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px; padding-bottom: calc(14px + env(safe-area-inset-bottom));
      background: rgba(29,29,31,0.95); backdrop-filter: blur(12px);
      color: #f5f5f7; font-size: 0.88rem; font-weight: 500; line-height: 1.4;
      transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    }
    .pwa-banner--visible { transform: translateY(0); }
    .pwa-banner__btn {
      flex-shrink: 0; padding: 10px 20px; border-radius: 999px; border: none;
      background: #0071e3; color: #fff; font-size: 0.84rem; font-weight: 700; cursor: pointer;
    }
    .pwa-banner__close {
      flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7);
      font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
  `;
  document.head.appendChild(style);
}
installPwaStyles();

function loadMainApp() {
  if (mainBooted) return;
  mainBooted = true;
  import('./main.js').catch((error) => {
    console.error('main bootstrap failed', error);
  });
}

if (window.location.hash === '#stepSpecies' || window.location.hash === '#diagnosisPanel' || window.location.search.length > 1) {
  loadMainApp();
} else {
  const diagnosisSection = document.getElementById('stepSpecies');
  if ('IntersectionObserver' in window && diagnosisSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMainApp();
        observer.disconnect();
      }
    }, { rootMargin: '320px 0px' });
    observer.observe(diagnosisSection);
  }

  ['pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
    window.addEventListener(eventName, loadMainApp, { once: true, passive: true });
  });

  document.querySelectorAll('a[href="#stepSpecies"]').forEach((link) => {
    link.addEventListener('click', loadMainApp, { once: true });
  });

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadMainApp, { timeout: 10000 });
  } else {
    window.setTimeout(loadMainApp, 10000);
  }
}
