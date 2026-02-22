/**
 * substack.js
 * Fetches posts from Cloudflare Worker JSON endpoint
 * and renders them into a two-column layout.
 */

(function () {
  "use strict";

  /* ================================
     CONFIG
  ================================== */

  const RSS_URL = "https://YOUR-WORKER-URL.workers.dev";
  const POST_LIMIT = 10; // Total posts to display

  /* ================================
     UTILITIES
  ================================== */

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function escapeHTML(str = "") {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function stripHTML(html = "") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  function truncate(text, length = 180) {
    if (!text) return "";
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + "...";
  }

  /* ================================
     RENDERING
  ================================== */

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "rss-card";

    const title = escapeHTML(post.title || "Untitled");
    const link = post.link || "#";
    const date = formatDate(post.pubDate);
    const rawExcerpt = post.description || "";
    const excerpt = truncate(stripHTML(rawExcerpt), 200);

    article.innerHTML = `
      <h3 class="rss-title">
        <a href="${link}" target="_blank" rel="noopener noreferrer">
          ${title}
        </a>
      </h3>
      ${date ? `<div class="rss-date">${date}</div>` : ""}
      <p class="rss-excerpt">${escapeHTML(excerpt)}</p>
      <a class="rss-read-more" href="${link}" target="_blank" rel="noopener noreferrer">
        Read more →
      </a>
    `;

    return article;
  }

  function renderTwoColumnPosts(posts, container) {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "rss-grid";

    const leftCol = document.createElement("div");
    leftCol.className = "rss-column";

    const rightCol = document.createElement("div");
    rightCol.className = "rss-column";

    posts.forEach((post, index) => {
      const card = createPostCard(post);
      if (index % 2 === 0) {
        leftCol.appendChild(card);
      } else {
        rightCol.appendChild(card);
      }
    });

    wrapper.appendChild(leftCol);
    wrapper.appendChild(rightCol);
    container.appendChild(wrapper);
  }

  /* ================================
     INIT
  ================================== */

  async function init() {
    const container = document.getElementById("rss-container");

    // Exit quietly if container not present (prevents breaking other pages)
    if (!container) return;

    try {
      container.innerHTML = `<p class="rss-loading">Loading posts...</p>`;

      const response = await fetch(RSS_URL);

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      const data = await response.json();

      const posts = (data.items || []).slice(0, POST_LIMIT);

      if (!posts.length) {
        container.innerHTML =
          `<p class="rss-error">No posts available.</p>`;
        return;
      }

      renderTwoColumnPosts(posts, container);

    } catch (error) {
      console.error("Substack fetch failed:", error);
      container.innerHTML =
        `<p class="rss-error">Unable to load posts at this time.</p>`;
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
