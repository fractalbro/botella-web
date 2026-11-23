/* Botella · "Por dentro": el viaje de una botella en isométrico, ligado al scroll.
   Sin dependencias. Todo se dibuja en un SVG y cada cuadro se calcula a partir
   de cuánto avanzaste en la sección (0 a 1). Con "reducir movimiento" no hay
   recorridos: cada paso aparece ya terminado. */
(() => {
  const sec = document.querySelector('.inside');
  const svg = document.getElementById('iso');
  if (!sec || !svg) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const NS = 'http://www.w3.org/2000/svg';
  const U = 17; // tamaño de una casilla
  const C30 = Math.cos(Math.PI / 6), S30 = 0.5;

  /* ---------- geometría isométrica ---------- */
  const P = (x, y, z = 0) => [(x - y) * C30 * U, (x + y) * S30 * U - z * U];
  const pts = a => a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
  const el = (tag, attrs = {}, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent.appendChild(n); return n;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Un bloque (isla): tapa + dos caras visibles.
  const prism = (g, x, y, w, d, h, top, left, right) => {
    const x0 = x - w / 2, y0 = y - d / 2, x1 = x + w / 2, y1 = y + d / 2;
    el('polygon', { points: pts([P(x0, y1, h), P(x1, y1, h), P(x1, y1, 0), P(x0, y1, 0)]), fill: left }, g);
    el('polygon', { points: pts([P(x1, y0, h), P(x1, y1, h), P(x1, y1, 0), P(x1, y0, 0)]), fill: right }, g);
    el('polygon', { points: pts([P(x0, y0, h), P(x1, y0, h), P(x1, y1, h), P(x0, y1, h)]), fill: top }, g);
  };

  /* ---------- escena ---------- */
  const defs = el('defs');
  defs.innerHTML = `
    <linearGradient id="g-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E2C42"/><stop offset="1" stop-color="#071827"/></linearGradient>
    <radialGradient id="g-glow"><stop offset="0" stop-color="#7FD8C9" stop-opacity=".55"/><stop offset="1" stop-color="#7FD8C9" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow-a"><stop offset="0" stop-color="#FFC24B" stop-opacity=".6"/><stop offset="1" stop-color="#FFC24B" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow-p"><stop offset="0" stop-color="#FF70A9" stop-opacity=".6"/><stop offset="1" stop-color="#FF70A9" stop-opacity="0"/></radialGradient>
    <g id="btl"><path d="M-9-3.2h8q2.3 0 3 1.3h3v3.8h-3q-.7 1.3-3 1.3h-8q-2 0-2-3.2t2-3.2z" fill="#9FE6DA" fill-opacity=".35" stroke="#C9F5EE" stroke-width=".9"/><rect x="-7.6" y="-1.3" width="7" height="2.6" rx="1.1" fill="#F6E7C4"/><rect x="5.1" y="-1.2" width="1.7" height="2.4" fill="#8A5A33"/></g>
    <g id="key"><circle cx="0" cy="-5" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M0-1.6V7M0 3.2h2.6M0 6h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>`;

  const cam = el('g', { class: 'cam' });
  const S = 6.4; // medio lado del mar
  el('polygon', { points: pts([P(-S, -S), P(S, -S), P(S, S), P(-S, S)]), fill: 'url(#g-sea)' }, cam);
  // borde frontal del mar, para que se lea como un bloque de agua
  el('polygon', { points: pts([P(-S, S), P(S, S), P(S, S, -.5), P(-S, S, -.5)]), fill: '#061421' }, cam);
  el('polygon', { points: pts([P(S, -S), P(S, S), P(S, S, -.5), P(S, -S, -.5)]), fill: '#04101B' }, cam);
  // cuadrícula muy suave
  const grid = el('g', { stroke: 'rgba(127,216,201,.07)', 'stroke-width': .6 }, cam);
  for (let i = -S + 1.6; i < S; i += 1.6) {
    el('line', { x1: P(i, -S)[0], y1: P(i, -S)[1], x2: P(i, S)[0], y2: P(i, S)[1] }, grid);
    el('line', { x1: P(-S, i)[0], y1: P(-S, i)[1], x2: P(S, i)[0], y2: P(S, i)[1] }, grid);
  }
  // olas que se mueven solas (CSS), en capas
  const waves = el('g', { class: 'waves' }, cam);
  [[-3, 2.4], [1.5, -2.6], [-1, 4.6], [3.8, 0.6], [-4.4, -2.8], [0.6, 0.8]].forEach(([x, y], i) => {
    const [a, b] = [P(x - .7, y), P(x + .7, y)];
    el('path', { d: `M${a[0]},${a[1]} q${(b[0] - a[0]) / 2},-3 ${b[0] - a[0]},${b[1] - a[1]}`, fill: 'none', stroke: 'rgba(170,240,228,.22)', 'stroke-width': .9, 'stroke-linecap': 'round', style: `animation-delay:${-i * .7}s` }, waves);
  });

  // Orillas: ocho primero, cuatro más con la marea.
  const SH8 = [[-4.2, -0.6], [-3.0, -3.5], [-0.3, -4.7], [2.5, -4.0], [4.4, -1.7], [-1.3, -1.7], [1.5, -0.9], [-4.9, 2.4]];
  const SH4 = [[-5.2, -5.1], [4.8, -4.2], [-4.8, 4.2], [0.2, 5.2]];
  const ME = [3.5, 3.5], THEM = 0; // índice de la orilla que responde
  const items = [];
  const layer = el('g', {}, cam);
  const shore = (x, y, extra, i) => {
    const g = el('g', { class: 'shore' }, layer);
    const ripple = el('ellipse', { cx: P(x, y)[0], cy: P(x, y)[1], rx: 0, ry: 0, fill: 'none', stroke: '#7FD8C9', 'stroke-width': 1, opacity: 0 }, g);
    const body = el('g', {}, g);
    prism(body, x, y, .95, .95, .32, '#2A4656', '#142A38', '#0F2130');
    const [ox, oy] = P(x, y, .32 + .55);
    const glow = el('circle', { cx: ox, cy: oy, r: 13, fill: 'url(#g-glow)', opacity: 0 }, body);
    const orb = el('circle', { cx: ox, cy: oy, r: 3.6, fill: '#22394A', stroke: 'rgba(170,240,228,.45)', 'stroke-width': .8 }, body);
    const bottle = el('use', { href: '#btl', opacity: 0 }, layer);
    const it = { x, y, g, body, orb, glow, ripple, bottle, extra, i, ox, oy };
    items.push(it); return it;
  };
  SH8.forEach((s, i) => shore(s[0], s[1], false, i));
  SH4.forEach((s, i) => shore(s[0], s[1], true, i));

  // Tu orilla: más grande, color ámbar.
  const meG = el('g', {}, layer);
  prism(meG, ME[0], ME[1], 1.7, 1.7, .5, '#F1E3C2', '#B9A479', '#9A875F');
  const [mx, my] = P(ME[0], ME[1], .5 + .8);
  const meGlow = el('circle', { cx: mx, cy: my, r: 18, fill: 'url(#g-glow-a)', opacity: .7 }, meG);
  const meOrb = el('circle', { cx: mx, cy: my, r: 5.6, fill: '#FFC24B' }, meG);
  const micRing = el('circle', { cx: mx, cy: my, r: 6, fill: 'none', stroke: '#FFC24B', 'stroke-width': 1, opacity: 0 }, meG);
  const bars = el('g', { transform: `translate(${mx},${my - 15})` }, meG);
  const BAR = [.5, .9, .65, 1, .7, .45, .8];
  const barEls = BAR.map((h, i) => el('rect', { x: (i - 3) * 3 - 1, y: 0, width: 2, height: 0, rx: 1, fill: '#FFC24B' }, bars));

  // Botella principal (la que lanzas).
  const main = el('use', { href: '#btl', opacity: 0 }, layer);

  // Reloj de la marea (6 h).
  const clockAt = P(0.2, 1.4, 2.2);
  const clock = el('g', { transform: `translate(${clockAt[0]},${clockAt[1]})`, opacity: 0 }, cam);
  el('circle', { r: 11, fill: '#0B2236', stroke: 'rgba(244,239,231,.18)', 'stroke-width': 1 }, clock);
  const RC = 2 * Math.PI * 11;
  const clockArc = el('circle', { r: 11, fill: 'none', stroke: '#7FD8C9', 'stroke-width': 1.6, 'stroke-dasharray': `0 ${RC}`, transform: 'rotate(-90)', 'stroke-linecap': 'round' }, clock);
  const clockTx = el('text', { y: 3.2, 'text-anchor': 'middle', class: 'iso-t', fill: '#F4EFE7' }, clock);
  clockTx.textContent = '0 h';

  // Línea de la conversación entre la orilla que responde y tú.
  const them = items[THEM];
  const A = [them.ox, them.oy], B = [mx, my];
  const ctrl = [(A[0] + B[0]) / 2 - 4, Math.min(A[1], B[1]) - 18];
  const qb = t => [(1 - t) ** 2 * A[0] + 2 * (1 - t) * t * ctrl[0] + t * t * B[0], (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * ctrl[1] + t * t * B[1]];
  const line = el('path', { d: `M${A[0]},${A[1]} Q${ctrl[0]},${ctrl[1]} ${B[0]},${B[1]}`, fill: 'none', stroke: '#FF70A9', 'stroke-width': 1, 'stroke-dasharray': '2 3', opacity: 0, 'stroke-linecap': 'round' }, cam);
  const pulses = [0, 1, 2].map(() => el('circle', { r: 2.2, fill: '#FF70A9', opacity: 0 }, cam));
  const pulsesBack = [0, 1].map(() => el('circle', { r: 2.2, fill: '#FFC24B', opacity: 0 }, cam));
  const themGlowP = el('circle', { cx: them.ox, cy: them.oy, r: 16, fill: 'url(#g-glow-p)', opacity: 0 }, cam);
  // corcho que salta
  const cork = el('rect', { x: -1.2, y: -1.6, width: 2.4, height: 3.2, rx: .6, fill: '#8A5A33', opacity: 0 }, cam);

  // Tema en común
  const chipAt = qb(.55).map((v, i) => v + [22, 4][i]);
  const chip = el('g', { transform: `translate(${chipAt[0]},${chipAt[1] - 6})`, opacity: 0 }, cam);
  el('rect', { x: -45, y: -9, width: 90, height: 18, rx: 9, fill: '#F4EFE7' }, chip);
  const chipTx = el('text', { y: 3.4, 'text-anchor': 'middle', class: 'iso-t', fill: '#05121F' }, chip);
  chipTx.textContent = 'Los dos aman el cine';

  // Llaves y nombres
  const keyMe = el('use', { href: '#key', color: '#FFC24B', opacity: 0 }, cam);
  const keyThem = el('use', { href: '#key', color: '#FF70A9', opacity: 0 }, cam);
  const label = (x, y, txt, fill) => {
    const g = el('g', { transform: `translate(${x},${y})`, opacity: 0 }, cam);
    const r = el('rect', { y: -8, height: 15, rx: 7.5, fill: '#05121F', stroke: fill, 'stroke-width': .8 }, g);
    const t = el('text', { y: 3, 'text-anchor': 'middle', class: 'iso-t', fill }, g);
    t.textContent = txt;
    const fit = () => { const w = Math.max(30, s2w(t.textContent)); r.setAttribute('x', -w / 2); r.setAttribute('width', w); };
    fit();
    return { g, r, t, set(s) { if (t.textContent !== s) { t.textContent = s; fit(); } } };
  };
  const s2w = s => s.length * 5.4 + 14;
  const lblMe = label(mx, my + 27, 'Tú', '#FFC24B');
  const lblThem = label(them.ox, them.oy - 13, 'Ama el cine', '#FF70A9');

  /* ---------- línea de tiempo ---------- */
  // Inicio de cada paso (8 pasos). El último dura hasta 1.
  const T = [0, .11, .22, .38, .52, .64, .76, .88, 1];
  const steps = [...document.querySelectorAll('#in-steps li')];
  const rail = document.getElementById('in-rail');
  const dots = steps.map((li, k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'in-dot';
    b.setAttribute('aria-label', li.querySelector('h3').textContent);
    b.addEventListener('click', () => go(k));
    rail.appendChild(b); return b;
  });

  // Cámara: zoom suave hacia quien responde y luego a los dos.
  const ctr = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const MID = [(A[0] + B[0]) / 2 + 6, (A[1] + B[1]) / 2 + 10];
  const CAM = [
    [0, 1.7, mx, my - 8], [.1, 1.7, mx, my - 8], [.2, 1, 0, -2], [.52, 1, 0, -2],
    [.6, 1.75, them.ox, them.oy], [.66, 1.75, them.ox, them.oy],
    [.74, 1.22, MID[0], MID[1]], [.88, 1.22, MID[0], MID[1]], [1, 1.28, MID[0], MID[1]]
  ];
  const camAt = p => {
    let i = 0; while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1], t = easeIO(seg(p, a[0], b[0]));
    return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
  };

  const spot = P(1.7, 1.7); // donde cae la botella al mar
  const place = (node, x, y, rot = 0, s = 1) => node.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`);
  let lastStep = -1;

  const render = p => {
    // cámara
    const [cs, cx, cy] = camAt(p);
    cam.setAttribute('transform', `scale(${cs.toFixed(3)}) translate(${(-cx).toFixed(1)},${(-cy).toFixed(1)})`);

    // 1. grabar
    const rec = seg(p, .01, .1);
    const recOn = p < T[1] + .02;
    barEls.forEach((b, i) => {
      const h = BAR[i] * 12 * ease(clamp(rec * 1.4 - i * .06)) * (recOn ? 1 : 1 - seg(p, T[1], T[1] + .03));
      b.setAttribute('height', h.toFixed(1)); b.setAttribute('y', (-h / 2).toFixed(1));
    });
    micRing.setAttribute('r', (6 + rec * 8).toFixed(1));
    micRing.setAttribute('opacity', (recOn ? (1 - (rec * 3 % 1)) * .7 * (rec > 0 && rec < 1 ? 1 : 0) : 0).toFixed(2));

    // 2. lanzar: de tu orilla al mar, en arco
    const ln = ease(seg(p, T[1] + .005, T[2] - .01));
    const sp = seg(p, T[2], T[2] + .02);
    const start = [mx, my - 6];
    const bx = lerp(start[0], spot[0], ln), by = lerp(start[1], spot[1], ln) - Math.sin(ln * Math.PI) * 42;
    main.setAttribute('opacity', p > T[1] && sp < 1 ? (1 - sp).toFixed(2) : 0);
    place(main, bx, by, lerp(-30, 8, ln) + (ln > .98 ? Math.sin(p * 400) * 2 : 0), 1.2);

    // 3 y 4. llegar a 8 y luego a 4 más
    items.forEach(it => {
      const a = it.extra ? T[3] + .055 + it.i * .01 : T[2] + .01 + it.i * .01;
      const travel = it.extra ? .04 : .06;
      const t = ease(seg(p, a, a + travel));
      const arrived = p >= a + travel;
      // islas extra salen del agua
      if (it.extra) {
        const rise = ease(seg(p, T[3] + .02, T[3] + .06));
        it.g.setAttribute('opacity', rise.toFixed(2));
        it.body.setAttribute('transform', `translate(0,${((1 - rise) * 10).toFixed(1)})`);
      }
      const [tx, ty] = P(it.x + .55, it.y + .55);
      const fromX = it.extra ? clockAt[0] : spot[0], fromY = it.extra ? clockAt[1] + 30 : spot[1];
      it.bottle.setAttribute('opacity', p > a && !arrived ? '1' : '0');
      place(it.bottle, lerp(fromX, tx, t), lerp(fromY, ty, t), Math.sin(t * 9) * 8, .85);
      // encendido
      const on = arrived ? 1 : 0;
      const dim = it.i === THEM && !it.extra ? 0 : seg(p, T[4], T[4] + .04) * .55;
      it.orb.setAttribute('fill', on ? '#7FD8C9' : '#22394A');
      it.glow.setAttribute('opacity', (on * (1 - dim)).toFixed(2));
      it.body.style.opacity = (1 - dim * .7).toFixed(2);
      const rp = seg(p, a + travel, a + travel + .05);
      it.ripple.setAttribute('rx', (rp * 14).toFixed(1)); it.ripple.setAttribute('ry', (rp * 8).toFixed(1));
      it.ripple.setAttribute('opacity', rp > 0 && rp < 1 ? (1 - rp).toFixed(2) : 0);
    });

    // reloj de 6 horas (solo si nadie respondió)
    const ck = seg(p, T[3] + .005, T[3] + .05);
    clock.setAttribute('opacity', (seg(p, T[3], T[3] + .01) * (1 - seg(p, T[4] - .03, T[4]))).toFixed(2));
    clockArc.setAttribute('stroke-dasharray', `${(ck * RC).toFixed(1)} ${RC}`);
    clockTx.textContent = Math.round(ck * 6) + ' h';

    // 5. alguien la descorcha
    const op = seg(p, T[4] + .03, T[4] + .09);
    themGlowP.setAttribute('opacity', (seg(p, T[4] + .02, T[4] + .06) * .9).toFixed(2));
    them.orb.setAttribute('fill', p > T[4] + .03 ? '#FF70A9' : them.orb.getAttribute('fill'));
    cork.setAttribute('opacity', op > 0 && op < 1 ? (1 - op * op).toFixed(2) : 0);
    cork.setAttribute('transform', `translate(${(them.ox + 4 + op * 6).toFixed(1)},${(them.oy - 4 - Math.sin(op * Math.PI) * 14 + op * 6).toFixed(1)}) rotate(${(op * 260).toFixed(0)})`);
    lblThem.g.setAttribute('opacity', seg(p, T[4] + .04, T[4] + .07).toFixed(2));

    // 6. responde con su voz: pulsos de su orilla hacia ti
    const rv = seg(p, T[5], T[6]);
    line.setAttribute('opacity', (seg(p, T[5], T[5] + .02) * .9).toFixed(2));
    line.setAttribute('stroke-dasharray', p > T[6] ? '0' : '2 3');
    pulses.forEach((c, i) => {
      const t = clamp(rv * 1.6 - i * .3);
      const [x, y] = qb(t);
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('opacity', t > 0 && t < 1 ? '1' : '0');
    });
    meGlow.setAttribute('opacity', (.7 + Math.sin(clamp(rv * 1.6 - .6) * Math.PI) * .3).toFixed(2));

    // 7. conversan: van y vienen, aparece el tema en común
    const tk = seg(p, T[6], T[7]);
    pulsesBack.forEach((c, i) => {
      const t = clamp(tk * 2 - i * .5);
      const [x, y] = qb(1 - t);
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('opacity', t > 0 && t < 1 ? '1' : '0');
    });
    line.setAttribute('stroke', p > T[6] + .01 ? '#F4EFE7' : '#FF70A9');
    line.setAttribute('stroke-opacity', p > T[6] + .01 ? '.45' : '1');
    const chipIn = ease(seg(p, T[6] + .03, T[6] + .07));
    chip.setAttribute('opacity', chipIn.toFixed(2));
    chip.setAttribute('transform', `translate(${chipAt[0].toFixed(1)},${(chipAt[1] - 6 + (1 - chipIn) * 8).toFixed(1)})`);
    lblMe.g.setAttribute('opacity', seg(p, T[6], T[6] + .03).toFixed(2));

    // 8. llaves: primero la tuya, después la suya; recién ahí, los nombres
    const k1 = ease(seg(p, T[7] + .01, T[7] + .04)), k2 = ease(seg(p, T[7] + .045, T[7] + .075));
    const showK = seg(p, T[7], T[7] + .015);
    keyMe.setAttribute('opacity', showK.toFixed(2));
    keyThem.setAttribute('opacity', showK.toFixed(2));
    place(keyMe, mx + 13, my - 12, k1 * 90, 1.1);
    place(keyThem, them.ox + 12, them.oy - 26, -k2 * 90, 1.1);
    const both = p >= T[7] + .08;
    lblMe.set(both ? 'Tú, Majo' : 'Tú');
    lblThem.set(both ? 'Leo' : 'Ama el cine');
    [lblMe, lblThem].forEach(l => l.g.classList.toggle('lit', both));

    // texto del paso
    let k = 0; while (k < 7 && p >= T[k + 1]) k++;
    if (k !== lastStep) {
      steps.forEach((li, i) => li.classList.toggle('on', i === k));
      dots.forEach((d, i) => { d.classList.toggle('on', i === k); d.classList.toggle('past', i < k); d.setAttribute('aria-current', i === k ? 'step' : 'false'); });
      lastStep = k;
    }
  };

  /* ---------- scroll ---------- */
  let target = 0, shown = 0, raf = 0;
  const progress = () => {
    const r = sec.getBoundingClientRect();
    const span = sec.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  };
  // Con "reducir movimiento", cada paso aparece entero: sin recorridos.
  const quant = p => { let k = 0; while (k < 7 && p >= T[k + 1]) k++; return k === 7 ? 1 : T[k + 1] - .001; };
  const tick = () => {
    raf = 0;
    if (reduce.matches) { shown = quant(target); render(shown); return; }
    shown += (target - shown) * .16;
    if (Math.abs(target - shown) < .0005) shown = target;
    render(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  };
  const onScroll = () => { target = progress(); if (!raf) raf = requestAnimationFrame(tick); };
  const go = k => {
    const top = sec.getBoundingClientRect().top + scrollY;
    const span = sec.offsetHeight - innerHeight;
    const p = k === 7 ? .97 : (T[k] + T[k + 1]) / 2 + (k === 0 ? .03 : 0);
    scrollTo({ top: top + span * p, behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  // Solo escuchamos el scroll cuando la sección está cerca de la pantalla.
  let live = false;
  new IntersectionObserver(([e]) => {
    live = e.isIntersecting;
    sec.classList.toggle('live', live);
    if (live) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    else removeEventListener('scroll', onScroll);
  }, { rootMargin: '20% 0px' }).observe(sec);
  addEventListener('resize', onScroll);
  reduce.addEventListener?.('change', onScroll);

  document.documentElement.classList.add('iso-ready');
  target = shown = progress(); render(shown);
})();
