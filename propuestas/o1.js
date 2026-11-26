import { THREE, C, stage, bottle, sky, moon, ocean, ribbon, orb, cloud, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed, animate } from './kit.js';
const S = stage(document.getElementById('gl'), { fov: MOBILE ? 46 : 34, bloom: [0.5, 0.35, 0.92] });
const { scene, camera } = S;
const sk = sky(scene); const mo = moon(MOBILE ? 3 : 4); const mpos = MOBILE ? new THREE.Vector3(9, 26, -90) : new THREE.Vector3(26, 17, -90); mo.position.copy(mpos); scene.add(mo);
const oc = ocean({ moonDir: [mpos.x, mpos.y, mpos.z], fogNear: 30, fogFar: 380 }); oc.mesh.position.y = -4.2; scene.add(oc.mesh);
scene.add(new THREE.HemisphereLight('#9FD8E8', '#05121F', 0.5)); const key = new THREE.DirectionalLight('#EAF6F2', 1.6); key.position.copy(mpos); scene.add(key);
// botella protagonista
const root = new THREE.Group(); scene.add(root); const b = bottle({ light: 2 }); b.position.y = -1.4; const holder = new THREE.Group(); holder.add(b); holder.rotation.z = -1.25; root.add(holder);
root.position.set(MOBILE ? 0.3 : 2.7, MOBILE ? 3.3 : 1.7, 0); root.scale.setScalar(MOBILE ? 1.9 : 2.1);
// nubes en capas (cerca, medio, lejos)
seed(5); const clouds = [];
for (let i = 0; i < 24; i++) { const far = i > 7; const c = cloud(far ? '#1E4363' : '#2E5F84', far ? 14 + rnd() * 16 : 3.5 + rnd() * 3, far ? .55 : .75); c.position.set((rnd() - .5) * (far ? 160 : 16), far ? -3 + rnd() * 8 : -2.6 + rnd() * 1.2, far ? -40 - rnd() * 90 : -3 + rnd() * 3); c.userData.v = .05 + rnd() * .15; clouds.push(c); scene.add(c); }
// cintas de voz que suben desde el cuello
const neck = new THREE.Vector3(); const rbs = [], orbs = [];
const ends = [[-3, 9, -6], [4, 11, -10], [8, 7, -4]];
ends.forEach((e, i) => { const o = orb(C.orb[i], .16 + i * .03, 2.4); o.position.set(...e); scene.add(o); orbs.push(o); });
const build = () => { rbs.forEach(r => scene.remove(r.mesh)); rbs.length = 0; b.localToWorld(neck.set(0, 2.9, 0)); ends.forEach((e, i) => { const m = [(neck.x + e[0]) / 2 + (i - 1) * 2, (neck.y + e[1]) / 2 + 1.5, (neck.z + e[2]) / 2]; const r = ribbon([[neck.x, neck.y, neck.z], m, e], { color: C.orb[i], r: .028, speed: .5 + i * .15 }); rbs.push(r); scene.add(r.mesh); }); };
// cinta de conversación (capítulo 3): dos orbes que se unen
const A1 = orb(C.orb[0], .3, 2.6), A2 = orb(C.orb[3], .3, 2.6); scene.add(A1, A2);
const talk = ribbon([[-3.2, 4, 0], [0, 6.2, -1], [3.2, 4, 0]], { r: .04, dash: 6 }); scene.add(talk.mesh);
const waves = document.getElementById('wv'); waves.innerHTML = Array.from({ length: 28 }, (_, i) => `<i class="${i < 10 ? 'on' : ''}" style="height:${30 + Math.abs(Math.sin(i * 1.7)) * 70}%"></i>`).join('');
let built = false;
S.on((t, p) => {
  sk.update(t); oc.update(t); rbs.forEach(r => r.update(t)); talk.update(t);
  const p1 = ease(seg(p, 0, .5)), p2 = ease(seg(p, .5, 1));
  // botella: flota, respira, sigue el dedo/cursor con retraso
  root.position.y = (MOBILE ? 3.3 : 1.7) + Math.sin(t * .8) * .18 - p2 * 1.2; root.rotation.y = Math.sin(t * .3) * .25 + S.pointer.x * .25 + p1 * .8; root.rotation.x = Math.sin(t * .5) * .05 - S.pointer.y * .1;
  holder.rotation.z = -1.25 + Math.sin(t * .6) * .05 + p1 * .35;
  // capítulo 2: se abre (anticipación: el corcho baja un poco antes de saltar)
  const pop = seg(p, .22, .42); b.userData.cork.position.y = 2.82 + (pop < .15 ? -pop * .3 : ease((pop - .15) / .85) * 1.6); b.userData.cork.rotation.z = pop * 2.4;
  b.userData.paper.position.y = .85 + ease(seg(p, .32, .5)) * 1.5; b.userData.paper.material.emissiveIntensity = .35 + p1 * 1.2;
  if (!built || p < .02) { built = true; root.updateMatrixWorld(true); build(); }
  rbs.forEach(r => r.mat.uniforms.uDraw.value = 1 - p1);
  orbs.forEach((o, i) => { o.position.y = ends[i][1] + Math.sin(t + i) * .3; o.scale.setScalar(1 - p1 * .8); });
  // capítulo 3: la conversación
  const c3 = ease(seg(p, .62, .9)); talk.mat.uniforms.uDraw.value = c3; A1.visible = A2.visible = talk.mesh.visible = p > .55;
  A1.position.set(-3.2, 4 + Math.sin(t) * .15, 0); A2.position.set(3.2, 4 + Math.cos(t) * .15, 0); A1.scale.setScalar(.4 + c3 * .6); A2.scale.setScalar(.4 + c3 * .6);
  clouds.forEach(c => { c.position.x += c.userData.v * .01; if (c.position.x > 70) c.position.x = -70; });
  // cámara: se acerca a la botella, luego sube a ver la conversación
  camera.position.set(lerp(0, MOBILE ? .6 : -1, p1) + S.pointer.x * .3, lerp(1.6, 2.4, p1) + p2 * 3, lerp(14, MOBILE ? 10 : 13, p1) + p2 * 6);
  camera.lookAt(lerp(MOBILE ? 0 : -1.4, root.position.x * .6, p1), lerp(MOBILE ? 1.5 : 1.6, root.position.y, p1) + p2 * 3.4, 0);
});
// tarjeta crema que se inclina hacia el dedo (máx 10°)
const tc = document.getElementById('tilt');
tc.addEventListener('pointermove', e => { const r = tc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tc.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`; });
tc.addEventListener('pointerleave', () => animate(tc, { rotateX: 0, rotateY: 0, duration: 500, ease: 'outElastic(1,.6)' }));
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
