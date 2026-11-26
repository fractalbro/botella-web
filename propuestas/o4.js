import { THREE, C, stage, bottle, ribbon, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed } from './kit.js';
const S = stage(document.getElementById('gl'), { fov: MOBILE ? 55 : 40, bloom: [0.9, 0.6, 0.7], bg: '#03101C' });
const { scene, camera } = S; scene.fog = new THREE.FogExp2('#04182A', .028); scene.environmentIntensity = .25;
// fondo: degradado desde la superficie
const bgm = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uT: { value: 0 } }, vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: 'varying vec3 vP; void main(){ float y=vP.y; vec3 a=vec3(.004,.02,.04), b=vec3(.03,.14,.22); gl_FragColor=vec4(mix(a,b,smoothstep(-.2,.9,y)),1.); }' });
scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), bgm));
// rayos de luz desde la superficie (ruido animado, aditivos)
const rayM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide, uniforms: { uT: { value: 0 } },
  vertexShader: 'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform float uT; varying vec2 vU; void main(){ float x=vU.x; float r=0.; for(int i=0;i<5;i++){ float fi=float(i); r+=smoothstep(.06,0.,abs(fract(x*1.7+fi*.23+sin(uT*.15+fi)*.05)-.5)-.02)*(.5+.5*sin(uT*.4+fi*2.)); } float a=r*.10*pow(vU.y,1.6)*smoothstep(0.,.25,x)*smoothstep(1.,.75,x); gl_FragColor=vec4(vec3(.65,.95,.95)*a,a); }' });
const rays = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), rayM); rays.position.set(0, 8, -18); rays.rotation.z = .18; scene.add(rays);
const rays2 = rays.clone(); rays2.position.set(-6, 10, -30); rays2.rotation.z = -.12; scene.add(rays2);
// nieve marina
seed(2); const N = 900, pp = new Float32Array(N * 3); for (let i = 0; i < N; i++) pp.set([(rnd() - .5) * 50, (rnd() - .5) * 40, -rnd() * 40 + 8], i * 3);
const snowG = new THREE.BufferGeometry(); snowG.setAttribute('position', new THREE.BufferAttribute(pp, 3));
const snow = new THREE.Points(snowG, new THREE.PointsMaterial({ color: '#BFE9F0', size: .06, transparent: true, opacity: .6, depthWrite: false })); scene.add(snow);
// medusa: campana con borde luminoso (fresnel) + tentáculos que ondulan
const jellies = [];
function jelly(color, s) {
  const g = new THREE.Group(); const c = new THREE.Color(color);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * .55), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uC: { value: c } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); vY=position.y; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f=pow(1.-abs(dot(vN,vV)),2.2); float rim=smoothstep(.25,0.,vY)*.9; float stripes=.5+.5*sin(atan(vN.x,vN.z)*8.); vec3 col=uC*(f*1.9+rim*1.3+.18+stripes*.12*f); gl_FragColor=vec4(col,.75); }' }));
  g.add(bell);
  const core = new THREE.Mesh(new THREE.SphereGeometry(.38, 24, 12), new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(2.6) })); core.position.y = .25; core.scale.y = .6; g.add(core);
  const tents = []; for (let i = 0; i < 9; i++) { const n = 40, pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: c.clone().multiplyScalar(1.4), transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); const a = i / 9 * Math.PI * 2, r = i < 6 ? .8 : .25; l.userData = { a, r, len: i < 6 ? 3.6 + Math.random() : 2.4, ph: Math.random() * 6 }; g.add(l); tents.push(l); }
  g.userData = { bell, core, tents, ph: Math.random() * 6 }; g.scale.setScalar(s); scene.add(g); jellies.push(g); return g;
}
const J = MOBILE ? [[C.orb[0], 1.3, [.8, 5.2, -2]], [C.orb[1], .8, [-2.6, 6.4, -4]], [C.orb[2], .6, [3.2, 2.2, -5]], [C.orb[3], .5, [-1.6, 7.6, -7]], [C.orb[5], .45, [2.6, 8, -9]]]
  : [[C.orb[0], 1.6, [4.2, 2.6, -2]], [C.orb[1], 1, [8.5, 0, -4]], [C.orb[2], .8, [1.2, -1.6, -5]], [C.orb[3], .7, [7, 5.2, -7]], [C.orb[5], .55, [11, 3, -9]]];
J.forEach(([c, s, p]) => { const j = jelly(c, s); j.position.set(...p); j.userData.home = new THREE.Vector3(...p); });
// la corriente (capítulo 2): cinta que lleva 4 botellas
const cur = ribbon([[-14, -1, -6], [-5, 1.5, -3], [3, -.5, -4], [14, 2, -8]], { color: '#8FB7CF', r: .05, speed: .8, dash: 14, glow: 1.2 }); scene.add(cur.mesh);
const bots = [0, 1, 2, 3].map(i => { const b = bottle({ light: .8, paper: true }); b.scale.setScalar(.38); const g = new THREE.Group(); g.add(b); b.rotation.z = -1.5; scene.add(g); return g; });
// capítulo 3: dos luces se encuentran
const link = ribbon([[-2.2, 1, 0], [0, -1.2, .5], [2.2, 1, 0]], { r: .04, dash: 8 }); scene.add(link.mesh);
S.on((t, p, dt) => {
  rayM.uniforms.uT.value = t; cur.update(t); link.update(t);
  const P = snowG.attributes.position; for (let i = 0; i < N; i++) { let y = P.getY(i) + dt * .25; if (y > 20) y = -20; P.setY(i, y); } P.needsUpdate = true;
  const c2 = ease(seg(p, .25, .55)), c3 = ease(seg(p, .62, .95));
  jellies.forEach((g, k) => {
    const u = g.userData, pulse = Math.sin(t * 1.6 + u.ph); u.bell.scale.set(1 + pulse * .08, 1 - pulse * .12, 1 + pulse * .08);
    let tgt = u.home.clone(); tgt.y += Math.sin(t * .5 + u.ph) * .4 + (pulse > 0 ? 0 : 0);
    if (k < 2) { const m = new THREE.Vector3(k === 0 ? -2.2 : 2.2, MOBILE ? 4.2 : 1, 0); if (!MOBILE) m.x += 4; tgt.lerp(m, c3); g.scale.setScalar(lerp(J[k][1], MOBILE ? .9 : 1.1, c3)); } else { tgt.y += c3 * 12; }
    g.position.lerp(tgt, .06); g.rotation.z = Math.sin(t * .4 + u.ph) * .12;
    u.tents.forEach(l => { const d = l.userData, P = l.geometry.attributes.position; for (let i = 0; i < 40; i++) { const s = i / 39, y = -s * d.len; const w = Math.sin(t * 2 + s * 6 + d.ph) * .25 * s; P.setXYZ(i, Math.cos(d.a) * d.r * (1 - s * .5) + w, y, Math.sin(d.a) * d.r * (1 - s * .5) + Math.cos(t * 1.7 + s * 5 + d.ph) * .2 * s); } P.needsUpdate = true; });
  });
  cur.mat.uniforms.uDraw.value = c2 * (1 - c3); cur.mesh.position.y = MOBILE ? 4 : 0;
  bots.forEach((g, i) => { const u = ((t * .05 + i * .22) % 1); const pt = cur.curve.getPointAt(u); g.position.copy(pt); g.position.y += cur.mesh.position.y; g.visible = c2 > .3 && c3 < .7; g.rotation.x = Math.sin(t + i) * .3; });
  link.mat.uniforms.uDraw.value = seg(c3, .4, 1); link.mesh.position.set(MOBILE ? 0 : 4, MOBILE ? 4.2 - 1 : 0, 0);
  camera.position.set(S.pointer.x * .8, lerp(MOBILE ? 1.5 : 1, MOBILE ? 1.2 : 0, c2), 14 - c2 * 2);
  camera.lookAt(MOBILE ? 0 : 2.5, MOBILE ? 2.5 : 1, -4);
});
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
