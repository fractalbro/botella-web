import { THREE, C, stage, bottle, sky, moon, ocean, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed } from './kit.js';
const S = stage(document.getElementById('gl'), { fov: MOBILE ? 50 : 36, bloom: [0.7, 0.5, 0.9] });
const { scene, camera } = S; scene.fog = new THREE.Fog('#0B2436', 50, 300); scene.environmentIntensity = .35;
const sk = sky(scene, { hz: '#173E5C' }); const mpos = new THREE.Vector3(-80, 40, -200); const mo = moon(5); mo.position.copy(mpos); scene.add(mo);
const oc = ocean({ moonDir: [mpos.x, mpos.y, mpos.z], fog: '#0B2436', skyc: '#123552', fogNear: 50, fogFar: 300, amp: .7 }); scene.add(oc.mesh);
scene.add(new THREE.HemisphereLight('#8FB7CF', '#020B15', .35)); const key = new THREE.DirectionalLight('#CFE8F2', .9); key.position.copy(mpos); scene.add(key);
// isla de roca
const LX = MOBILE ? 7 : 16, LZ = -26;
const rg = new THREE.IcosahedronGeometry(1, 4); const rp = rg.attributes.position; seed(5); for (let i = 0; i < rp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(rp, i); const n = 1 + Math.sin(v.x * 4 + v.z * 3) * .12 + Math.sin(v.y * 7) * .06 + (rnd() - .5) * .08; v.multiplyScalar(n); rp.setXYZ(i, v.x, v.y, v.z); } rg.computeVertexNormals();
const rock = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: '#14324A', roughness: .95, flatShading: true })); rock.scale.set(9, 3.2, 7); rock.position.set(LX, -1, LZ); scene.add(rock);
// faro
const lh = new THREE.Group(); lh.position.set(LX, 1.6, LZ); scene.add(lh);
const red = new THREE.MeshStandardMaterial({ color: '#E8585E', roughness: .55 }), wht = new THREE.MeshStandardMaterial({ color: '#EFE9E1', roughness: .55 });
let y = 0; const H = [[1.5, 1.38, 2], [1.38, 1.26, 2], [1.26, 1.14, 2], [1.14, 1.02, 2], [1.02, .92, 2]];
H.forEach(([r1, r2, hh], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, hh, 48), i % 2 ? red : wht); m.position.y = y + hh / 2; lh.add(m); y += hh; });
const gal = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, .18, 48), new THREE.MeshStandardMaterial({ color: '#1E4A6B', roughness: .6 })); gal.position.y = y + .09; lh.add(gal); y += .18;
const glassM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFE7B0').multiplyScalar(3.2) }); const lan = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 1.2, 32), glassM); lan.position.y = y + .6; lh.add(lan); const LY = y + .6; y += 1.2;
const dome = new THREE.Mesh(new THREE.SphereGeometry(.92, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#1E4A6B', roughness: .5 })); dome.position.y = y; lh.add(dome);
const lpl = new THREE.PointLight('#FFE7B0', 30, 30, 2); lpl.position.y = LY; lh.add(lpl);
// haz volumétrico: cono aditivo que se desvanece con la distancia y en los bordes
const L = 120; const bgeo = new THREE.ConeGeometry(14, L, 48, 1, true); bgeo.translate(0, -L / 2, 0); bgeo.rotateX(-Math.PI / 2); bgeo.rotateY(Math.PI);
const beamM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uT: { value: 0 }, uI: { value: 1 } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vD; void main(){ vD=-position.z/120.; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'uniform float uT,uI; varying vec3 vN; varying vec3 vV; varying float vD; void main(){ float e=pow(abs(dot(vN,vV)),1.6); float a=e*(1.-smoothstep(0.,1.,vD))*smoothstep(0.,.02,vD)*.75*uI; a*=.85+.15*sin(vD*40.-uT*2.); gl_FragColor=vec4(vec3(1.,.9,.68)*a,a); }' });
const beam = new THREE.Mesh(bgeo, beamM); const pivot = new THREE.Group(); pivot.position.set(LX, 1.6 + LY, LZ); pivot.add(beam); scene.add(pivot);
const beam2 = beam.clone(); beam2.rotation.y = Math.PI; pivot.add(beam2);
// botellas en el mar: se iluminan cuando pasa la luz
seed(12); const bots = []; for (let i = 0; i < (MOBILE ? 9 : 14); i++) { const b = bottle({ light: 0, paper: true }); b.scale.setScalar(.7); const g = new THREE.Group(); g.add(b); b.rotation.z = -1.45; g.userData = { x: (rnd() - .5) * (MOBILE ? 22 : 50), z: -2 - rnd() * 28, ph: rnd() * 6, ry: rnd() * 6 }; const gl = new THREE.PointLight('#FFE7B0', 0, 5, 2); gl.position.y = .8; g.add(gl); g.userData.gl = gl; scene.add(g); bots.push(g); }
const hero = bots[0]; hero.userData.x = MOBILE ? -1 : 4; hero.userData.z = 4;
const dir = new THREE.Vector3(), to = new THREE.Vector3();
S.on((t, p) => {
  sk.update(t); oc.update(t); beamM.uniforms.uT.value = t;
  const c2 = ease(seg(p, .25, .55)), c3 = ease(seg(p, .65, 1));
  // barrido: gira solo en la portada; en el capítulo 2 apunta a tu botella
  const free = t * .45; to.set(hero.position.x - pivot.position.x, 0, hero.position.z - pivot.position.z); const aim = Math.atan2(-to.x, -to.z);
  let ang = free; if (c2 > 0 && c3 < 1) { let d = ((aim - free) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; ang = free + d * c2 * (1 - c3); }
  pivot.rotation.y = ang; pivot.rotation.x = -.08 - c2 * .05; beamM.uniforms.uI.value = 1 + c3 * .6;
  dir.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
  bots.forEach((g, i) => { const u = g.userData; g.position.set(u.x, oc.hAt(u.x, u.z, t) + .15, u.z); g.rotation.y = u.ry; g.children[0].rotation.x = Math.sin(t + u.ph) * .2;
    to.set(u.x - pivot.position.x, 0, u.z - pivot.position.z).normalize(); const hit = Math.pow(Math.max(0, dir.dot(to)), 300) + Math.pow(Math.max(0, -dir.dot(to)), 300); u.gl.intensity = lerp(u.gl.intensity, hit * 14 + c3 * 6, .2); });
  oc.mat.uniforms.uSpot.value.set(hero.position.x, hero.position.z, 3.5, c2 * (1 - c3) * 1.4);
  camera.position.set(lerp(MOBILE ? -2 : -4, hero.position.x + 1, c2) + S.pointer.x, lerp(MOBILE ? 7 : 6, 3.2, c2) + c3 * 14, lerp(30, 14, c2) + c3 * 22);
  camera.lookAt(lerp(MOBILE ? 3 : 5, hero.position.x, c2) * (1 - c3) + LX * .4 * c3, lerp(MOBILE ? 0 : 5, 2.6, c2) * (1 - c3) + c3 * -2, lerp(LZ, hero.position.z - 6, c2) * (1 - c3) + LZ * .6 * c3);
});
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
