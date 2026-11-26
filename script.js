(() => {
  document.body.classList.add('js-ready');
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const progress = document.querySelector('.page-progress span');
  const glow = document.querySelector('.cursor-glow');
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  // No blocking intro: show the portfolio immediately.

  // Scroll progress.
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  // Native system cursor: intentionally no custom pointer effects.

  // Mobile navigation.
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  // Cinematic scroll reveals with staggered children.
  const revealItems = document.querySelectorAll('.section-block, .quick-facts, .hero-copy, .hero-art, .ticker, .skill-meter-panel');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        entry.target.querySelectorAll('.capability-card, .journey-card, .service-grid article, .workflow article, .project-card, .skill-meter').forEach((child, index) => {
          child.style.setProperty('--reveal-delay', `${Math.min(index * 85, 510)}ms`);
          child.classList.add('child-reveal');
        });
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });
    revealItems.forEach((item) => { item.classList.add('will-reveal'); observer.observe(item); });
  } else revealItems.forEach((item) => item.classList.add('is-revealed'));

  // Kinetic role line.
  const kineticWord = document.getElementById('kinetic-word');
  const words = ['strategy', 'sales', 'visual thinking', 'business growth'];
  if (kineticWord && !reduceMotion) {
    let wordIndex = 0;
    window.setInterval(() => {
      kineticWord.classList.add('is-changing');
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        kineticWord.textContent = words[wordIndex];
        kineticWord.classList.remove('is-changing');
      }, 260);
    }, 2200);
  }

  // Animate qualitative skill indicators only when the skill panel enters view.
  const skillPanel = document.querySelector('.skill-meter-panel');
  const animateSkills = () => {
    document.querySelectorAll('.skill-meter').forEach((meter) => meter.classList.add('is-filled'));
  };
  if (skillPanel && 'IntersectionObserver' in window && !reduceMotion) {
    const skillObserver = new IntersectionObserver((entries, instance) => {
      if (entries.some((entry) => entry.isIntersecting)) { animateSkills(); instance.disconnect(); }
    }, { threshold: 0.25 });
    skillObserver.observe(skillPanel);
  } else animateSkills();

  // Project category filtering.
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-category]');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible && !reduceMotion) { card.classList.remove('filter-in'); void card.offsetWidth; card.classList.add('filter-in'); }
    });
  }));

  // Subtle 3D tilt on project cards. Disabled on touch devices and reduced motion.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`);
        card.style.setProperty('--shine-x', `${x * 100}%`);
        card.style.setProperty('--shine-y', `${y * 100}%`);
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y');
      });
    });
  }

  // Highlight current navigation section.
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-current', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => activeObserver.observe(section));
  }
})();
