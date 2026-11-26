{
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Datos públicos del Supabase de Botella (la publishable key es pública por diseño).
const CFG = window.BOTELLA || { url: 'https://zmqkcbykltzyxowskois.supabase.co', key: 'sb_publishable_UZ3kuFA3UHG2vdMSDoMFUA_KDrQxztd', app: 'https://botella-app.vercel.app', code: 'BOTELLA-01' };

// barra: se vuelve sólida al bajar
const bar = $('.bar'); const onS = () => bar.classList.toggle('solid', scrollY > innerHeight * .6); addEventListener('scroll', onS, { passive: true }); onS();

// 8 + 4 puntos ligados al scroll de la portada
const hero = $('#hero'), reach = $('#reach');
reach.innerHTML = '<i></i>'.repeat(8) + '<span class="sep"></span>' + '<i class="later"></i>'.repeat(4);
const dots = $$('i', reach);
const onR = () => { const p = Math.max(0, Math.min(1, scrollY / (hero.offsetHeight * .9))); dots.forEach((d, i) => d.classList.toggle('on', i < 8 ? p > .5 + i * .03 : p > .78 + (i - 8) * .03)); };
addEventListener('scroll', onR, { passive: true }); onR();

// voces de ejemplo
const V = [
  { tag: 'Música', theme: 'la música', q: '¿Qué harías un domingo si nadie en esta ciudad te conociera?', v: 'majo-say', s: 14, c: '#FF70A9', pk: [1.0,0.48,0.77,0.57,0.82,0.74,0.67,0.41,0.35,0.91,0.76,0.58,0.92,0.51,0.68,0.28,0.88,0.57,0.71,0.74,0.53,0.33,0.89,0.5,0.38,0.86,1.0,0.48] },
  { tag: 'Cine', theme: 'el cine', q: 'Me mudé a Lima hace tres meses y todavía no tengo con quién ir al cine.', v: 'leo-say', s: 13, c: '#8E8CFF', pk: [0.67,0.42,0.32,0.41,1.0,0.48,0.49,0.29,0.59,0.6,0.53,0.39,0.4,0.16,0.6,0.49,0.4,0.39,0.44,0.41,0.67,0.55,0.61,0.52,0.4,0.3,0.42,0.18] },
  { tag: 'Atardeceres', theme: 'los atardeceres', q: '¿Cuál es el mejor atardecer que has visto en Lima?', v: 'caro-say', s: 13, c: '#FFB061', pk: [0.71,0.79,0.58,0.79,0.67,0.66,0.88,0.59,0.59,0.9,0.84,0.64,0.86,0.74,0.69,1.0,0.63,0.8,1.0,0.69,0.87,0.91,0.74,0.74,0.81,0.89,0.59,0.7] }
];
const audio = new Audio(); let playing = null;
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const stop = () => { audio.pause(); $$('.playing').forEach(x => x.classList.remove('playing')); $$('#wave i').forEach(i => i.classList.remove('on')); playing = null; };
const play = (v, btn, s) => { if (playing === btn) return stop(); stop(); playing = btn; btn.classList.add('playing'); let ft = null; const fake = () => { if (ft || playing !== btn) return; let t = 0; ft = setInterval(() => { t += .1; if (playing !== btn || t >= s) { clearInterval(ft); if (playing === btn) stop(); return; } if (btn.id === 'player') { $$('#wave i').forEach((b, i, a) => b.classList.toggle('on', i < t / s * a.length)); $('#t').textContent = fmt(t); } }, 100); };
  if (window.__noAudio) return fake(); audio.src = `v/${v}.mp3`; audio.onerror = fake; audio.play().catch(e => { if (e && e.name !== 'AbortError') fake(); });
  audio.ontimeupdate = () => { if (btn.id !== 'player') return; const f = audio.currentTime / (audio.duration || s); $$('#wave i').forEach((b, i, a) => b.classList.toggle('on', i < f * a.length)); $('#t').textContent = fmt(audio.currentTime); };
  audio.onended = stop; };
let cur = 0;
const show = i => { cur = i; const x = V[i]; stop();
  $('#who').innerHTML = `<i style="background:${x.c}"></i>Alguien que ama ${esc(x.theme)}`; $('#q').textContent = x.q; $('#t').textContent = fmt(x.s);
  $('#wave').innerHTML = x.pk.map(p => `<i style="height:${Math.round(p * 100)}%"></i>`).join('');
  $$('#topics button').forEach((b, j) => b.setAttribute('aria-selected', j === i)); const p = $('#paper'); p.classList.remove('swap'); void p.offsetWidth; p.classList.add('swap'); };
$('#topics').innerHTML = V.map((x, i) => `<button role="tab" type="button">${esc(x.tag)}</button>`).join('');
$$('#topics button').forEach((b, i) => b.onclick = () => show(i)); show(0);
$('#player').onclick = () => play(V[cur].v, $('#player'), V[cur].s);
$$('[data-play]').forEach(b => b.onclick = () => play(b.dataset.play, b, 14));

// tarjeta crema: se inclina hacia el puntero (máx 8°)
const paper = $('#paper'); if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(hover:hover)').matches) {
  paper.addEventListener('pointermove', e => { const r = paper.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; paper.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
  paper.addEventListener('pointerleave', () => paper.style.transform = ''); }

// aparecer al entrar
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('wait'); e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .3 });
$$('.band .wrap, .struck').forEach(w => { if (!w.classList.contains('struck')) { w.setAttribute('data-in', ''); w.classList.add('wait'); } io.observe(w); });

// registro: la misma función join_waitlist del sitio actual
const rpc = (fn, body) => fetch(`${CFG.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: CFG.key, Authorization: `Bearer ${CFG.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(async r => { const j = await r.json().catch(() => null); if (!r.ok) { const e = new Error((j && j.message) || r.statusText); e.status = r.status; e.code = j && j.code; throw e; } return j; });
rpc('waitlist_left').then(n => { if (typeof n === 'number') $('#left').textContent = n > 0 ? (n === 1 ? 'Queda 1 lugar.' : `Quedan ${n} lugares.`) : 'Los cien lugares se llenaron. Te anotamos en la lista.'; }).catch(() => {});
const ref = new URLSearchParams(location.search).get('de');
const done = r => { const f = $('#f'); f.hidden = true; const d = $('#done'); d.hidden = false;
  d.innerHTML = r.granted ? `<h3>Listo, ${esc(r.name)}.</h3><p>Tu lugar está guardado. Entra y abre tu primera botella.</p><a class="btn btn-a" href="${esc(r.link)}">Abrir Botella</a>` : `<h3>Estás en la lista, ${esc(r.name)}.</h3><p>Te escribimos apenas se abra un lugar.</p>`; };
$('#f').onsubmit = async e => { e.preventDefault(); const f = new FormData(e.target), err = $('#err'); err.hidden = true;
  const name = (f.get('name') || '').trim(), phone = (f.get('phone') || '').replace(/\D/g, '');
  if (!name) { err.textContent = 'Escribe tu nombre.'; err.hidden = false; return; }
  if (phone.length < 9) { err.textContent = 'Revisa tu celular: son 9 números.'; err.hidden = false; return; }
  if (!f.get('age')) { err.textContent = 'Botella es para mayores de 18.'; err.hidden = false; return; }
  const b = e.target.querySelector('button'); b.disabled = true; b.textContent = 'Guardando…';
  try { const r = await rpc('join_waitlist', { p_name: name, p_phone: phone, p_district: null, p_ref: ref, p_source: 'web-nueva' }); done({ ...r, name: r.name || name }); }
  catch (x) { if (x.code === 'PGRST202' || x.status === 404 || x instanceof TypeError) return done({ granted: true, name, link: `${CFG.app}/?c=${CFG.code}` });
    err.textContent = /duplicate|ya/i.test(x.message) ? 'Ese celular ya tiene un lugar guardado.' : 'No pudimos guardarlo. Intenta otra vez.'; err.hidden = false; b.disabled = false; b.textContent = 'Guardar mi lugar'; } };
}
