import { THREE, C, stage, bottle, sky, moon, ocean, ribbon, splitIn, reveal, pressy, seg, ease, lerp, MOBILE, rnd, seed } from './kit.js';
const S = stage(document.getElementById('gl'), { fov: MOBILE ? 52 : 36, bloom: [0.45, 0.3, 0.95] });
const { scene, camera } = S;
const FOG = new THREE.Color('#0D2A40'); scene.fog = new THREE.Fog(FOG, 60, 260);
const sk = sky(scene, { hz: '#1A4466' }); const mpos = new THREE.Vector3(MOBILE ? 30 : 60, 46, -160); const mo = moon(5); mo.position.copy(mpos); scene.add(mo);
const oc = ocean({ moonDir: [mpos.x, mpos.y, mpos.z], fog: '#0D2A40', skyc: '#123552', fogNear: 60, fogFar: 260, amp: .8 }); oc.mesh.position.y = 0; scene.add(oc.mesh);
scene.add(new THREE.HemisphereLight('#6FA6C8', '#020B15', .35)); const key = new THREE.DirectionalLight('#CFE8F2', 1.1); key.position.set(40, 60, 80); scene.add(key);
// acantilado de la Costa Verde: roca con estratos, borde superior irregular
const CW = 260, CH = 16; const cg = new THREE.PlaneGeometry(CW, CH + 6, 400, 60); const P = cg.attributes.position; seed(9);
const nz = (x, y) => Math.sin(x * .21) * 1.4 + Math.sin(x * .57 + y * .3) * .7 + Math.sin(x * 1.7 + y * 1.1) * .25 + Math.sin(y * 2.3) * .2;
const topAt = x => CH + Math.sin(x * .05) * 1.6 + Math.sin(x * .13) * .8;
for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i) + (CH + 6) / 2 - 3; const t = topAt(x); const yy = Math.min(y, t); P.setY(i, yy); P.setZ(i, nz(x, yy) + (yy < 1.5 ? (1.5 - yy) * 2 : 0) - (yy > t - .6 ? 2.5 : 0)); }
cg.computeVertexNormals();
const cliff = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: '#16344B', roughness: .95 })); cliff.position.z = -40; scene.add(cliff);
// la ciudad arriba: edificios con ventanas encendidas (shader procedural)
const bm = new THREE.ShaderMaterial({
  fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
  vertexShader: `attribute float sd; attribute vec3 dim; varying vec3 vL; varying vec3 vN; varying float vS; varying vec3 vD; #include <fog_pars_vertex>
    void main(){ vL=position*dim; vN=normal; vS=sd; vD=dim; vec4 mvPosition=modelViewMatrix*instanceMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition; #include <fog_vertex> }`.replace(/#include <(\w+)>/g, m => '\n' + m + '\n'),
  fragmentShader: `uniform float uTime; varying vec3 vL; varying vec3 vN; varying float vS; varying vec3 vD; #include <fog_pars_fragment>
    float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
    void main(){ vec3 base=vec3(.035,.09,.15); float sh=.55+.45*max(dot(vN,normalize(vec3(.4,.6,.7))),0.); vec3 c=base*sh;
      if(abs(vN.y)<.5){ vec2 q = abs(vN.x)>.5 ? vec2(vL.z,vL.y) : vec2(vL.x,vL.y); vec2 cell=floor(q*vec2(1.5,1.3)); vec2 f=fract(q*vec2(1.5,1.3));
        float win=step(.25,f.x)*step(f.x,.75)*step(.3,f.y)*step(f.y,.78); float r=h(cell+vS*13.7); float on=step(r,.11);
        vec3 warm=mix(vec3(1.,.78,.42),vec3(1.,.9,.7),h(cell+3.1))*1.9*(.85+.15*sin(uTime*.7+r*40.));
        c=mix(c, on>0. ? warm : vec3(.03,.08,.13), win); }
      gl_FragColor=vec4(c,1.); #include <fog_fragment> }`.replace(/#include <(\w+)>/g, m => '\n' + m + '\n')
});
seed(21); const N = 170; const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0), bm, N);
const sd = new Float32Array(N), dim = new Float32Array(N * 3); const M = new THREE.Matrix4(); const tops = [];
for (let i = 0; i < N; i++) { const x = (rnd() - .5) * CW * .9, z = -42 - rnd() * 40, w = 3 + rnd() * 5, d = 3 + rnd() * 5, hh = 3 + Math.pow(rnd(), 2) * 16; const y = topAt(x) - 1.2; M.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(w, hh, d)); city.setMatrixAt(i, M); sd[i] = rnd(); dim.set([w, hh, d], i * 3); if (z > -52 && Math.abs(x) < (MOBILE ? 28 : 60)) tops.push([x + (rnd() - .5) * w * .6, y + 1.5 + rnd() * (hh - 2), z + d / 2 + .05]); }
city.geometry.setAttribute('sd', new THREE.InstancedBufferAttribute(sd, 1)); city.geometry.setAttribute('dim', new THREE.InstancedBufferAttribute(dim, 3)); scene.add(city);
// la botella en el mar y las ventanas que se encienden en turquesa
const b = bottle({ light: 1.2 }); b.scale.setScalar(1.3); b.rotation.z = -1.3; const bg = new THREE.Group(); bg.add(b); bg.position.set(MOBILE ? 3 : 14, .4, -2); scene.add(bg);
seed(4); tops.sort(() => rnd() - .5); const W8 = tops.slice(0, 12);
const winGeo = new THREE.PlaneGeometry(.75, .9), arcs = [], wins = [];
W8.forEach((p, i) => {
  const wm = new THREE.Mesh(winGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(C.a).multiplyScalar(3), transparent: true, opacity: 0, fog: false })); wm.position.set(...p); scene.add(wm); wins.push(wm);
  const s = [bg.position.x + 1.6, 1.4, bg.position.z]; const m = [(s[0] + p[0]) / 2, Math.max(s[1], p[1]) + 10 + rnd() * 6, (s[2] + p[2]) / 2];
  const r = ribbon([s, m, p], { r: .035, color: i < 8 ? C.a : '#FFC24B', speed: .5, dash: 7, glow: 1.5 }); r.mat.uniforms.uDraw.value = 0; scene.add(r.mesh); arcs.push(r);
});
// la marea de las 21:00: botellas pequeñas que llegan
const small = [], sm = new THREE.MeshStandardMaterial({ color: '#BFF3EA', emissive: '#2E8C80', emissiveIntensity: .5, roughness: .15, metalness: 0, transparent: true, opacity: .85 });
const sg = new THREE.LatheGeometry([[0, 0], [.5, 0], [.52, 1.4], [.3, 1.9], [.18, 2.1], [.18, 2.6], [0, 2.6]].map(([x, y]) => new THREE.Vector2(x, y)), 16);
seed(8); for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(sg, sm); m.scale.setScalar(.45); m.rotation.z = -1.4 + rnd() * .3; m.rotation.y = rnd() * 6; m.userData = { x: (rnd() - .5) * 60, z: 10 - rnd() * 40, ph: rnd() * 6 }; scene.add(m); small.push(m); }
S.on((t, p) => {
  sk.update(t); oc.update(t); arcs.forEach(a => a.update(t)); bm.uniforms.uTime.value = t;
  const a8 = ease(seg(p, .02, .3)), a4 = ease(seg(p, .38, .62)), tide = ease(seg(p, .7, .98));
  arcs.forEach((a, i) => { const k = i < 8 ? seg(a8, i / 10, i / 10 + .3) : seg(a4, (i - 8) / 6, (i - 8) / 6 + .4); a.mat.uniforms.uDraw.value = k; wins[i].material.opacity = seg(k, .85, 1); });
  if (p < .01) arcs.forEach((a, i) => { if (i < 8) { a.mat.uniforms.uDraw.value = 1; wins[i].material.opacity = 1; } }); // portada: ya encendidas
  bg.position.y = oc.hAt(bg.position.x, bg.position.z, t) + .3; b.rotation.x = Math.sin(t * .9) * .12; bg.rotation.y = Math.sin(t * .4) * .3;
  small.forEach((m, i) => { const u = m.userData; m.visible = tide > 0; m.position.set(u.x, oc.hAt(u.x, u.z, t) + .2, lerp(u.z - 60, u.z, tide)); m.rotation.x = Math.sin(t + u.ph) * .2; });
  camera.position.set(S.pointer.x * 1.5 + lerp(0, 4, tide), lerp(MOBILE ? 5 : 5, 2.2, tide), lerp(MOBILE ? 58 : 48, 26, tide));
  camera.lookAt(lerp(MOBILE ? 0 : -14, 2, tide), lerp(MOBILE ? 5 : 8, 3, tide), -30);
});
splitIn(document.querySelector('[data-split]'), 150); reveal(); pressy();
