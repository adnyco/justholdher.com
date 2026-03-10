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
