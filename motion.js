/* Botella · capas suaves de movimiento ligadas al scroll.
   Un solo bucle: cada efecto recibe su avance (0 a 1) solo mientras está cerca de la pantalla.
   Con "reducir movimiento" todo queda en su estado final. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const NS = 'http://www.w3.org/2000/svg';
  const fx = []; // { el, fn, visible }

  // 0 cuando el borde superior del elemento está en `from` (fracción de la pantalla), 1 cuando llega a `to`
  const along = (el, from, to) => { const r = el.getBoundingClientRect(), H = innerHeight; return clamp((H * from - r.top) / (H * (from - to))); };
  const io = new IntersectionObserver(es => es.forEach(e => { const f = fx.find(x => x.el === e.target); if (f) { f.visible = e.isIntersecting; if (f.visible) kick(); } }), { rootMargin: '15% 0px' });
  const add = (el, fn) => { if (!el) return; fx.push({ el, fn, visible: false }); io.observe(el); };

  /* 1. barra de avance de la página, bajo la barra superior */
  const prog = $('#nav-prog');
  const doProg = () => { const max = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(4) : 0})`; };

  /* 2. lo que no vas a encontrar: cada línea se tacha cuando cruza el centro */
  $$('.strike li').forEach(li => { li.classList.add('scrub'); add(li, () => li.style.setProperty('--s', along(li, .8, .5).toFixed(3))); });

  /* 3. 1 de cada 6: seis puntos que se van conectando */
  const six = $('#six');
  let lines = [], dots = [];
  if (six) {
    const pts = [[30, 60], [80, 20], [140, 20], [190, 60], [140, 100], [80, 100]];
    // primero ese uno se conecta con todos; después, todos entre sí
    const pairs = [[0, 1], [0, 5], [0, 2], [0, 4], [0, 3], [1, 2], [5, 4], [2, 3], [4, 3], [1, 5], [2, 4], [1, 4], [2, 5], [1, 3], [5, 3]];
    lines = pairs.map(([a, b]) => {
      const l = document.createElementNS(NS, 'line');
      const [x1, y1] = pts[a], [x2, y2] = pts[b], len = Math.hypot(x2 - x1, y2 - y1);
      Object.entries({ x1, y1, x2, y2, 'stroke-dasharray': len.toFixed(1), 'stroke-dashoffset': len.toFixed(1) }).forEach(([k, v]) => l.setAttribute(k, v));
      six.appendChild(l); return [l, len, b];
    });
    dots = pts.map(([cx, cy], i) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', i ? 7 : 9); if (!i) c.classList.add('one'); six.appendChild(c); return c; });
    add(six, () => {
      const p = along(six, .92, .4) * lines.length;
      lines.forEach(([l, len, b], i) => { const t = clamp(p - i * .85); l.setAttribute('stroke-dashoffset', (len * (1 - t)).toFixed(1)); if (t >= 1) dots[b].classList.add('lit'); else if (i < 5) dots[b].classList.remove('lit'); });
    });
  }

  /* 4. final: la palabra Botella se llena como marea */
  const wm = $('.wm-xl');
  add(wm, () => wm.style.setProperty('--tide', (along(wm, 1, .55) * 64).toFixed(1) + '%'));

  /* bucle único */
  let raf = 0;
  const frame = () => { raf = 0; doProg(); fx.forEach(f => f.visible && f.fn()); };
  function kick() { if (!reduce && !raf) raf = requestAnimationFrame(frame); }
  if (reduce) {
    prog.hidden = true;
    $$('.strike li').forEach(li => li.style.setProperty('--s', 1));
    if (wm) wm.style.setProperty('--tide', '64%');
    lines.forEach(([l]) => l.setAttribute('stroke-dashoffset', 0));
    dots.forEach(c => c.classList.add('lit'));
  } else {
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    kick();
  }

  /* 5. al registrarte, tu botella despega desde la tarjeta */
  window.botellaLaunch = () => {
    if (reduce) return;
    const card = $('.join-card'); if (!card) return;
    const b = document.createElement('div');
    b.className = 'launch'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = '<svg viewBox="0 0 120 40"><path d="M16 6h56q14 0 18 8h18v12H90q-4 8-18 8H16q-10 0-10-14T16 6z" fill="rgba(127,216,201,.3)" stroke="#1E6F66" stroke-width="2.5"/><rect x="22" y="14" width="48" height="12" rx="5" fill="#F6E7C4"/><rect x="108" y="15" width="8" height="10" fill="#8A5A33"/></svg>';
    card.appendChild(b);
    b.addEventListener('animationend', () => b.parentNode && b.parentNode.removeChild(b));
  };
})();
