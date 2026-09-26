/* ============================================================
   enhance.js — unified motion layer for StudentHub
   Ripple buttons · scroll-reveal · spotlight cards · page fade
   ============================================================ */
(function () {
  // ---- Page enter fade ----
  document.documentElement.style.scrollBehavior = 'smooth';
  document.body.classList.add('page-enter');

  // ---- Ripple effect on primary buttons ----
  function attachRipple(el) {
    if (el.dataset.rippleBound) return;
    el.dataset.rippleBound = '1';
    el.classList.add('ripple-holder');
    el.addEventListener('click', function (e) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - rect.left - size / 2) + 'px';
      dot.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(dot);
      setTimeout(() => dot.remove(), 650);
    });
  }

  function bindRipples(root) {
    (root || document).querySelectorAll('.btn-grad, .grad-btn, .btn-primary-grad, .btn-ghost, .filter-chip')
      .forEach(attachRipple);
  }

  // ---- Spotlight cursor glow on cards ----
  function bindSpotlights(root) {
    (root || document).querySelectorAll('.card-soft, .stat-card').forEach(card => {
      card.classList.add('spot-card');
      if (card.dataset.spotBound) return;
      card.dataset.spotBound = '1';
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  // ---- Scroll reveal ----
  let observer;
  function bindReveal(root) {
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    (root || document).querySelectorAll('.reveal:not(.in-view)').forEach(el => observer.observe(el));
  }

  // Auto-tag common content blocks as reveal targets (light touch, non-destructive)
  function autoTagReveal(root) {
    (root || document).querySelectorAll('.content .row.g-3 > div, .content > .card, table.table').forEach(el => {
      if (!el.classList.contains('reveal') && !el.closest('.modal')) {
        el.classList.add('reveal');
      }
    });
  }

  function initAll(root) {
    bindRipples(root);
    bindSpotlights(root);
    autoTagReveal(root);
    bindReveal(root);
  }

  document.addEventListener('DOMContentLoaded', () => initAll());

  // Re-scan when the SPA-style dashboard swaps views (app.js toggles .view.active)
  const bodyObserver = new MutationObserver((mutations) => {
    let shouldScan = false;
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('active')) shouldScan = true;
      if (m.addedNodes && m.addedNodes.length) shouldScan = true;
    });
    if (shouldScan) initAll();
  });
  document.addEventListener('DOMContentLoaded', () => {
    bodyObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });

  window.StudentHubEnhance = { initAll, bindRipples, bindSpotlights, bindReveal };
})();
