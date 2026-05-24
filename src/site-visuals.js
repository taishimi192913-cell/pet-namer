import { enhanceArticleHeroFigures } from './visuals/article-hero-canvas.js';
import { initBackgroundCanvas } from './visuals/background-canvas.js';

function bootSiteVisuals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initBackgroundCanvas({ reducedMotion });
  enhanceArticleHeroFigures({ reducedMotion });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootSiteVisuals, { once: true });
} else {
  bootSiteVisuals();
}
