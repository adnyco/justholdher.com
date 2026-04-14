// ── Review Copy Modal ──
function openReviewModal() {
  var overlay = document.getElementById('rcopyModal');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('input, textarea, select, button:not(.rcopy-modal-close)').focus();
}

function closeReviewModal() {
  document.getElementById('rcopyModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('rcopyModal');
  if (!overlay) return;

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeReviewModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeReviewModal();
  });

  // Formspree AJAX submit
  var form = document.getElementById('rcopyForm');
  var success = document.getElementById('rcopySuccess');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('.rcopy-submit');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function(r) {
        if (r.ok) {
          form.style.display = 'none';
          success.style.display = 'block';
        } else {
          btn.textContent = 'Send Request';
          btn.disabled = false;
          alert('Something went wrong. Please try again or email press@heldclosebooks.com directly.');
        }
      })
      .catch(function() {
        btn.textContent = 'Send Request';
        btn.disabled = false;
        alert('Something went wrong. Please try again or email press@heldclosebooks.com directly.');
      });
    });
  }
});

// ── Press Copy Tabs ──
document.querySelectorAll('.press-tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.press-tab-btn').forEach(function(b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.press-copy-panel').forEach(function(p) {
      p.classList.remove('active');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.getAttribute('data-target')).classList.add('active');
  });
});

// ── Copy to clipboard ──
function copyPressText(id, btn) {
  var el = document.getElementById(id);
  var text = el ? el.innerText : '';
  var span = btn.querySelector('span');
  function doConfirm() {
    btn.classList.add('copied');
    span.textContent = 'Copied';
    setTimeout(function() {
      btn.classList.remove('copied');
      span.textContent = 'Copy Text';
    }, 2500);
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(doConfirm).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      doConfirm();
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    doConfirm();
  }
}
