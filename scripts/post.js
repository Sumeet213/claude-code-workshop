// Tiny enhancement script for WORKSHOP.html.
// 1. Tints code blocks that follow a "❌ Bad" heading red.
// 2. Tints blockquotes that begin with "Predict" yellow.
// 3. Adds a "Show all reveals" button to the top of the doc.

(function () {
  // 1. Bad-prompt tinting
  document.querySelectorAll('h3, h4').forEach((h) => {
    const txt = (h.textContent || '').trim();
    if (txt.startsWith('❌')) {
      let next = h.nextElementSibling;
      while (next && next.tagName !== 'PRE' && !['H2', 'H3', 'DETAILS'].includes(next.tagName)) {
        next = next.nextElementSibling;
      }
      if (next && next.tagName === 'PRE') next.classList.add('bad-prompt');
    }
  });

  // 2. Predict callouts
  document.querySelectorAll('blockquote').forEach((q) => {
    if (/predict/i.test(q.textContent || '')) q.classList.add('predict-callout');
  });

  // 3. Show-all-reveals toggle, fixed top-right
  const btn = document.createElement('button');
  btn.textContent = 'Reveal all';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '14px',
    right: '20px',
    zIndex: '1000',
    background: '#5fd97a',
    color: '#0f1419',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  });
  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    document.querySelectorAll('details').forEach((d) => (d.open = open));
    btn.textContent = open ? 'Hide all' : 'Reveal all';
  });
  document.body.appendChild(btn);
})();
