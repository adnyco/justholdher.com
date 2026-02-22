/**
 * Substack RSS Feed Integration — Two Columns
 * Site: Judy’s Notebook
 */

document.addEventListener("DOMContentLoaded", () => {
  const RSS_URL = "https://substack-proxy.adny.workers.dev";
  const POST_LIMIT = 10;

  const el = {
    container: document.getElementById("rss-container"),
    postModal: document.getElementById("post-modal"),
    subscribeModal: document.getElementById("subscribe-modal"),
    subscribeBtn: document.getElementById("subscribe-btn"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalLink: document.getElementById("modal-link"),
    closeBtns: document.querySelectorAll("[data-close]")
  };

  // -----------------------------
  // Initialization
  // -----------------------------
  const init = async () => {
    showLoading(true);

    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const posts = (data.items || []).slice(0, POST_LIMIT);

      if (!posts.length) {
        el.container.innerHTML = `<p class="error-msg">No posts available. Please visit <a href="https://judysnotebook.substack.com">Judy's Notebook</a>.</p>`;
        return;
      }

     el.container.innerHTML = "<h1>TEST RENDER</h1>";

  // -----------------------------
  // Render Posts in Two Columns
  // -----------------------------
  function renderTwoColumnPosts(posts) {
    el.container.innerHTML = "";

    // Create two column containers
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");
    col1.className = "rss-column";
    col2.className = "rss-column";

    // Distribute posts evenly
    posts.forEach((post, i) => {
      const article = createPostElement(post);
      if (i % 2 === 0) col1.appendChild(article);
      else col2.appendChild(article);
    });

    el.container.appendChild(col1);
    el.container.appendChild(col2);
  }

  // -----------------------------
  // Create Individual Post Element
  // -----------------------------
  function createPostElement(post) {
    const date = post.pubDate ? new Date(post.pubDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "";

    const article = document.createElement("article");
    article.className = "post-item";
    article.innerHTML = `
      <div class="post-date">${date}</div>
      <h2 class="post-title">${post.title || "Untitled"}</h2>
      <p class="post-desc">${stripHTML(post.description || post.content || "")}</p>
      <button class="read-more" aria-label="Read more about ${post.title || "post"}">Read More →</button>
    `;

    article.querySelector(".read-more").addEventListener("click", e => {
      e.preventDefault();
      openPost(post);
    });

    return article;
  }

  // -----------------------------
  // Open Modal
  // -----------------------------
  function openPost(post) {
    el.modalTitle.textContent = post.title || "Untitled";
    const fullContent = post.content || post.description || "<p>No content available.</p>";
    el.modalBody.innerHTML = sanitizeContent(fullContent);
    el.modalLink.href = post.link || "#";

    toggleModal(el.postModal, true);
  }

  // -----------------------------
  // Utilities
  // -----------------------------
  function stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  function sanitizeContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("script, iframe, form, object").forEach(el => el.remove());
    return doc.body.innerHTML;
  }

  function showLoading(isLoading) {
    if (isLoading) el.container.innerHTML = `<div class="loader-container"><div class="loader">Loading latest posts…</div></div>`;
  }

  // -----------------------------
  // Modal Management
  // -----------------------------
  function toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
      modal.hidden = false;
      setTimeout(() => modal.classList.add("is-open"), 10);
      trapFocus?.(modal);
      document.body.style.overflow = "hidden";
    } else {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => modal.hidden = true, 250);
    }
  }

  el.closeBtns.forEach(btn => btn.addEventListener("click", () => {
    toggleModal(el.postModal, false);
    toggleModal(el.subscribeModal, false);
  }));

  el.subscribeBtn?.addEventListener("click", () => toggleModal(el.subscribeModal, true));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toggleModal(el.postModal, false);
      toggleModal(el.subscribeModal, false);
    }
  });

  [el.postModal, el.subscribeModal].forEach(modal => {
    modal?.addEventListener("click", e => {
      if (e.target === modal) toggleModal(modal, false);
    });
  });

  // -----------------------------
  // Start
  // -----------------------------
  init();
});
