// substack.js

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("rss-container");
  const modal = document.getElementById("post-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalLink = document.getElementById("modal-link");

  const subscribeBtn = document.getElementById("subscribe-btn");
  const subscribeModal = document.getElementById("subscribe-modal");

  const RSS_URL = "https://api.rss2json.com/v1/api.json?rss_url=https://judysnotebook.substack.com/feed";

  fetch(RSS_URL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      data.items.slice(0, 10).forEach(post => {
        const date = new Date(post.pubDate);
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const item = document.createElement("article");
        item.className = "post-item";

        item.innerHTML = `
          <div class="post-date">${formattedDate}</div>
          <h2 class="post-title">${post.title}</h2>
          <p class="post-desc">${post.description}</p>
          <a href="#" class="read-more">Read More →</a>
        `;

        item.querySelector(".read-more").addEventListener("click", e => {
          e.preventDefault();
          modalTitle.textContent = post.title;
          modalBody.innerHTML = post.content;
          modalLink.href = post.link;
          openModal(modal);
        });

        container.appendChild(item);
      });
    })
    .catch(() => {
      container.innerHTML = "<p>Unable to load posts at this time.</p>";
    });

  function openModal(el) {
    el.hidden = false;
    el.querySelector(".modal-dialog").focus();
  }

  function closeModal(el) {
    el.hidden = true;
  }

  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(modal);
      closeModal(subscribeModal);
    });
  });

  subscribeBtn.addEventListener("click", () => {
    openModal(subscribeModal);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal(modal);
      closeModal(subscribeModal);
    }
  });
});
