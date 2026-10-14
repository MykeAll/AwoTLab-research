(() => {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  const navLinks = nav ? nav.querySelectorAll('a') : [];
  function closeMenu() {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });
    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); });
  }

  // Hero image carousel: auto-advance, manual controls and pause/resume.
  const slides = [...document.querySelectorAll('.hero-slide')];
  const current = document.getElementById('slideCurrent');
  const track = document.getElementById('slideTrack');
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  const pause = document.getElementById('pauseSlides');
  let active = 0;
  let timer = null;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    if (current) current.textContent = String(active + 1).padStart(2, '0');
    if (track) track.style.width = `${((active + 1) / slides.length) * 100}%`;
  }
  function stopCarousel() { if (timer) clearInterval(timer); timer = null; }
  function startCarousel() {
    stopCarousel();
    if (!paused && slides.length > 1) timer = setInterval(() => showSlide(active + 1), 6500);
    if (pause) { pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel'); }
  }
  if (prev) prev.addEventListener('click', () => { showSlide(active - 1); startCarousel(); });
  if (next) next.addEventListener('click', () => { showSlide(active + 1); startCarousel(); });
  if (pause) pause.addEventListener('click', () => { paused = !paused; startCarousel(); });
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopCarousel);
    hero.addEventListener('mouseleave', startCarousel);
    hero.addEventListener('focusin', stopCarousel);
    hero.addEventListener('focusout', startCarousel);
  }
  showSlide(0); startCarousel();

  // Reveal content as it enters the viewport, with a graceful fallback.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Scroll progress and current section link state.
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  const sections = [...document.querySelectorAll('main section[id], main section.hero')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id || 'top';
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Click-to-enlarge user-supplied specimen photos.
  const dialog = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  document.querySelectorAll('.specimen-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!dialog || !lightboxImage) return;
      lightboxImage.src = card.dataset.image;
      lightboxImage.alt = card.querySelector('img')?.alt || 'Fish specimen';
      if (lightboxCaption) lightboxCaption.textContent = card.dataset.caption || '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(card.dataset.image, '_blank', 'noopener');
    });
  });
  const closeLightbox = document.getElementById('lightboxClose');
  if (closeLightbox && dialog) closeLightbox.addEventListener('click', () => dialog.close());
  if (dialog) dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  // No contact endpoint was supplied: prepare a draft in the visitor's email client.
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = `AwoTlab enquiry: ${data.get('topic')}`;
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nTopic: ${data.get('topic')}\n\n${data.get('message')}`;
    const contactEmail = 'Olatunji.mat@gmail.com';
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = 'Your email app should open with the enquiry drafted.';
  });
})();