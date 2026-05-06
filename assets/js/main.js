'use strict';

/* ================================================================
   main.js — Just Hold Her · Shared + Page-Specific Behaviors
   ================================================================
   1. Navigation (hamburger drawer)
   2. Modal system (generic open/close with focus management)
   3. Modal triggers (footer contact, contact cards, review copy)
   4. Formspree AJAX submission
   5. Press copy tabs + clipboard
   6. Headshot gallery
   7. Rotating quote banners (pause on hidden tab)
   8. Notebook: Substack RSS feed + post reading modal
   9. Notebook: Subscribe drawer
  10. Footer year
   ================================================================ */

(function () {

  /* ──────────────────────────────────────────────────────────────
     PHASE DATE FALLBACK
     Safety net: auto-corrects the body phase class if the manual
     switchover hasn't happened yet. Remove this block once
     phase-all is committed and the release banner is cleaned up.
  ────────────────────────────────────────────────────────────── */
  var now = new Date();
  var body = document.body;
  if (now >= new Date('2026-06-01T00:00:00-04:00')) {
    body.className = body.className.replace('phase-preorder', 'phase-all').replace('phase-ebook', 'phase-all');
  } else if (now >= new Date('2026-04-15T00:00:00-04:00')) {
    body.className = body.className.replace('phase-preorder', 'phase-ebook');
  }


  /* ──────────────────────────────────────────────────────────────
     SCROLL LOCK UTILITY
     Reference-counted so nav and modals don't collide.
     lockScroll() increments, unlockScroll() decrements.
     html.scroll-locked is applied when count > 0.
  ────────────────────────────────────────────────────────────── */
  var scrollLockCount = 0;

  function lockScroll() {
    scrollLockCount++;
    document.documentElement.classList.add('scroll-locked');
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.documentElement.classList.remove('scroll-locked');
    }
  }


  /* ──────────────────────────────────────────────────────────────
     1. NAVIGATION
  ────────────────────────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('nav-menu');
  var navOverlay = document.querySelector('.nav-overlay');

  function openNav() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.classList.add('active');
    navOverlay.classList.add('active');
    lockScroll();
  }

  function closeNav() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('active');
    navOverlay.classList.remove('active');
    unlockScroll();
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }


  /* ──────────────────────────────────────────────────────────────
     2. MODAL SYSTEM
  ────────────────────────────────────────────────────────────── */
  var activeModal = null;
  var activeTrigger = null;

  function openModal(id, trigger) {
    var modal = document.getElementById(id);
    if (!modal) return;
    activeModal = modal;
    activeTrigger = trigger || null;
    modal.classList.add('open');
    lockScroll();
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeActiveModal() {
    if (!activeModal) return;
    activeModal.classList.remove('open');
    unlockScroll();
    if (activeTrigger) activeTrigger.focus();
    activeModal = null;
    activeTrigger = null;
  }

  document.querySelectorAll('.modal-close').forEach(function (btn) {
    btn.addEventListener('click', closeActiveModal);
  });

  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeActiveModal();
    });
  });


  /* ──────────────────────────────────────────────────────────────
     UNIFIED KEYBOARD HANDLER
     Single listener handles Escape (nav/modal) + gallery arrows
  ────────────────────────────────────────────────────────────── */
  var galleryModal = document.getElementById('galleryModal');
  var currentGallerySlide = 0;
  var showGallerySlide = function () {};

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (activeModal) { closeActiveModal(); }
      else if (toggle && toggle.getAttribute('aria-expanded') === 'true') { closeNav(); toggle.focus(); }
      return;
    }
    if (galleryModal && activeModal === galleryModal) {
      if (e.key === 'ArrowLeft')  { showGallerySlide(currentGallerySlide - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { showGallerySlide(currentGallerySlide + 1); e.preventDefault(); }
    }
  });


  /* ──────────────────────────────────────────────────────────────
     3. MODAL TRIGGERS
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.footer-contact-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal('contactModal', btn); });
  });

  document.querySelectorAll('.contact-card[data-subject]').forEach(function (card) {
    card.addEventListener('click', function () {
      var subject = card.getAttribute('data-subject');
      var select = document.querySelector('#contactModal select[name="subject"]');
      if (select && subject) {
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value === subject) { select.selectedIndex = i; break; }
        }
      }
      openModal('contactModal', card);
    });
  });

  document.querySelectorAll('.asset-note-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal('contactModal', btn); });
  });

  document.querySelectorAll('#openReviewModal, #openReviewModal2').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal('rcopyModal', btn); });
  });

  document.querySelectorAll('#openVisitModal, #openVisitModal2').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal('visitModal', btn); });
  });


  /* ──────────────────────────────────────────────────────────────
     4. FORMSPREE AJAX SUBMISSION
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.modal-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Sending\u2026';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          var success = form.parentElement.querySelector('.modal-success');
          if (success) success.style.display = 'block';
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }).catch(function () {
        btn.textContent = originalText;
        btn.disabled = false;
      });
    });
  });


  /* ──────────────────────────────────────────────────────────────
     5. PRESS COPY TABS + CLIPBOARD
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.press-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.press-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.press-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var target = document.getElementById(tab.getAttribute('data-target'));
      if (target) target.classList.add('active');
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-copy'));
      if (!el) return;
      var text = el.innerText;
      var span = btn.querySelector('span');

      function onCopied() {
        btn.classList.add('copied');
        span.textContent = 'Copied';
        setTimeout(function () { btn.classList.remove('copied'); span.textContent = 'Copy Text'; }, 2500);
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(onCopied).catch(function () { fallbackCopy(text); onCopied(); });
      } else {
        fallbackCopy(text);
        onCopied();
      }
    });
  });


  /* ──────────────────────────────────────────────────────────────
     6. HEADSHOT GALLERY
  ────────────────────────────────────────────────────────────── */
  if (galleryModal) {
    var gSlides = galleryModal.querySelectorAll('.gallery-slide');
    var gDots = galleryModal.querySelectorAll('.gallery-dot');
    var dlDigital = galleryModal.querySelector('.gallery-download-digital');
    var dlHires = galleryModal.querySelector('.gallery-download-hires');

    var digitalUrls = [
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-A-digital.jpg',
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-B-digital.jpg',
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-C-digital.jpg'
    ];
    var hiresUrls = [
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-A-high-res.jpg',
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-B-high-res.jpg',
      'assets/img/judy-wright-headshot/downloads/judy-wright-headshot-C-high-res.jpg'
    ];

    showGallerySlide = function (index) {
      gSlides.forEach(function (s) { s.classList.remove('active'); });
      gDots.forEach(function (d) { d.classList.remove('active'); d.setAttribute('aria-selected', 'false'); });
      currentGallerySlide = (index + gSlides.length) % gSlides.length;
      gSlides[currentGallerySlide].classList.add('active');
      gDots[currentGallerySlide].classList.add('active');
      gDots[currentGallerySlide].setAttribute('aria-selected', 'true');
      if (dlDigital) dlDigital.href = digitalUrls[currentGallerySlide];
      if (dlHires) dlHires.href = hiresUrls[currentGallerySlide];
    };

    galleryModal.querySelector('.gallery-prev').addEventListener('click', function () { showGallerySlide(currentGallerySlide - 1); });
    galleryModal.querySelector('.gallery-next').addEventListener('click', function () { showGallerySlide(currentGallerySlide + 1); });

    gDots.forEach(function (dot) {
      dot.addEventListener('click', function () { showGallerySlide(parseInt(dot.getAttribute('data-index'), 10)); });
    });

    var galleryBtn = document.getElementById('openGalleryBtn');
    if (galleryBtn) {
      galleryBtn.addEventListener('click', function () { showGallerySlide(0); openModal('galleryModal', galleryBtn); });
    }

    showGallerySlide(0);
  }


  /* ──────────────────────────────────────────────────────────────
     7. ROTATING QUOTE BANNERS
     Auto-advance pauses when tab is hidden to save CPU
  ────────────────────────────────────────────────────────────── */
  var quoteTimers = [];

  document.querySelectorAll('.quote-banner').forEach(function (banner) {
    var slides = banner.querySelectorAll('.quote-slide');
    var dotsContainer = banner.querySelector('.quote-dots');
    if (!slides.length || !dotsContainer) return;

    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Quote ' + (i + 1) + ' of ' + slides.length);
      dot.addEventListener('click', function () { goTo(i); resetTimer(); });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('.quote-dot');

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    resetTimer();
    quoteTimers.push({
      start: resetTimer,
      stop: function () { if (timer) { clearInterval(timer); timer = null; } }
    });
  });

  /* Pause all quote timers when tab is hidden */
  document.addEventListener('visibilitychange', function () {
    quoteTimers.forEach(function (t) { document.hidden ? t.stop() : t.start(); });
  });


  /* ──────────────────────────────────────────────────────────────
     8. NOTEBOOK: SUBSTACK RSS FEED + POST MODAL
     Post content from Substack is injected as raw HTML — this is
     trusted first-party content from the author's own feed,
     proxied through a Cloudflare Worker.
  ────────────────────────────────────────────────────────────── */
  var rssContainer = document.getElementById('rss-container');

  if (rssContainer) {
    var RSS_URL = 'https://substack-proxy.adny.workers.dev/';
    var POST_LIMIT = 10;
    var SUBTITLE_LENGTH = 240;

    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function estimateReadTime(text) {
      var words = (text || '').trim().split(/\s+/).length;
      return Math.max(1, Math.round(words / 225)) + ' min read';
    }

    function stripHTML(html) {
      var div = document.createElement('div');
      div.innerHTML = html || '';
      return div.textContent || div.innerText || '';
    }

    function getSubtitle(post) {
      if (!post.description) return '';
      var clean = stripHTML(post.description).trim();
      return clean.length > SUBTITLE_LENGTH ? clean.slice(0, SUBTITLE_LENGTH) + '\u2026' : clean;
    }

    function getPreferredTheme() {
      var stored = sessionStorage.getItem('postModalTheme');
      if (stored) return stored;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    function applyPostTheme(modal, theme) {
      modal.classList.toggle('post-dark', theme === 'dark');
      sessionStorage.setItem('postModalTheme', theme);
      var btn = modal.querySelector('.post-theme-btn');
      if (btn) btn.textContent = theme === 'dark' ? '\u2600 Light' : '\u263E Dark';
    }

    function openPostModal(post) {
      var modalBody = document.getElementById('post-modal-body');
      var modalEl = document.getElementById('postModal');
      if (!modalBody || !modalEl) return;

      var subtitle = getSubtitle(post);
      var readTime = estimateReadTime(stripHTML(post.content || ''));
      var wideModal = modalEl.querySelector('.modal--wide');

      modalBody.innerHTML =
        '<div class="post-theme-toggle"><button type="button" class="post-theme-btn"></button></div>' +
        '<article class="post-article">' +
          '<p class="post-meta">' + formatDate(post.pubDate) + ' \u00b7 ' + readTime + '</p>' +
          '<h2 id="post-modal-title">' + post.title + '</h2>' +
          (subtitle ? '<p class="post-subtitle">' + subtitle + '</p>' : '') +
          '<div class="post-content">' + (post.content || '') + '</div>' +
          '<div class="post-cta"><p>Thank you for reading. If you\u2019d like to stay:</p>' +
            '<a href="https://judysnotebook.substack.com/subscribe" class="btn btn--accent" target="_blank" rel="noopener noreferrer">Subscribe on Substack</a></div>' +
        '</article>';

      applyPostTheme(wideModal, getPreferredTheme());

      /* Event delegation — avoids stacking listeners on repeated opens */
      modalBody.onclick = function (e) {
        if (e.target.classList.contains('post-theme-btn')) {
          applyPostTheme(wideModal, wideModal.classList.contains('post-dark') ? 'light' : 'dark');
        }
      };

      if (wideModal) wideModal.scrollTop = 0;
      openModal('postModal', null);
    }

    /* Skeleton loaders */
    var skeletons = '';
    for (var s = 0; s < 6; s++) {
      skeletons +=
        '<article class="notebook-card notebook-card--skeleton" aria-hidden="true">' +
          '<div class="skeleton-line skeleton-line--meta"></div>' +
          '<div class="skeleton-line skeleton-line--title"></div>' +
          '<div class="skeleton-line skeleton-line--body"></div>' +
          '<div class="skeleton-line skeleton-line--body skeleton-line--short"></div>' +
        '</article>';
    }
    rssContainer.innerHTML = skeletons;

    fetch(RSS_URL)
      .then(function (r) { if (!r.ok) throw new Error('Network error'); return r.json(); })
      .then(function (data) {
        var posts = (data.items || [])
          .filter(function (p) { return p.title; })
          .sort(function (a, b) { return new Date(b.pubDate) - new Date(a.pubDate); })
          .slice(0, POST_LIMIT);

        rssContainer.innerHTML = '';
        posts.forEach(function (post) {
          var card = document.createElement('article');
          card.className = 'notebook-card';
          card.innerHTML =
            '<a href="#" class="notebook-card-link">' +
              '<p class="post-meta">' + formatDate(post.pubDate) + ' \u00b7 ' + estimateReadTime(stripHTML(post.content || '')) + '</p>' +
              '<h2 class="post-title">' + post.title + '</h2>' +
              (getSubtitle(post) ? '<p class="post-subtitle">' + getSubtitle(post) + '</p>' : '') +
            '</a>';
          card.querySelector('.notebook-card-link').addEventListener('click', function (e) { e.preventDefault(); openPostModal(post); });
          rssContainer.appendChild(card);
        });
      })
      .catch(function (err) {
        rssContainer.innerHTML =
          '<p class="notebook-error">Unable to load posts. ' +
          '<a href="https://judysnotebook.substack.com" target="_blank" rel="noopener noreferrer">Visit Substack directly</a>.</p>';
        console.error('RSS fetch error:', err);
      });
  }


  /* ──────────────────────────────────────────────────────────────
     9. NOTEBOOK: SUBSCRIBE DRAWER
  ────────────────────────────────────────────────────────────── */
  var subscribeDrawer = document.getElementById('subscribe-drawer');
  var subscribeAnchor = document.getElementById('subscribe');
  var subscribeBtn = document.getElementById('notebook-subscribe-btn');

  function openSubscribeDrawer() {
    if (subscribeDrawer) {
      subscribeDrawer.classList.add('is-open');
    }
    if (subscribeAnchor) {
      subscribeAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openSubscribeDrawer();
      history.replaceState(null, '', '#subscribe');
    });
  }

  var footerSubscribeBtn = document.getElementById('footer-subscribe-btn');
  if (footerSubscribeBtn) {
    footerSubscribeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openSubscribeDrawer();
      history.replaceState(null, '', '#subscribe');
    });
  }

  // Auto-open if URL hash is #subscribe
  if (window.location.hash === '#subscribe') {
    // Small delay to let page render first
    setTimeout(openSubscribeDrawer, 300);
  }


  /* ──────────────────────────────────────────────────────────────
     10. FOOTER YEAR
  ────────────────────────────────────────────────────────────── */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
