import { getArticleScenePreset } from './scene-presets.js';

function fitCanvasToImage(canvas, image, ctx) {
  const rect = image.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height || rect.width * 0.6667));

  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { width, height };
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPetSilhouette(ctx, x, y, scale, color, type = 'cat') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.ellipse(0, 8, 40, 24, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(type === 'dog' ? -36 : -32, -2, 18, 0, Math.PI * 2);
  ctx.fill();
  if (type === 'cat') {
    ctx.beginPath();
    ctx.moveTo(-43, -16);
    ctx.lineTo(-36, -34);
    ctx.lineTo(-27, -15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-27, -15);
    ctx.lineTo(-16, -31);
    ctx.lineTo(-15, -8);
    ctx.fill();
  } else {
    roundedRect(ctx, -52, -16, 12, 28, 8);
    ctx.fill();
    roundedRect(ctx, -26, -18, 12, 26, 8);
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.quadraticCurveTo(62, -32, 80, -4);
  ctx.stroke();
  ctx.restore();
}

function drawFineGrid(ctx, width, height, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.08;
  for (let x = width * 0.08; x < width * 0.95; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, height * 0.08);
    ctx.lineTo(x + 22, height * 0.92);
    ctx.stroke();
  }
  for (let y = height * 0.12; y < height * 0.9; y += 34) {
    ctx.beginPath();
    ctx.moveTo(width * 0.06, y);
    ctx.lineTo(width * 0.94, y - 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMicroPaws(ctx, width, height, color, time, reducedMotion) {
  const drift = reducedMotion ? 0 : Math.sin(time * 0.0012) * 3;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.055;
  for (let index = 0; index < 5; index += 1) {
    const x = width * 0.18 + index * width * 0.07;
    const y = height * 0.72 + Math.sin(index * 1.4) * 12 + drift;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((index % 2 ? 0.18 : -0.12) + drift * 0.008);
    ctx.beginPath();
    ctx.ellipse(0, 7, 5.2, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let toe = 0; toe < 4; toe += 1) {
      const angle = -1.95 + toe * 0.58;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 10, -4 + Math.sin(angle) * 6, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawRouteAnnotations(ctx, preset, width, height, time, reducedMotion) {
  const pulse = reducedMotion ? 0 : (Math.sin(time * 0.0018) + 1) * 0.5;
  const labels = preset.motif === 'map'
    ? ['route', 'shade', 'water']
    : ['memo', 'care', 'check'];

  ctx.save();
  ctx.font = '700 10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textBaseline = 'middle';
  labels.forEach((label, index) => {
    const x = width * (0.58 + index * 0.09);
    const y = height * (0.23 + (index % 2) * 0.18) + pulse * (index + 1);
    const chipWidth = 54 + label.length * 5;
    roundedRect(ctx, x, y, chipWidth, 26, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.globalAlpha = 0.42;
    ctx.fill();
    ctx.fillStyle = preset.primary;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x + 14, y + 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d1d1f';
    ctx.globalAlpha = 0.4;
    ctx.fillText(label, x + 25, y + 14);
  });
  ctx.restore();
}

function drawMotif(ctx, preset, width, height, time, reducedMotion) {
  const sway = reducedMotion ? 0 : Math.sin(time * 0.001) * 5;
  const baseY = height * 0.64;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  drawFineGrid(ctx, width, height, preset.accent);

  for (let index = 0; index < 5; index += 1) {
    const x = width * (0.12 + index * 0.19);
    const y = baseY + Math.sin(index) * 18 + sway * (index % 2 ? -1 : 1);
    ctx.strokeStyle = index % 2 ? preset.secondary : preset.primary;
    ctx.globalAlpha = 0.13;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 26, y + 26);
    ctx.bezierCurveTo(x - 10, y - 36, x + 20, y - 42, x + 34, y - 4);
    ctx.stroke();
  }

  if (preset.motif === 'kit') {
    roundedRect(ctx, width * 0.61, height * 0.46 + sway, width * 0.22, height * 0.18, 14);
    ctx.fillStyle = preset.primary;
    ctx.globalAlpha = 0.22;
    ctx.fill();
    ctx.strokeStyle = '#fff7ed';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, height * 0.49 + sway);
    ctx.lineTo(width * 0.72, height * 0.61 + sway);
    ctx.moveTo(width * 0.68, height * 0.55 + sway);
    ctx.lineTo(width * 0.76, height * 0.55 + sway);
    ctx.stroke();
  } else if (preset.motif === 'map') {
    ctx.strokeStyle = preset.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.26;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(width * 0.12, height * 0.58);
    ctx.bezierCurveTo(width * 0.35, height * 0.34 + sway, width * 0.55, height * 0.77, width * 0.84, height * 0.43);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = preset.primary;
    ctx.lineWidth = 1.5;
    for (let index = 0; index < 7; index += 1) {
      const x = width * (0.18 + index * 0.09);
      ctx.beginPath();
      ctx.moveTo(x, height * 0.32);
      ctx.lineTo(x + width * 0.08, height * 0.76);
      ctx.stroke();
    }
  } else if (preset.motif === 'care') {
    ctx.fillStyle = preset.secondary;
    ctx.globalAlpha = 0.19;
    for (let index = 0; index < 4; index += 1) {
      roundedRect(ctx, width * (0.48 + index * 0.07), height * (0.35 + (index % 2) * 0.1) + sway, 42, 16, 8);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = preset.accent;
    ctx.globalAlpha = 0.17;
    for (let index = 0; index < 4; index += 1) {
      roundedRect(ctx, width * (0.46 + index * 0.09), height * (0.42 + (index % 2) * 0.12) + sway, 56, 42, 10);
      ctx.fill();
    }
  }

  drawMicroPaws(ctx, width, height, preset.primary, time, reducedMotion);
  drawRouteAnnotations(ctx, preset, width, height, time, reducedMotion);
  drawPetSilhouette(ctx, width * 0.28, height * 0.58 + sway, Math.max(0.85, width / 980), preset.secondary, preset.animal);
  ctx.restore();
}

function drawScene(ctx, preset, size, time, reducedMotion) {
  const { width, height } = size;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(255, 250, 243, 0.24)');
  gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(1, 'rgba(244, 235, 218, 0.24)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = preset.primary;
  ctx.beginPath();
  ctx.ellipse(width * 0.72, height * 0.26, width * 0.24, height * 0.18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = preset.secondary;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.ellipse(width * 0.24, height * 0.34, width * 0.22, height * 0.2, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawMotif(ctx, preset, width, height, time, reducedMotion);

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const fade = ctx.createLinearGradient(0, 0, width, height);
  fade.addColorStop(0, 'rgba(0,0,0,0.78)');
  fade.addColorStop(0.62, 'rgba(0,0,0,0.42)');
  fade.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function enhanceArticleHeroFigures({ reducedMotion = false } = {}) {
  const figures = Array.from(document.querySelectorAll('.article-hero-figure'));
  if (!figures.length) return [];

  return figures.map((figure) => {
    const image = figure.querySelector('img');
    if (!image || figure.querySelector('.article-hero-figure__canvas')) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return null;

    const preset = getArticleScenePreset(image.currentSrc || image.src || image.getAttribute('src'));
    canvas.className = 'article-hero-figure__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    image.insertAdjacentElement('afterend', canvas);
    figure.classList.add('article-hero-figure--enhanced');

    let size = fitCanvasToImage(canvas, image, ctx);
    let raf = 0;
    let active = false;

    const render = (time = 0) => {
      drawScene(ctx, preset, size, time, reducedMotion);
      if (active && !reducedMotion) raf = window.requestAnimationFrame(render);
    };

    const resize = () => {
      size = fitCanvasToImage(canvas, image, ctx);
      render(0);
    };

    const start = () => {
      if (active) return;
      active = true;
      render(0);
    };

    const stop = () => {
      active = false;
      window.cancelAnimationFrame(raf);
    };

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
        else stop();
      }, { rootMargin: '120px 0px' })
      : null;

    window.addEventListener('resize', resize, { passive: true });
    if (observer) observer.observe(figure);
    else start();
    if (reducedMotion) render(0);

    return {
      destroy() {
        stop();
        observer?.disconnect();
        window.removeEventListener('resize', resize);
        canvas.remove();
      },
    };
  }).filter(Boolean);
}
