const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.site-menu');
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? 'Close' : 'Menu';
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = 'Menu';
}));

document.querySelectorAll('.compare').forEach((compare) => {
  const range = compare.querySelector('.compare-range');
  const update = () => compare.style.setProperty('--position', `${range.value}%`);
  range.addEventListener('input', update);
  update();
});

const hero = document.querySelector('.hero');
const splitter = document.querySelector('.hero-splitter');
if (hero && splitter) {
  splitter.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    splitter.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const bounds = hero.getBoundingClientRect();
      const percent = Math.max(35, Math.min(66, ((moveEvent.clientX - bounds.left) / bounds.width) * 100));
      hero.style.setProperty('--hero-split', `${percent}%`);
    };
    const stop = () => {
      splitter.removeEventListener('pointermove', move);
      splitter.removeEventListener('pointerup', stop);
      splitter.removeEventListener('pointercancel', stop);
    };
    splitter.addEventListener('pointermove', move);
    splitter.addEventListener('pointerup', stop);
    splitter.addEventListener('pointercancel', stop);
  });
}

const heroPan = document.querySelector('[data-pan]');
if (heroPan) {
  let panX = 0;
  heroPan.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    const startX = event.clientX;
    const startPan = panX;
    heroPan.classList.add('is-panning');
    heroPan.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      panX = Math.max(-90, Math.min(20, startPan + moveEvent.clientX - startX));
      heroPan.style.setProperty('--pan-x', `${panX}px`);
    };
    const stop = () => {
      heroPan.classList.remove('is-panning');
      heroPan.removeEventListener('pointermove', move);
      heroPan.removeEventListener('pointerup', stop);
      heroPan.removeEventListener('pointercancel', stop);
    };
    heroPan.addEventListener('pointermove', move);
    heroPan.addEventListener('pointerup', stop);
    heroPan.addEventListener('pointercancel', stop);
  });
}

const roomViewer = document.querySelector('#room-viewer');
const viewerStage = roomViewer?.querySelector('.viewer-stage');
const heroVideoWrap = document.querySelector('.interactive-video');
const heroVideo = heroVideoWrap?.querySelector('video');
const viewerVideo = viewerStage?.querySelector('video');
const closeViewer = () => {
  viewerVideo?.pause();
  roomViewer?.classList.remove('open');
  roomViewer?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-open');
};
const openViewer = () => {
  if (viewerVideo && heroVideo && Number.isFinite(heroVideo.currentTime)) viewerVideo.currentTime = heroVideo.currentTime;
  roomViewer.classList.add('open');
  roomViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('viewer-open');
  viewerStage.focus();
  viewerVideo?.play().catch(() => {});
};
document.querySelectorAll('.viewer-launch').forEach((button) => button.addEventListener('click', openViewer));
roomViewer?.querySelector('.viewer-close')?.addEventListener('click', closeViewer);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeViewer(); });

if (heroVideoWrap && heroVideo) {
  heroVideoWrap.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    const startX = event.clientX;
    const startTime = heroVideo.currentTime;
    let moved = false;
    heroVideo.pause();
    heroVideoWrap.classList.add('is-scrubbing');
    heroVideoWrap.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      if (Math.abs(delta) > 5) moved = true;
      if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 0) {
        const next = startTime + (delta / heroVideoWrap.clientWidth) * heroVideo.duration * 1.5;
        heroVideo.currentTime = ((next % heroVideo.duration) + heroVideo.duration) % heroVideo.duration;
      }
    };
    const stop = () => {
      heroVideoWrap.classList.remove('is-scrubbing');
      heroVideoWrap.removeEventListener('pointermove', move);
      heroVideoWrap.removeEventListener('pointerup', stop);
      heroVideoWrap.removeEventListener('pointercancel', stop);
      if (moved) heroVideo.play().catch(() => {}); else openViewer();
    };
    heroVideoWrap.addEventListener('pointermove', move);
    heroVideoWrap.addEventListener('pointerup', stop);
    heroVideoWrap.addEventListener('pointercancel', stop);
  });
  heroVideoWrap.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openViewer(); }
  });
}

if (viewerStage) {
  viewerStage.addEventListener('pointerdown', (event) => {
    const startX = event.clientX;
    const startTime = viewerVideo?.currentTime || 0;
    viewerVideo?.pause();
    viewerStage.classList.add('is-panning');
    viewerStage.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      if (viewerVideo && Number.isFinite(viewerVideo.duration) && viewerVideo.duration > 0) {
        const next = startTime + ((moveEvent.clientX - startX) / viewerStage.clientWidth) * viewerVideo.duration * 1.5;
        viewerVideo.currentTime = ((next % viewerVideo.duration) + viewerVideo.duration) % viewerVideo.duration;
      }
      roomViewer.classList.add('dragged');
    };
    const stop = () => {
      viewerStage.classList.remove('is-panning');
      viewerStage.removeEventListener('pointermove', move);
      viewerStage.removeEventListener('pointerup', stop);
      viewerStage.removeEventListener('pointercancel', stop);
      viewerVideo?.play().catch(() => {});
    };
    viewerStage.addEventListener('pointermove', move);
    viewerStage.addEventListener('pointerup', stop);
    viewerStage.addEventListener('pointercancel', stop);
  });
}

document.querySelector('#enquiry-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `Project enquiry — ${data.get('type')}`;
  const body = [`Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Project type: ${data.get('type')}`, `Location: ${data.get('location') || 'Not specified'}`, '', 'Project notes:', data.get('message')].join('\n');
  window.location.href = `mailto:hello@aurenatelier.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelectorAll('.feature-slideshow').forEach((slideshow) => {
  const slides = [...slideshow.querySelectorAll('.feature-slide')];
  const counter = slideshow.querySelector('.slideshow-controls b');
  let active = 0;
  let timer;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const selected = slideIndex === active;
      slide.classList.toggle('active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
    });
    counter.textContent = String(active + 1).padStart(2, '0');
  };
  const start = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = window.setInterval(() => show(active + 1), 4500);
  };
  const restart = () => { window.clearInterval(timer); start(); };
  slideshow.querySelector('.slide-prev').addEventListener('click', () => { show(active - 1); restart(); });
  slideshow.querySelector('.slide-next').addEventListener('click', () => { show(active + 1); restart(); });
  slideshow.addEventListener('mouseenter', () => window.clearInterval(timer));
  slideshow.addEventListener('mouseleave', start);
  show(0);
  start();
});
