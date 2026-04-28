let mainBooted = false;

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
