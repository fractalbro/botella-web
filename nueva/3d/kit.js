// Botella · kit 3D compartido (Three.js + anime.js). Paleta de la app y reglas de movimiento (docs/MOTION.md).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { animate, stagger } from './lib/anime.esm.min.js';
export { THREE, animate, stagger };

export const C = { bg: '#05121F', a: '#7FD8C9', paper: '#F3E6C8', cork: '#8A5A33', moon: '#EAF6F2', orb: ['#7FD8C9', '#FFC24B', '#8E8CFF', '#FF70A9', '#FFB061', '#9FE3B0'] };
export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = innerWidth < 900;
const col = h => new THREE.Color(h);
let _s = 7; export const rnd = () => (_s = (_s * 9301 + 49297) % 233280) / 233280; export const seed = n => { _s = n; };

// ---------- escenario: render, entorno, bloom, bucle y progreso de scroll ----------
export function stage(canvas, { fov = 35, bloom = [0.5, 0.35, 0.92], exposure = 1, ortho = 0, bg = C.bg, progress = null, active = null } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = exposure;
  const scene = new THREE.Scene(); scene.background = col(bg);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = ortho ? new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200) : new THREE.PerspectiveCamera(fov, 1, 0.1, 2000);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bp = new UnrealBloomPass(new THREE.Vector2(256, 256), ...bloom); composer.addPass(bp);
  composer.addPass(new OutputPass()); if (location.search.includes('nobloom')) bp.enabled = false;
  const fns = []; let w = 0, h = 0;
  const size = () => {
    w = canvas.clientWidth; h = canvas.clientHeight; renderer.setSize(w, h, false); composer.setSize(w, h);
    if (ortho) { const a = w / h, s = ortho; camera.left = -s * a; camera.right = s * a; camera.top = s; camera.bottom = -s; } else camera.aspect = w / h;
    // pantallas bajas (iPhone SE): subo la escena para que no choque con el titular
    const lift = w < 900 ? Math.max(0, Math.min(.16, (1.75 - h / w) * .4)) : 0;
    if (lift) camera.setViewOffset(w, h, 0, h * lift, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  size(); addEventListener('resize', size);
  const st = { renderer, scene, camera, composer, bloom: bp, p: 0, pointer: new THREE.Vector2(), t: 0, on: f => fns.push(f), get aspect() { return w / h; } };
  addEventListener('pointermove', e => { st.pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  const prog = progress || (() => { const m = document.documentElement.scrollHeight - innerHeight; return m > 0 ? scrollY / m : 0; });
  let sp = prog(); const clock = new THREE.Clock();
  const tick = () => {
    const dt = Math.min(clock.getDelta(), 0.05); st.t += REDUCE ? 0 : dt;
    sp += (prog() - sp) * (REDUCE ? 1 : 1 - Math.pow(0.0015, dt)); st.p = sp; // seguimiento suave, sin velocidad constante
    if (!active || active()) { fns.forEach(f => f(st.t, st.p, dt)); composer.render(); } // fuera de la historia no se dibuja (batería)
    requestAnimationFrame(tick);
  };
  if (location.search.includes('rec')) { window.__frame = dt => { st.t += dt; sp = prog(); st.p = sp; fns.forEach(f => f(st.t, st.p, dt)); composer.render(); }; window.__frame(0.016); }
  else requestAnimationFrame(tick);
  return st;
}

// ---------- la botella de vidrio (la pieza protagonista) ----------
export function bottle({ paper = true, light = 1.2, tint = '#CFF5EE' } = {}) {
  const g = new THREE.Group();
  const P = [[0, 0], [0.42, 0], [0.5, 0.06], [0.52, 0.2], [0.52, 1.45], [0.5, 1.62], [0.4, 1.82], [0.26, 1.98], [0.18, 2.1], [0.17, 2.6], [0.2, 2.64], [0.2, 2.74], [0.16, 2.78]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.MeshPhysicalMaterial({ color: col(tint), transmission: 1, thickness: 0.35, roughness: 0.06, ior: 1.42, clearcoat: 1, clearcoatRoughness: 0.08, attenuationColor: col(C.a), attenuationDistance: 3, specularIntensity: 1, envMapIntensity: 1.4, side: THREE.DoubleSide, transparent: true });
  const body = new THREE.Mesh(new THREE.LatheGeometry(P, 72), glass); g.add(body);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.15, 0.36, 32), new THREE.MeshStandardMaterial({ color: col(C.cork), roughness: 0.85 }));
  cork.position.y = 2.82; g.add(cork); g.userData.cork = cork;
  if (paper) {
    const pm = new THREE.MeshStandardMaterial({ color: col(C.paper), roughness: 0.7, emissive: col('#FFE7B0'), emissiveIntensity: 0.35 });
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.05, 40, 1, true), pm); roll.position.y = 0.85; g.add(roll);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 40), new THREE.MeshBasicMaterial({ color: col(C.a).multiplyScalar(2.2) }));
    edge.rotation.x = Math.PI / 2; edge.position.y = 0.85; g.add(edge);
    g.userData.paper = roll;
  }
  if (light) { const pl = new THREE.PointLight(col(C.a), light, 4, 2); pl.position.y = 0.9; g.add(pl); }
  g.traverse(o => { if (o.isMesh) o.renderOrder = 2; });
  return g;
}

// ---------- cielo con degradado y estrellas que titilan ----------
export function sky(scene, { top = '#020B15', mid = '#0A2238', hz = '#1C4A6C', stars = 1400 } = {}) {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { uT: { value: col(top) }, uM: { value: col(mid) }, uH: { value: col(hz) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uT,uM,uH; varying vec3 vP; void main(){ float y=vP.y; vec3 c = y>0. ? mix(uH,mix(uM,uT,smoothstep(.15,.7,y)),smoothstep(0.,.18,y)) : uH*.6; gl_FragColor=vec4(c,1.); }'
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), m); scene.add(dome);
  seed(3); const n = stars, pos = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n);
  for (let i = 0; i < n; i++) { const u = rnd() * Math.PI * 2, v = 0.03 + rnd() * 0.97, r = 800; const y = v * v; const k = Math.sqrt(1 - y * y); pos.set([Math.cos(u) * k * r, y * r, Math.sin(u) * k * r], i * 3); ph[i] = rnd() * 6.28; sz[i] = 0.6 + Math.pow(rnd(), 6) * 3.2; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); geo.setAttribute('sz', new THREE.BufferAttribute(sz, 1));
  const sm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPR: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: 'attribute float ph; attribute float sz; uniform float uTime,uPR; varying float vA; void main(){ vA = .55+.45*sin(uTime*(.6+fract(ph)*1.4)+ph); gl_PointSize = sz*uPR*1.6; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying float vA; void main(){ vec2 d=gl_PointCoord-.5; float a=smoothstep(.5,0.,length(d)); gl_FragColor=vec4(vec3(1.4),a*vA); }'
  });
  const pts = new THREE.Points(geo, sm); scene.add(pts);
  return { dome, stars: pts, update: t => { sm.uniforms.uTime.value = t; } };
}

// ---------- luna con halo (el bloom hace el resto) ----------
export function moon(r = 6) {
  const g = new THREE.Group();
  const tex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(234,246,242,.55)'); gr.addColorStop(.25, 'rgba(234,246,242,.18)'); gr.addColorStop(1, 'rgba(234,246,242,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return c; })());
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(r * 6); g.add(halo);
  const mm = new THREE.ShaderMaterial({ uniforms: { uC: { value: col(C.moon).multiplyScalar(1.6) } }, vertexShader: 'varying vec3 vN; varying vec2 vU; void main(){ vN=normalMatrix*normal; vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: 'uniform vec3 uC; varying vec3 vN; varying vec2 vU; float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);} float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);} void main(){ float m = n(vU*vec2(10.,5.))*.6+n(vU*vec2(24.,12.))*.4; float l = .55+.45*max(dot(normalize(vN),normalize(vec3(-.4,.3,1.))),0.); gl_FragColor=vec4(uC*l*(1.-smoothstep(.55,.85,m)*.18),1.); }' });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), mm));
  return g;
}

// ---------- mar de noche con olas, fresnel y reflejo de luna ----------
export function ocean({ size = 600, deep = '#03101C', skyc = '#1E4A6C', fog = '#123049', moonDir = [0, 0.35, -1], moonCol = '#EAF6F2', amp = 1, fogNear = 40, fogFar = 420 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, 220, 220); geo.rotateX(-Math.PI / 2);
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmp: { value: amp }, uDeep: { value: col(deep) }, uSky: { value: col(skyc) }, uFog: { value: col(fog) }, uMoonDir: { value: new THREE.Vector3(...moonDir).normalize() }, uMoon: { value: col(moonCol) }, uNear: { value: fogNear }, uFar: { value: fogFar }, uSpot: { value: new THREE.Vector4(0, 0, 0, 0) }, uSpotC: { value: col('#FFE7B0') } },
    vertexShader: `uniform float uTime,uAmp; varying vec3 vW; varying vec3 vN;
      float h(vec2 p){ return uAmp*( sin(p.x*.18+uTime*.7)*.35 + sin(p.y*.27+uTime*.9+p.x*.08)*.25 + sin((p.x*.6+p.y*.8)+uTime*1.6)*.07 + sin((p.x*-1.3+p.y*1.1)+uTime*2.1)*.035 ); }
      void main(){ vec3 p=position; vec2 q=(modelMatrix*vec4(p,1.)).xz; p.y+=h(q); float e=.15; vN=normalize(vec3(h(q-vec2(e,0))-h(q+vec2(e,0)),2.*e,h(q-vec2(0,e))-h(q+vec2(0,e)))); vW=(modelMatrix*vec4(p,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform vec3 uDeep,uSky,uFog,uMoonDir,uMoon,uSpotC; uniform float uNear,uFar,uTime; uniform vec4 uSpot; varying vec3 vW; varying vec3 vN;
      float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){ vec3 V=normalize(cameraPosition-vW), N=normalize(vN); float fr=pow(1.-max(dot(N,V),0.),5.);
        vec3 c=mix(uDeep,uSky,clamp(fr*1.2,0.,1.)); vec3 R=reflect(-V,N); float d=max(dot(R,uMoonDir),0.);
        float spark = step(.992, hs(floor(vW.xz*9.)+floor(uTime*4.)))*pow(d,10.)*1.6*smoothstep(7.,22.,length(vW-cameraPosition));
        c+=uMoon*(pow(d,600.)*1.0+pow(d,40.)*.04+spark*.35);
        if(uSpot.w>0.){ vec2 dd=vW.xz-uSpot.xy; float s=exp(-dot(dd,dd)/(uSpot.z*uSpot.z)); c+=uSpotC*s*uSpot.w*(.4+fr); }
        float dist=length(vW-cameraPosition); c=mix(c,uFog,smoothstep(uNear,uFar,dist)); gl_FragColor=vec4(c,1.); }`
  });
  const mesh = new THREE.Mesh(geo, m);
  const hAt = (x, z, t) => { const a = m.uniforms.uAmp.value; return a * (Math.sin(x * .18 + t * .7) * .35 + Math.sin(z * .27 + t * .9 + x * .08) * .25 + Math.sin((x * .6 + z * .8) + t * 1.6) * .07); };
  return { mesh, mat: m, hAt, update: t => { m.uniforms.uTime.value = t; } };
}

// ---------- cinta de voz: tubo con luz que fluye ----------
export function ribbon(points, { color = C.a, r = 0.035, speed = 0.6, dash = 9, glow = 2.4 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uC: { value: col(color).multiplyScalar(glow) }, uDraw: { value: 1 } },
    vertexShader: 'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float uTime,uDraw; uniform vec3 uC; varying vec2 vU; void main(){ float f=fract(vU.x*${dash.toFixed(1)}-uTime*${speed.toFixed(2)}); float a=smoothstep(0.,.15,f)*smoothstep(.75,.35,f); a=.25+a*.9; a*=step(vU.x,uDraw)*smoothstep(0.,.06,vU.x)*smoothstep(1.,.9,vU.x); gl_FragColor=vec4(uC,a); }`
  });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, r, 8, false), m);
  return { mesh, curve, mat: m, update: t => { m.uniforms.uTime.value = t; } };
}

// ---------- orbe de color (una voz) ----------
export function orb(color, r = 0.18, glow = 2) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ color: col(color).multiplyScalar(glow) })));
  return g;
}

// ---------- nubes suaves (sprites con textura procedural) ----------
let _cloudTex;
export function cloudTex() {
  if (_cloudTex) return _cloudTex;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); seed(17);
  for (let i = 0; i < 70; i++) { const px = 90 + rnd() * 330, py = 110 + (rnd() - .5) * 90 * (1 - Math.abs(px - 256) / 300), r = 30 + rnd() * 70; const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }
  return (_cloudTex = new THREE.CanvasTexture(c));
}
export function cloud(color = '#3A6A8E', s = 10, op = 0.9) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex(), color: col(color), transparent: true, opacity: op, depthWrite: false }));
  sp.scale.set(s * 2, s, 1); return sp;
}

// ---------- texto: entra palabra por palabra (stagger 40 ms, ease-out, desenfoque) ----------
export function splitIn(el, delay = 0) {
  if (!el) return;
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
  const spans = el.querySelectorAll('.w>span');
  if (REDUCE) return;
  animate(spans, { y: ['110%', '0%'], opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'], duration: 900, delay: stagger(45, { start: delay }), ease: 'outExpo' });
}
// aparece al entrar en pantalla (una vez)
export function reveal(sel = '[data-in]') {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const kids = e.target.querySelectorAll(':scope > *');
    if (REDUCE) return;
    animate(kids, { y: [28, 0], opacity: [0, 1], duration: 700, delay: stagger(50), ease: 'outExpo' });
  }), { threshold: 0.25 });
  document.querySelectorAll(sel).forEach(el => { if (!REDUCE) el.querySelectorAll(':scope > *').forEach(c => c.style.opacity = 0); io.observe(el); });
}
// botones: se hunden al tocar (squash 100 ms) y vuelven con resorte
export function pressy() {
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('pointerdown', () => animate(b, { scaleX: 1.04, scaleY: 0.92, duration: 100, ease: 'outQuad' }));
    const up = () => animate(b, { scaleX: 1, scaleY: 1, duration: 420, ease: 'outElastic(1,.5)' });
    b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
  });
}
export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const seg = (p, a, b) => clamp01((p - a) / (b - a)); // progreso dentro de un tramo del scroll
export const ease = x => 1 - Math.pow(1 - x, 3);
