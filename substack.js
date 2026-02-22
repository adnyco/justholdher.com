/**
 * substack.js
 * Reverse chronological
 * Skeleton loader
 * Uses .notebook-post layout
 */

(function () {
  "use strict";

  /* ================================
     CONFIG
  ================================== */

  const RSS_URL = "https://substack-proxy.adny.workers.dev/";
  const POST_LIMIT = 10;

  /* ================================
     UTILITIES
  ================================== */

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long"
    });
  }

  function estimateReadTime(text = "") {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
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

  /* ================================
     SKELETON LOADER
  ================================== */

  function renderSkeleton(container, count = 4) {
    container.innerHTML = "";
    container.classList.add("notebook-center");

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton-card";

      skeleton.innerHTML = `
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      `;

      container.appendChild(skeleton);
    }
  }

  /* ================================
     POST RENDER
  ================================== */

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "notebook-post";

    const rawText = stripHTML(post.description || post.content || "");
    const excerpt = truncate(rawText, 220);
    const readTime = estimateReadTime(rawText);

    article.innerHTML = `
      <a href="${post.link}" class="post-link" target="_blank" rel="noopener noreferrer">
        <header>
          <p class="post-meta">
            ${formatDate(post.pubDate)} · ${readTime}
          </p>
          <h2 class="post-title">
            ${post.title || "Untitled"}
          </h2>
        </header>
        <p class="post-excerpt">
          ${excerpt}
        </p>
      </a>
    `;

    return article;
  }

  function renderPosts(posts, container) {
    container.innerHTML = "";
    container.classList.add("notebook-center");

    posts.forEach(post => {
      const card = createPostCard(post);
      container.appendChild(card);
    });
  }

  /* ================================
     INIT
  ================================== */

  async function init() {
    const container = document.getElementById("rss-container");
    if (!container) return;

    renderSkeleton(container, 6);

    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      let posts = data.items || [];

      // ✅ Reverse chronological sort (most recent first)
      posts.sort((a, b) => {
        return new Date(b.pubDate) - new Date(a.pubDate);
      });

      posts = posts.slice(0, POST_LIMIT);

      if (!posts.length) {
        container.innerHTML = `<p>No posts available.</p>`;
        return;
      }

      renderPosts(posts, container);

    } catch (err) {
      console.error("Substack fetch failed:", err);
      container.innerHTML = `
        <div class="loader-container">
          <div class="loader">Unable to load posts.</div>
        </div>
      `;
    }
  }

  /* ================================
     START
  ================================== */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
