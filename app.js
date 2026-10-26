(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = reducedMotion ? 'auto' : 'smooth';
  const clamp = (number, min = 0, max = 1) => Math.max(min, Math.min(max, number));

  const loader = $('.page-loader');
  const finishLoad = () => loader?.classList.add('is-loaded');
  if (document.readyState === 'complete') finishLoad();
  else window.addEventListener('load', finishLoad, { once: true });
  window.setTimeout(finishLoad, 1800);

  const menu = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');
  const setMenu = open => {
    if (!menu || !mobileNav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  $$('.mobile-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('visible'));

  const steps = [
    {
      label: '01 — THE LINE',
      title: 'A line drawn<br>from the <em>horizon.</em>',
      text: 'The continuous roof holds the composition together. Its quiet horizontal gesture lets the coast and water remain the focus.',
      caption: 'THE ROOF AS A HORIZONTAL DATUM'
    },
    {
      label: '02 — THE THRESHOLD',
      title: 'Inside and out,<br><em>in conversation.</em>',
      text: 'Deep shade, sliding glass and an uninterrupted terrace soften the separation between protected interior and the open landscape.',
      caption: 'A GRADUAL PASSAGE BETWEEN SPACES'
    },
    {
      label: '03 — THE LIGHT',
      title: 'Architecture<br>across <em>time.</em>',
      text: 'The stone retains its warmth at dusk while the interior becomes a quiet source of light. The building shifts in atmosphere, not identity.',
      caption: 'THE SAME FORM / A CHANGING ATMOSPHERE'
    }
  ];

  const scrollspace = $('#narrative-scrollspace');
  const sticky = $('.narrative-sticky');
  const sceneButtons = $$('.scene-select');
  const sceneImages = $$('.narrative-image');
  let currentScene = 0;
  const sceneNumber = $('#narrative-num');
  const sceneTitle = $('#narrative-step-title');
  const sceneText = $('#narrative-step-text');
  const sceneCaption = $('#scene-caption');
  const sceneCounter = $('#scene-counter');
  const sceneProgressLabel = $('#narrative-progress-label');

  function setScene(index) {
    if (!steps[index] || currentScene === index && sceneImages[index]?.classList.contains('is-current')) return;
    currentScene = index;
    const step = steps[index];
    sceneImages.forEach((image, i) => image.classList.toggle('is-current', i === index));
    sceneButtons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    sceneNumber.textContent = String(index + 1).padStart(2, '0');
    sceneTitle.innerHTML = step.title;
    sceneText.textContent = step.text;
    sceneCaption.textContent = step.caption;
    sceneCounter.textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    sceneProgressLabel.textContent = step.label;
  }

  function sequenceProgress() {
    if (!scrollspace || !sticky) return 0;
    const rect = scrollspace.getBoundingClientRect();
    const travel = Math.max(1, scrollspace.offsetHeight - sticky.offsetHeight);
    return clamp(-rect.top / travel);
  }

  function updateSequence() {
    if (!scrollspace || !sticky) return;
    const p = sequenceProgress();
    setScene(p < 0.325 ? 0 : p < 0.665 ? 1 : 2);
  }

  sceneButtons.forEach(button => button.addEventListener('click', () => {
    const i = Number(button.dataset.scene);
    setScene(i);
    if (!scrollspace || !sticky) return;
    const top = window.scrollY + scrollspace.getBoundingClientRect().top;
    const travel = Math.max(1, scrollspace.offsetHeight - sticky.offsetHeight);
    window.scrollTo({ top: top + travel * ([0.10, 0.48, 0.86][i] || 0), behavior: motion });
  }));

  const heroImage = $('#hero-image');
  const hero = $('.hero');
  const heroProgress = $('.hero-progress');
  let ticking = false;
  function scrollEffects() {
    ticking = false;
    updateSequence();
    if (!hero || !heroImage || reducedMotion) return;
    const r = hero.getBoundingClientRect();
    const amount = clamp(-r.top / Math.max(1, r.height));
    heroImage.style.transform = `translate3d(0, ${amount * 55}px, 0) scale(${1 + amount * 0.035})`;
    heroProgress.style.width = `${amount * 100}%`;
  }
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(scrollEffects);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  updateSequence();

  const range = $('#compare-range');
  const topImage = $('#compare-top');
  const line = $('#compare-line');
  function updateComparison() {
    if (!range || !topImage || !line) return;
    const amount = Number(range.value);
    topImage.style.clipPath = `inset(0 ${100 - amount}% 0 0)`;
    line.style.left = `${amount}%`;
  }
  range?.addEventListener('input', updateComparison);
  updateComparison();

  const projectData = {
    atrium: {
      label: '02 / CULTURAL INTERIOR CONCEPT',
      title: 'The Atrium',
      text: 'An interior study of movement and natural light. A curved stair becomes a spatial guide, drawing people through layered stone surfaces and changing shadows.',
      image: 'assets/atrium.webp',
      alt: 'Sculptural curved staircase within a warm stone atrium'
    },
    night: {
      label: '03 / RESIDENTIAL CONCEPT',
      title: 'The Cliff House',
      text: 'An exploration of warm interior life against an expansive coastal landscape at blue hour. The building reads as a sequence of illuminated rooms connected to the horizon.',
      image: 'assets/night-house.webp',
      alt: 'Stone coastal residence at twilight with warm lit rooms'
    }
  };
  const dialog = $('#project-dialog');
  $$('.project-card').forEach(card => card.addEventListener('click', () => {
    const project = projectData[card.dataset.project];
    if (!project || !dialog || typeof dialog.showModal !== 'function') return;
    $('#dialog-label').textContent = project.label;
    $('#dialog-title').textContent = project.title;
    $('#dialog-text').textContent = project.text;
    const image = $('#dialog-image');
    image.src = project.image;
    image.alt = project.alt;
    dialog.showModal();
  }));
  $('.dialog-close')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  $('.back-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion }));
})();
