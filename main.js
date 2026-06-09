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
  if (typeof gsap === 'undefined') return;
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
  if (typeof gsap === 'undefined') return;
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
  if (typeof gsap === 'undefined' || prefersReducedMotion) return;

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
      immediateRender: false,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true,
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
  if (typeof gsap === 'undefined') return;
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
  if (!embed || !playBtn) return;

  playBtn.addEventListener('click', () => {
    // Eliminar cualquier iframe previo
    embed.querySelectorAll('iframe').forEach(f => f.remove());
    const vimeoId = embed.dataset.vimeo;
    const iframe  = document.createElement('iframe');
    iframe.src    = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&color=7B1F2E`;
    iframe.allow  = 'autoplay; fullscreen; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'Showreel de Juanma Cifuentes');
    embed.appendChild(iframe);
    if (placeholder) placeholder.style.display = 'none';
  });
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
  if (!grid) return;

  const filters   = qsa('.gallery-filter');
  const items     = qsa('.gallery-item', grid);
  const lightbox  = qs('#lightbox');
  const lbOverlay = qs('#lightbox-overlay');
  const lbClose   = qs('#lightbox-close');
  const lbPrev    = qs('#lightbox-prev');
  const lbNext    = qs('#lightbox-next');
  const lbImg     = qs('#lightbox-img');
  const lbCaption = qs('#lightbox-caption');

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
  if (typeof gsap === 'undefined') return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});

/* ===== APPEND: nuevas secciones ===== */
/* ================================================================
   NUEVAS SECCIONES — JS
   Cronología (61 obras) · Microteatro · Quiz
   Reutiliza #video-modal del sitio. Si no existe gsap, degrada.
   ================================================================ */
(function(){
  const QS  = (s,c=document)=>c.querySelector(s);
  const QSA = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1 · CRONOLOGÍA  —  edita SOLO los arrays de abajo
     type: teatro | zarzuela | tv | cine
     img : imagen de esa obra (placeholder por ahora)
     video : ID de Vimeo (opcional) -> muestra botón play
     ============================================================ */
  const START=1992, END=2026, COLS=END-START+1, col=y=>y-START+1;
  const ph = s => `https://picsum.photos/seed/${s}/300/200`;

  const WORKS=[
    /* — CINE — */
    {y:2025,t:"La huella del mal",m:"Cine · Carlos Béjar",type:"cine",side:"up",img:"C1.jpeg"},
    {y:2023,t:"He pescado",m:"Cine · Cortometraje",type:"cine",side:"down",img:"public/HePescado.jpeg"},
    {y:2018,t:"El club de los buenos infieles",m:"Cine · Juan · Netflix",type:"cine",side:"down",img:"C3.jpg"},
    /* — TV — */
    {y:2025,t:"Sin Gluten",m:"TV · TVE",type:"tv",side:"down",img:"public/SinGluten.jpeg"},
    {y:2025,t:"Custodia repartida",m:"TV · Disney+ · Fesser",type:"tv",side:"up",img:null},
    {y:2025,t:"Atasco",m:"TV · Prime Video",type:"tv",side:"down",img:"public/Atasco.jpeg"},
    {y:2024,t:"Nos vemos en otra vida",m:"TV · Tenete · Disney+",type:"tv",side:"down",img:null},
    {y:2021,t:"Ana Tramel. El juego",m:"TV · Friman · TVE",type:"tv",side:"down",img:"public/AnaTramel.jpeg"},
    {y:2020,t:"HIT",m:"TV · Telmo · TVE",type:"tv",side:"down",img:null},
    {y:2019,t:"45 Revoluciones",m:"TV · Antena 3 / Netflix",type:"tv",side:"up",img:null},
    {y:2018,t:"La catedral del mar",m:"TV · Miquel · Netflix/A3",type:"tv",side:"up",img:"public/CatedralMar.jpeg"},
    {y:2015,t:"La que se avecina",m:"TV · Rogelio · Tele5",type:"tv",side:"up",img:"public/LaQueSeAvecina.webp"},
    {y:2014,t:"Gym Tony",m:"TV · Miguelón · Cuatro",type:"tv",side:"down",img:"gymtony.webp"},
    {y:2012,t:"Stamos Okupados",m:"TV · TVE",type:"tv",side:"down",img:"public/StamosOcupados.jpeg"},
    {y:2009,t:"Amar en tiempos revueltos",m:"TV · TVE",type:"tv",side:"down",img:null},
    {y:2007,t:"Síndrome de Ulises",m:"TV · TVE",type:"tv",side:"up",img:"public/SindromeUlises.jpeg"},
    {y:2005,t:"A tortas con la vida",m:"TV · Rafa · Antena 3",type:"tv",side:"down",img:"public/ATortasVida.jpg"},
    {y:2003,t:"Aquí no hay quien viva",m:"TV · Agustín/Rafa · Antena 3",type:"tv",side:"down",img:"public/AquiNoHayQuienViva.webp"},
    /* — TEATRO — */
    {y:2026,t:"El jardín de los cerezos",m:"Teatro · Pérez de la Fuente · Fernán Gómez",type:"teatro",side:"down",img:"public/JardinCerezos.jpg"},
    {y:2024,t:"Don Juan Tenorio",m:"Teatro · Cristófano · Fernán Gómez",type:"teatro",side:"up",img:"Juanma-Cifuentes-Don-Juan-Tenorio.jpg"},
    {y:2012,t:"Figuración especial con frase",m:"Teatro · Trujillo · Albacete",type:"teatro",side:"down",img:null},
    {y:2011,t:"Más se perdió en Cuba",m:"Teatro · Musical · T. Circo, Albacete",type:"teatro",side:"up",img:"public/MasPerdioCuba.jpeg"},
    {y:2009,t:"Asma de copla",m:"Teatro · Andrés Ermitaño · T. de la Paz",type:"teatro",side:"down",img:"public/AsmaCopla.jpeg"},
    {y:2008,t:"El juglar del Cid",m:"Teatro · Hamete · Almagro",type:"teatro",side:"up",img:"public/JuglarCid.jpeg"},
    {y:2004,t:"La cena de los idiotas",m:"Teatro · Agustín · T. Venevisión",type:"teatro",side:"down",img:null},
    {y:2002,t:"Defensa de Sancho Panza",m:"Teatro · Sancho Panza · SMEDIA",type:"teatro",side:"up",img:"public/DefensaSanchoPanza.jpeg"},
    {y:2002,t:"Sádicamente Sade",m:"Teatro · Fabrice · Pereira",type:"teatro",side:"down",img:null},
    {y:2000,t:"La tentación vive arriba",m:"Teatro · Bobadilla · Forqué",type:"teatro",side:"down",img:null},
    {y:1994,t:"Fuenteovejuna",m:"Teatro · Mengo · Marsillach",type:"teatro",side:"up",img:"public/Fuenteovejuna.jpeg"},
    {y:1992,t:"La gran sultana",m:"Teatro · Mustafá · Marsillach",type:"teatro",side:"up",img:"public/LaGranSultana.jpeg"},
    {y:1992,t:"Othello",m:"Teatro · Othello · S. Hutton",type:"teatro",side:"down",img:null},
    /* — ZARZUELA Y ÓPERA — */
    {y:2018,t:"Alí Babá",m:"Zarzuela · Musical",type:"zarzuela",side:"up",img:"public/AliBaba.jpeg"},
    {y:2018,t:"La malquerida",m:"Zarzuela · T. Campoamor",type:"zarzuela",side:"down",img:null},
    {y:2016,t:"La del Soto del Parral",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"down",img:null},
    {y:2014,t:"El dominó azul",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"up",img:null},
    {y:2013,t:"La corte de Faraón",m:"Zarzuela · Veranos de la Villa",type:"zarzuela",side:"down",img:"public/CorteFaraon.webp"},
    {y:2013,t:"La verbena de la Paloma",m:"Zarzuela · Teatros del Canal",type:"zarzuela",side:"down",img:"public/VerbenaPaloma.jpeg"},
    {y:2013,t:"La reina mora",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"up",img:"public/ReinaMora.jpeg"},
    {y:2013,t:"Alma de Dios",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"down",img:"public/AlmaDios.jpeg"},
    {y:2013,t:"La Tempranica",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"down",img:null},
    {y:2007,t:"Los descamisaos / La verbena de la Paloma",m:"Zarzuela · Ópera Cómica · Fernán Gómez",type:"zarzuela",side:"down",img:null},
    {y:2006,t:"La Gran Vía",m:"Zarzuela · Ópera Cómica · Fernán Gómez",type:"zarzuela",side:"up",img:null},
    {y:2006,t:"Katiuska",m:"Zarzuela · T. Gayarre · Kursaal",type:"zarzuela",side:"down",img:null},
    {y:2005,t:"Agua, azucarillos y aguardiente / El bateo",m:"Zarzuela · Ópera Cómica",type:"zarzuela",side:"down",img:null},
    {y:2005,t:"La verbena de la Paloma",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"up",img:"public/VerbenaPaloma.jpeg"},
    {y:2003,t:"Emigrantes / La señora capitana",m:"Zarzuela · Ópera Cómica · Villamarta",type:"zarzuela",side:"up",img:null},
    {y:2001,t:"El legado de Guerrero",m:"Zarzuela · T. Coliseum",type:"zarzuela",side:"up",img:null},
    {y:2001,t:"El Madrid de Jacinto Guerrero",m:"Zarzuela · La Corrala",type:"zarzuela",side:"down",img:null},
    {y:1999,t:"La tabernera del puerto",m:"Zarzuela · Sorozábal",type:"zarzuela",side:"up",img:"public/TaberneraPuerto.jpeg"},
    {y:1998,t:"Luisa Fernanda",m:"Zarzuela · Moreno Torroba",type:"zarzuela",side:"down",img:"public/LuisaFernanda.jpeg"},
    {y:1998,t:"Ensayo general",m:"Zarzuela · T. La Latina",type:"zarzuela",side:"down",img:null},
    {y:1998,t:"En brazos de Cupido",m:"Zarzuela · T. de la Paz",type:"zarzuela",side:"up",img:null},
    {y:1997,t:"La chulapona",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"down",img:null},
    {y:1995,t:"El huésped del sevillano",m:"Zarzuela · Guerrero",type:"zarzuela",side:"up",img:"public/HuespedSevillano.jpeg"},
    {y:1995,t:"Don Gil de Alcalá",m:"Zarzuela · T. de la Zarzuela",type:"zarzuela",side:"down",img:"public/DonGilAlcala.jpeg"},
    {y:1995,t:"El Teléfono",m:"Zarzuela · T. Conde Duque",type:"zarzuela",side:"up",img:null},
  ];

  const MILES=[
    {y:2004,text:"Premio Mejor Actor · Festival Teatro Avante, Miami"},
    {y:2024,text:"Estreno mundial en Disney+"},
    {y:2025,text:"Festival de Málaga · candidata al Goya 2026"},
  ];

  const ERAS=[
    {text:"ESCENA",   y:1994,top:"40%"},
    {text:"VOZ",      y:2005,top:"58%"},
    {text:"PANTALLA", y:2017,top:"40%"},
  ];

  const tl = QS('#timeline');
  if(tl){
    const AXIS_ROW=8;
    tl.style.setProperty('--cols',COLS);

    /* eje */
    const axis=document.createElement('div');
    axis.className='axis'; axis.style.gridColumn='1 / -1'; axis.style.gridRow=AXIS_ROW;
    for(let y=START;y<=END;y++){
      const s=document.createElement('span');
      s.className='year'; s.dataset.year=y;
      s.textContent=(y%2===0)?("’"+String(y).slice(2)):"";
      axis.appendChild(s);
    }
    tl.appendChild(axis);

    /* Packer con intervalos: soporta drift fuera de orden */
    const packer=()=>{
      const lanes=[];
      const isFree=(c,span,l)=>{
        if(!lanes[l]||!lanes[l].length)return true;
        const ne=c+span;
        return lanes[l].every(([s,e])=>e<c||s>=ne);
      };
      const occupy=(c,span,l)=>{if(!lanes[l])lanes[l]=[];lanes[l].push([c,c+span]);};
      /* pack sin drift — para títulos sin imagen */
      const pack=(c,span)=>{let l=0;while(!isFree(c,span,l))l++;occupy(c,span,l);return{col:c,lane:l};};
      /* packDrift — para fotos: busca hueco en lane mínima desplazándose ±drift cols */
      const packDrift=(c,span,drift=3)=>{
        for(let l=0;l<20;l++){
          for(let d=0;d<=drift;d++){
            const offs=d===0?[0]:[d,-d];
            for(const off of offs){
              const tc=c+off;
              if(tc<1)continue;
              if(isFree(tc,span,l)){occupy(tc,span,l);return{col:tc,lane:l};}
            }
          }
        }
        occupy(c,span,0);return{col:c,lane:0};
      };
      return{pack,packDrift};
    };

    /* ── OBRAS: fotos pegadas al eje con drift, títulos sueltos como antes ── */
    const upPack=packer(), downPack=packer();
    let maxDownLane=0, photoCount=0;
    WORKS.slice().sort((a,b)=>a.y-b.y).forEach(w=>{
      const c=col(w.y), isUp=w.side==='up';
      const pk=isUp?upPack:downPack;
      const {col:cf,lane}=w.img?pk.packDrift(c,2,3):pk.pack(c,1);
      if(!isUp) maxDownLane=Math.max(maxDownLane,lane);
      const rowVal=isUp?Math.max(2,AXIS_ROW-2-lane):AXIS_ROW+1+lane;

      if(w.img){
        const fig=document.createElement('figure');
        fig.className='strip-photo strip-photo--'+(isUp?'up':'down');
        fig.style.gridColumn=cf+' / span 2';
        fig.style.gridRow=rowVal;
        const tiltVal=(((photoCount%2===0)?1:-1)*(1.5+Math.random()*2.5));
        fig.style.setProperty('--tilt',tiltVal.toFixed(1)+'deg');
        photoCount++;
        const img=document.createElement('img');
        img.loading='lazy'; img.alt=w.t;
        img.onload=()=>{if(img.naturalWidth>img.naturalHeight) fig.classList.add('strip-photo--landscape');};
        img.src=w.img;
        const cap=document.createElement('figcaption');
        cap.innerHTML=`<strong class="sp-title">${w.t}</strong>${w.video?'<button class="m-play" data-video="'+w.video+'">▶</button>':''}<span class="sp-meta">${w.m} · ${w.y}</span>`;
        fig.appendChild(img); fig.appendChild(cap); tl.appendChild(fig);
      } else {
        const el=document.createElement('div');
        el.className='work work--'+w.type+' work--'+(isUp?'up':'down');
        el.style.gridColumn=cf;
        el.style.gridRow=rowVal;
        el.innerHTML=`<span class="w-dot"></span><span class="w-title">${w.t}</span>${w.video?'<span class="w-vid">▶</span>':''}<small>${w.m} · ${w.y}</small>`;
        tl.appendChild(el);
      }
    });

    /* hitos — pegados al eje (row 7, entre los títulos y el eje) */
    MILES.slice().sort((a,b)=>a.y-b.y).forEach(m=>{
      const c=col(m.y);
      const el=document.createElement('div');
      el.className='milestone'; el.style.gridColumn=c; el.style.gridRow=AXIS_ROW-1;
      el.innerHTML=`<span class="m-year">${m.y}</span>${m.text}`;
      tl.appendChild(el);
    });

    /* eras de fondo */
    const eraEls=ERAS.map(e=>{const s=document.createElement('span');s.className='era';s.textContent=e.text;s.style.top=e.top;tl.appendChild(s);return{el:s,data:e};});
    function placeEras(){eraEls.forEach(({el,data})=>{const yr=tl.querySelector('.axis .year[data-year="'+data.y+'"]');if(yr)el.style.left=(axis.offsetLeft+yr.offsetLeft)+'px';});}
    requestAnimationFrame(placeEras);
    window.addEventListener('resize',()=>requestAnimationFrame(placeEras));

    /* wrap */
    const wrap=QS('#cronoWrap');

    /* pista "desliza" */
    const hint=QS('#cronoHint');
    wrap&&wrap.addEventListener('scroll',()=>{if(wrap.scrollLeft>30&&hint)hint.classList.add('gone');},{passive:true});

    /* vídeo -> reutiliza #video-modal del sitio */
    const modal=QS('#video-modal'), vWrap=QS('#modal-video-wrap');
    function openVideo(id){
      if(!modal||!vWrap) return;
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      vWrap.innerHTML='';
      const f=document.createElement('iframe');
      f.src=`https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&color=7B1F2E`;
      f.allow='autoplay; fullscreen; picture-in-picture'; f.setAttribute('allowfullscreen','');
      vWrap.appendChild(f);
    }
    function closeVideo(){
      if(!modal||!vWrap) return;
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
      const f=vWrap.querySelector('iframe'); if(f) f.remove();
    }
    tl.addEventListener('click',e=>{const b=e.target.closest('.m-play');if(b){e.preventDefault();e.stopPropagation();openVideo(b.dataset.video);}});
    QS('#modal-overlay')&&QS('#modal-overlay').addEventListener('click',closeVideo);
    QS('#modal-close')&&QS('#modal-close').addEventListener('click',closeVideo);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeVideo();});

    /* arrastrar para desplazar (desktop) */
    if(wrap){
      let down=false,sx=0,sl=0;
      wrap.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;sl=wrap.scrollLeft;wrap.classList.add('dragging');});
      wrap.addEventListener('pointermove',e=>{if(down)wrap.scrollLeft=sl-(e.clientX-sx);});
      const up=()=>{down=false;wrap.classList.remove('dragging');};
      wrap.addEventListener('pointerup',up); wrap.addEventListener('pointerleave',up);
    }
  }

  /* ============================================================
     2 · MICROTEATRO  (tipo × tiempo)
     ============================================================ */
  (function(){
    const EJ={
      verso:{
        tag:'Verso clásico',
        3:{title:'La intención en un verso',dur:'3 min · individual',
          body:['Coge un solo verso del Siglo de Oro — cualquiera que te sepas.','Dilo diez veces seguidas, cada vez con una intención diferente: miedo, ironía, ternura, rabia, súplica… No repitas ninguna.','¿Cuántas veces puede cambiar una sola línea?'],
          tip:'El verso no cambia. Tú sí. Ahí está todo.'},
        5:{title:'El relevo de la pausa',dur:'5 min · en pareja',
          body:['Uno dice un fragmento de monólogo; el otro decide dónde van las pausas golpeando la mesa.','El que habla no puede adelantarse: espera la señal. El que marca no puede ser caprichoso: la pausa tiene que tener sentido.','Cambiad roles a la mitad.'],
          tip:'La pausa no es silencio vacío. Es lo que el personaje no puede decir todavía.'},
        10:{title:'La décima respirada',dur:'10 min · en pareja',
          body:['Coged diez versos de cualquier monólogo del Siglo de Oro (Segismundo va de lujo).','Uno los dice; el otro marca con una palmada el final de cada verso. La regla: una sola respiración por verso, ni media más.','Cuando suene mecánico, cambiad: el sentido manda sobre la métrica, no al revés.'],
          tip:'El verso no se recita, se piensa. Si entiendes lo que dices, el público también.'},
      },
      comedia:{
        tag:'Comedia física',
        3:{title:'El objeto imposible',dur:'3 min · individual',
          body:['Coge cualquier objeto que tengas a mano (bolígrafo, vaso, zapato).','Hazlo pesar 20 kilos. Luego que flote. Luego que queme. Treinta segundos cada estado.','Nada de palabras ni sonidos: solo el cuerpo y la cara.'],
          tip:'La comedia física no es hacer el ridículo. Es hacer real lo imposible.'},
        5:{title:'El estado de la silla',dur:'5 min · individual',
          body:['Una silla en el centro. Siéntate en ella como si fuera un trono, un banco de médico, una montaña rusa, un retrete público.','Un minuto por estado. La silla no cambia; tú cambias todo lo demás.','El público tiene que saber dónde estás sin que digas una palabra.'],
          tip:'En la máscara, el cuerpo grita y la cara escucha.'},
        10:{title:'El lazzo de la silla',dur:'10 min · individual',
          body:['Una silla en el centro. Tu objetivo absurdo: sentarte. El obstáculo te lo inventas (el suelo quema, la silla huye, tu cuerpo no obedece).','Tres intentos, cada uno más grande que el anterior. Nada de palabras: todo en el cuerpo y la cara.','Termina con un golpe de efecto (un "tac") que cierre el gag.'],
          tip:'Exagera el doble de lo que crees necesario. Luego un poco más.'},
      },
      drama:{
        tag:'Drama intenso',
        3:{title:'La palabra prohibida',dur:'3 min · individual',
          body:['Elige una sola palabra que no puedas pronunciar pero que lo explique todo.','Di todo lo demás. Rodéala. Evítala. El público tiene que sentir el hueco que deja.','Cuando ya no puedas más: dila.'],
          tip:'Lo que más duele rara vez se dice directamente. El rodeo es la verdad.'},
        5:{title:'El precio',dur:'5 min · individual',
          body:['Recuerda una decisión que cambió algo importante. No tienes que contarla: tienes que vivirla otra vez.','Sin palabras. Solo el cuerpo en el momento exacto antes de decidir.','Quédate ahí al menos treinta segundos. No resuelvas.'],
          tip:'El drama no se empuja, se permite. La inacción a veces es la escena más potente.'},
        10:{title:'La carta que no se envía',dur:'10 min · individual',
          body:['Escribe en 2 minutos lo que nunca le dijiste a alguien. Luego léelo en voz alta… a la silla vacía de enfrente.','Prohibido llorar a propósito y prohibido "actuar" la emoción. Solo decir la verdad de lo escrito.','Al acabar, rompe el papel. Ese gesto es el final de la escena.'],
          tip:'Cuanto menos lo fuerzas, más llega.'},
      },
      cantado:{
        tag:'Teatro cantado',
        3:{title:'Sin melodía',dur:'3 min · individual',
          body:['Coge tu canción favorita — la que sea.','Dila como texto, sin melodía, sin ritmo musical. Solo las palabras y lo que significan.','¿Qué queda cuando se va la música?'],
          tip:'Si el texto solo no funciona, la melodía tampoco salvará la actuación.'},
        5:{title:'La intención primero',dur:'5 min · individual',
          body:['Elige una copla o romanza que te sepas bien.','Primero dila como texto buscando qué quiere el personaje en cada frase — sin cantar.','Luego cántala manteniendo exactamente esas intenciones. La música se monta sobre la actuación.'],
          tip:'Primero actor, luego voz. Siempre en ese orden.'},
        10:{title:'Hablar la canción',dur:'10 min · individual',
          body:['Coge una romanza o copla que te sepas. Primero dila como texto, sin melodía, buscando qué quiere el personaje en cada frase.','Después cántala manteniendo EXACTAMENTE esas intenciones. La música se monta sobre la actuación, no la sustituye.','Graba las dos versiones y compáralas: ahí está el trabajo.'],
          tip:'Un tenor cómico que solo canta, aburre. Primero actor, luego voz.'},
      },
      impro:{
        tag:'Improvisación',
        3:{title:'La máquina',dur:'3 min · en grupo',
          body:['Tres personas forman una máquina con el cuerpo y sonidos — cada uno un engranaje.','Una cuarta persona le da un uso absurdo (máquina de peinar nubes, de traducir suspiros).','La máquina se adapta sin parar ni hablar entre sí.'],
          tip:'En la impro, el "no sé qué hacer" desaparece cuando te comprometes al 100% con lo que ya está pasando.'},
        5:{title:'El experto',dur:'5 min · en grupo',
          body:['Uno es "experto mundial" en algo que no existe o no sabe nada (la cría de dragones domésticos, el budismo lunar, el protocolo del queso).','Los demás le entrevistan con total seriedad. El experto nunca duda.','Cambiad de experto cuando la situación explote.'],
          tip:'La impro no es ser gracioso, es escuchar. El que ya sabe lo que va a decir no está en escena.'},
        10:{title:'Sí, y… además',dur:'10 min · en grupo',
          body:['Alguien lanza una frase. El siguiente acepta TODO lo propuesto ("sí") y añade algo nuevo ("y además…").','Prohibido negar, prohibido preguntar para ganar tiempo. La escena avanza o muere.','Sube la apuesta cada tres frases hasta que reventéis de risa o de tensión.'],
          tip:'Improvisar no es ser gracioso, es escuchar. El que ya sabe lo que va a decir no está escuchando.'},
      },
    };

    const opts=QSA('.micro-opt'), timeBtns=QSA('.micro-time'), res=QS('#microResult');
    if(!opts.length||!res) return;
    let activeMins='3', activeKey=null;

    function showResult(){
      if(!activeKey) return;
      const e=EJ[activeKey][activeMins];
      QS('#mrTag').textContent=EJ[activeKey].tag;
      QS('#mrTitle').textContent=e.title;
      QS('#mrDur').textContent=e.dur;
      QS('#mrBody').innerHTML=e.body.map(p=>`<p>${p}</p>`).join('');
      QS('#mrTip').textContent=' '+e.tip;
      res.classList.add('is-show');
      res.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
    }

    timeBtns.forEach(btn=>btn.addEventListener('click',()=>{
      timeBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeMins=btn.dataset.mins;
      if(activeKey) showResult();
    }));

    opts.forEach(btn=>btn.addEventListener('click',()=>{
      opts.forEach(o=>o.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeKey=btn.dataset.key;
      showResult();
    }));
  })();

  /* ============================================================
     3 · QUIZ
     ============================================================ */
  (function(){
    const PERS={
      miguelon:{
        name:'Miguelón',
        obra:'Gym Tony · Cuatro',
        img:'gymtony.webp',
        desc:'Afable, optimista y bienintencionado. Siempre a dieta, siempre en ropa de deporte, siempre con la promesa de empezar mañana. El motor cómico del grupo: el que más promete, el que menos cumple, y con quien todo el mundo conecta de inmediato porque es imposible no quererle.'
      },
      rafa:{
        name:'Rafa',
        obra:'Aquí no hay quien viva · A tortas con la vida · Antena 3',
        img:'public/ATortasVida.jpg',imgPos:'right center',
        desc:'Lleva una década sin superar su divorcio y lo ha convertido en su rasgo definitorio. Víctima voluntaria de su propio melodrama, entrañable e irremediable. El hombre que saca a su ex en cualquier conversación, a cualquier hora, sin importar el contexto.'
      },
      sancho:{
        name:'Sancho Panza',
        obra:'El hombre de La Mancha · teatro',
        img:'defensasancho.avif',
        desc:'El escudero más querido de la literatura: gordo, pragmático, leal y sensato frente a la locura idealista de su amo. Contradice a Don Quijote y a la vez lo sigue hasta el fin. Más profundo de lo que parece: Sancho es quien al final más cree en el sueño del caballero.'
      },
      hamlet:{
        name:'Hamlet',
        obra:'Hamlet · teatro',
        img:'R2.jpg',
        desc:'El príncipe de Dinamarca. Inteligente, indeciso, filosófico, al borde de la locura — o perfectamente lúcido fingiendo estarlo. El que le da mil vueltas a todo antes de actuar. Un rol que exige el máximo registro dramático y vocal, muy alejado de cualquier personaje cómico.'
      },
      friman:{
        name:'Friman',
        obra:'Ana Tramel. El juego · TVE',
        img:'public/AnaTramel.jpeg',imgPos:'70% center',
        desc:'Dueño de timbas ilegales con maneras de persona educada y aspecto bonachón. El aliado inesperado, el verso libre de la ecuación. Sorprendió porque rompía por completo el perfil cómico con el que el público identificaba a Cifuentes. La química con Maribel Verdú, uno de los puntos fuertes de la miniserie.'
      },
      bejar:{
        name:'Carlos Béjar',
        obra:'La huella del mal · 2025',
        img:'C1.jpeg',
        desc:'El taxidermista que se escapó de la justicia. Frío, perturbador, ritual. El papel más alejado del registro habitual de Cifuentes: un antagonista que mata siguiendo ritos prehistóricos. Demostración de su alcance dramático fuera de la comedia. El que siempre tiene un plan y siempre lo ejecuta.'
      },
      rogelio:{
        name:'Rogelio "el Padre Piruletas"',
        obra:'La que se avecina · Telecinco',
        img:'public/LaQueSeAvecina.webp',imgPos:'25% center',
        desc:'El párroco orondo, campechano y aparentemente devoto que esconde una naturaleza siniestra. Un personaje episódico de gran impacto: llegó, sorprendió y se fue, dejando uno de los giros más oscuros de la serie. La cara amable como escudo perfecto.'
      },
      taxista:{
        name:'El taxista',
        obra:'Atasco · Prime Video',
        img:'atasco.png',imgPos:'right center',
        desc:'Atrapado en un inmenso atasco a las afueras de Madrid, repite a lo largo de cinco episodios viviendo su pequeña historia dentro del gran mosaico de la serie. Sin apellidos, sin backstory, puro presente y situación. El que siempre llega donde hace falta, sin preguntas.'
      },
      cristofano:{
        name:'Cristófano Butarelli',
        obra:'Don Juan Tenorio · Teatro Fernán Gómez',
        img:'Juanma-Cifuentes-Don-Juan-Tenorio.jpg',
        desc:'El posadero italiano donde arranca la acción. Sirve vino y escucha cómo Don Juan y Don Luis se jactan de sus conquistas. Rol secundario con mucho sabor: presencia física, carácter, testigo cómplice. El que siempre está en el sitio exacto donde ocurren las cosas importantes.'
      },
      miquel:{
        name:'Miquel Bastaixo',
        obra:'La catedral del mar · Antena 3 / Netflix',
        img:'public/CatedralMar.jpeg',
        desc:'Uno de los porteadores de piedra que construyen Santa María del Mar en el Barcelona del siglo XIV. Personaje de la comunidad de trabajadores humildes que rodea y apoya al protagonista. Peso coral, épica histórica, trabajo silencioso. El que sostiene lo que otros no pueden cargar.'
      },
    };
    const steps=QSA('.quiz-step'), dots=QSA('#quizProgress span');
    if(!steps.length) return;
    let idx=0;
    const score={miguelon:0,rafa:0,sancho:0,hamlet:0,friman:0,bejar:0,rogelio:0,taxista:0,cristofano:0,miquel:0};
    function show(n){
      steps.forEach(s=>s.classList.remove('is-active'));
      if(n==='result'){
        const win=Object.keys(score).reduce((a,b)=>score[a]>=score[b]?a:b);
        const p=PERS[win];
        QS('#qrName').textContent=p.name;
        QS('#qrObra').textContent=p.obra;
        QS('#qrDesc').textContent=p.desc;
        const img=QS('#qrImg');
        if(img){img.src=p.img; img.alt=p.name; img.style.objectPosition=p.imgPos||'top center';}
        QS('[data-step="result"]').classList.add('is-active'); dots.forEach(d=>d.classList.add('on')); return;
      }
      QS(`[data-step="${n}"]`).classList.add('is-active');
      dots.forEach((d,i)=>d.classList.toggle('on',i<=n));
    }
    QSA('.quiz-ans').forEach(b=>b.addEventListener('click',()=>{score[b.dataset.w]++;idx++;show(idx<4?idx:'result');}));
    QS('#quizRestart')&&QS('#quizRestart').addEventListener('click',()=>{idx=0;for(const k in score)score[k]=0;show(0);});
  })();

})();

/* ================================================================
   HAMLET — apertura de telón + stagger de citas
   ================================================================ */
(function initHamletCurtain() {
  if (prefersReducedMotion) return;
  const left  = qs('.hq-curtain--left');
  const right = qs('.hq-curtain--right');
  const inner = qs('.hq-inner');
  if (!left || !right) return;

  // El contenido empieza invisible
  gsap.set(inner, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hq-section', start: 'top 65%', once: true },
  });

  // Telón se abre
  tl.to(left,  { x: '-100%', duration: 1.4, ease: 'power2.inOut' }, 0)
    .to(right, { x: '100%',  duration: 1.4, ease: 'power2.inOut' }, 0)
    // Contenido aparece cuando el telón ya está abierto a la mitad
    .to(inner, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.6);

  // Citas entran en stagger tras el telón
  gsap.fromTo('.hq-quote',
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.hq-quotes', start: 'top 80%', once: true } }
  );
})();

/* ================================================================
   JUANMA SIN FILTROS — animaciones
   ================================================================ */
(function initJuanmaOff() {
  if (prefersReducedMotion) return;

  /* Aplica el tilt de data-tilt como variable CSS */
  qsa('.jo-card').forEach(card => {
    const t = card.dataset.tilt || 0;
    card.style.setProperty('--card-tilt', t + 'deg');
  });

  /* Header: clip-path reveal */
  const header = qs('.jo-header');
  if (header) {
    gsap.fromTo(header,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 85%', once: true } }
    );
  }

  /* Fotos y cards mezclados: stagger de entrada conjunto */
  const joItems = qsa('.jo-stage .jo-portrait, .jo-stage .jo-card');
  if (joItems.length) {
    gsap.fromTo(joItems,
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.jo-stage', start: 'top 82%', once: true } }
    );
  }

})();

/* ================================================================
   REVEAL OBSERVER — añade in-view a todos los .reveal al entrar
   ================================================================ */
(function initRevealObserver() {
  const els = qsa('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => io.observe(el));
})();

/* Refresh ScrollTrigger cuando todo esté cargado para corregir
   posiciones si la página cargó con scroll distinto de 0 */
window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});

/* Protección básica contra descarga de imágenes */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
