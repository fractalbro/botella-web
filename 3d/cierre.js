// El cierre de la web en 3D, con el mismo mar de la portada.
// 1) "Por qué": al bajar se van encendiendo luces en el mar, una por persona. Empieza con una sola
//    ("nadie está tan solo como cree") y termina con el mar lleno.
// 2) Registro: cuando guardas tu lugar, tu botella sale al mar y se encienden las 8 orillas.
import { THREE, C, stage, bottle, sky, moon, ocean, glow, seg, ease, lerp, MOBILE, rnd, seed, REDUCE } from './kit.js';
const cl = x => Math.max(0, Math.min(1, x));

function sea(S, { moonAt, amp = .7, fogFar = 260, noMoon = false }) {
  const { scene } = S; scene.fog = new THREE.Fog('#0B2436', 40, fogFar); scene.environmentIntensity = .45;
  const sk = sky(scene, { hz: '#173E5C', stars: 900 }); const mo = moon(2.4); mo.position.copy(moonAt); if (!noMoon) scene.add(mo);
  const oc = ocean({ moonDir: [moonAt.x, moonAt.y, moonAt.z], fog: '#0B2436', skyc: '#123552', fogNear: 30, fogFar, amp, size: 420 }); scene.add(oc.mesh);
  scene.add(new THREE.HemisphereLight('#9FD8E8', '#05121F', .45)); const key = new THREE.DirectionalLight('#EAF6F2', 1.3); key.position.copy(moonAt); scene.add(key);
  return { sk, oc };
}
// botellas pequeñas que se encienden (cada una es una persona)
function lights(scene, n, spread, { z0 = -14, depth = 34, seedN = 21 } = {}) {
  seed(seedN); const out = [];
  for (let i = 0; i < n; i++) { const b = bottle({ light: 0 }); b.scale.setScalar(.6); b.userData.paper.material = b.userData.paper.material.clone(); b.userData.paper.material.emissiveIntensity = .08;
    const g = new THREE.Group(); g.add(b); b.rotation.z = -1.45; const gl = glow(C.orb[i % C.orb.length], 3); gl.position.y = .4; g.add(gl); // brillo, no luz real: no recompila nada al encenderse
    g.userData = { x: (rnd() - .5) * spread, z: z0 - rnd() * depth, ph: rnd() * 6, ry: rnd() * 6, gl, paper: b.userData.paper, lit: 0 }; scene.add(g); out.push(g); }
  // la primera en encenderse queda al centro y cerca: es la tuya
  out[0].userData.x = MOBILE ? .4 : 2; out[0].userData.z = z0 + 4;
  return out;
}
function float(list, oc, t, on) { list.forEach((g, i) => { const u = g.userData; g.position.set(u.x, oc.hAt(u.x, u.z, t) + .1, u.z); g.rotation.y = u.ry; g.children[0].rotation.x = Math.sin(t + u.ph) * .2;
  u.lit = lerp(u.lit, on(i), .08); u.gl.material.opacity = u.lit * .75; u.gl.scale.setScalar(1.1 + u.lit * 1.1); u.paper.material.emissiveIntensity = .08 + u.lit * .9; }); }

// ---------- 1) Por qué ----------
const why = document.getElementById('por-que'), cw = document.getElementById('gl-why');
if (why && cw) {
  let vis = false, made = false; const prog = () => { const r = why.getBoundingClientRect(); return cl((innerHeight * .9 - r.top) / (r.height * .85)); };
  // se arma en un momento libre después de cargar (o antes, si ya te estás acercando) y compila en segundo plano
  const once = () => { if (!made) { made = true; make(); } };
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) once(); }, { rootMargin: '1200px 0px' }).observe(why);
  (window.requestIdleCallback || (f => setTimeout(f, 1500)))(once, { timeout: 4000 });
  const make = () => { try {
    const S = stage(cw, { fov: MOBILE ? 50 : 32, bloom: [.5, .4, .9], progress: prog, active: () => vis });
    const { scene, camera } = S; const { sk, oc } = sea(S, { moonAt: new THREE.Vector3(MOBILE ? 9 : 46, MOBILE ? 4.5 : 7, -110), noMoon: MOBILE }); // en celular la luna chocaría con el texto: solo queda su reflejo
    const N = MOBILE ? 18 : 26, L = lights(scene, N, MOBILE ? 18 : 46);
    S.on((t, p) => { sk.update(t); oc.update(t);
      const k = REDUCE ? N : 1 + ease(seg(p, .15, .85)) * (N - 1); // de 1 a todas
      float(L, oc, t, i => cl(k - i));
      camera.position.set(Math.sin(t * .1) * .3, 2.2 + Math.sin(t * .2) * .08, 10); camera.lookAt(0, 2.2, -10);
      // el horizonte baja: el mar queda detrás del final de la sección y el texto de arriba se lee sobre el cielo
      const w = cw.clientWidth, h = cw.clientHeight; camera.setViewOffset(w, h, 0, -h * (MOBILE ? .2 : .12), w, h); camera.updateProjectionMatrix(); });
    S.go().then(() => document.documentElement.classList.add('why-3d'));
  } catch (e) { console.warn(e); } };
}

// ---------- 2) Registro: tu botella sale al mar ----------
const done = document.getElementById('done'), cd = document.getElementById('gl-done');
if (done && cd) {
  let S = null, t0 = null, vis = false;
  const start = () => {
    if (S || done.hidden) return;
    try {
      S = stage(cd, { fov: 40, bloom: [.5, .4, .9], progress: () => 0, active: () => vis && !done.hidden });
      const { scene, camera } = S; const { sk, oc } = sea(S, { moonAt: new THREE.Vector3(-14, 9, -110), fogFar: 200 });
      const L = lights(scene, 8, 13, { z0: -9, depth: 12, seedN: 8 });
      const b = bottle({ light: 2 }); b.position.y = -1.4; const hold = new THREE.Group(); hold.add(b); const root = new THREE.Group(); root.add(hold); root.scale.setScalar(1); scene.add(root);
      const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(.96, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#AAF0E4').multiplyScalar(1.6), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; });
      const HS = new THREE.Vector3(-.3, 0, -3);
      S.on(t => { sk.update(t); oc.update(t); if (t0 === null) t0 = t; const k = REDUCE ? 99 : t - t0;
        // 0–0,9 s: arco; luego chapuzón y anillos; desde 1,4 s se encienden las 8 orillas, una tras otra
        if (k < .9) { const u = k / .9; root.position.set(lerp(3.2, HS.x, u), lerp(-1, oc.hAt(HS.x, HS.z, t) + .2, u) + Math.sin(u * Math.PI) * 3.2, lerp(4, HS.z, u)); hold.rotation.set(0, 0, -1.3 + u * 7); root.rotation.y = .4; }
        else { root.position.set(HS.x, oc.hAt(HS.x, HS.z, t) + .2, HS.z); hold.rotation.set(Math.sin(t * .9) * .1, 0, -1.4); root.rotation.y = .4 + Math.sin(t * .3) * .2;
          rings.forEach((r, i) => { const q = cl((k - .9 - i * .14) / 1.1); r.position.set(HS.x, oc.hAt(HS.x, HS.z, t) + .05, HS.z); r.scale.setScalar(.3 + ease(q) * (2.2 + i * .8)); r.material.opacity = q > 0 && q < 1 ? (1 - q) * .7 : 0; }); }
        float(L, oc, t, i => cl((k - 1.4) * 3 - i * .9));
        camera.position.set(0, 1.3, 6.5); camera.lookAt(0, .9, -6); });
      S.go().then(() => { t0 = null; cd.classList.add('on'); }); // el arco empieza cuando ya se ve
    } catch (e) { console.warn(e); cd.remove(); }
  };
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) start(); }, { threshold: .3 }).observe(cd);
  new MutationObserver(() => { if (!done.hidden && vis) start(); }).observe(done, { attributes: true, attributeFilter: ['hidden'] });
}
