/* ============================================================
   JUANMA CIFUENTES — main.js
   GSAP + ScrollTrigger · Navigation · Gallery · Modal · Form
   ============================================================ */

'use strict';

/* ── GSAP setup ─────────────────────────────────────────────── */
if (typeof gsap === 'undefined') {
  console.warn('GSAP no disponible. La web funciona sin animaciones.');
  // Eliminar loading screen inmediatamente si GSAP falla
  const ls = document.getElementById('loading-screen');
  if (ls) ls.remove();
} else {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── HELPERS ─────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   1. LOADING SCREEN
   ================================================================ */
(function initLoader() {
  const screen = qs('#loading-screen');
  const name   = qs('.loader-name');
  if (!screen) return;

  if (prefersReducedMotion) {
    screen.style.display = 'none';
    return;
  }

  gsap.timeline()
    .to(name, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.0,
      ease: 'power3.out',
    })
    .to(screen, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => screen.remove(),
    }, '+=0.15');
})();

/* ================================================================
   2. SCROLL PROGRESS BAR
   ================================================================ */
(function initScrollProgress() {
  const bar = qs('.scroll-progress');
  if (!bar) return;

  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate: (self) => {
      bar.style.width = `${self.progress * 100}%`;
      bar.setAttribute('aria-valuenow', Math.round(self.progress * 100));
    },
  });
})();

/* ================================================================
   3. NAVIGATION — SIDEBAR ACTIVE DOTS
   ================================================================ */
(function initSidebarNav() {
  const dots    = qsa('.nav-dot');
  const sections = qsa('main section[id]');
  if (!dots.length) return;

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => setActiveNav(section.id),
      onEnterBack: () => setActiveNav(section.id),
    });
  });

  function setActiveNav(id) {
    dots.forEach((dot) => {
      dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`);
    });
  }
})();

/* ================================================================
   4. HAMBURGER + MOBILE DRAWER
   ================================================================ */
(function initMobileNav() {
  const hamburger = qs('#hamburger-btn');
  const drawer    = qs('#nav-drawer');
  const closeBtn  = qs('#drawer-close-btn');
  const drawerLinks = qsa('.drawer-link', drawer);
  if (!hamburger || !drawer) return;

  let isOpen = false;

  function openDrawer() {
    isOpen = true;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeDrawer() {
    isOpen = false;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => isOpen ? closeDrawer() : openDrawer());
  closeBtn?.addEventListener('click', closeDrawer);

  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeDrawer();
  });
})();

/* ================================================================
   5. SMOOTH ANCHOR SCROLLING
   ================================================================ */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const target = qs(anchor.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ================================================================
   6. HERO ANIMATIONS
   ================================================================ */
(function initHeroAnimations() {
  if (prefersReducedMotion) return;

  const lines   = qsa('.hero-name-line');
  const pre     = qs('.hero-pre');
  const tagline = qs('.hero-tagline');
  const ctas    = qs('.hero-ctas');
  const heroImg = qs('.hero-img');

  // Estados iniciales — elementos visibles por defecto en CSS,
  // los ocultamos aquí para que la animación tenga de dónde partir
  if (lines.length) gsap.set(lines, { clipPath: 'inset(0 100% 0 0)' });
  if (pre)     gsap.set(pre,     { opacity: 0, y: 12 });
  if (tagline) gsap.set(tagline, { opacity: 0, y: 12 });
  if (ctas)    gsap.set(ctas,    { opacity: 0, y: 8 });

  const tl = gsap.timeline({ delay: 1.4 });

  // Nombre: reveal clip-path de izquierda a derecha
  tl.to(lines, {
    clipPath: 'inset(0 0% 0 0)',
    duration: 0.9,
    stagger: 0.14,
    ease: 'power3.out',
  });

  // Pre + tagline + CTAs: fade-up escalonado
  tl.to([pre, tagline, ctas], {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power2.out',
  }, '-=0.45');

  // Ken-Burns: fromTo correcto en GSAP 3
  if (heroImg) {
    gsap.fromTo(heroImg,
      { scale: 1.07 },
      { scale: 1, duration: 2.8, ease: 'power1.out' }
    );
  }

  // Parallax en scroll
  if (heroImg) {
    gsap.to(heroImg, {
      y: '28%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  // Ocultar scroll indicator al primer scroll
  const indicator = qs('.scroll-indicator');
  if (indicator) {
    ScrollTrigger.create({
      trigger: document.body,
      start: '80px top',
      once: true,
      onEnter: () => gsap.to(indicator, { opacity: 0, duration: 0.5 }),
    });
  }
})();

/* ================================================================
   7. GENERIC SECTION REVEAL (opacity + translateY)
   ================================================================ */
(function initSectionReveals() {
  if (prefersReducedMotion) return;

  qsa('.section-title, .section-label, .section-header-row').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  qsa('.bio-text p').forEach((p, i) => {
    gsap.fromTo(p,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%', once: true },
      }
    );
  });

  gsap.fromTo('.casting-card',
    { opacity: 0, x: 24 },
    {
      opacity: 1, x: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.casting-card', start: 'top 85%', once: true },
    }
  );

  gsap.fromTo('.sobre-mi-img',
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1, scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.sobre-mi-img', start: 'top 85%', once: true },
    }
  );
})();

/* ================================================================
   8. SHOWREEL — LAZY EMBED
   ================================================================ */
(function initShowreel() {
  const embed       = qs('.showreel-embed');
  const placeholder = qs('#showreel-placeholder');
  const playBtn     = qs('#btn-play-embed');

  function loadEmbed() {
    if (!embed || embed.dataset.loaded) return;
    embed.dataset.loaded = 'true';
    const vimeoId = embed.dataset.vimeo;
    const iframe  = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&color=7B1F2E`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'Showreel de Juanma Cifuentes');
    embed.appendChild(iframe);
    if (placeholder) placeholder.style.display = 'none';
  }

  playBtn?.addEventListener('click', loadEmbed);

  // Autoload when entering viewport (no autoplay, just embed)
  if (embed) {
    ScrollTrigger.create({
      trigger: embed,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        // Preload embed DOM but don't autoplay
        if (!embed.dataset.loaded) {
          const vimeoId = embed.dataset.vimeo;
          const iframe  = document.createElement('iframe');
          iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=0&title=0&byline=0&portrait=0&color=7B1F2E`;
          iframe.allow = 'autoplay; fullscreen; picture-in-picture';
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('title', 'Showreel de Juanma Cifuentes');
          iframe.style.opacity = '0';
          embed.appendChild(iframe);
          embed.dataset.loaded = 'pending';
        }
      },
    });
  }
})();

/* ================================================================
   9. VIDEO MODAL (Hero CTA)
   ================================================================ */
(function initVideoModal() {
  const modal     = qs('#video-modal');
  const overlay   = qs('#modal-overlay');
  const closeBtn  = qs('#modal-close');
  const videoWrap = qs('#modal-video-wrap');
  const openBtn   = qs('#btn-showreel-hero');
  if (!modal) return;

  const VIMEO_ID = '930300084';

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!videoWrap.querySelector('iframe')) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&title=0&byline=0&portrait=0&color=7B1F2E`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', 'Showreel de Juanma Cifuentes');
      videoWrap.appendChild(iframe);
    }
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Remove iframe to stop video
    const iframe = videoWrap.querySelector('iframe');
    if (iframe) iframe.remove();
    openBtn?.focus();
  }

  openBtn?.addEventListener('click', openModal);
  overlay?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

/* ================================================================
   10. CINE CARDS — STAGGER REVEAL
   ================================================================ */
(function initCineCards() {
  if (prefersReducedMotion) return;

  const cards = qsa('.cine-card');
  if (!cards.length) return;

  gsap.fromTo(cards,
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cine-grid',
        start: 'top 80%',
        once: true,
      },
    }
  );
})();

/* ================================================================
   11. SERIES TIMELINE — SCROLL-DRIVEN BACKGROUND + LINE DRAWING
   ================================================================ */
(function initTimeline() {
  const lineEl = qs('.timeline-draw');

  /* -- SVG timeline line draw -- */
  if (!prefersReducedMotion && lineEl) {
    const length = lineEl.getTotalLength ? lineEl.getTotalLength() : 1000;
    gsap.set(lineEl, { strokeDasharray: length, strokeDashoffset: length });

    gsap.to(lineEl, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline-wrapper',
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 1,
      },
    });
  }

  /* -- Timeline entry reveals -- */
  if (!prefersReducedMotion) {
    qsa('.timeline-entry').forEach((entry) => {
      const isLeft  = entry.classList.contains('timeline-entry--left');
      gsap.fromTo(entry,
        { opacity: 0, x: isLeft ? -20 : 20 },
        {
          opacity: 1, x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: entry, start: 'top 85%', once: true },
        }
      );
    });

    qsa('.timeline-dot').forEach((dot) => {
      gsap.fromTo(dot,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.4,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: dot, start: 'top 85%', once: true },
        }
      );
    });
  }

  /* -- Transición crema→oscuro animada con scroll -- */
  const seam     = qs('.series-band-seam');
  const darkBand = qs('.series-band--dark');

  if (seam) {
    if (!prefersReducedMotion) {
      gsap.fromTo(seam,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: seam,
            start: 'top 95%',
            end: 'bottom 40%',
            scrub: 1,
          },
        }
      );
    }
  }

  if (darkBand && !prefersReducedMotion) {
    gsap.fromTo(darkBand.querySelector('.series-band-inner'),
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: darkBand,
          start: 'top 72%',
          once: true,
        },
      }
    );
  }

})();

/* ================================================================
   12. TEATRO LIST — CLIP-PATH REVEAL
   ================================================================ */
(function initTeatroReveals() {
  if (prefersReducedMotion) return;

  qsa('.teatro-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      {
        opacity: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.55,
        delay: i * 0.04,
        ease: 'power2.out',
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
      }
    );
  });

  // Award box border animation
  const hito = qs('.teatro-hito');
  if (hito) {
    gsap.fromTo(hito,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: hito, start: 'top 85%', once: true },
      }
    );
  }

  // Maestros list
  const maestros = qs('.maestros-list');
  if (maestros) {
    gsap.fromTo(maestros,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: maestros, start: 'top 88%', once: true },
      }
    );
  }
})();

/* ================================================================
   13. ZARZUELA — FLIP REVEAL
   ================================================================ */
(function initZarzuelaCards() {
  if (prefersReducedMotion) return;

  qsa('.zarzuela-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, rotateY: 8, y: 20 },
      {
        opacity: 1, rotateY: 0, y: 0,
        duration: 0.55,
        delay: i * 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      }
    );
  });

  // Zarzuela ornament SVG draw
  const ornament = qs('.zarzuela-ornament svg');
  if (ornament) {
    const paths = qsa('path, line, circle', ornament);
    paths.forEach((path) => {
      const len = path.getTotalLength ? path.getTotalLength() : 80;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, fill: 'none' });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: ornament, start: 'top 85%', once: true },
      });
    });
  }
})();

/* ================================================================
   14. DOCENCIA REVEAL
   ================================================================ */
(function initDocenciaReveal() {
  if (prefersReducedMotion) return;

  gsap.fromTo('.docencia-img',
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1, scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.docencia-img', start: 'top 85%', once: true },
    }
  );

  qsa('.docencia-text-col > *').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0,
        duration: 0.55,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });
})();

/* ================================================================
   15. GALLERY — FILTER + MASONRY + LIGHTBOX
   ================================================================ */
(function initGallery() {
  const grid      = qs('#gallery-grid');
  const filters   = qsa('.gallery-filter');
  const items     = qsa('.gallery-item', grid);
  const lightbox  = qs('#lightbox');
  const lbOverlay = qs('#lightbox-overlay');
  const lbClose   = qs('#lightbox-close');
  const lbPrev    = qs('#lightbox-prev');
  const lbNext    = qs('#lightbox-next');
  const lbImg     = qs('#lightbox-img');
  const lbCaption = qs('#lightbox-caption');

  if (!grid) return;

  let currentIndex = 0;
  let visibleItems = [];

  /* -- Intersection observer para reveal inicial escalonado -- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.style.display !== 'none') {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  items.forEach((item, i) => {
    item.style.transitionDelay = `${Math.min(i * 0.05, 0.4)}s`;
    observer.observe(item);
  });

  /* -- Filter con fade suave -- */
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach((item) => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        if (show) {
          // Mostrar: primero quitar display:none, luego animar a visible
          item.style.display = '';
          item.classList.remove('fading-out');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.classList.add('visible');
            });
          });
        } else {
          // Ocultar: fade-out, luego display:none al terminar transición
          item.classList.remove('visible');
          item.classList.add('fading-out');
          const hide = () => {
            item.style.display = 'none';
            item.removeEventListener('transitionend', hide);
          };
          item.addEventListener('transitionend', hide, { once: true });
        }
      });
    });
  });

  /* -- Lightbox -- */
  function openLightbox(index) {
    visibleItems = items.filter((i) => !i.classList.contains('hidden'));
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const img     = qs('img', item);
    const caption = qs('figcaption', item);
    if (lbImg) {
      lbImg.style.opacity = '0';
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbImg.onload = () => { lbImg.style.opacity = '1'; };
    }
    if (lbCaption) lbCaption.textContent = caption?.textContent || '';
    lbPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    lbNext.style.visibility = currentIndex < visibleItems.length - 1 ? 'visible' : 'hidden';
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const filtered = items.filter((x) => !x.classList.contains('hidden'));
      const idx = filtered.indexOf(item);
      openLightbox(idx);
    });
  });

  lbOverlay?.addEventListener('click', closeLightbox);
  lbClose?.addEventListener('click', closeLightbox);

  lbPrev?.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; updateLightbox(); }
  });
  lbNext?.addEventListener('click', () => {
    if (currentIndex < visibleItems.length - 1) { currentIndex++; updateLightbox(); }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updateLightbox(); }
    if (e.key === 'ArrowRight' && currentIndex < visibleItems.length - 1) { currentIndex++; updateLightbox(); }
  });
})();

/* ================================================================
   16. PRENSA CARDS — REVEAL
   ================================================================ */
(function initPresna() {
  if (prefersReducedMotion) return;

  qsa('.prensa-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.55,
        delay: i * 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      }
    );
  });
})();

/* ================================================================
   17. CONTACTO — FORM VALIDATION + SUBMIT
   ================================================================ */
(function initContactForm() {
  const form      = qs('#contacto-form');
  const submitBtn = qs('#btn-submit');
  const status    = qs('#form-status');
  if (!form) return;

  function validateField(input) {
    const errorEl = qs(`#error-${input.id.replace('campo-', '')}`);
    if (!input.validity.valid) {
      let msg = '';
      if (input.validity.valueMissing)  msg = 'Este campo es obligatorio.';
      if (input.validity.typeMismatch)  msg = 'Por favor, introduce un email válido.';
      if (errorEl) errorEl.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (errorEl) errorEl.textContent = '';
    input.removeAttribute('aria-invalid');
    return true;
  }

  // Live validation on blur
  qsa('.form-input', form).forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = qsa('.form-input[required]', form);
    const valid  = fields.map(validateField).every(Boolean);
    if (!valid) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    if (status) { status.textContent = ''; status.className = 'form-status'; }

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        if (status) {
          status.textContent = 'Mensaje enviado. Te contestaré en breve.';
          status.className = 'form-status success';
        }
        form.reset();
        setTimeout(() => {
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      if (status) {
        status.textContent = 'No se pudo enviar el mensaje. Por favor, intenta de nuevo.';
        status.className = 'form-status error';
      }
    }
  });
})();

/* ================================================================
   18. COUNTER ANIMATIONS (numbers in casting card)
   ================================================================ */
(function initCounters() {
  if (prefersReducedMotion) return;
  // Available for future numeric elements if needed
})();

/* ================================================================
   19. SHOWREEL HEADER PARALLAX
   ================================================================ */
(function initShowreelParallax() {
  if (prefersReducedMotion) return;

  const header = qs('.showreel-header');
  if (!header) return;

  gsap.fromTo(header,
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: header, start: 'top 85%', once: true },
    }
  );
})();

/* ================================================================
   20. SECTION ORNAMENTAL SEPARATORS — DRAW ANIMATION
   ================================================================ */
(function initSeparators() {
  if (prefersReducedMotion) return;

  // All CSS ::before separators are drawn via CSS animations
  // This adds a scroll trigger for the hito border draw effect
  const hito = qs('.teatro-hito');
  if (!hito) return;

  ScrollTrigger.create({
    trigger: hito,
    start: 'top 85%',
    once: true,
    onEnter: () => hito.classList.add('in-view'),
  });
})();

/* ================================================================
   21. KEYBOARD FOCUS TRAP FOR MODALS (ACCESSIBILITY)
   ================================================================ */
function trapFocus(container) {
  const focusable = qsa(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    container
  );
  if (!focusable.length) return () => {};

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}

// Apply focus traps when modals open
['#video-modal', '#lightbox'].forEach((sel) => {
  const el = qs(sel);
  if (!el) return;
  const observer = new MutationObserver(() => {
    if (el.classList.contains('open')) {
      el.__removeTrap = trapFocus(el);
    } else {
      el.__removeTrap?.();
    }
  });
  observer.observe(el, { attributes: true, attributeFilter: ['class'] });
});

/* ================================================================
   22. REFRESH SCROLLTRIGGER ON RESIZE (debounced)
   ================================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});
