/**
 * Daun Mas — Client-side behavior
 *
 * Features:
 * 1. Theme toggle (light/dark, respects OS preference)
 * 2. Scroll-reveal animations via IntersectionObserver
 * 3. Video auto-pause (only one plays at a time)
 * 4. Mobile nav auto-collapse on link click
 * 5. RFQ form inline validation + success state
 * 6. Gallery "show more" toggle
 */

(() => {
  'use strict';

  // ─── 1. THEME TOGGLE ──────────────────────────────────────────────
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');

  // Initialize theme from OS preference
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  root.setAttribute('data-theme', theme);

  themeToggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
  });


  // ─── 2. SCROLL REVEAL ─────────────────────────────────────────────
  // Elements with class="reveal" fade-in when they enter the viewport.
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el) => revealObserver.observe(el));


  // ─── 3. VIDEO AUTO-PAUSE ──────────────────────────────────────────
  // When one video starts playing, pause all others.
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    video.addEventListener('play', () => {
      videos.forEach((other) => {
        if (other !== video) other.pause();
      });
    });
  });


  // ─── 4. MOBILE NAV COLLAPSE ───────────────────────────────────────
  // Auto-close the Bootstrap mobile menu when a nav link is clicked.
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (
        mainNav &&
        mainNav.classList.contains('show') &&
        typeof bootstrap !== 'undefined'
      ) {
        const bsCollapse =
          bootstrap.Collapse.getInstance(mainNav) ||
          new bootstrap.Collapse(mainNav);
        bsCollapse.hide();
      }
    });
  });


  // ─── 5. RFQ FORM VALIDATION ───────────────────────────────────────
  const rfqForm = document.getElementById('rfqForm');
  const rfqSuccess = document.getElementById('rfqSuccess');

  if (rfqForm) {
    // Validation rules: field ID → { required, type, errorId }
    const fields = [
      { id: 'company', errorId: 'companyError' },
      { id: 'pic', errorId: 'picError' },
      { id: 'email', errorId: 'emailError', type: 'email' },
      { id: 'wa', errorId: 'waError' },
      { id: 'product', errorId: null },     // select, validated by empty value
      { id: 'quantity', errorId: 'qtyError' },
    ];

    /**
     * Validate a single field. Returns true if valid.
     * Shows/hides inline error message and applies CSS classes.
     */
    function validateField(fieldDef) {
      const el = document.getElementById(fieldDef.id);
      if (!el) return true;

      const value = el.value.trim();
      let isValid = true;

      // Check required
      if (el.hasAttribute('required') && !value) {
        isValid = false;
      }

      // Check email format
      if (isValid && fieldDef.type === 'email' && value) {
        // Simple email regex — good enough for inline hint
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      // Update UI
      el.classList.toggle('is-invalid', !isValid);
      el.classList.toggle('is-valid', isValid && value.length > 0);

      if (fieldDef.errorId) {
        const errorEl = document.getElementById(fieldDef.errorId);
        errorEl?.classList.toggle('is-visible', !isValid);
      }

      return isValid;
    }

    // Validate on blur (inline feedback as user fills form)
    fields.forEach((fieldDef) => {
      const el = document.getElementById(fieldDef.id);
      el?.addEventListener('blur', () => validateField(fieldDef));
      // Also clear error on input (responsive feel)
      el?.addEventListener('input', () => {
        if (el.classList.contains('is-invalid')) {
          validateField(fieldDef);
        }
      });
    });

    // Submit handler
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      let allValid = true;
      fields.forEach((fieldDef) => {
        if (!validateField(fieldDef)) {
          allValid = false;
        }
      });

      if (!allValid) {
        // Focus first invalid field
        const firstInvalid = rfqForm.querySelector('.is-invalid');
        firstInvalid?.focus();
        return;
      }

      // All valid — show success state
      rfqForm.style.display = 'none';
      if (rfqSuccess) {
        rfqSuccess.classList.add('is-visible');
      }
    });
  }


  // ─── 6. GALLERY "SHOW MORE" TOGGLE ────────────────────────────────
  const galleryToggle = document.getElementById('galleryToggle');
  const galleryExtras = document.querySelectorAll('.gallery-extra');

  if (galleryToggle && galleryExtras.length > 0) {
    let isExpanded = false;

    galleryToggle.addEventListener('click', () => {
      isExpanded = !isExpanded;

      galleryExtras.forEach((el) => {
        el.classList.toggle('is-shown', isExpanded);
      });

      galleryToggle.textContent = isExpanded
        ? 'Tampilkan lebih sedikit ↑'
        : 'Lihat semua foto ↓';
      galleryToggle.setAttribute('aria-expanded', isExpanded);
    });
  }
})();
