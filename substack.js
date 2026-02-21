document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("rss-container");
  const postModal = document.getElementById("post-modal");
  const subscribeModal = document.getElementById("subscribe-modal");
  const subscribeBtn = document.getElementById("subscribe-btn");

  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalLink = document.getElementById("modal-link");

  const RSS_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://judysnotebook.substack.com/feed";

  /* ------------------ FETCH ------------------ */

  fetch(RSS_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      const structuredData = [];

      data.items.slice(0, 10).forEach(post => {

        const date = new Date(post.pubDate);
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const article = document.createElement("article");
        article.className = "post-item";

        article.innerHTML = `
          <div class="post-date">${formattedDate}</div>
          <h2 class="post-title">${post.title}</h2>
          <p class="post-desc">${stripHTML(post.description)}</p>
          <a href="#" class="read-more">Read More →</a>
        `;

        article.querySelector(".read-more").addEventListener("click", e => {
          e.preventDefault();
          openPost(post);
        });

        container.appendChild(article);

        /* JSON-LD */
        structuredData.push({
          "@type": "BlogPosting",
          "headline": post.title,
          "datePublished": post.pubDate,
          "author": {
            "@type": "Person",
            "name": "Judy Wright"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Judy’s Notebook"
          },
          "mainEntityOfPage": post.link
        });
      });

      injectJSONLD(structuredData);
    })
    .catch(() => {
      container.innerHTML = "<p>Unable to load posts at this time.</p>";
    });

  /* ------------------ SANITIZER ------------------ */

  function stripHTML(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  function sanitizeContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("script, iframe").forEach(el => el.remove());
    return doc.body.innerHTML;
  }

  /* ------------------ MODAL ------------------ */

  function openPost(post) {
    modalTitle.textContent = post.title;
    modalBody.innerHTML = sanitizeContent(post.content);
    modalLink.href = post.link;
    openModal(postModal);
  }

  function openModal(modal) {
    modal.hidden = false;
    modal.classList.add("is-open");
    trapFocus(modal);
    modal.querySelector(".modal-dialog").focus();
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
    setTimeout(() => modal.hidden = true, 250);
  }

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(postModal);
      closeModal(subscribeModal);
    });
  });

  subscribeBtn.addEventListener("click", () => openModal(subscribeModal));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal(postModal);
      closeModal(subscribeModal);
    }
  });

  /* ------------------ FOCUS TRAP ------------------ */

  function trapFocus(modal) {
    const focusable = modal.querySelectorAll("a, button, textarea, input");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener("keydown", function(e) {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------ JSON-LD ------------------ */

  function injectJSONLD(posts) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": posts
    });
    document.head.appendChild(script);
  }

});
