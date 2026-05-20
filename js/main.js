/* ============================================================
   FAHOSUR FINANCE ACADEMY — Premium JS
   Stack: Vanilla JS + GSAP (ScrollTrigger, gsap core)
   No AOS. No jQuery.
   ============================================================ */

/* ── GSAP Plugin Registration ─────────────────────────────── */
// Assumes GSAP + ScrollTrigger loaded via CDN before this file
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Hide on mobile / touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
    return;
  }

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  const LERP = 0.15;

  // Dot follows exactly
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring lerps (lags) behind
  function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Scale up on hoverable elements
  const hoverTargets = 'a, button, .btn, .filter-btn, .course-card, .blog-card, .team-card, .accordion-header, .t-dot, [data-cursor-hover]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.style.transform  = 'translate(-50%, -50%) scale(0)';
      ring.classList.add('hovered');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.style.transform  = 'translate(-50%, -50%) scale(1)';
      ring.classList.remove('hovered');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  });
})();


/* ═══════════════════════════════════════════════════════════
   2. PAGE LOADER
   ═══════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Remove loader after page load + minimum delay for brand feel
  const minDelay = 1200;
  const startTime = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDelay - elapsed);
    setTimeout(() => {
      loader.classList.add('done');
      // Remove from DOM after transition
      setTimeout(() => loader.remove(), 700);
    }, remaining);
  });
})();


/* ═══════════════════════════════════════════════════════════
   3. NAVBAR — Scroll State + Active Link
   ═══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function handleScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on init

  // Active link detection on scroll
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    const observerOpts = { rootMargin: '-40% 0px -55% 0px' };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, observerOpts);

    sections.forEach((section) => sectionObserver.observe(section));
  }
})();


/* ═══════════════════════════════════════════════════════════
   4. HAMBURGER + FULL-SCREEN NAV OVERLAY
   ═══════════════════════════════════════════════════════════ */
(function initMobileNav() {
  const hamburger  = document.querySelector('.hamburger');
  const overlay    = document.getElementById('nav-overlay');
  if (!hamburger || !overlay) return;

  let isOpen = false;

  function openNav() {
    isOpen = true;
    hamburger.classList.add('active');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Stagger overlay links
    const links = overlay.querySelectorAll('.nav-overlay-link');
    links.forEach((link, i) => {
      link.style.opacity    = '0';
      link.style.transform  = 'translateX(-24px)';
      link.style.transition = `opacity 0.45s ${i * 0.06}s, transform 0.45s ${i * 0.06}s`;
      // Trigger reflow
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          link.style.opacity   = '';
          link.style.transform = '';
        });
      });
    });
  }

  function closeNav() {
    isOpen = false;
    hamburger.classList.remove('active');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    isOpen ? closeNav() : openNav();
  });

  // Close on overlay link click
  overlay.querySelectorAll('.nav-overlay-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeNav();
  });
})();


/* ═══════════════════════════════════════════════════════════
   5. SMOOTH ANCHOR SCROLLING
   ═══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   6. TICKER — Duplicate for Seamless Loop
   ═══════════════════════════════════════════════════════════ */
(function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;

  // Clone all children for seamless infinite loop
  const items = Array.from(track.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();


/* ═══════════════════════════════════════════════════════════
   7. COUNTER ANIMATION — data-count attribute
   ═══════════════════════════════════════════════════════════ */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.count);
  const suffix   = el.dataset.suffix || '';
  const decimals = (target % 1 !== 0) ? 1 : 0;
  const duration = 1800;
  const startTime = performance.now();

  // Easing: ease out cubic
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value    = easeOutCubic(progress) * target;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toFixed(decimals) + suffix;
  }

  requestAnimationFrame(update);
}


/* ═══════════════════════════════════════════════════════════
   8. COURSE FILTER
   ═══════════════════════════════════════════════════════════ */
(function initFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const courseCards  = document.querySelectorAll('.course-card[data-category]');
  if (!filterBtns.length || !courseCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter || 'all';

      courseCards.forEach((card) => {
        const category = card.dataset.category;
        const show = (filter === 'all' || category === filter);
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        if (show) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   9. ACCORDION / FAQ
   ═══════════════════════════════════════════════════════════ */
(function initAccordion() {
  const headers = document.querySelectorAll('.accordion-header');
  if (!headers.length) return;

  headers.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.accordion-item.open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('open');
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   10. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
  if ('ontouchstart' in window) return; // no magnetic on touch

  const RANGE  = 80;
  const STRENGTH = 0.4;

  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const dx      = e.clientX - centerX;
      const dy      = e.clientY - centerY;
      const dist    = Math.sqrt(dx * dx + dy * dy);

      if (dist < RANGE) {
        const factor = (RANGE - dist) / RANGE;
        const moveX  = dx * factor * STRENGTH;
        const moveY  = dy * factor * STRENGTH;
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   11. BACK TO TOP + WHATSAPP FLOAT
   ═══════════════════════════════════════════════════════════ */
(function initFloatingButtons() {
  const backToTop = document.getElementById('back-to-top');
  const waFloat   = document.getElementById('wa-float');

  function handleScroll() {
    const show = window.scrollY > 400;
    if (backToTop) backToTop.classList.toggle('visible', show);
    if (waFloat)   waFloat.classList.toggle('visible', show);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();


/* ═══════════════════════════════════════════════════════════
   12. GSAP ANIMATIONS (requires GSAP + ScrollTrigger)
   ═══════════════════════════════════════════════════════════ */
(function initGSAP() {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded — animations skipped.');
    return;
  }

  /* ── 12a. Hero — staggered text entrance on load ── */
  const heroTimeline = gsap.timeline({ delay: 1.3 }); // after loader

  const heroEyebrow  = document.querySelector('.hero-eyebrow');
  const heroTitle    = document.querySelector('.hero-title');
  const heroDesc     = document.querySelector('.hero-desc');
  const heroActions  = document.querySelector('.hero-actions');
  const heroStats    = document.querySelector('.hero-stats');

  [heroEyebrow, heroTitle, heroDesc, heroActions, heroStats].forEach((el) => {
    if (el) gsap.set(el, { opacity: 0, y: 40 });
  });

  if (heroEyebrow) heroTimeline.to(heroEyebrow,  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
  if (heroTitle)   heroTimeline.to(heroTitle,    { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.6');
  if (heroDesc)    heroTimeline.to(heroDesc,     { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7');
  if (heroActions) heroTimeline.to(heroActions,  { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
  if (heroStats)   heroTimeline.to(heroStats,    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');


  /* ── 12b. Section titles — slide up on enter ── */
  document.querySelectorAll('.section-header, .section-title').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      opacity: 0,
      y: 48,
      duration: 1.0,
      ease: 'power3.out',
    });
  });


  /* ── 12c. "Why FA" rows — alternating side slide-in ── */
  document.querySelectorAll('.why-row').forEach((row, i) => {
    const fromLeft  = i % 2 === 0;
    gsap.from(row, {
      scrollTrigger: {
        trigger: row,
        start: 'top 86%',
        once: true,
      },
      opacity: 0,
      x: fromLeft ? -60 : 60,
      duration: 1.0,
      ease: 'power3.out',
    });
  });


  /* ── 12d. Timeline items — alternating fade in left/right ── */
  document.querySelectorAll('.timeline-item-left, .timeline-item-right').forEach((item) => {
    const isRight = item.classList.contains('timeline-item-right');
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      x: isRight ? 60 : -60,
      duration: 0.95,
      ease: 'power3.out',
    });
  });


  /* ── 12e. Course cards — stagger in ── */
  const courseGrid = document.querySelector('.courses-grid');
  if (courseGrid) {
    gsap.from('.course-card', {
      scrollTrigger: {
        trigger: courseGrid,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 50,
      duration: 0.85,
      ease: 'power3.out',
      stagger: 0.1,
    });
  }


  /* ── 12f. Blog cards — stagger in ── */
  const blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) {
    gsap.from('.blog-card', {
      scrollTrigger: {
        trigger: blogGrid,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
    });
  }


  /* ── 12g. Team cards — stagger in ── */
  const teamGrid = document.querySelector('.team-grid');
  if (teamGrid) {
    gsap.from('.team-card', {
      scrollTrigger: {
        trigger: teamGrid,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      scale: 0.96,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    });
  }


  /* ── 12h. Testimonial section — fade in ── */
  const testimonialSection = document.querySelector('.testimonials-section');
  if (testimonialSection) {
    gsap.from('.testimonial-featured', {
      scrollTrigger: {
        trigger: testimonialSection,
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 50,
      duration: 1.1,
      ease: 'power3.out',
    });
  }


  /* ── 12i. Stats counter — triggered by ScrollTrigger ── */
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  statNumbers.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => animateCounter(el),
    });
  });

  // Also pick up hero stat numbers
  document.querySelectorAll('.hero-stat-num[data-count]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 95%',
      once: true,
      onEnter: () => animateCounter(el),
    });
  });


  /* ── 12j. CTA section — scale in ── */
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    gsap.from(ctaSection.querySelectorAll('.cta-title, .cta-desc, .cta-actions'), {
      scrollTrigger: {
        trigger: ctaSection,
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 40,
      duration: 1.0,
      ease: 'power3.out',
      stagger: 0.15,
    });
  }


  /* ── 12k. Generic fadeSlideUp for remaining elements ── */
  document.querySelectorAll('[data-gsap="fadeUp"]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

})();


/* ═══════════════════════════════════════════════════════════
   13. TESTIMONIAL SLIDER (lightweight, no library)
   ═══════════════════════════════════════════════════════════ */
(function initTestimonialSlider() {
  const testimonials = [
    {
      text:   "Fahosur completely changed how I approach the markets. Within 3 months of their Options Mastery course, I was consistently profitable. The mentorship quality is unparalleled in India.",
      name:   "Arjun Mehta",
      role:   "Options Trader, Mumbai",
      avatar: "images/testimonial-1.jpg",
    },
    {
      text:   "I had tried three other courses before. None came close to the depth and real-world relevance of what Fahosur teaches. My portfolio is up 68% since I enrolled.",
      name:   "Priya Krishnamurthy",
      role:   "Equity Analyst, Bengaluru",
      avatar: "images/testimonial-2.jpg",
    },
    {
      text:   "The Fundamental Analysis module alone was worth every rupee. The faculty's ability to simplify complex concepts without dumbing them down is rare and exceptional.",
      name:   "Rohan Sinha",
      role:   "Portfolio Manager, Delhi",
      avatar: "images/testimonial-3.jpg",
    },
  ];

  const textEl   = document.querySelector('.testimonial-text');
  const nameEl   = document.querySelector('.author-name');
  const roleEl   = document.querySelector('.author-role');
  const avatarEl = document.querySelector('.author-avatar');
  const dotsEl   = document.querySelectorAll('.t-dot');
  const featured = document.querySelector('.testimonial-featured');

  if (!textEl || !testimonials.length) return;

  let current = 0;
  let intervalId = null;

  function goTo(index) {
    current = (index + testimonials.length) % testimonials.length;
    const t = testimonials[current];

    // Fade out
    if (featured) {
      featured.style.transition = 'opacity 0.4s';
      featured.style.opacity = '0';
    }

    setTimeout(() => {
      if (textEl)   textEl.textContent   = `"${t.text}"`;
      if (nameEl)   nameEl.textContent   = t.name;
      if (roleEl)   roleEl.textContent   = t.role;
      if (avatarEl) { avatarEl.src = t.avatar; avatarEl.alt = t.name; }

      // Update dots
      dotsEl.forEach((dot, i) => dot.classList.toggle('active', i === current));

      // Fade in
      if (featured) {
        featured.style.opacity = '1';
      }
    }, 400);
  }

  function startAutoplay() {
    intervalId = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    clearInterval(intervalId);
  }

  // Dot click
  dotsEl.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goTo(i);
      startAutoplay();
    });
  });

  // Initialize
  goTo(0);
  startAutoplay();

  // Pause on hover
  if (featured) {
    featured.addEventListener('mouseenter', stopAutoplay);
    featured.addEventListener('mouseleave', startAutoplay);
  }
})();


/* ═══════════════════════════════════════════════════════════
   14. PARALLAX — subtle on hero orbs (requestAnimationFrame)
   ═══════════════════════════════════════════════════════════ */
(function initParallax() {
  if ('ontouchstart' in window) return;

  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const orb3 = document.querySelector('.hero-orb-3');
  if (!orb1 && !orb2) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (orb1) orb1.style.transform = `translateY(${scrollY * 0.15}px)`;
        if (orb2) orb2.style.transform = `translateY(${scrollY * -0.1}px)`;
        if (orb3) orb3.style.transform = `translateY(${scrollY * 0.08}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════
   15. FORM VALIDATION (contact / enrollment forms)
   ═══════════════════════════════════════════════════════════ */
(function initForms() {
  document.querySelectorAll('form[data-validate]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((field) => {
        const wrapper = field.closest('.form-group') || field.parentElement;
        const error   = wrapper?.querySelector('.form-error');

        if (!field.value.trim()) {
          valid = false;
          wrapper?.classList.add('has-error');
          if (error) error.textContent = 'This field is required';
        } else {
          wrapper?.classList.remove('has-error');
        }

        // Email validation
        if (field.type === 'email' && field.value.trim()) {
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(field.value)) {
            valid = false;
            wrapper?.classList.add('has-error');
            if (error) error.textContent = 'Enter a valid email address';
          }
        }
      });

      if (valid) {
        // Show success state (replace with real API call)
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          const original = btn.textContent;
          btn.textContent = 'Sent!';
          btn.disabled = true;
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
            form.reset();
          }, 3000);
        }
      }
    });

    // Clear errors on input
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => {
        const wrapper = field.closest('.form-group') || field.parentElement;
        wrapper?.classList.remove('has-error');
      });
    });
  });
})();


/* ═══════════════════════════════════════════════════════════
   16. LAZY LOAD IMAGES (IntersectionObserver)
   ═══════════════════════════════════════════════════════════ */
(function initLazyLoad() {
  const lazyImgs = document.querySelectorAll('img[data-src]');
  if (!lazyImgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    });
  }, { rootMargin: '200px' });

  lazyImgs.forEach((img) => observer.observe(img));
})();


/* ═══════════════════════════════════════════════════════════
   17. UTILITY — debounce helper
   ═══════════════════════════════════════════════════════════ */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}


/* ═══════════════════════════════════════════════════════════
   18. WINDOW RESIZE — recalculate ScrollTrigger
   ═══════════════════════════════════════════════════════════ */
window.addEventListener('resize', debounce(() => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}, 250));


/* ═══════════════════════════════════════════════════════════
   19. DOMContentLoaded GUARD — safe init wrapper
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Any DOM-dependent inits that need a fallback
  // (all major inits above use self-executing IIFEs that
  //  already query the DOM, so they're safe if this file
  //  is deferred or placed before </body>)
  console.log('%cFahosur Finance Academy — Premium UI loaded', 'color:#c9a84c;font-family:serif;font-size:13px;');
});
