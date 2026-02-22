(function () {
  "use strict";

  const RSS_URL = "https://substack-proxy.adny.workers.dev/";
  const POST_LIMIT = 10;

  /* ================================
     UTILITIES
  ================================== */

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function stripHTML(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function truncate(text = "", length = 220) {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + "...";
  }

  function calculateReadingTime(text = "") {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 225);
    return `${minutes} min read`;
  }

  /* ================================
     MODAL
  ================================== */

  function createModal() {
    const modal = document.createElement("div");
    modal.className = "notebook-modal";

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">×</button>
        <div class="modal-body"></div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".modal-close").addEventListener("click", closeModal);
    modal.querySelector(".modal-overlay").addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    return modal;
  }

  function openModal(post) {
    const modal =
      document.querySelector(".notebook-modal") || createModal();

    const body = modal.querySelector(".modal-body");

    const contentHTML = post.content || post.description || "";
    const cleanText = stripHTML(contentHTML);

    body.innerHTML = `
      <article class="modal-article">
        <h2>${post.title}</h2>
        <p class="post-meta">
          ${formatDate(post.pubDate)} · ${calculateReadingTime(cleanText)}
        </p>
        <div class="modal-content-body">
          ${contentHTML}
        </div>

        <div class="post-cta">
          <hr>
          <p>If this resonated, subscribe to receive future essays directly.</p>
          <a href="https://judysnotebook.substack.com/subscribe"
             target="_blank"
             rel="noopener"
             class="button button--primary">
             Subscribe →
          </a>
        </div>
      </article>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = document.querySelector(".notebook-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  /* ================================
     SKELETON
  ================================== */

  function renderSkeleton(container, count = 6) {
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton-card";
      skeleton.innerHTML = `
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      `;
      container.appendChild(skeleton);
    }
  }

  /* ================================
     POSTS
  ================================== */

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "notebook-post";

    const contentHTML = post.content || post.description || "";
    const rawText = stripHTML(contentHTML);
    const excerpt = truncate(rawText, 220);
    const readTime = calculateReadingTime(rawText);

    article.innerHTML = `
      <a href="#" class="post-link">
        <header>
          <p class="post-meta">
            ${formatDate(post.pubDate)} · ${readTime}
          </p>
          <h2 class="post-title">${post.title}</h2>
        </header>
        <p class="post-excerpt">${excerpt}</p>
      </a>
    `;

    article.querySelector(".post-link").addEventListener("click", (e) => {
      e.preventDefault();
      openModal(post);
    });

    return article;
  }

  function renderPosts(posts, container) {
    container.innerHTML = "";

    posts.forEach(post => {
      container.appendChild(createPostCard(post));
    });
  }

  /* ================================
     INIT
  ================================== */

  async function init() {
    const container = document.getElementById("rss-container");
    if (!container) return;

    renderSkeleton(container);

    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      let posts = data.items || [];

      posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      posts = posts.slice(0, POST_LIMIT);

      renderPosts(posts, container);

    } catch (err) {
      container.innerHTML = `<p>Unable to load posts.</p>`;
      console.error(err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
