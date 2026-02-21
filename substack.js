/**
 * Substack RSS Feed Integration
 * Site: Judy’s Notebook
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Configuration ---
  const RSS_URL = "https://substack-proxy.adnyco.workers.dev";
  const POST_LIMIT = 10;
  
  // --- DOM Elements ---
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

  /**
   * Initialization
   */
  const init = async () => {
    try {
      showLoading(true);
      const response = await fetch(RSS_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      const posts = data.items.slice(0, POST_LIMIT);
      
      renderPosts(posts);
      injectJSONLD(posts);
    } catch (error) {
      console.error("Feed failed to load:", error);
      el.container.innerHTML = `<p class="error-msg">Unable to load posts. Please visit <a href="https://judysnotebook.substack.com">Judy's Notebook</a> directly.</p>`;
    } finally {
      showLoading(false);
    }
  };

  /**
   * Rendering Logic
   */
  function renderPosts(posts) {
    el.container.innerHTML = ""; // Clear loader

    posts.forEach(post => {
      const date = new Date(post.pubDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });

      const article = document.createElement("article");
      article.className = "post-item";
      article.innerHTML = `
        <div class="post-date">${date}</div>
        <h2 class="post-title">${post.title}</h2>
        <p class="post-desc">${stripHTML(post.description)}</p>
        <button class="read-more" aria-label="Read more about ${post.title}">Read More →</button>
      `;

      article.querySelector(".read-more").addEventListener("click", (e) => {
        e.preventDefault();
        openPost(post);
      });

      el.container.appendChild(article);
    });
  }

  /**
   * Post Modal Content Logic
   */
  function openPost(post) {
    el.modalTitle.textContent = post.title;
    // content:encoded is usually where the full body lives in Substack RSS
    const fullContent = post.content || post.description; 
    el.modalBody.innerHTML = sanitizeContent(fullContent);
    el.modalLink.href = post.link;
    
    toggleModal(el.postModal, true);
  }

  /**
   * Utilities & Security
   */
  function stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  function sanitizeContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // Remove scripts, iframes, and forms for security
    doc.querySelectorAll("script, iframe, form, object").forEach(el => el.remove());
    return doc.body.innerHTML;
  }

  function showLoading(isLoading) {
    if (isLoading) el.container.innerHTML = `<div class="loader">Loading latest posts...</div>`;
  }

  /**
   * Modal Management
   */
  function toggleModal(modal, show) {
    if (show) {
      modal.hidden = false;
      setTimeout(() => modal.classList.add("is-open"), 10);
      trapFocus(modal);
      // Optional: Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'; 
    } else {
      modal.classList.remove("is-open");
      document.body.style.overflow = '';
      setTimeout(() => modal.hidden = true, 250);
    }
  }

  /**
   * Event Listeners
   */
  el.closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      toggleModal(el.postModal, false);
      toggleModal(el.subscribeModal, false);
    });
  });

  el.subscribeBtn?.addEventListener("click", () => toggleModal(el.subscribeModal, true));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toggleModal(el.postModal, false);
      toggleModal(el.subscribeModal, false);
    }
  });

  // Close modal if clicking background overlay
  [el.postModal, el.subscribeModal].forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) toggleModal(modal, false
