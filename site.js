/* Botella · web. Sin librerías. Mismo mundo que la app: la noche, la botella que brilla, la voz.
   Un solo bucle de scroll que solo trabaja cuando hace falta. Con "reducir movimiento" todo
   aparece ya en su estado final. */
(() => {
  const CFG = window.BOTELLA || {};
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const store = { get(k) { try { return JSON.parse(localStorage.getItem('botella-web-' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('botella-web-' + k, JSON.stringify(v)); } catch (e) {} } };
  document.documentElement.classList.add('js');

  const qs = new URLSearchParams(location.search);
  const ref = (qs.get('de') || qs.get('r') || '').slice(0, 40);
  if (ref) store.set('ref', ref);
  const source = (qs.get('utm_source') || qs.get('src') || (document.referrer ? new URL(document.referrer).hostname : '') || '').slice(0, 40);

  /* ---------- iconos: un solo trazo, como en la app ---------- */
  const IC = {
    play: '<svg class="fill" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',
    pause: '<svg class="fill" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></svg>',
    tide: '<svg viewBox="0 0 24 24"><path d="M2 9q2.5-3 5 0t5 0 5 0 5 0M2 15q2.5-3 5 0t5 0 5 0 5 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    seal: '<svg viewBox="0 0 24 24"><path d="M12 3l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L12 21l-2.2-1.6-2.7.1-.9-2.6-2.2-1.6.8-2.6-.8-2.6 2.2-1.6.9-2.6 2.7.1z"/><path d="M9 12l2 2 4-4"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.5 7-12a7 7 0 00-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
    adult: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 9.5l1.5-1V16M14.5 12.2a1.9 1.9 0 110-3.7 1.9 1.9 0 010 3.7zm0 0a2 2 0 110 3.8 2 2 0 010-3.8z"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>'
  };
  const ico = (n) => IC[n] || '';
  const paintIcons = (root = document) => root.querySelectorAll('[data-ico]').forEach(n => { if (!n.firstChild) n.innerHTML = ico(n.dataset.ico); });
  paintIcons();

  /* ---------- la noche de la app: cielo, luna, mar ---------- */
  const sea = (svg, o = {}) => {
    if (!svg) return;
    const r0 = svg.getBoundingClientRect(); const W = Math.max(320, Math.round(r0.width)), H = Math.max(400, Math.round(r0.height));
    const hz = o.hz ?? (W > H ? .5 : .4), y0 = H * hz, id = svg.id;
    let s = 11; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
    let h = `<defs><linearGradient id="${id}-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020B15"/><stop offset="${hz}" stop-color="#0A2238"/><stop offset="1" stop-color="#03101C"/></linearGradient><radialGradient id="${id}-m"><stop offset="0" stop-color="#EAF6F2" stop-opacity=".2"/><stop offset="1" stop-color="#EAF6F2" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}-s)"/>`;
    const stars = Math.round(W * y0 / 2600);
    for (let i = 0; i < stars; i++) { const o = (rnd() * .6 + .2).toFixed(2), tw = rnd() < .45; h += `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * y0 * .95).toFixed(1)}" r="${(rnd() * .9 + .3).toFixed(2)}" fill="#fff" opacity="${o}"${tw ? ` class="tw" style="--o:${o};--d:${(2 + rnd() * 4).toFixed(1)}s;--dl:-${(rnd() * 5).toFixed(1)}s"` : ''}/>`; }
    const mx = W * (o.mx ?? .78), my = (o.myf ? H * o.myf : Math.min(y0 * .45, 170)) + (o.off || 0), mr = o.mr ?? (W > 900 ? 34 : 24);
    h += `<circle cx="${mx}" cy="${my}" r="${mr * 6}" fill="url(#${id}-m)"/><circle cx="${mx}" cy="${my}" r="${mr}" fill="#EAF6F2"/>`;
    h += `<g class="glint">`; for (let i = 0; i < 10; i++) { const yy = y0 + 6 + i * i * 4.5; const w = 40 - i * 2.5 + rnd() * 20; const o = (.5 - i * .045).toFixed(2); h += `<rect x="${(mx - w / 2 + (rnd() - .5) * 14).toFixed(0)}" y="${yy.toFixed(0)}" width="${w.toFixed(0)}" height="1.4" fill="#EAF6F2" opacity="${o}" style="--o:${o};--dl:-${(rnd() * 2.6).toFixed(1)}s"/>`; } h += `</g>`;
    h += `<rect y="${y0}" width="${W}" height="1" fill="#2A4A63" opacity=".8"/>`;
    const waves = Math.round(W * (H - y0) / 5000);
    for (let i = 0; i < waves; i++) { const y = y0 + 6 + rnd() * (H - y0); const w = 8 + rnd() * 34; h += `<rect class="wave" x="${(rnd() * W).toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="1" fill="#8FB7CF" opacity="${(.08 + rnd() * .22).toFixed(2)}" style="--d:${(5 + rnd() * 7).toFixed(1)}s;--dl:-${(rnd() * 8).toFixed(1)}s;--dx:${((rnd() < .5 ? -1 : 1) * (10 + rnd() * 26)).toFixed(0)}px"/>`; }
    svg.innerHTML = h;
  };
  const skies = () => { sea($('#sky'), { off: 80, hz: innerWidth > innerHeight ? .55 : .45 }); sea($('#sky2'), { hz: .86, mx: .84, myf: .76, mr: 16 }); };
  skies();
  let rs = 0; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(skies, 150); });

  const BOTTLE = '<svg viewBox="0 0 120 40" aria-hidden="true" style="filter:drop-shadow(0 0 18px rgba(127,216,201,.55)) drop-shadow(0 0 4px rgba(255,236,190,.5))"><path d="M16 6h56q14 0 18 8h18v12H90q-4 8-18 8H16q-10 0-10-14T16 6z" fill="rgba(127,216,201,.2)" stroke="rgba(170,240,228,.9)" stroke-width="2.5"/><rect x="22" y="14" width="48" height="12" rx="5" fill="#F6E7C4"/><rect x="108" y="15" width="8" height="10" fill="#8A5A33"/></svg>';
  $('#hero-bottle').innerHTML = BOTTLE;
  { const h1 = $('#h1'); let k = 0; const wrap = n => { [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) f.append(t); else { const sp = document.createElement('span'); sp.className = 'w'; sp.style.setProperty('--i', k++); sp.textContent = t; f.append(sp); } }); c.replaceWith(f); } else wrap(c); }); }; wrap(h1); }
  $('#pop').innerHTML = '<svg viewBox="0 0 130 60"><path d="M16 16h56q14 0 18 8h18v12H90q-4 8-18 8H16q-10 0-10-14T16 16z" fill="rgba(127,216,201,.2)" stroke="rgba(170,240,228,.9)" stroke-width="2.5"/><rect x="22" y="24" width="48" height="12" rx="5" fill="#F6E7C4" opacity=".5"/><rect class="cork" x="108" y="25" width="8" height="10" fill="#8A5A33"/><g class="spark" stroke="#7FD8C9" stroke-width="2" stroke-linecap="round"><path d="M118 18l4-7M124 24l8-3M120 14l1-9"/></g></svg>';

  /* ---------- voces de ejemplo ---------- */
  const V = [
    { id: 'majo', kind: 'Pregunta', topic: 'la música', chip: 'Música', c: '#FFC24B', secs: 14, q: '¿Qué harías un domingo si nadie en esta ciudad te conociera?', pk: [1, .48, .77, .57, .82, .74, .67, .41, .35, .91, .76, .58, .92, .51, .68, .28, .88, .57, .71, .74, .53, .33, .89, .5, .38, .86, 1, .48] },
    { id: 'leo', kind: 'Confesión', topic: 'el cine', chip: 'Cine', c: '#8E8CFF', secs: 13, q: 'Me mudé a Lima hace tres meses y todavía no tengo con quién ir al cine.', pk: [.67, .42, .32, .41, 1, .48, .49, .29, .59, .6, .53, .39, .4, .16, .6, .49, .4, .39, .44, .41, .67, .55, .61, .52, .4, .3, .42, .18] },
    { id: 'rocio', kind: 'Historia', topic: 'la comida', chip: 'Comida', c: '#FF70A9', secs: 15, q: 'Lo más raro que me pasó en una combi.', pk: [.64, .72, .92, .62, .74, .42, .74, .72, .95, .51, .6, .86, .52, .65, .73, .75, .7, .57, .73, .79, .82, .84, 1, .54, .91, .79, .61, .62] },
    { id: 'diego', kind: 'Confesión', topic: 'la tecnología', chip: 'Tecnología', c: '#9FE3B0', secs: 12, q: 'Trabajo desde casa y a veces paso días sin hablar con nadie.', pk: [1, .87, .93, .83, .7, .85, .7, .58, .68, .7, .63, .52, .25, .92, .64, .64, .57, .36, .26, .77, .73, .7, .61, .42, .89, .84, .57, .36] }
  ];
  const fmt = s => `0:${String(Math.max(0, Math.round(s))).padStart(2, '0')}`;
  const bars = (pk) => pk.map((p, k) => `<i style="--h:${Math.round(Math.max(.18, p) * 100)}%;--k:${k}"></i>`).join('');
  const seedBars = (seed, n = 26) => { let r = seed; const a = []; for (let i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; a.push(.25 + r / 233280 * .75); } return a; };
  $$('.chat .wv').forEach(w => w.innerHTML = bars(seedBars(+w.dataset.seed)));

  let sel = 0;
  const topics = $('#topics'), paper = $('#paper');
  topics.innerHTML = V.map((v, i) => `<button class="chip" role="tab" type="button" aria-selected="${i === 0}" data-i="${i}"><span class="dot" style="--c:${v.c}"></span>${v.chip}</button>`).join('');
  const showPaper = (i, animate) => {
    sel = i; const v = V[i];
    $('#paper-m').textContent = `${v.kind} de alguien que ama ${v.topic}`;
    $('#paper-q').textContent = v.q;
    $('#paper-wv').innerHTML = bars(v.pk);
    $('#paper-t').textContent = fmt(v.secs);
    $('#player').setAttribute('aria-label', `Escuchar: ${v.q}`);
    topics.querySelectorAll('.chip').forEach((c, k) => c.setAttribute('aria-selected', k === i));
    if (animate && !reduce) { paper.classList.remove('swap'); void paper.offsetWidth; paper.classList.add('swap'); }
  };
  showPaper(0);
  topics.addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; if (cur) stop(); showPaper(+c.dataset.i, true); });

  /* ---------- un solo reproductor para toda la página ---------- */
  const au = $('#au'); let cur = null, from = null; // from: 'paper' | 'hero' | 'ring'
  const heroBtn = $('.hero [data-play]'), ringBtn = $('.ring-play');
  let actx = null, an = null, freq = null;
  const analyser = () => {
    if (an || !window.AudioContext) return;
    try { actx = new AudioContext(); const src = actx.createMediaElementSource(au); an = actx.createAnalyser(); an.fftSize = 256; src.connect(an); an.connect(actx.destination); freq = new Uint8Array(an.frequencyBinCount); } catch (e) { an = null; }
  };
  const setIcon = (n, name) => { if (n) n.innerHTML = ico(name); };
  const paintPaper = () => {
    if (from !== 'paper') return;
    const v = V[sel], p = au.duration ? au.currentTime / au.duration : 0;
    $$('#paper-wv i').forEach((b, i) => b.classList.toggle('p', i / v.pk.length < p));
    $('#paper-t').textContent = fmt(au.duration ? au.duration - au.currentTime : v.secs);
  };
  const stop = () => {
    au.pause();
    setIcon($('#player .ico'), 'play'); $('#player').classList.remove('playing'); $$('#paper-wv i').forEach(b => b.classList.remove('p')); $('#paper-t').textContent = fmt(V[sel].secs);
    setIcon(heroBtn.querySelector('.ico'), 'play'); heroBtn.classList.remove('on'); heroBtn.querySelector('.listen-t').textContent = 'Escuchar una botella';
    setIcon(ringBtn.querySelector('.ico'), 'play'); ringBtn.setAttribute('aria-label', 'Escuchar una voz de verdad'); $('#ring-cap').textContent = 'Escucha una botella de verdad · 0:13';
    cur = null; from = null; kick();
  };
  const play = (id, src) => {
    if (cur === id && from === src && !au.paused) return stop();
    if (cur) stop();
    analyser(); if (actx && actx.state === 'suspended') actx.resume();
    cur = id; from = src; au.src = `/v/${id}-say.mp3`; au.currentTime = 0;
    au.play().catch(() => stop());
    if (src === 'paper') { setIcon($('#player .ico'), 'pause'); $('#player').classList.add('playing'); }
    if (src === 'hero') { setIcon(heroBtn.querySelector('.ico'), 'pause'); heroBtn.classList.add('on'); heroBtn.querySelector('.listen-t').textContent = 'Escuchando…'; }
    if (src === 'ring') { setIcon(ringBtn.querySelector('.ico'), 'pause'); ringBtn.setAttribute('aria-label', 'Pausar'); }
    kick();
  };
  au.addEventListener('timeupdate', () => { paintPaper(); if (from === 'ring') $('#ring-cap').textContent = `Escuchando · ${fmt(au.duration ? au.duration - au.currentTime : 13)}`; });
  au.addEventListener('ended', stop);
  $('#player').addEventListener('click', () => play(V[sel].id, 'paper'));
  heroBtn.addEventListener('click', () => play('majo', 'hero'));
  ringBtn.addEventListener('click', () => play('leo', 'ring'));

  /* ---------- anillo de voz ---------- */
  const ring = $('#ring'), N = 72, R0 = 78;
  const base = seedBars(17, N).map(v => 14 + v * 52);
  const lines = base.map((L, i) => {
    const a = i / N * Math.PI * 2, l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', (Math.sin(a) * R0).toFixed(1)); l.setAttribute('y1', (-Math.cos(a) * R0).toFixed(1));
    l.dataset.a = a; ring.appendChild(l); return l;
  });
  const setLen = (l, L) => { const a = +l.dataset.a; l.setAttribute('x2', (Math.sin(a) * (R0 + L)).toFixed(1)); l.setAttribute('y2', (-Math.cos(a) * (R0 + L)).toFixed(1)); };
  lines.forEach((l, i) => setLen(l, base[i]));
  let litShown = reduce ? N : 0;
  const renderRing = (scrollP) => {
    const playing = from === 'ring' && !au.paused;
    let lit;
    if (playing) { lit = Math.round((au.duration ? au.currentTime / au.duration : 0) * N); }
    else lit = Math.round(scrollP * N);
    if (an && playing) { an.getByteFrequencyData(freq); lines.forEach((l, i) => { const f = freq[(i * 3) % 90] / 255; setLen(l, base[i] * .55 + f * 58); }); }
    else if (playing) { const t = performance.now() / 160; lines.forEach((l, i) => setLen(l, base[i] * (.7 + .3 * Math.sin(t + i * .7)))); }
    if (lit !== litShown || playing) { lines.forEach((l, i) => l.classList.toggle('lit', i < lit)); litShown = lit; }
    return playing;
  };
  if (reduce) lines.forEach(l => l.classList.add('lit'));

  /* ---------- conversación ---------- */
  const chat = $('#chat'), stages = $$('#stages li');
  const chatIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; chatIO.unobserve(e.target);
    const items = [...chat.children];
    if (reduce) { items.forEach(n => n.classList.add('in')); return; }
    let t = 0;
    items.forEach(n => {
      if (n.classList.contains('bub')) {
        const rec = document.createElement('div'); rec.className = 'rec in' + (n.classList.contains('me') ? ' me' : '');
        rec.innerHTML = `<span class="dot"></span><span class="mini">${[0, 1, 2, 3, 4].map(k => `<i style="--k:${k}"></i>`).join('')}</span>${n.classList.contains('me') ? 'Grabando tu respuesta' : 'Grabando…'}`;
        setTimeout(() => { n.before(rec); rec.style.display = ''; }, t);
        t += 1100;
        setTimeout(() => { rec.remove(); n.classList.add('in'); const bs = [...n.querySelectorAll('.wv i')]; bs.forEach((b, i) => setTimeout(() => b.classList.add('p'), 300 + i * 28)); }, t);
        t += 500;
      } else { setTimeout(() => n.classList.add('in'), t + 200); }
    });
  }), { threshold: .35 });
  chatIO.observe(chat);

  /* ---------- 8 orillas y la marea ---------- */
  const shore = $('#shore'), SVGNS = 'http://www.w3.org/2000/svg';
  let renderShore = () => {};
  if (shore) { // la sección 8 + 4 en SVG (ahora la cuenta la portada 3D)
  const C8 = ['#7FD8C9', '#FFC24B', '#8E8CFF', '#FF70A9', '#FFB061', '#9FE3B0', '#8E8CFF', '#FFC24B'];
  const hub = [200, 96], start = [24, 20];
  const P8 = C8.map((c, i) => [26 + i * 49.7, 128 + Math.sin(i * 1.3) * 12]);
  const P4 = [[60, 34], [150, 22], [250, 22], [340, 34]];
  let g = `<svg viewBox="0 0 400 170"><defs>${[...new Set(C8)].map((c, i) => `<radialGradient id="og${c.slice(1)}" cx=".32" cy=".28"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="#050407"/></radialGradient>`).join('')}</defs>`;
  g += `<path class="tidewave" d="M0 70 q25 -10 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="rgba(143,183,207,.5)" stroke-width="1.2"/>`;
  g += `<path id="flight" d="M${start[0]} ${start[1]} Q 90 -10 ${hub[0]} ${hub[1]}" fill="none" stroke="rgba(127,216,201,.35)" stroke-width="1" stroke-dasharray="2 4"/>`;
  P8.forEach(([x, y]) => g += `<path class="path p8" d="M${hub[0]} ${hub[1]} L${x.toFixed(1)} ${y.toFixed(1)}"/>`);
  P4.forEach(([x, y]) => g += `<path class="path p4" d="M${hub[0]} ${hub[1]} L${x} ${y}"/>`);
  P8.forEach(([x, y], i) => g += `<circle class="o8" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="url(#og${C8[i].slice(1)})"/>`);
  P4.forEach(([x, y]) => g += `<circle class="o4" cx="${x}" cy="${y}" r="6.5" fill="url(#og7FD8C9)"/>`);
  g += `<g id="sb"><g transform="scale(.32) translate(-60 -20)"><path d="M16 6h56q14 0 18 8h18v12H90q-4 8-18 8H16q-10 0-10-14T16 6z" fill="rgba(127,216,201,.3)" stroke="rgba(170,240,228,.95)" stroke-width="3"/><rect x="22" y="14" width="48" height="12" rx="5" fill="#F6E7C4"/><rect x="108" y="15" width="8" height="10" fill="#8A5A33"/></g></g></svg>`;
  g += `<div class="lbls"><span class="lbl">8 personas con tus gustos</span><span class="lbl">+4 si en 6 h nadie responde</span></div>`;
  shore.innerHTML = g;
  const flight = shore.querySelector('#flight'), FL = flight.getTotalLength(), sb = shore.querySelector('#sb');
  const p8 = [...shore.querySelectorAll('.p8')], p4 = [...shore.querySelectorAll('.p4')], o8 = [...shore.querySelectorAll('.o8')], o4 = [...shore.querySelectorAll('.o4')], tw = shore.querySelector('.tidewave');
  [...p8, ...p4].forEach(p => { const L = p.getTotalLength(); p.dataset.l = L; p.style.strokeDasharray = `${L} ${L}`; });
  renderShore = (p) => {
    const f = clamp(p / .35), pt = flight.getPointAtLength(FL * (1 - Math.pow(1 - f, 2)));
    sb.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(-30 + f * 50).toFixed(0)})`);
    sb.style.opacity = p < .42 ? 1 : Math.max(0, 1 - (p - .42) * 10);
    flight.style.opacity = 1 - clamp((p - .3) * 5);
    p8.forEach((l, i) => { const t = clamp((p - .36 - i * .02) / .12); l.style.strokeDashoffset = (+l.dataset.l * (1 - t)).toFixed(1); });
    o8.forEach((c, i) => { const t = clamp((p - .44 - i * .02) / .06); c.setAttribute('r', (11 * (t < 1 ? t * 1.25 : 1)).toFixed(2)); c.style.opacity = t > 0 ? 1 : 0; });
    const tide = clamp((p - .7) / .1);
    tw.setAttribute('transform', `translate(${(-50 + tide * 50).toFixed(1)} ${(30 - tide * 30).toFixed(1)})`); tw.style.opacity = tide;
    p4.forEach((l, i) => { const t = clamp((p - .76 - i * .02) / .1); l.style.strokeDashoffset = (+l.dataset.l * (1 - t)).toFixed(1); });
    o4.forEach((c, i) => { const t = clamp((p - .82 - i * .03) / .06); c.setAttribute('r', (6.5 * t).toFixed(2)); c.style.opacity = t * .8; });
  };
  renderShore(reduce ? 1 : 0);
  }

  /* ---------- constelación y la cifra que cuenta ---------- */
  const cst = $('#const'); let cLines = [];
  if (cst) {
    const pts = [[60, 150], [130, 70], [215, 110], [300, 50], [350, 160], [250, 200]];
    const pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2], [0, 5], [1, 3]];
    cLines = pairs.map(([a, b]) => { const [x1, y1] = pts[a], [x2, y2] = pts[b], L = Math.hypot(x2 - x1, y2 - y1); const l = document.createElementNS(SVGNS, 'line'); Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v)); l.style.strokeDasharray = `${L} ${L}`; l.style.strokeDashoffset = reduce ? 0 : L; l.dataset.l = L; cst.appendChild(l); return l; });
    pts.forEach(([x, y], i) => { const c = document.createElementNS(SVGNS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', i ? 2.4 : 3.6); if (!i) c.classList.add('one'); cst.appendChild(c); });
  }
  const six = $('#six');
  if (six && !reduce) { six.textContent = '1'; const sio = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; sio.disconnect(); let n = 1; const t = setInterval(() => { six.textContent = String(++n); if (n >= 6) clearInterval(t); }, 140); }, { threshold: .6 }); sio.observe(six); }

  /* ---------- entradas suaves ---------- */
  const inkSel = '.sec .d-lg, .sec-p, .note, .open-card, .rit li, .calm-grid > div, .faq details, .off-yes, .stat, .prose > *, .sheet-head > *, .ring-wrap';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$(inkSel).forEach(n => { n.classList.add('ink'); io.observe(n); });

  /* ---------- un solo bucle de scroll ---------- */
  const driftB = $('#drift-b'), sky = $('#sky');
  const bar = $('#bar'), hero = $('.hero'), ringSec = $('.ring-sec'), chatSec = $('.chat-sec');
  const strikes = $$('.strike li');
  const along = (n, a, b) => { const r = n.getBoundingClientRect(), H = innerHeight; return clamp((H * a - r.top) / (H * (a - b))); };
  const near = n => { const r = n.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; };
  let lastY = scrollY, raf = 0;
  const frame = () => {
    raf = 0; const y = scrollY;
    bar.classList.toggle('solid', y > hero.offsetHeight - 80);
    if (y > 500 && y > lastY + 4) bar.classList.add('hide'); else if (y < lastY - 4 || y < 500) bar.classList.remove('hide');
    lastY = y;
    let again = false;
    if (!reduce && y < hero.offsetHeight) { const hp = y / hero.offsetHeight; driftB.style.transform = `translate(${(hp * 70).toFixed(1)}px, ${(hp * 160).toFixed(1)}px) rotate(${(hp * 18).toFixed(1)}deg) scale(${(1 - hp * .35).toFixed(3)})`; sky.style.transform = `translateY(${(hp * 60).toFixed(1)}px)`; }
    if (!reduce && shore && near(shore)) renderShore(along(shore, .92, .25));
    if (!reduce && cst && near(cst)) { const p = along(cst, 1, .3) * cLines.length; cLines.forEach((l, i) => l.style.strokeDashoffset = (+l.dataset.l * (1 - clamp(p - i * .8))).toFixed(1)); }
    if (near(ringSec)) again = renderRing(reduce ? 1 : along($('.ring-wrap'), .95, .4)) || again;
    if (!reduce && near(chatSec)) { const p = along(chatSec, .7, -.1); const k = Math.min(3, Math.floor(p * 4)); stages.forEach((s, i) => s.classList.toggle('on', i <= k)); }
    if (!reduce) strikes.forEach(li => { if (near(li)) li.style.setProperty('--s', along(li, .85, .55).toFixed(3)); });
    if (again) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  strikes.forEach(li => li.style.setProperty('--s', reduce ? 1 : 0));
  if (reduce) stages.forEach(s => s.classList.add('on'));
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  frame();

  /* ---------- registro ---------- */
  const rpc = (fn, body) => fetch(`${CFG.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: CFG.key, Authorization: `Bearer ${CFG.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then(async r => { const j = await r.json().catch(() => null); if (!r.ok) { const e = new Error((j && (j.message || j.hint)) || r.statusText); e.status = r.status; e.code = j && j.code; throw e; } return j; });
  rpc('waitlist_left').then(n => {
    if (typeof n !== 'number') return;
    const l = $('#left'); l.hidden = false;
    l.textContent = n > 0 ? (n === 1 ? 'Queda 1 lugar' : `Quedan ${n} lugares`) : 'Los 100 lugares se llenaron. Te anotamos en la lista.';
    if (n > 0 && n <= 100) $('#pass-no').textContent = String(101 - n).padStart(3, '0');
  }).catch(() => {});

  const form = $('#form'), err = $('#err'), go = $('#go'), adult = $('#adult'), goT = go.querySelector('span');
  adult.addEventListener('click', () => adult.setAttribute('aria-checked', adult.getAttribute('aria-checked') !== 'true'));
  const shareText = invite => `Te mando una botella 🌊 Es una app de Lima donde grabas una pregunta con tu voz y ocho personas con tus mismos gustos la escuchan. Sin fotos. Entra aquí: ${location.origin}/${invite ? '?de=' + invite : ''}`;
  const show = r => {
    form.hidden = true; $('.sheet-head').hidden = true; $('#done').hidden = false;
    const first = (r.name || '').split(' ')[0];
    if (r.granted) {
      $('#done-eye').textContent = 'Tu lugar está guardado';
      $('#done-h').textContent = `${first ? first + ', tu' : 'Tu'} botella está lista.`;
      $('#done-p').textContent = 'Este es tu acceso. Guárdalo, también te sirve para volver a entrar.';
      $('#open').href = r.link || `${CFG.app}/?c=${CFG.code}`;
      $('#code').textContent = r.code || CFG.code;
      $('#done-access').hidden = false;
    } else {
      $('#done-eye').textContent = 'Lista de espera';
      $('#done-h').textContent = `${first ? first + ', ya' : 'Ya'} tienes tu lugar en la lista.`;
      $('#done-p').textContent = `Se llenaron los primeros lugares. Eres el número ${r.place} de la lista y te escribimos por WhatsApp apenas se abra el tuyo.`;
      $('#done-access').hidden = true;
    }
    $('#wa').href = 'https://wa.me/?text=' + encodeURIComponent(shareText(r.invite));
  };
  const saved = store.get('result');
  if (saved) show(saved);
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.textContent = '';
    const f = new FormData(form), name = String(f.get('name') || '').trim(), phone = String(f.get('phone') || '').replace(/[^\d+]/g, '');
    if (!name) { err.textContent = 'Escribe tu nombre o apodo.'; return form.name.focus(); }
    if (!/^(\+?\d{9,15})$/.test(phone)) { err.textContent = 'Revisa tu número de WhatsApp. Son 9 dígitos, por ejemplo 987 654 321.'; return form.phone.focus(); }
    if (adult.getAttribute('aria-checked') !== 'true') { err.textContent = 'Confirma que tienes 18 años o más para continuar.'; return adult.focus(); }
    go.disabled = true; goT.textContent = 'Guardando tu lugar…';
    try {
      const r = await rpc('join_waitlist', { p_name: name, p_phone: phone, p_district: f.get('district') || null, p_ref: store.get('ref') || null, p_source: source || null });
      store.set('result', r); show(r);
    } catch (x) {
      if (x.code === 'PGRST202' || x.status === 404) show({ granted: true, name, link: `${CFG.app}/?c=${CFG.code}`, code: CFG.code, invite: null });
      else if (/phone/.test(x.message)) err.textContent = 'Revisa tu número de WhatsApp.';
      else err.textContent = 'No pudimos guardar tu lugar. Revisa tu conexión e intenta otra vez.';
    } finally { go.disabled = false; goT.textContent = 'Quiero mi botella'; }
    $('#entrar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
})();
