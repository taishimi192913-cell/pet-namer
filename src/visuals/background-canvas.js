function fitCanvas(canvas, context) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { width, height };
}

function makeParticles(count, width, height) {
  return Array.from({ length: count }, (_, index) => ({
    x: (index * 179 + Math.random() * width) % width,
    y: Math.random() * height,
    r: 0.9 + Math.random() * 2.8,
    z: 0.15 + Math.random() * 0.85,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.45 ? '0, 113, 227' : '224, 206, 170',
  }));
}

function drawNoise(ctx, width, height, time) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = '#1d1d1f';
  const gap = 18;
  const offset = (time * 0.006) % gap;
  for (let y = -gap; y < height + gap; y += gap) {
    for (let x = -gap; x < width + gap; x += gap) {
      if ((x + y) % (gap * 3) === 0) {
        ctx.fillRect(x + offset, y - offset, 1, 1);
      }
    }
  }
  ctx.restore();
}

export function initBackgroundCanvas({ reducedMotion = false } = {}) {
  if (!document.body || document.querySelector('.site-depth-canvas')) return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return null;

  canvas.className = 'site-depth-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  document.documentElement.classList.add('has-site-visuals');

  let size = fitCanvas(canvas, ctx);
  let particles = makeParticles(Math.min(78, Math.max(36, Math.round(size.width / 18))), size.width, size.height);
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;

  const render = (time = 0) => {
    const scroll = window.scrollY || 0;
    ctx.clearRect(0, 0, size.width, size.height);

    const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
    gradient.addColorStop(0, 'rgba(244, 238, 222, 0.48)');
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.24)');
    gradient.addColorStop(1, 'rgba(224, 206, 170, 0.22)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, size.height);

    drawNoise(ctx, size.width, size.height, reducedMotion ? 0 : time);

    particles.forEach((particle) => {
      const drift = reducedMotion ? 0 : Math.sin(time * 0.00045 + particle.phase) * 10 * particle.z;
      const parallaxX = pointerX * 16 * particle.z;
      const parallaxY = pointerY * 12 * particle.z + scroll * 0.015 * particle.z;
      const x = (particle.x + drift + parallaxX + size.width) % size.width;
      const y = (particle.y + parallaxY + size.height) % size.height;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${particle.color}, ${0.05 + particle.z * 0.06})`;
      ctx.arc(x, y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion) raf = window.requestAnimationFrame(render);
  };

  const onResize = () => {
    size = fitCanvas(canvas, ctx);
    particles = makeParticles(Math.min(78, Math.max(36, Math.round(size.width / 18))), size.width, size.height);
    if (reducedMotion) render(0);
  };

  const onPointerMove = (event) => {
    pointerX = event.clientX / Math.max(1, size.width) - 0.5;
    pointerY = event.clientY / Math.max(1, size.height) - 0.5;
  };

  window.addEventListener('resize', onResize, { passive: true });
  if (!reducedMotion) window.addEventListener('pointermove', onPointerMove, { passive: true });
  render(0);

  return {
    destroy() {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.remove();
    },
  };
}
