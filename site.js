/* Botella · Carta náutica. Sin librerías.
   Todo lo que se mueve con el scroll pasa por un solo bucle y solo cuando está en pantalla.
   Con "reducir movimiento" cada cosa aparece ya en su estado final. */
(() => {
  const CFG = window.BOTELLA || {};
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const store = { get(k) { try { return JSON.parse(localStorage.getItem('botella-web-' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('botella-web-' + k, JSON.stringify(v)); } catch (e) {} } };
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  document.documentElement.classList.add('js');

  const qs = new URLSearchParams(location.search);
  const ref = (qs.get('de') || qs.get('r') || '').slice(0, 40);
  if (ref) store.set('ref', ref);
  const source = (qs.get('utm_source') || qs.get('src') || (document.referrer ? new URL(document.referrer).hostname : '') || '').slice(0, 40);

  /* ---------- la costa (compartida por la portada y la bitácora) ---------- */
  const coast = (w, y0, amp) => { let d = `M-20 -20 L${w + 20} -20 L${w + 20} ${y0}`; for (let x = w + 20; x >= -20; x -= 20) { const y = y0 + Math.sin(x * .021) * amp + Math.sin(x * .057 + 1) * amp * .45; d += ` L${x} ${y.toFixed(1)}`; } return d + ' Z'; };
  const contour = (w, y0, amp, ph) => { let d = ''; for (let x = -20; x <= w + 20; x += 10) { const y = y0 + Math.sin(x * .021 + ph) * amp + Math.sin(x * .057 + 1 + ph) * amp * .45; d += (x === -20 ? 'M' : 'L') + x + ' ' + y.toFixed(1) + ' '; } return d; };
  const soundings = (g, list) => list.forEach(([x, y, n]) => { const t = el('text', { x, y, 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#6B7888' }, g); t.textContent = n; });

  /* ---------- portada ---------- */
  const hm = $('#hero-map');
  if (hm) {
    const W = 400;
    const g = el('g', {}, hm);
    [0, 1, 2, 3, 4].forEach(i => el('path', { d: contour(W, 80 + i * 40, 9 - i, i * .6), fill: 'none', stroke: '#13233A', 'stroke-width': .7, opacity: .5 - i * .08 }, g));
    el('path', { d: coast(W, 46, 12), fill: '#D8CCB0' }, g);
    el('path', { d: contour(W, 46, 12, 0), fill: 'none', stroke: '#13233A', 'stroke-width': 1.3 }, g);
    soundings(g, [[34, 104, 12], [118, 128, 18], [270, 132, 23], [214, 214, 31], [64, 236, 27], [344, 232, 40], [150, 286, 46], [362, 98, 15]]);
    const lbl = el('text', { x: 262, y: 26, 'font-family': 'IBM Plex Mono', 'font-size': 9, 'letter-spacing': '.08em', fill: '#44546A' }, g); lbl.textContent = 'COSTA VERDE';
    const you = [214, 56];
    el('rect', { x: you[0] - 4, y: you[1] - 4, width: 8, height: 8, fill: '#13233A' }, g);
    const ty = el('text', { x: you[0] + 10, y: you[1] + 3, 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#13233A' }, g); ty.textContent = 'TÚ';
    const marks = [[150, 236], [58, 172], [96, 270], [236, 276], [292, 186], [346, 256], [30, 252], [206, 176]];
    const hub = [172, 146];
    const r = el('path', { class: 'route', d: `M${you[0]} ${you[1]} C 226 100, 150 110, ${hub[0]} ${hub[1]}`, fill: 'none', stroke: '#B93A24', 'stroke-width': 1.4 }, g);
    const len = r.getTotalLength(); r.style.setProperty('--len', len);
    marks.forEach(([x, y], i) => {
      const l = el('path', { class: 'route', d: `M${hub[0]} ${hub[1]} L${x} ${y}`, fill: 'none', stroke: '#B93A24', 'stroke-width': .8, 'stroke-dasharray': '2 3', opacity: .7 }, g);
      const L = Math.hypot(x - hub[0], y - hub[1]); l.style.setProperty('--len', L); l.style.animationDelay = (1.6 + i * .09) + 's';
      const m = el('g', { class: 'mark' }, g); m.style.animationDelay = (2 + i * .09) + 's';
      el('circle', { cx: x, cy: y, r: 5, fill: '#EEE7D8', stroke: '#B93A24', 'stroke-width': 1.4 }, m);
      const t = el('text', { x: x + 9, y: y + 3, 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#B93A24' }, m); t.textContent = '0' + (i + 1);
    });
    const b = el('g', { transform: `translate(${hub[0]} ${hub[1]})` }, g);
    const bi = el('g', { class: 'bob' }, b);
    el('rect', { x: -12, y: -4, width: 22, height: 8, rx: 3, fill: '#EEE7D8', stroke: '#13233A', 'stroke-width': 1.2 }, bi);
    el('rect', { x: -8, y: -1.6, width: 12, height: 3.2, rx: 1, fill: '#D8CCB0' }, bi);
    el('rect', { x: 10, y: -2.4, width: 4.5, height: 4.8, fill: '#13233A' }, bi);
  }

  /* ---------- tinta que se asienta al entrar ---------- */
  const inkSel = '.sec-head .d-lg, .sec-note, .find, .key, .calm-grid > div, .faq details, .off-yes, .night .d-lg, .stat, .prose > *, .ticket-head > *';
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  const watchInk = () => $$(inkSel).forEach(n => { if (!n.classList.contains('ink')) { n.classList.add('ink'); io.observe(n); } });

  /* ---------- botellas encontradas ---------- */
  const V = [
    { id: 'majo', n: '014', kind: 'Pregunta', topic: 'la música', secs: 14, q: '¿Qué harías un domingo si nadie en esta ciudad te conociera?', pk: [1, .48, .77, .57, .82, .74, .67, .41, .35, .91, .76, .58, .92, .51, .68, .28, .88, .57, .71, .74, .53, .33, .89, .5, .38, .86, 1, .48] },
    { id: 'leo', n: '022', kind: 'Confesión', topic: 'el cine', secs: 13, q: 'Me mudé a Lima hace tres meses y todavía no tengo con quién ir al cine.', pk: [.67, .42, .32, .41, 1, .48, .49, .29, .59, .6, .53, .39, .4, .16, .6, .49, .4, .39, .44, .41, .67, .55, .61, .52, .4, .3, .42, .18] },
    { id: 'rocio', n: '031', kind: 'Historia', topic: 'la comida', secs: 15, q: 'Lo más raro que me pasó en una combi.', pk: [.64, .72, .92, .62, .74, .42, .74, .72, .95, .51, .6, .86, .52, .65, .73, .75, .7, .57, .73, .79, .82, .84, 1, .54, .91, .79, .61, .62] },
    { id: 'diego', n: '047', kind: 'Confesión', topic: 'la tecnología', secs: 12, q: 'Trabajo desde casa y a veces paso días sin hablar con nadie.', pk: [1, .87, .93, .83, .7, .85, .7, .58, .68, .7, .63, .52, .25, .92, .64, .64, .57, .36, .26, .77, .73, .7, .61, .42, .89, .84, .57, .36] }
  ];
  const fmt = s => `0:${String(Math.round(s)).padStart(2, '0')}`;
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  $('#finds').innerHTML = V.map(v => `<li class="find" data-v="${v.id}"><button type="button" aria-label="Escuchar: ${v.q}. ${v.kind} de alguien que ama ${v.topic}">
    <span class="play">${PLAY}</span>
    <span><span class="meta mono"><span>N.º ${v.n} · ${v.kind}</span><b>Ama ${v.topic}</b></span>
    <span class="q">${v.q}</span>
    <span class="bars">${v.pk.map(p => `<i style="--h:${Math.max(.15, p).toFixed(2)};height:100%"></i>`).join('')}<span class="t mono">${fmt(v.secs)}</span></span></span>
  </button></li>`).join('');
  const au = $('#au'); let cur = null;
  const row = id => $(`.find[data-v="${id}"]`);
  const heroBtn = $('[data-play]');
  const paint = () => {
    if (!cur) return;
    const v = V.find(x => x.id === cur), r = row(cur), p = au.duration ? au.currentTime / au.duration : 0;
    r.querySelectorAll('.bars i').forEach((b, i) => b.classList.toggle('p', i / v.pk.length < p));
    r.querySelector('.t').textContent = fmt(au.duration ? au.duration - au.currentTime : v.secs);
  };
  const stop = () => {
    if (!cur) return;
    const r = row(cur); r.classList.remove('on'); r.querySelector('.play').innerHTML = PLAY;
    r.querySelectorAll('.bars i').forEach(b => b.classList.remove('p'));
    r.querySelector('.t').textContent = fmt(V.find(x => x.id === cur).secs);
    if (cur === heroBtn.dataset.play) { heroBtn.classList.remove('on'); heroBtn.querySelector('.listen-t').textContent = 'Escuchar una botella'; }
    cur = null;
  };
  const play = id => {
    if (cur === id && !au.paused) { au.pause(); stop(); return; }
    stop(); cur = id; au.src = `/v/${id}-say.mp3`; au.currentTime = 0;
    au.play().catch(() => stop());
    const r = row(id); r.classList.add('on'); r.querySelector('.play').innerHTML = PAUSE;
    if (id === heroBtn.dataset.play) { heroBtn.classList.add('on'); heroBtn.querySelector('.listen-t').textContent = 'Escuchando…'; }
  };
  au.addEventListener('timeupdate', paint);
  au.addEventListener('ended', stop);
  document.addEventListener('click', e => {
    const f = e.target.closest('.find'); if (f) return play(f.dataset.v);
    const h = e.target.closest('[data-play]'); if (h) return play(h.dataset.play);
  });
  watchInk();

  /* ---------- bitácora: el viaje de una botella, ligado al scroll ---------- */
  const log = $('.log'), lm = $('#log-map');
  const entries = $$('#entries li');
  const T = [0, .1, .2, .36, .5, .62, .74, .86, 1];
  const TIMES = ['21:04', '21:05', '21:05', '03:05', '08:12', '08:15', '08:40', '22:10'];
  let renderLog = () => {};
  if (log && lm && !reduce) {
    document.documentElement.classList.add('pinned');
    const W = 400;
    const g = el('g', {}, lm);
    [0, 1, 2, 3].forEach(i => el('path', { d: contour(W, 80 + i * 44, 8 - i, i * .7), fill: 'none', stroke: '#13233A', 'stroke-width': .6, opacity: .4 - i * .07 }, g));
    el('path', { d: coast(W, 44, 9), fill: '#D8CCB0' }, g);
    el('path', { d: contour(W, 44, 9, 0), fill: 'none', stroke: '#13233A', 'stroke-width': 1.2 }, g);
    soundings(g, [[30, 100, 12], [350, 96, 15], [240, 140, 22], [60, 250, 30], [360, 220, 38]]);
    const you = [206, 52], hub = [196, 150];
    const M8 = [[110, 108], [60, 160], [300, 104], [350, 160], [96, 222], [178, 238], [262, 210], [326, 246]];
    const M4 = [[30, 286], [140, 290], [262, 292], [376, 286]];
    const THEM = 4;
    const lineTo = (a, b, attrs) => { const l = el('path', Object.assign({ d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, fill: 'none' }, attrs), g); const L = Math.hypot(b[0] - a[0], b[1] - a[1]); l.setAttribute('stroke-dasharray', `${L} ${L}`); l.setAttribute('stroke-dashoffset', L); return [l, L]; };
    const launch = el('path', { d: `M${you[0]} ${you[1]} C 214 92, 170 104, ${hub[0]} ${hub[1]}`, fill: 'none', stroke: '#B93A24', 'stroke-width': 1.5 }, g);
    const LL = launch.getTotalLength(); launch.setAttribute('stroke-dasharray', `${LL} ${LL}`); launch.setAttribute('stroke-dashoffset', LL);
    const spokes = M8.map(m => lineTo(hub, m, { stroke: '#B93A24', 'stroke-width': .8, opacity: .65 }));
    const spokes4 = M4.map(m => lineTo(hub, m, { stroke: '#B93A24', 'stroke-width': .8, opacity: .45 }));
    const mark = (x, y, label, dashed) => {
      const m = el('g', { opacity: 0 }, g);
      const c = el('circle', { cx: x, cy: y, r: 7, fill: '#E5DCC8', stroke: '#B93A24', 'stroke-width': 1.4, 'stroke-dasharray': dashed ? '2 2' : 'none' }, m);
      const t = el('text', { x: x + 10, y: y + 3, 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#B93A24' }, m); t.textContent = label;
      return { m, c, t, x, y };
    };
    const m8 = M8.map(([x, y], i) => mark(x, y, '0' + (i + 1)));
    const m4 = M4.map(([x, y], i) => mark(x, y, String(9 + i).padStart(2, '0'), true));
    // tú
    el('rect', { x: you[0] - 4.5, y: you[1] - 4.5, width: 9, height: 9, fill: '#13233A' }, g);
    const youT = el('text', { x: you[0] + 11, y: you[1] + 3, 'font-family': 'IBM Plex Mono', 'font-size': 12, fill: '#13233A' }, g); youT.textContent = 'TÚ';
    // ondas de grabación
    const rings = [0, 1, 2].map(() => el('circle', { cx: you[0], cy: you[1], r: 6, fill: 'none', stroke: '#B93A24', 'stroke-width': 1, opacity: 0 }, g));
    // botella
    const bottle = el('g', { opacity: 0 }, g);
    el('rect', { x: -11, y: -4, width: 20, height: 8, rx: 3, fill: '#EEE7D8', stroke: '#13233A', 'stroke-width': 1.2 }, bottle);
    el('rect', { x: 9, y: -2.4, width: 4.5, height: 4.8, fill: '#13233A' }, bottle);
    // marea
    const tide = el('g', { opacity: 0 }, g);
    [0, 1].forEach(i => el('path', { d: `M${hub[0] - 26} ${hub[1] + 18 + i * 7} q6.5 -5 13 0 t13 0 t13 0 t13 0`, fill: 'none', stroke: '#13233A', 'stroke-width': 1 }, tide));
    const tideT = el('text', { x: hub[0] + 32, y: hub[1] + 26, 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#13233A' }, tide); tideT.textContent = '+6 H';
    // respuesta
    const them = m8[THEM];
    const reply = el('path', { d: `M${them.x} ${them.y} C 120 140, 180 70, ${you[0]} ${you[1]}`, fill: 'none', stroke: '#13233A', 'stroke-width': 1.6 }, g);
    const RL = reply.getTotalLength(); reply.setAttribute('stroke-dasharray', `${RL} ${RL}`); reply.setAttribute('stroke-dashoffset', RL);
    const pulses = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#B93A24', opacity: 0 }, g));
    const chip = el('g', { opacity: 0 }, g);
    el('rect', { x: 80, y: 110, width: 184, height: 22, fill: '#13233A' }, chip);
    const chipT = el('text', { x: 172, y: 124.5, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#EEE7D8', 'letter-spacing': '.06em' }, chip); chipT.textContent = 'TEMA EN COMÚN: EL CINE';
    const themT = el('text', { x: them.x - 10, y: them.y + 22, 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#13233A', opacity: 0 }, g); themT.textContent = 'AMA EL CINE';
    const key = (x, y) => { const k = el('g', { opacity: 0 }, g); el('circle', { cx: 0, cy: 0, r: 4, fill: 'none', stroke: '#B93A24', 'stroke-width': 1.5 }, k); el('path', { d: 'M4 0h9M10 0v4M13 0v3', stroke: '#B93A24', 'stroke-width': 1.5, fill: 'none', 'stroke-linecap': 'round' }, k); k.dataset.x = x; k.dataset.y = y; return k; };
    const k1 = key(you[0] - 36, you[1] + 18), k2 = key(them.x - 34, them.y - 18);

    let lastK = -1;
    renderLog = p => {
      // 1 grabar
      const rec = seg(p, .01, T[1]);
      rings.forEach((c, i) => { const t = Math.max(0, rec * 2.4 - i * .3) % 1; const on = rec > 0 && rec < 1 && rec * 2.4 > i * .3; c.setAttribute('r', (6 + t * 22).toFixed(1)); c.setAttribute('opacity', on ? (1 - t).toFixed(2) : 0); });
      // 2 lanzar
      const ln = ease(seg(p, T[1], T[2] - .01));
      launch.setAttribute('stroke-dashoffset', (LL * (1 - ln)).toFixed(1));
      const pt = launch.getPointAtLength(LL * ln);
      bottle.setAttribute('opacity', p > T[1] && p < T[4] ? 1 : 0);
      bottle.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(-30 + ln * 40).toFixed(0)})`);
      // 3 ocho orillas
      spokes.forEach(([l, L], i) => {
        const t = ease(seg(p, T[2] + .005 + i * .012, T[2] + .05 + i * .012));
        l.setAttribute('stroke-dashoffset', (L * (1 - t)).toFixed(1));
        const on = t >= 1;
        m8[i].m.setAttribute('opacity', on ? 1 : t > .6 ? .6 : 0);
        const dim = i === THEM ? 0 : seg(p, T[4], T[4] + .03) * .55;
        if (p >= T[4]) m8[i].m.setAttribute('opacity', (1 - dim).toFixed(2));
      });
      // 4 marea
      tide.setAttribute('opacity', (seg(p, T[3], T[3] + .02) * (1 - seg(p, T[4] - .02, T[4]))).toFixed(2));
      tideT.textContent = '+' + Math.max(1, Math.round(seg(p, T[3], T[3] + .05) * 6)) + ' H';
      spokes4.forEach(([l, L], i) => {
        const t = ease(seg(p, T[3] + .05 + i * .01, T[3] + .09 + i * .01));
        l.setAttribute('stroke-dashoffset', (L * (1 - t)).toFixed(1));
        m4[i].m.setAttribute('opacity', (t >= 1 ? 1 - seg(p, T[4], T[4] + .03) * .55 : 0).toFixed(2));
      });
      // 5 descorchada
      const op = seg(p, T[4] + .01, T[4] + .05);
      them.c.setAttribute('fill', op > .5 ? '#B93A24' : '#E5DCC8');
      them.c.setAttribute('r', (7 + Math.sin(op * Math.PI) * 4).toFixed(1));
      themT.setAttribute('opacity', seg(p, T[4] + .03, T[4] + .06).toFixed(2));
      // 6 responde
      const rp = ease(seg(p, T[5], T[6] - .02));
      reply.setAttribute('stroke-dashoffset', (RL * (1 - rp)).toFixed(1));
      // 7 conversan: pulsos que van y vienen
      const tk = seg(p, T[6], T[7]);
      pulses.forEach((c, i) => {
        let t = clamp((p < T[6] ? rp * 1.4 : tk * 2.2) - i * .3); if (p >= T[6] && i === 1) t = 1 - t;
        const on = (p >= T[5] + .01) && t > 0 && t < 1;
        const q = reply.getPointAtLength(RL * (p < T[6] ? t * rp : t));
        c.setAttribute('cx', q.x.toFixed(1)); c.setAttribute('cy', q.y.toFixed(1)); c.setAttribute('opacity', on ? 1 : 0);
        c.setAttribute('fill', p >= T[6] && i === 1 ? '#13233A' : '#B93A24');
      });
      chip.setAttribute('opacity', seg(p, T[6] + .02, T[6] + .05).toFixed(2));
      // 8 llaves y nombres
      const a1 = seg(p, T[7] + .01, T[7] + .04), a2 = seg(p, T[7] + .05, T[7] + .08);
      [[k1, a1], [k2, a2]].forEach(([k, a]) => { k.setAttribute('opacity', seg(p, T[7], T[7] + .01).toFixed(2)); k.setAttribute('transform', `translate(${k.dataset.x} ${k.dataset.y}) rotate(${(-90 + a * 90).toFixed(0)})`); });
      const both = p >= T[7] + .09;
      youT.textContent = both ? 'TÚ · MAJO' : 'TÚ';
      themT.textContent = both ? 'LEO' : 'AMA EL CINE';
      themT.setAttribute('fill', both ? '#B93A24' : '#13233A');
      // texto
      let k = 0; while (k < 7 && p >= T[k + 1]) k++;
      if (k !== lastK) {
        entries.forEach((li, i) => { const up = k - i; li.style.setProperty('--up', Math.max(0, up)); li.style.setProperty('--o', up < 0 ? 0 : up === 0 ? 1 : up === 1 ? .55 : up === 2 ? .25 : 0); li.classList.toggle('now', up === 0); li.setAttribute('aria-hidden', up === 0 ? 'false' : 'true'); });
        $('#log-time').textContent = TIMES[k]; $('#log-step').textContent = (k + 1) + '/8';
        lastK = k;
      }
    };
    renderLog(0);
  }

  /* ---------- fuera del mapa, estrellas y marea final ---------- */
  const strikes = $$('.strike li');
  const stars = $('#stars');
  let starLines = [], starDots = [];
  if (stars) {
    const pts = [[60, 150], [130, 70], [215, 110], [300, 50], [350, 160], [250, 210]];
    const pairs = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2], [1, 3]];
    starLines = pairs.map(([a, b]) => { const [x1, y1] = pts[a], [x2, y2] = pts[b], L = Math.hypot(x2 - x1, y2 - y1); const l = el('line', { x1, y1, x2, y2, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': reduce ? 0 : L }, stars); return [l, L]; });
    starDots = pts.map(([cx, cy], i) => el('circle', { cx, cy, r: i ? 2.6 : 4, class: i ? '' : 'one' }, stars));
  }
  const wm = $('.foot-wm');
  const along = (n, from, to) => { const r = n.getBoundingClientRect(), H = innerHeight; return clamp((H * from - r.top) / (H * (from - to))); };

  /* ---------- un solo bucle de scroll ---------- */
  const bar = $('#bar'), rule = $('#bar-rule'), sheet = $('#sheet'), night = $('.night'), foot = $('.foot');
  const tape = $('.tape-track');
  let lastY = scrollY, tapeX = 0, tapeV = 0, tapeW = 0, raf = 0, shown = 0;
  const near = n => { const r = n.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; };
  const sheets = [['#top', 'Hoja 01 · Lima'], ['#voces', 'Hoja 02 · Hallazgos'], ['#como', 'Hoja 03 · Bitácora'], ['.legend', 'Hoja 04 · Leyenda'], ['#entrar', 'Hoja 05 · Pase'], ['#por-que', 'Hoja 06 · Nocturna']].map(([s, t]) => [$(s), t]);
  const frame = () => {
    raf = 0;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    rule.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    bar.classList.toggle('hide', y > 400 && y > lastY + 4 && !(log && near(log) && log.getBoundingClientRect().top < 0 && log.getBoundingClientRect().bottom > innerHeight));
    if (y < lastY - 4) bar.classList.remove('hide');
    const dark = [night, foot].some(n => { const r = n.getBoundingClientRect(); return r.top < 50 && r.bottom > 50; });
    bar.classList.toggle('dark', dark);
    let s = sheets[0][1]; sheets.forEach(([n, t]) => { if (n && n.getBoundingClientRect().top < innerHeight * .4) s = t; }); if (sheet.textContent !== s) sheet.textContent = s;
    // cinta
    tapeV += (y - lastY) * .3; lastY = y;
    // bitácora
    let again = false;
    if (log && near(log)) {
      const r = log.getBoundingClientRect(), span = log.offsetHeight - innerHeight;
      const target = span > 0 ? clamp(-r.top / span) : 0;
      shown += (target - shown) * .2; if (Math.abs(target - shown) < .0005) shown = target; else again = true;
      renderLog(shown);
    }
    strikes.forEach(li => { if (near(li)) li.style.setProperty('--s', along(li, .82, .5).toFixed(3)); });
    if (stars && near(stars)) { const p = along(stars, 1, .2) * starLines.length; starLines.forEach(([l, L], i) => l.setAttribute('stroke-dashoffset', (L * (1 - clamp(p - i * .8))).toFixed(1))); }
    if (wm && near(wm)) wm.style.setProperty('--tide', (along(wm, 1, .55) * 70).toFixed(1) + '%');
    if (Math.abs(tapeV) > .05) { tapeW = tapeW || tape.scrollWidth / 2; tapeV *= .9; tapeX = (tapeX - tapeV) % tapeW; if (tapeX > 0) tapeX -= tapeW; tape.style.setProperty('--tx', tapeX.toFixed(1) + 'px'); again = true; }
    if (again) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  if (reduce) {
    strikes.forEach(li => li.style.setProperty('--s', 1));
    if (wm) wm.style.setProperty('--tide', '70%');
  } else {
    strikes.forEach(li => li.style.setProperty('--s', 0));
  }
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
  const shareText = invite => `Te mando una botella 🌊 Es una app de Lima donde grabas una pregunta con tu voz y la escuchan ocho personas de tus mismos temas. Sin fotos. Entra aquí: ${location.origin}/${invite ? '?de=' + invite : ''}`;
  const show = r => {
    form.hidden = true; $('.ticket-head').hidden = true; $('#done').hidden = false;
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
      $('#done-h').textContent = `${first ? first + ', estás' : 'Estás'} en la orilla.`;
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
