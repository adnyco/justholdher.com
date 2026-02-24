(function () {
  "use strict";

  const RSS_URL = "https://substack-proxy.adny.workers.dev/";
  const POST_LIMIT = 10;
  const SUBTITLE_LENGTH = 240;

  const CTA_HTML = `
  <div class="post-cta">
    <p>Thank you for reading.<br>If you’d like to stay,</p>
    <a href="https://judysnotebook.substack.com/subscribe" 
       target="_blank" 
       rel="noopener"
       class="cta-button">
      Subscribe →
    </a>
  </div>
`;

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

  // ✅ NEW: Extract subtitle from description
  function getSubtitle(post) {
    if (!post.description) return "";

    const clean = stripHTML(post.description).trim();

    if (!clean) return "";

    return clean.length > SUBTITLE_LENGTH
      ? clean.slice(0, SUBTITLE_LENGTH) + "…"
      : clean;
  }

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "notebook-post";

    const subtitle = getSubtitle(post);
    const rawText = stripHTML(post.content || "");
    const readTime = estimateReadTime(rawText);

    article.innerHTML = `
      <a href="#" class="post-link">
        <header>
          <p class="post-meta">${formatDate(post.pubDate)} · ${readTime}</p>
          <h2 class="post-title">${post.title}</h2>
          ${subtitle ? `<h3 class="post-subtitle">${subtitle}</h3>` : ""}
        </header>
      </a>
    `;

    article.querySelector(".post-link").addEventListener("click", (e) => {
      e.preventDefault();
      openModal(post);
    });

    return article;
  }

  function createModal() {
    if (document.querySelector(".notebook-modal"))
      return document.querySelector(".notebook-modal");

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

    modal.querySelector(".modal-close").onclick = closeModal;
    modal.querySelector(".modal-overlay").onclick = closeModal;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    return modal;
  }

  function openModal(post) {
    const modal = createModal();
    const body = modal.querySelector(".modal-body");

    const subtitle = getSubtitle(post);
    const contentHTML = post.content || "";
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

  function renderPosts(posts, container) {
    container.innerHTML = "";
    container.classList.add("notebook-center");
    posts.forEach((post) =>
      container.appendChild(createPostCard(post))
    );
  }

  async function init() {
    const container = document.getElementById("rss-container");
    if (!container) return;

    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      let posts = data.items || [];

      posts = posts
        .filter(post => post.title)
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
