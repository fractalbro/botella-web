/* Botella · sitio */
(() => {
  const CFG = window.BOTELLA || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return JSON.parse(localStorage.getItem('botella-web-' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('botella-web-' + k, JSON.stringify(v)); } catch (e) {} } };
  document.documentElement.classList.add('js');

  /* ---------- quién compartió el link ---------- */
  const qs = new URLSearchParams(location.search);
  const ref = (qs.get('de') || qs.get('r') || '').slice(0, 40);
  if (ref) store.set('ref', ref);
  const source = (qs.get('utm_source') || qs.get('src') || (document.referrer ? new URL(document.referrer).hostname : '') || '').slice(0, 40);

  /* ---------- aparecer al hacer scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  $$('.strike li').forEach((el, i) => el.style.transitionDelay = (i * 0.08) + 's');

  /* ---------- barra superior ---------- */
  const nav = $('#nav'); let lastY = 0;
  const papers = $$('.paper, .join-card');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('solid', y > 40);
    nav.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('hide');
    const mid = 40;
    nav.classList.toggle('on-paper', papers.some(p => { const r = p.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mar de noche ---------- */
  const cv = $('#sea'), ctx = cv.getContext('2d');
  let W, H, dpr, raf, visible = true;
  const size = () => { cv.parentNode.style.setProperty('--hz', (cv.clientWidth < 860 ? 26 : 56) + '%'); dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const stars = Array.from({ length: 70 }, (_, i) => ({ x: (Math.sin(i * 91.7) * .5 + .5), y: (Math.sin(i * 47.3) * .5 + .5) * .5, r: .4 + (i % 5) * .22, p: i }));
  const draw = t => {
    t /= 1000;
    const hz = H * (W < 860 ? .26 : .56);
    const sky = ctx.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, '#030B14'); sky.addColorStop(1, '#0B2236');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hz);
    stars.forEach(s => { ctx.globalAlpha = .25 + .35 * (Math.sin(t * 1.3 + s.p) * .5 + .5); ctx.fillStyle = '#F4EFE7'; ctx.beginPath(); ctx.arc(s.x * W, s.y * hz, s.r, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    // luna
    const mx = W * .78, my = hz * (W < 860 ? .42 : .34), mr = Math.max(18, Math.min(W, H) * .045);
    const halo = ctx.createRadialGradient(mx, my, mr * .5, mx, my, mr * 6);
    halo.addColorStop(0, 'rgba(246,231,196,.22)'); halo.addColorStop(1, 'rgba(246,231,196,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, hz);
    ctx.fillStyle = '#F6E7C4'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
    // mar
    const sea = ctx.createLinearGradient(0, hz, 0, H);
    sea.addColorStop(0, '#0A2133'); sea.addColorStop(1, '#05121F');
    ctx.fillStyle = sea; ctx.fillRect(0, hz, W, H - hz);
    // camino de luna
    for (let i = 0; i < 26; i++) {
      const k = i / 26, y = hz + 4 + k * k * (H - hz), w = (10 + k * W * .16) * (.6 + .4 * Math.sin(t * 1.7 + i * 1.3));
      ctx.globalAlpha = (1 - k) * .55; ctx.fillStyle = '#F6E7C4';
      ctx.fillRect(mx - w / 2 + Math.sin(t + i) * 6, y, w, 1.2 + k * 2);
    }
    ctx.globalAlpha = 1;
    // olas
    ctx.lineWidth = 1;
    for (let j = 0; j < 9; j++) {
      const k = j / 9, y0 = hz + 10 + k * k * (H - hz) * .95, amp = 1.5 + k * 7, sp = .5 + k;
      ctx.strokeStyle = `rgba(127,216,201,${.07 + k * .12})`;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) { const y = y0 + Math.sin(x * (.012 - k * .006) + t * sp + j) * amp; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // ocho orillas en el horizonte
    [.06, .18, .3, .42, .55, .67, .8, .93].forEach((x, i) => { ctx.globalAlpha = .45 + Math.sin(t * 2 + i) * .3; ctx.fillStyle = '#7FD8C9'; ctx.shadowColor = '#7FD8C9'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(W * x, hz - 1, 2.6, 0, 7); ctx.fill(); });
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // línea del horizonte
    ctx.fillStyle = 'rgba(244,239,231,.12)'; ctx.fillRect(0, hz, W, 1);
  };
  const loop = t => { draw(t); if (!reduce && visible) raf = requestAnimationFrame(loop); };
  size(); draw(0); if (!reduce) raf = requestAnimationFrame(loop);
  addEventListener('resize', () => { size(); draw(performance.now()); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } }).observe(cv);

  /* ---------- voces de ejemplo ---------- */
  const V = [
    { id: 'majo', name: 'Majo', d: 'Barranco', kind: 'Pregunta', c: '#7FD8C9', secs: 14, q: '¿Qué harías un domingo si nadie en esta ciudad te conociera?', pk: [1, .48, .77, .57, .82, .74, .67, .41, .35, .91, .76, .58, .92, .51, .68, .28, .88, .57, .71, .74, .53, .33, .89, .5, .38, .86, 1, .48] },
    { id: 'leo', name: 'Leo', d: 'Lince', kind: 'Confesión', c: '#FFC24B', secs: 13, q: 'Me mudé a Lima hace tres meses y todavía no tengo con quién ir al cine.', pk: [.67, .42, .32, .41, 1, .48, .49, .29, .59, .6, .53, .39, .4, .16, .6, .49, .4, .39, .44, .41, .67, .55, .61, .52, .4, .3, .42, .18] },
    { id: 'rocio', name: 'Rocío', d: 'Jesús María', kind: 'Historia', c: '#FF70A9', secs: 15, q: 'Lo más raro que me pasó en una combi.', pk: [.64, .72, .92, .62, .74, .42, .74, .72, .95, .51, .6, .86, .52, .65, .73, .75, .7, .57, .73, .79, .82, .84, 1, .54, .91, .79, .61, .62] },
    { id: 'diego', name: 'Diego', d: 'San Borja', kind: 'Confesión', c: '#8E8CFF', secs: 12, q: 'Trabajo desde casa y a veces paso días sin hablar con nadie.', pk: [1, .87, .93, .83, .7, .85, .7, .58, .68, .7, .63, .52, .25, .92, .64, .64, .57, .36, .26, .77, .73, .7, .61, .42, .89, .84, .57, .36] }
  ];
  const fmt = s => `0:${String(Math.round(s)).padStart(2, '0')}`;
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  $('#vlist').innerHTML = V.map(v => `<button class="vc rv" type="button" data-v="${v.id}" style="--c:${v.c}" aria-label="Escuchar la botella de ${v.name}: ${v.q}">
    <span class="pp">${PLAY}</span>
    <span><span class="meta"><b>${v.name}</b><span>${v.d}</span><span>·</span><span>${v.kind}</span></span>
    <span class="q" style="display:block">${v.q}</span>
    <span class="bars" style="display:flex">${v.pk.map(p => `<i style="height:${Math.max(14, p * 100)}%"></i>`).join('')}<span class="t">${fmt(v.secs)}</span></span></span>
  </button>`).join('');
  $$('#vlist .rv').forEach(el => io.observe(el));
  const au = $('#au'); let cur = null;
  const card = id => $(`.vc[data-v="${id}"]`);
  const heroBtn = $('[data-play]');
  const paint = () => {
    if (!cur) return;
    const v = V.find(x => x.id === cur), el = card(cur), p = au.duration ? au.currentTime / au.duration : 0;
    el.querySelectorAll('.bars i').forEach((b, i) => b.classList.toggle('p', i / v.pk.length < p));
    el.querySelector('.t').textContent = fmt(au.duration ? au.duration - au.currentTime : v.secs);
  };
  const stop = () => {
    if (!cur) return;
    const el = card(cur); el.classList.remove('on'); el.querySelector('.pp').innerHTML = PLAY;
    el.querySelectorAll('.bars i').forEach(b => b.classList.remove('p'));
    el.querySelector('.t').textContent = fmt(V.find(x => x.id === cur).secs);
    if (cur === heroBtn.dataset.play) { heroBtn.classList.remove('on'); heroBtn.querySelector('span').textContent = 'Escuchar una botella'; }
    cur = null;
  };
  const play = id => {
    if (cur === id && !au.paused) { au.pause(); stop(); return; }
    stop(); cur = id; au.src = `/v/${id}-say.mp3`; au.currentTime = 0;
    au.play().catch(() => stop());
    const el = card(id); el.classList.add('on'); el.querySelector('.pp').innerHTML = PAUSE;
    if (id === heroBtn.dataset.play) { heroBtn.classList.add('on'); heroBtn.querySelector('span').textContent = 'Escuchando a Majo…'; }
  };
  au.addEventListener('timeupdate', paint);
  au.addEventListener('ended', stop);
  document.addEventListener('click', e => {
    const v = e.target.closest('.vc'); if (v) return play(v.dataset.v);
    const h = e.target.closest('[data-play]'); if (h) return play(h.dataset.play);
  });

  /* ---------- registro ---------- */
  const rpc = (fn, body) => fetch(`${CFG.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: CFG.key, Authorization: `Bearer ${CFG.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
    .then(async r => { const j = await r.json().catch(() => null); if (!r.ok) { const e = new Error((j && (j.message || j.hint)) || r.statusText); e.status = r.status; e.code = j && j.code; throw e; } return j; });

  rpc('waitlist_left').then(n => {
    if (typeof n !== 'number') return;
    const el = $('#left'); el.hidden = false;
    el.textContent = n > 0 ? (n === 1 ? 'Queda 1 lugar' : `Quedan ${n} lugares`) : 'Los 100 lugares se llenaron. Te anotamos en la lista.';
  }).catch(() => {});

  const form = $('#form'), err = $('#err'), go = $('#go'), adult = $('#adult');
  adult.addEventListener('click', () => adult.setAttribute('aria-checked', adult.getAttribute('aria-checked') !== 'true'));
  const shareText = invite => {
    const url = `${location.origin}/${invite ? '?de=' + invite : ''}`;
    return `Te mando una botella 🌊 Es una app de Lima donde grabas una pregunta con tu voz y la escuchan ocho personas de tus mismos temas. Sin fotos. Entra aquí: ${url}`;
  };
  const show = r => {
    form.hidden = true; $('.join-head').hidden = true; $('#done').hidden = false;
    const first = (r.name || '').split(' ')[0];
    if (r.granted) {
      $('#done-eye').textContent = 'Tu lugar está guardado';
      $('#done-h').innerHTML = `${first ? first + ', tu' : 'Tu'} botella está <em>lista</em>.`;
      $('#done-p').textContent = 'Este es tu acceso. Guárdalo, también te sirve para volver a entrar.';
      $('#open').href = r.link || `${CFG.app}/?c=${CFG.code}`;
      $('#code').textContent = r.code || CFG.code;
      $('#done-access').hidden = false;
    } else {
      $('#done-eye').textContent = 'Lista de espera';
      $('#done-h').innerHTML = `${first ? first + ', estás' : 'Estás'} en la <em>orilla</em>.`;
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
    go.disabled = true; go.textContent = 'Guardando tu lugar…';
    try {
      const r = await rpc('join_waitlist', { p_name: name, p_phone: phone, p_district: f.get('district') || null, p_ref: store.get('ref') || null, p_source: source || null });
      store.set('result', r); show(r);
      $('#entrar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    } catch (x) {
      if (x.code === 'PGRST202' || x.status === 404) {
        // El servidor aún no tiene la tabla de registro: no dejamos a nadie afuera.
        const r = { granted: true, name, link: `${CFG.app}/?c=${CFG.code}`, code: CFG.code, invite: null };
        show(r);
      } else if (/phone/.test(x.message)) err.textContent = 'Revisa tu número de WhatsApp.';
      else err.textContent = 'No pudimos guardar tu lugar. Revisa tu conexión e intenta otra vez.';
    } finally { go.disabled = false; go.textContent = 'Quiero mi botella'; }
  });
})();
