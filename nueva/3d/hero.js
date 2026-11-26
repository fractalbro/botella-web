// Botella web nueva · portada 3D: la botella de vidrio flota; el faro barre al fondo.
// Al bajar, la botella cae al mar y el faro la encuentra. Se apaga fuera de la portada.
import { THREE, C, stage, bottle, sky, moon, ocean, lerp, ease, seed, rnd } from './kit.js';
const cv = document.getElementById('gl'), hero = document.getElementById('hero');
const ok = (() => { try { return !!document.createElement('canvas').getContext('webgl2') && !(navigator.connection && navigator.connection.saveData); } catch (e) { return false; } })();
if (!ok) document.documentElement.classList.add('no3d');
else {
  let inView = true; new IntersectionObserver(es => { inView = es[0].isIntersecting; }).observe(hero);
  const prog = () => Math.max(0, Math.min(1, scrollY / (hero.offsetHeight * .9)));
  const MOB = innerWidth < 760;
  const S = stage(cv, { fov: MOB ? 44 : 34, bloom: [0.5, 0.4, 0.9], progress: prog, active: () => inView });
  S.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const { scene, camera } = S; scene.fog = new THREE.Fog('#0B2436', 40, 300); scene.environmentIntensity = .45;
  const sk = sky(scene, { hz: '#173E5C' });
  const mpos = MOB ? new THREE.Vector3(-8, 26, -90) : new THREE.Vector3(-22, 18, -90); const mo = moon(MOB ? 3 : 4); mo.position.copy(mpos); scene.add(mo);
  const SEA = -4.2;
  const oc = ocean({ moonDir: [mpos.x, mpos.y, mpos.z], fog: '#0B2436', skyc: '#123552', fogNear: 40, fogFar: 300, amp: .8 }); oc.mesh.position.y = SEA; scene.add(oc.mesh);
  scene.add(new THREE.HemisphereLight('#9FD8E8', '#05121F', .45)); const key = new THREE.DirectionalLight('#EAF6F2', 1.4); key.position.copy(mpos); scene.add(key);
  // faro
  const LX = MOB ? 16 : 40, LZ = -70;
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: '#14324A', roughness: .95, flatShading: true })); rock.scale.set(9, 3, 7); rock.position.set(LX, SEA - 1, LZ); scene.add(rock);
  const lh = new THREE.Group(); lh.position.set(LX, SEA + 1.4, LZ); scene.add(lh);
  const wht = new THREE.MeshStandardMaterial({ color: '#EFE9E1', roughness: .55 }), red = new THREE.MeshStandardMaterial({ color: '#E8585E', roughness: .55 });
  let y = 0; [[1.4, 1.25], [1.25, 1.1], [1.1, .95], [.95, .85]].forEach(([a, b], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(b, a, 2, 32), i % 2 ? red : wht); m.position.y = y + 1; lh.add(m); y += 2; });
  const lan = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, 1.1, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE7B0').multiplyScalar(3) })); lan.position.y = y + .55; lh.add(lan); const LY = y + .55;
  const L = 130; const bgeo = new THREE.ConeGeometry(12, L, 40, 1, true); bgeo.translate(0, -L / 2, 0); bgeo.rotateX(-Math.PI / 2); bgeo.rotateY(Math.PI);
  const beamM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uI: { value: .7 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vD; void main(){ vD=-position.z/${L}.; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: 'uniform float uI; varying vec3 vN; varying vec3 vV; varying float vD; void main(){ float e=pow(abs(dot(vN,vV)),1.6); float a=e*(1.-smoothstep(0.,1.,vD))*smoothstep(0.,.02,vD)*.6*uI; gl_FragColor=vec4(vec3(1.,.9,.68)*a,a); }' });
  const pivot = new THREE.Group(); pivot.position.set(LX, SEA + 1.4 + LY, LZ); pivot.add(new THREE.Mesh(bgeo, beamM)); scene.add(pivot);
  // las 8 orillas que se encienden al bajar, y 4 más tenues
  seed(4); const lights = [];
  for (let i = 0; i < 12; i++) { const a = -Math.PI * .92 + (i / 11) * Math.PI * .84, r = 20 + rnd() * 22; const m = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(i < 8 ? C.a : '#FFE7B0').multiplyScalar(1.6) })); m.userData = { x: Math.cos(a) * r * (MOB ? .8 : 1.3), z: Math.sin(a) * r - 8, i }; m.scale.setScalar(.001); scene.add(m); lights.push(m); }
  // la botella
  const root = new THREE.Group(); scene.add(root); const b = bottle({ light: 2 }); b.position.y = -1.4; const holder = new THREE.Group(); holder.add(b); root.add(holder);
  const P0 = MOB ? new THREE.Vector3(.5, 3.1, 0) : new THREE.Vector3(4.1, 1.5, 0), S0 = MOB ? .85 : 1.35, HS = new THREE.Vector3(MOB ? 0 : 3, 0, -8);
  const tmp = new THREE.Vector3();
  S.on((t, p) => {
    sk.update(t); oc.update(t);
    const c = ease(Math.min(1, p * 1.25));
    const hy = oc.hAt(HS.x, HS.z, t) + SEA + .3;
    root.position.set(lerp(P0.x, HS.x, c), lerp(P0.y + Math.sin(t * .8) * .18, hy, c) + Math.sin(c * Math.PI) * 1.2, lerp(P0.z, HS.z, c)); root.scale.setScalar(lerp(S0, .8, c));
    root.rotation.y = Math.sin(t * .3) * .25 + S.pointer.x * .25; root.rotation.x = Math.sin(t * .5) * .05 - S.pointer.y * .08;
    holder.rotation.z = lerp(-1.2 + Math.sin(t * .6) * .05, -1.5, c);
    b.userData.paper.material.emissiveIntensity = .5 + Math.sin(t * 1.2) * .15;
    let ang = t * .4; const to = tmp.set(root.position.x - pivot.position.x, 0, root.position.z - pivot.position.z); const aim = Math.atan2(-to.x, -to.z); const lock = Math.max(0, Math.min(1, (p - .35) / .3)); const d = ((aim - ang) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; ang += d * ease(lock);
    pivot.rotation.y = ang; pivot.rotation.x = -.06; beamM.uniforms.uI.value = .7 + lock * .5;
    oc.mat.uniforms.uSpot.value.set(root.position.x, root.position.z, 2.4, ease(lock) * .7);
    lights.forEach(m => { const u = m.userData; const on = u.i < 8 ? Math.max(0, Math.min(1, (p - .5 - u.i * .03) / .1)) : Math.max(0, Math.min(.6, (p - .78 - (u.i - 8) * .03) / .1)); m.scale.setScalar(Math.max(.001, on)); m.position.set(u.x, oc.hAt(u.x, u.z, t) + SEA + .4, u.z); });
    camera.position.set(lerp(0, HS.x * .4, c) + S.pointer.x * .3, lerp(1.4, SEA + 6, c), lerp(14, 18, c)); camera.lookAt(lerp(0, HS.x, c), lerp(MOB ? -.6 : 1.2, SEA - 1, c), lerp(0, HS.z - 6, c));
  });
  document.documentElement.classList.add('gl-on');
}
