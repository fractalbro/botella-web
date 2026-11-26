// Mezcla de la 1 (Sueño) y la 5 (El faro): una sola historia sobre el mismo mar.
import { THREE, C, stage, bottle, sky, moon, ocean, ribbon, orb, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed, animate } from './kit.js';
const S = stage(document.getElementById('gl'), { fov: MOBILE ? 46 : 34, bloom: [0.55, 0.4, 0.9] });
const { scene, camera } = S; scene.fog = new THREE.Fog('#0B2436', 60, 320); scene.environmentIntensity = .45;
const sk = sky(scene, { hz: '#173E5C' });
const mpos = MOBILE ? new THREE.Vector3(9, 26, -90) : new THREE.Vector3(26, 17, -90); const mo = moon(MOBILE ? 3 : 4); mo.position.copy(mpos); scene.add(mo);
const oc = ocean({ moonDir: [mpos.x, mpos.y, mpos.z], fog: '#0B2436', skyc: '#123552', fogNear: 50, fogFar: 320, amp: .8 }); oc.mesh.position.y = -4.2; scene.add(oc.mesh);
const SEA = -4.2;
scene.add(new THREE.HemisphereLight('#9FD8E8', '#05121F', .45)); const key = new THREE.DirectionalLight('#EAF6F2', 1.4); key.position.copy(mpos); scene.add(key);
// ---- el faro, a lo lejos desde la portada ----
const LX = MOBILE ? 12 : 9, LZ = MOBILE ? -70 : -50;
const rg = new THREE.IcosahedronGeometry(1, 4); const rp = rg.attributes.position; seed(5); for (let i = 0; i < rp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(rp, i); v.multiplyScalar(1 + Math.sin(v.x * 4 + v.z * 3) * .12 + Math.sin(v.y * 7) * .06 + (rnd() - .5) * .08); rp.setXYZ(i, v.x, v.y, v.z); } rg.computeVertexNormals();
const rock = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: '#14324A', roughness: .95, flatShading: true })); rock.scale.set(9, 3.2, 7); rock.position.set(LX, SEA - 1, LZ); scene.add(rock);
const lh = new THREE.Group(); lh.position.set(LX, SEA + 1.6, LZ); scene.add(lh);
const red = new THREE.MeshStandardMaterial({ color: '#E8585E', roughness: .55 }), wht = new THREE.MeshStandardMaterial({ color: '#EFE9E1', roughness: .55 });
let y = 0; [[1.5, 1.38], [1.38, 1.26], [1.26, 1.14], [1.14, 1.02], [1.02, .92]].forEach(([r1, r2], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, 2, 48), i % 2 ? red : wht); m.position.y = y + 1; lh.add(m); y += 2; });
const gal = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, .18, 48), new THREE.MeshStandardMaterial({ color: '#1E4A6B', roughness: .6 })); gal.position.y = y + .09; lh.add(gal); y += .18;
const lan = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 1.2, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE7B0').multiplyScalar(3.2) })); lan.position.y = y + .6; lh.add(lan); const LY = y + .6; y += 1.2;
const dome = new THREE.Mesh(new THREE.SphereGeometry(.92, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#1E4A6B', roughness: .5 })); dome.position.y = y; lh.add(dome);
const lpl = new THREE.PointLight('#FFE7B0', 30, 30, 2); lpl.position.y = LY; lh.add(lpl);
const L = 140; const bgeo = new THREE.ConeGeometry(14, L, 48, 1, true); bgeo.translate(0, -L / 2, 0); bgeo.rotateX(-Math.PI / 2); bgeo.rotateY(Math.PI);
const beamM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uT: { value: 0 }, uI: { value: 1 } },
  vertexShader: `varying vec3 vN; varying vec3 vV; varying float vD; void main(){ vD=-position.z/${L}.; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
  fragmentShader: 'uniform float uT,uI; varying vec3 vN; varying vec3 vV; varying float vD; void main(){ float e=pow(abs(dot(vN,vV)),1.6); float a=e*(1.-smoothstep(0.,1.,vD))*smoothstep(0.,.02,vD)*.7*uI; a*=.85+.15*sin(vD*40.-uT*2.); gl_FragColor=vec4(vec3(1.,.9,.68)*a,a); }' });
const pivot = new THREE.Group(); pivot.position.set(LX, SEA + 1.6 + LY, LZ); const beam = new THREE.Mesh(bgeo, beamM); pivot.add(beam); const beam2 = beam.clone(); beam2.rotation.y = Math.PI; pivot.add(beam2); scene.add(pivot);
// ---- las otras botellas en el mar (las 8 personas, y 4 más) ----
seed(12); const bots = []; for (let i = 0; i < 12; i++) { const b = bottle({ light: 0 }); b.scale.setScalar(.7); const g = new THREE.Group(); g.add(b); b.rotation.z = -1.45; const a = (i / 12) * Math.PI * 2 + rnd() * .3, r = 9 + rnd() * 14; g.userData = { x: Math.cos(a) * r * (MOBILE ? .7 : 1.3), z: -14 + Math.sin(a) * r * .9, ph: rnd() * 6, ry: rnd() * 6, i }; const gl = new THREE.PointLight(i < 8 ? C.a : '#FFC24B', 0, 6, 2); gl.position.y = .8; g.add(gl); g.userData.gl = gl; g.visible = false; scene.add(g); bots.push(g); }
// ---- la botella protagonista (de la 1) ----
const root = new THREE.Group(); scene.add(root); const b = bottle({ light: 2 }); b.position.y = -1.4; const holder = new THREE.Group(); holder.add(b); holder.rotation.z = -1.25; root.add(holder);
const P0 = MOBILE ? new THREE.Vector3(.3, 3.3, 0) : new THREE.Vector3(2.7, 1.7, 0), S0 = MOBILE ? 1.9 : 2.1; root.position.copy(P0); root.scale.setScalar(S0);
const HS = new THREE.Vector3(MOBILE ? 0 : 3, 0, -6); // dónde cae al mar
const neck = new THREE.Vector3(); const rbs = []; const ends = [[-3, 9, -6], [4, 11, -10], [8, 7, -4]]; const orbs = ends.map((e, i) => { const o = orb(C.orb[i], .16 + i * .03, 2.4); o.position.set(...e); scene.add(o); return o; });
const build = () => { rbs.forEach(r => scene.remove(r.mesh)); rbs.length = 0; root.updateMatrixWorld(true); b.localToWorld(neck.set(0, 2.9, 0)); ends.forEach((e, i) => { const m = [(neck.x + e[0]) / 2 + (i - 1) * 2, (neck.y + e[1]) / 2 + 1.5, (neck.z + e[2]) / 2]; const r = ribbon([[neck.x, neck.y, neck.z], m, e], { color: C.orb[i], r: .028, speed: .5 + i * .15 }); rbs.push(r); scene.add(r.mesh); }); };
build();
document.getElementById('wv').innerHTML = Array.from({ length: 28 }, (_, i) => `<i class="${i < 10 ? 'on' : ''}" style="height:${30 + Math.abs(Math.sin(i * 1.7)) * 70}%"></i>`).join('');
const dir = new THREE.Vector3(), to = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), cp = new THREE.Vector3(), lk = new THREE.Vector3();
S.on((t, p) => {
  sk.update(t); oc.update(t); rbs.forEach(r => r.update(t)); beamM.uniforms.uT.value = t;
  const c1 = ease(seg(p, 0, .3)), c2 = ease(seg(p, .34, .62)), c3 = ease(seg(p, .7, 1));
  // botella: flota (1), se abre (1→2), baja al mar (2→3)
  const hy = oc.hAt(HS.x, HS.z, t) + SEA + .3;
  root.position.set(lerp(P0.x, HS.x, c2), lerp(P0.y + Math.sin(t * .8) * .18, hy, c2), lerp(P0.z, HS.z, c2)); root.scale.setScalar(lerp(S0, .9, c2));
  root.rotation.y = lerp(Math.sin(t * .3) * .25 + S.pointer.x * .25 + c1 * .8, .4, c2); root.rotation.x = lerp(Math.sin(t * .5) * .05 - S.pointer.y * .1, Math.sin(t * .9) * .1, c2);
  holder.rotation.z = lerp(-1.25 + Math.sin(t * .6) * .05 + c1 * .35, -1.5, c2);
  const pop = seg(p, .12, .26); b.userData.cork.position.y = 2.82 + (pop < .15 ? -pop * .3 : ease((pop - .15) / .85) * 1.6) * (1 - c2); b.userData.cork.rotation.z = pop * 2.4;
  b.userData.paper.position.y = .85 + ease(seg(p, .18, .3)) * 1.5 * (1 - c2); b.userData.paper.material.emissiveIntensity = .35 + c1 * 1.2;
  rbs.forEach(r => r.mat.uniforms.uDraw.value = 1 - c1); orbs.forEach((o, i) => { o.position.y = ends[i][1] + Math.sin(t + i) * .3; o.scale.setScalar(Math.max(.001, 1 - c1)); });
  // el faro: gira libre, en el capítulo 3 apunta a tu botella
  const free = t * .45; to.set(root.position.x - pivot.position.x, 0, root.position.z - pivot.position.z); const aim = Math.atan2(-to.x, -to.z);
  let ang = free; const lock = seg(p, .5, .66) * (1 - c3); if (lock > 0) { const d = ((aim - free) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; ang = free + d * ease(lock); }
  pivot.rotation.y = ang; pivot.rotation.x = -.06; beamM.uniforms.uI.value = .8 + c2 * .4 + c3 * .6; dir.set(0, 0, -1).applyAxisAngle(up, ang);
  oc.mat.uniforms.uSpot.value.set(root.position.x, root.position.z, 2.4, ease(lock) * .7);
  // las 8 personas (y 4 más): aparecen y se encienden en el capítulo 3; con la marea, todas
  const reach8 = seg(p, .56, .68), reach4 = seg(p, .66, .74);
  bots.forEach(g => { const u = g.userData; g.visible = c2 > .5; g.position.set(u.x, oc.hAt(u.x, u.z, t) + SEA + .15, u.z); g.rotation.y = u.ry; g.children[0].rotation.x = Math.sin(t + u.ph) * .2;
    to.set(u.x - pivot.position.x, 0, u.z - pivot.position.z).normalize(); const hit = Math.pow(Math.max(0, dir.dot(to)), 300) + Math.pow(Math.max(0, -dir.dot(to)), 300);
    const on = u.i < 8 ? seg(reach8, u.i / 10, u.i / 10 + .2) : seg(reach4, (u.i - 8) / 6, (u.i - 8) / 6 + .3); u.gl.intensity = lerp(u.gl.intensity, hit * 14 + on * 7 + c3 * 4, .15); });
  // cámara: de cerca a la botella (1-2) → baja al mar y mira hacia el faro (3) → sube a ver la marea (4)
  const nearC = new THREE.Vector3(lerp(0, MOBILE ? .6 : -1, c1) + S.pointer.x * .3, lerp(1.6, 2.4, c1), lerp(14, MOBILE ? 10 : 13, c1));
  const nearL = new THREE.Vector3(lerp(MOBILE ? 0 : -1.4, root.position.x * .6, c1), lerp(MOBILE ? 1.5 : 1.6, root.position.y, c1), 0);
  const seaC = new THREE.Vector3(HS.x + (MOBILE ? 1.5 : -3) + S.pointer.x, SEA + 4.2, HS.z + 16), seaL = new THREE.Vector3(lerp(HS.x, LX, .35), SEA + (MOBILE ? 1.2 : 3), lerp(HS.z, LZ, .4));
  const topC = new THREE.Vector3(HS.x * .5, SEA + 20, HS.z + 40), topL = new THREE.Vector3(lerp(HS.x, LX, .5), SEA - 2, -24);
  cp.copy(nearC).lerp(seaC, c2).lerp(topC, c3); lk.copy(nearL).lerp(seaL, c2).lerp(topL, c3);
  camera.position.copy(cp); camera.lookAt(lk);
});
const tc = document.getElementById('tilt');
tc.addEventListener('pointermove', e => { const r = tc.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5; tc.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-yy * 10}deg)`; });
tc.addEventListener('pointerleave', () => animate(tc, { rotateX: 0, rotateY: 0, duration: 500, ease: 'outElastic(1,.6)' }));
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
