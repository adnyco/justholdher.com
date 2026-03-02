/* ==========================================================================
   JUST HOLD HER — Master script.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // --- 1. GLOBAL: Navigation & Hamburger Logic ---
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".topnav-links");
  let overlay = document.querySelector(".topnav-overlay");

  if (hamburger && navLinks) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "topnav-overlay";
      document.body.appendChild(overlay);
    }

    const toggleMenu = () => {
      const isActive = hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
      overlay.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isActive);
      document.body.style.overflow = isActive ? "hidden" : "";
    };

    hamburger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        toggleMenu();
      }
    });
  }

  // --- 2. GLOBAL: Footer Year Auto-Update ---
  const yearSpan = document.querySelector('.footer-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- 3. PAGE SPECIFIC: Notebook / Substack RSS & Modals ---
  const rssContainer = document.getElementById("rss-container");
  
  if (rssContainer) {
    const RSS_URL = "https://substack-proxy.adny.workers.dev/";
    const POST_LIMIT = 10;
    const SUBTITLE_LENGTH = 240;
    const CTA_HTML = `
      <div class="post-cta">
        <p>Thank you for reading.<br>If you’d like to stay, please:</p>
        <a href="https://judysnotebook.substack.com/subscribe" target="_blank" rel="noopener" class="cta-button">
          Subscribe →
        </a>
      </div>`;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric"
    });

    const estimateReadTime = (text = "") => {
      const words = text.trim().split(/\s+/).length;
      return `${Math.max(1, Math.round(words / 225))} min read`;
    };

    const stripHTML = (html = "") => {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    };

    const getSubtitle = (post) => {
      if (!post.description) return "";
      const clean = stripHTML(post.description).trim();
      return clean.length > SUBTITLE_LENGTH ? clean.slice(0, SUBTITLE_LENGTH) + "…" : clean;
    };

    const closeModal = () => {
      const modal = document.querySelector(".notebook-modal");
      if (modal) {
        modal.classList.remove("active");
        if (navLinks && !navLinks.classList.contains("active")) {
          document.body.style.overflow = "";
        }
      }
    };

    const openModal = (post) => {
      let modal = document.querySelector(".notebook-modal");
      if (!modal) {
        modal = document.createElement("div");
        modal.className = "notebook-modal";
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <button class="modal-close">×</button>
            <div class="modal-body"></div>
          </div>`;
        document.body.appendChild(modal);
        modal.querySelector(".modal-close").onclick = closeModal;
        modal.querySelector(".modal-overlay").onclick = closeModal;
      }

      const subtitle = getSubtitle(post);
      const readTime = estimateReadTime(stripHTML(post.content || ""));
      const body = modal.querySelector(".modal-body");

      body.innerHTML = `
        <article class="modal-article">
          <p class="post-meta">${formatDate(post.pubDate)} · ${readTime}</p>
          <h2 class="post-title">${post.title}</h2>
          ${subtitle ? `<h3 class="post-subtitle">${subtitle}</h3>` : ""}
          <div class="modal-content-body">${post.content || ""}</div>
          ${CTA_HTML}
        </article>`;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    // Fetch Logic with full closure
    fetch(RSS_URL)
      .then(response => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .then(data => {
        let posts = data.items || [];
        posts = posts
          .filter(post => post.title)
          .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
          .slice(0, POST_LIMIT);

        rssContainer.innerHTML = "";
        rssContainer.classList.add("notebook-center");
        
        posts.forEach(post => {
          const article = document.createElement("article");
          article.className = "notebook-post";
          const subtitle = getSubtitle(post);
          const readTime = estimateReadTime(stripHTML(post.content || ""));

          article.innerHTML = `
            <a href="#" class="post-link">
              <header>
                <p class="post-meta">${formatDate(post.pubDate)} · ${readTime}</p>
                <h2 class="post-title">${post.title}</h2>
                ${subtitle ? `<h3 class="post-subtitle">${subtitle}</h3>` : ""}
              </header>
            </a>`;

          article.querySelector(".post-link").addEventListener("click", (e) => {
            e.preventDefault();
            openModal(post);
          });
          rssContainer.appendChild(article);
        });
      })
      .catch(err => {
        rssContainer.innerHTML = `<p>Unable to load posts.</p>`;
        console.error(err);
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // --- 4. PAGE SPECIFIC: Hero Fade Fallback (Home Page) ---
  const hero = document.querySelector('.hero');
  const shroud = document.querySelector('.hero-shroud');
  const supportsScrollLinked = CSS && CSS.supports && CSS.supports('animation-timeline: auto');
  
  if (!supportsScrollLinked && hero && shroud) {
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.rootBounds) return;
      const t = entry.boundingClientRect;
      const heroHeight = t.height || hero.offsetHeight;
      const progress = Math.min(1, Math.max(0, (0 - t.top) / heroHeight));
      shroud.style.opacity = String(progress);
    }, { threshold: thresholds });

    io.observe(hero);
  }
});
