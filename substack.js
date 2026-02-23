(function () {
  "use strict";

  const RSS_URL = "https://substack-proxy.adny.workers.dev/";
  const POST_LIMIT = 10;

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function estimateReadTime(text = "") {
    const words = text.trim().split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 225))} min read`;
  }

  function stripHTML(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function getSubtitle(post) {
    if (post.subtitle && post.subtitle.trim()) return post.subtitle.trim();
    if (post.summary && post.summary.trim()) return stripHTML(post.summary).trim();
    return "";
  }

  const CTA_HTML = `
    <div class="post-cta" style="margin-top:2rem;padding-top:1rem;border-top:1px solid #ddd;">
      <p>Thank you for reading.<br/>If you’d like to stay,</p>
      <a href="https://judysnotebook.substack.com/subscribe" 
         target="_blank" 
         rel="noopener" 
         style="display:inline-block;margin-top:.5rem;padding:.5rem 1rem;background:#ff6600;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
        Subscribe →
      </a>
    </div>
  `;

  function createModal() {
    if (document.querySelector(".notebook-modal")) return document.querySelector(".notebook-modal");

    const modal = document.createElement("div");
    modal.className = "notebook-modal";
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">×</button>
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
    const modal = createModal();
    const body = modal.querySelector(".modal-body");

    const subtitle = getSubtitle(post);
    const contentHTML = post.content || post.description || "";
    const cleanText = stripHTML(contentHTML);
    const readTime = estimateReadTime(cleanText);

    body.innerHTML = `
      <article class="modal-article">
        <p class="post-meta">${formatDate(post.pubDate)} · ${readTime}</p>
        <h2 class="post-title">${post.title}</h2>
        ${subtitle ? `<h3 class="post-subtitle">${subtitle}</h3>` : ""}
        <div class="modal-content-body">${contentHTML}</div>
        ${CTA_HTML}
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

  function renderSkeleton(container, count = 6) {
    container.innerHTML = "";
    container.classList.add("notebook-center");
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

 function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "notebook-post";

    const subtitle = post.subtitle || ""; // Use subtitle if available
    const rawText = stripHTML(post.description || post.content || "");
    const readTime = estimateReadTime(rawText);

    article.innerHTML = `
      <a href="#" class="post-link">
        <header>
          <p class="post-meta">${formatDate(post.pubDate)} · ${readTime}</p>
          <h2 class="post-title">${post.title}</h2>
        </header>
        <p class="post-excerpt">${subtitle}</p>
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
    container.classList.add("notebook-center");
    posts.forEach((post) => container.appendChild(createPostCard(post)));
  }

  async function init() {
    const container = document.getElementById("rss-container");
    if (!container) return;

    renderSkeleton(container);

    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      let posts = data.items || [];

      posts = posts
        .filter(post => post.title) // filter out invalid entries
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, POST_LIMIT);

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
