import { THREE, C, stage, bottle, orb, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed, animate } from './kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const S = stage(document.getElementById('gl'), { ortho: MOBILE ? 7.5 : 6, bloom: [0.35, 0.35, 1.3], exposure: .95 });
const { scene, camera, renderer } = S;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.background = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 4; c.height = 512; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#020B15'); g.addColorStop(.6, '#0A2238'); g.addColorStop(1, '#16405E'); x.fillStyle = g; x.fillRect(0, 0, 4, 512); return c; })()); scene.background.colorSpace = THREE.SRGBColorSpace;
scene.environmentIntensity = .3;
scene.add(new THREE.HemisphereLight('#BFE3F0', '#0A2238', .45));
const sun = new THREE.DirectionalLight('#FFF1D6', 2.2); sun.position.set(-6, 14, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.bias = -.0005; Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 }); scene.add(sun);
const rim = new THREE.DirectionalLight(C.a, 1.2); rim.position.set(8, 4, -8); scene.add(rim);
// archipiélago: cada isla es un tipo de oyente
const T = [ // x, z, w, d, h, color, nombre
  [0, 0, 3.2, 3.2, 1.2, C.orb[0], 'Marea'], [-3.9, 1.4, 2.2, 2.2, .9, C.orb[1], 'Luciérnaga'], [3.6, -1.6, 2.4, 2.4, 1.6, C.orb[2], 'Faro'],
  [-1.8, 4, 1.8, 1.8, .7, C.orb[3], 'Ola'], [2.4, 3.2, 2, 2, .8, C.orb[4], 'Brújula'], [-2.6, -3.2, 1.6, 1.6, 1.1, C.orb[5], 'Ancla']];
const isl = T.map(([x, z, w, d, h, c], i) => {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, .22), new THREE.MeshPhysicalMaterial({ color: c, roughness: .45, clearcoat: .6, clearcoatRoughness: .3, sheen: .4, sheenColor: '#ffffff' }));
  m.position.y = -h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
  const top = new THREE.Mesh(new RoundedBoxGeometry(w * .82, .08, d * .82, 4, .04), new THREE.MeshStandardMaterial({ color: new THREE.Color(c).offsetHSL(0, -.05, .08), roughness: .8 })); top.position.y = .02; top.receiveShadow = true; g.add(top);
  g.userData = { base: 0, ph: i * 1.3, h }; scene.add(g); return g;
});
// utilería: botella sobre Marea, faro sobre Faro, orbes, pasto
const b = bottle({ light: 1.5 }); b.scale.setScalar(.55); b.rotation.z = -1.35; b.position.set(-.6, .32, .2); isl[0].add(b); b.traverse(o => o.isMesh && (o.castShadow = true));
const lh = new THREE.Group(); const red = new THREE.MeshStandardMaterial({ color: '#FF6B6F', roughness: .5 }), wht = new THREE.MeshStandardMaterial({ color: '#F4EFE7', roughness: .5 });
[[.42, .36, .5, wht], [.36, .31, .5, red], [.31, .27, .5, wht], [.27, .24, .4, red]].reduce((y, [r1, r2, hh, m]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, hh, 32), m); c.position.y = y + hh / 2; c.castShadow = true; lh.add(c); return y + hh; }, 0);
const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE7B0').multiplyScalar(3) })); lamp.position.y = 2.06; lh.add(lamp);
const cap = new THREE.Mesh(new THREE.ConeGeometry(.32, .3, 24), new THREE.MeshStandardMaterial({ color: '#1E4A6B' })); cap.position.y = 2.37; cap.castShadow = true; lh.add(cap);
const lpl = new THREE.PointLight('#FFE7B0', 6, 6, 2); lpl.position.y = 2.06; lh.add(lpl); lh.position.set(.3, 0, -.2); isl[2].add(lh);
const orbs = []; seed(3); for (let i = 0; i < 9; i++) { const o = orb(C.orb[i % 6], .09 + rnd() * .08, 2.2); o.position.set((rnd() - .5) * 11, 1.5 + rnd() * 3, (rnd() - .5) * 10); o.userData.ph = rnd() * 6; scene.add(o); orbs.push(o); }
// sombra suave bajo cada isla (flotan en la noche)
const shadowTex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c; })());
isl.forEach(g => { const s = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.set(g.position.x, -3.2, g.position.z); s.scale.setScalar(4); scene.add(s); g.userData.sh = s; });
// deslizador elástico (Fitts: perilla de 44 px; rubber band en los bordes; squash al soltar)
let val = .3, pick = 2;
const sl = document.getElementById('sl'), k = sl.querySelector('.k'), fill = sl.querySelector('.fill'), res = document.getElementById('res');
const names = ['Faro', 'Marea', 'Ola', 'Brújula', 'Luciérnaga'], idx = [2, 0, 3, 4, 1];
const draw = v => { const vv = Math.max(-.08, Math.min(1.08, v)); k.style.left = vv * 100 + '%'; fill.style.width = Math.max(0, Math.min(1, vv)) * 100 + '%'; const n = Math.min(4, Math.floor(Math.max(0, Math.min(.999, v)) * 5)); res.innerHTML = `Vas camino a <b>${names[n]}</b>`; pick = idx[n]; k.setAttribute('aria-valuenow', Math.round(Math.max(0, Math.min(1, v)) * 100)); };
draw(val);
let drag = false;
const at = e => { const r = sl.getBoundingClientRect(); let v = (e.clientX - r.left) / r.width; if (v < 0) v = -(1 - 1 / (-v * .55 / .1 + 1)) * .1; if (v > 1) v = 1 + (1 - 1 / ((v - 1) * .55 / .1 + 1)) * .1; return v; };
sl.addEventListener('pointerdown', e => { drag = true; sl.setPointerCapture(e.pointerId); animate(k, { scale: 1.12, duration: 120, ease: 'outQuad' }); val = at(e); draw(val); });
sl.addEventListener('pointermove', e => { if (drag) { val = at(e); draw(val); } });
sl.addEventListener('pointerup', () => { drag = false; const t = Math.max(0, Math.min(1, val)); const o = { v: val }; animate(o, { v: t, duration: 380, ease: 'outElastic(1,.6)', onUpdate: () => draw(o.v) }); val = t; animate(k, { scaleX: [1.25, 1], scaleY: [.8, 1], duration: 420, ease: 'outElastic(1,.5)' }); });
k.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { val = Math.max(0, Math.min(1, val + (e.key === 'ArrowRight' ? .05 : -.05))); draw(val); e.preventDefault(); } });
// escena por scroll
const look = new THREE.Vector3(), cam0 = new THREE.Vector3(10, 10, 10);
S.on((t, p) => {
  const q = ease(seg(p, .3, .55)), r = ease(seg(p, .7, 1));
  isl.forEach((g, i) => { const sel = (q > .5 && i === pick) || (r > 0 && i === 2); const tgt = Math.sin(t * .9 + g.userData.ph) * .12 + (sel ? .6 : 0) - (r > 0 && i !== 2 ? r * 1.2 : 0); g.userData.base = lerp(g.userData.base, tgt, .08); g.position.y = g.userData.base; g.userData.sh.material.opacity = 1 - g.position.y * .4; g.scale.setScalar(1 - (r > 0 && i !== 2 ? r * .25 : 0)); });
  orbs.forEach(o => { o.position.y += Math.sin(t * 1.2 + o.userData.ph) * .004; });
  lh.rotation.y = t * .5; lamp.material.color.setScalar(1).multiply(new THREE.Color('#FFE7B0')).multiplyScalar(2 + Math.sin(t * 3) * .6 + r * 3);
  const z = (MOBILE ? 7.5 : 6) * lerp(1, .68, r); camera.top = z; camera.bottom = -z; camera.left = -z * S.aspect; camera.right = z * S.aspect; camera.updateProjectionMatrix();
  const off = MOBILE ? lerp(-4.2, -2.6, q) : 0; const dx = MOBILE ? 0 : lerp(-4, -2, r);
  look.set(lerp(0, isl[2].position.x, r) + dx, lerp(off, MOBILE ? -1.4 : .8, r), lerp(0, isl[2].position.z, r));
  camera.position.copy(look).add(cam0).add(new THREE.Vector3(S.pointer.x * .6, 0, -S.pointer.x * .6)); camera.lookAt(look);
});
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
