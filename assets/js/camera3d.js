/* ============================================================
   STATIC BRAND FILMS — 3D Cinema Camera
   ES module · Three.js r160 · PBR + post-processing
   ============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { EffectComposer }  from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass }      from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';

/* ── guard ─────────────────────────────────────────────────── */
if (window.matchMedia('(max-width: 760px)').matches) throw 0;
const canvas = document.getElementById('hero-canvas');
if (!canvas) throw 0;

/* ── renderer ──────────────────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping   = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace    = THREE.SRGBColorSpace;

/* ── scene ─────────────────────────────────────────────────── */
const scene = new THREE.Scene();

/* ── environment map (makes metals look real) ──────────────── */
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ── camera ─────────────────────────────────────────────────  */
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
cam.position.set(0, 0.5, 9.5);

/* ── resize ─────────────────────────────────────────────────  */
let W = 0, H = 0;
function onResize() {
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  renderer.setSize(W, H, false);
  cam.aspect = W / H;
  cam.updateProjectionMatrix();
  composer.setSize(W, H);
  bloom.resolution.set(W, H);
}

/* ── lights  ────────────────────────────────────────────────  */
scene.add(new THREE.AmbientLight(0xfaf5ea, 0.25));

const key = new THREE.DirectionalLight(0xffffff, 9);
key.position.set(5, 9, 7);
scene.add(key);

const goldSpot = new THREE.SpotLight(0xF0C885, 28, 18, Math.PI / 5.5, 0.25);
goldSpot.position.set(-4, 3, 7);
scene.add(goldSpot);

const tealRim = new THREE.DirectionalLight(0x4a9ab5, 5);
tealRim.position.set(-6, 1, -9);
scene.add(tealRim);

const fill = new THREE.DirectionalLight(0x0d2236, 3);
fill.position.set(0, -7, 3);
scene.add(fill);

const lensGlow = new THREE.PointLight(0xc8e0ff, 5, 5);
lensGlow.position.set(0, 0, 3.5);
scene.add(lensGlow);

/* ── materials (PBR, clearcoat, iridescence) ───────────────── */
const M = {
  body: new THREE.MeshPhysicalMaterial({
    color: 0x0e0e0e, metalness: 0.95, roughness: 0.12,
    clearcoat: 0.9, clearcoatRoughness: 0.08,
  }),
  accent: new THREE.MeshPhysicalMaterial({
    color: 0xE4B960, metalness: 1.0, roughness: 0.05,
    clearcoat: 0.5,
  }),
  grip: new THREE.MeshPhysicalMaterial({
    color: 0x141414, metalness: 0.0, roughness: 1.0,
  }),
  lensBody: new THREE.MeshPhysicalMaterial({
    color: 0x080808, metalness: 0.98, roughness: 0.08,
    clearcoat: 0.7, clearcoatRoughness: 0.04,
  }),
  lensGlass: new THREE.MeshPhysicalMaterial({
    color: 0x010306, metalness: 0.0, roughness: 0.0,
    transmission: 0.4, opacity: 0.9, transparent: true,
    ior: 1.72, thickness: 0.25,
  }),
  lensCoat: new THREE.MeshPhysicalMaterial({
    color: 0x1a3050, metalness: 0.0, roughness: 0.0,
    iridescence: 1.0, iridescenceIOR: 1.5,
    iridescenceThicknessRange: [80, 380],
    transparent: true, opacity: 0.6,
  }),
  chrome: new THREE.MeshPhysicalMaterial({
    color: 0x999999, metalness: 1.0, roughness: 0.02,
    clearcoat: 1.0, clearcoatRoughness: 0.0,
  }),
  screen: new THREE.MeshPhysicalMaterial({
    color: 0x020e1a, metalness: 0.0, roughness: 0.05,
    emissive: 0x052839, emissiveIntensity: 1.4,
  }),
  recBtn: new THREE.MeshPhysicalMaterial({
    color: 0xcc1111, metalness: 0.2, roughness: 0.3,
    emissive: 0x550000, emissiveIntensity: 0.4,
  }),
};

/* ── helpers ─────────────────────────────────────────────────  */
const cg = new THREE.Group();

function mesh(geo, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(px, py, pz);
  m.rotation.set(rx, ry, rz);
  cg.add(m); return m;
}

/* ── BODY ────────────────────────────────────────────────────  */
mesh(new THREE.BoxGeometry(2.85, 1.65, 1.75), M.body);

// Top / bottom accent rails
mesh(new THREE.BoxGeometry(2.87, 0.058, 1.77), M.accent,  0,  0.857, 0);
mesh(new THREE.BoxGeometry(2.87, 0.048, 1.77), M.accent,  0, -0.852, 0);

/* ── LENS MOUNT ──────────────────────────────────────────────  */
mesh(new THREE.TorusGeometry(0.63, 0.052, 20, 72), M.accent,    0, 0, 0.90, Math.PI/2);
mesh(new THREE.TorusGeometry(0.59, 0.028, 16, 72), M.lensBody,  0, 0, 0.89, Math.PI/2);

/* ── LENS BARREL — LatheGeometry (smooth revolution) ─────────  */
// Points are (radius, y) — we rotate 90° on X to face forward
const barrelPts = [
  new THREE.Vector2(0.630, 0.00),
  new THREE.Vector2(0.660, 0.12),
  new THREE.Vector2(0.640, 0.40),
  new THREE.Vector2(0.590, 0.72),
  new THREE.Vector2(0.560, 0.95),  // groove 1
  new THREE.Vector2(0.575, 1.12),
  new THREE.Vector2(0.555, 1.30),  // groove 2 (focus ring)
  new THREE.Vector2(0.575, 1.48),
  new THREE.Vector2(0.550, 1.75),
  new THREE.Vector2(0.520, 2.05),
  new THREE.Vector2(0.475, 2.35),
  new THREE.Vector2(0.420, 2.58),
  new THREE.Vector2(0.375, 2.72),
  new THREE.Vector2(0.345, 2.80),
];
const barrelGeo = new THREE.LatheGeometry(barrelPts, 72);
const barrel = new THREE.Mesh(barrelGeo, M.lensBody);
barrel.rotation.x = Math.PI / 2;
barrel.position.z = 0.90;
cg.add(barrel);

// Focus ring accent
const focusPts = [
  new THREE.Vector2(0.568, 0.00),
  new THREE.Vector2(0.582, 0.04),
  new THREE.Vector2(0.582, 0.20),
  new THREE.Vector2(0.568, 0.24),
];
const focusRingGeo = new THREE.LatheGeometry(focusPts, 72);
const focusRing = new THREE.Mesh(focusRingGeo, M.accent);
focusRing.rotation.x = Math.PI / 2;
focusRing.position.z = 0.90 + 1.28;
cg.add(focusRing);

// Aperture ring
const aperturePts = [
  new THREE.Vector2(0.562, 0.00),
  new THREE.Vector2(0.576, 0.04),
  new THREE.Vector2(0.576, 0.16),
  new THREE.Vector2(0.562, 0.20),
];
const apertureGeo = new THREE.LatheGeometry(aperturePts, 72);
const apertureRing = new THREE.Mesh(apertureGeo, M.accent);
apertureRing.rotation.x = Math.PI / 2;
apertureRing.position.z = 0.90 + 2.00;
cg.add(apertureRing);

/* ── LENS FRONT ELEMENT ──────────────────────────────────────  */
// Glass disk — uses transmission for realistic look
const glassGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.065, 72);
const glassMesh = new THREE.Mesh(glassGeo, M.lensGlass);
glassMesh.rotation.x = Math.PI / 2;
glassMesh.position.z = 0.90 + 2.80;
cg.add(glassMesh);

// Iridescent coating on the glass
const coatGeo = new THREE.CircleGeometry(0.30, 72);
const coatMesh = new THREE.Mesh(coatGeo, M.lensCoat);
coatMesh.position.z = 0.90 + 2.84;
cg.add(coatMesh);

// Front rim ring (gold)
mesh(new THREE.TorusGeometry(0.32, 0.022, 12, 72), M.accent, 0, 0, 0.90 + 2.84, Math.PI/2);

/* ── TOP HANDLE ──────────────────────────────────────────────  */
mesh(new THREE.BoxGeometry(0.24, 0.30, 1.60), M.body,  0,  0.975, -0.10);
mesh(new THREE.BoxGeometry(1.95, 0.20, 0.34), M.body,  0,  1.125, -0.10);
mesh(new THREE.BoxGeometry(1.15, 0.18, 0.30), M.grip,  0.25, 1.125, -0.10);
// Handle accent screws
[-0.55, 0, 0.55].forEach(x => {
  mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), M.accent, x, 1.23, -0.10, Math.PI/2);
});

/* ── VIEWFINDER ──────────────────────────────────────────────  */
mesh(new THREE.BoxGeometry(0.62, 0.50, 0.65), M.body, -0.72, 1.00, -0.72);
mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.24, 20), M.lensBody, -0.72, 1.00, -1.07, Math.PI/2);
mesh(new THREE.TorusGeometry(0.115, 0.015, 8, 20), M.accent, -0.72, 1.00, -1.085, Math.PI/2);

/* ── 15MM SUPPORT RAILS (chrome) ────────────────────────────  */
const railGeo = new THREE.CylinderGeometry(0.050, 0.050, 3.6, 24);
mesh(railGeo, M.chrome,  0, -0.90,  0.46, 0, 0, Math.PI/2);
mesh(railGeo, M.chrome,  0, -0.90, -0.38, 0, 0, Math.PI/2);

/* ── BASEPLATE ────────────────────────────────────────────────  */
mesh(new THREE.BoxGeometry(3.30, 0.11, 0.98), M.lensBody,  0, -0.975, 0.04);
mesh(new THREE.BoxGeometry(3.32, 0.04, 1.00), M.chrome,    0, -1.005, 0.04);

/* ── FLIP-OUT MONITOR ─────────────────────────────────────────  */
mesh(new THREE.BoxGeometry(0.065, 0.90, 1.15), M.screen,  -1.47, 0.06, -0.08);
mesh(new THREE.BoxGeometry(0.030, 0.92, 1.17), M.body,    -1.485, 0.06, -0.08);
mesh(new THREE.BoxGeometry(0.040, 0.96, 1.21), M.accent,  -1.49, 0.06, -0.08);

/* ── FRONT CONTROLS ──────────────────────────────────────────  */
// REC button
mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.048, 16), M.recBtn, 0.96, 0.58, 0.93, Math.PI/2);
mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16), M.accent, 0.96, 0.58, 0.935, Math.PI/2);
// Other buttons
mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.048, 14), M.accent, 0.72, 0.58, 0.93, Math.PI/2);
mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.048, 14), M.lensBody, 0.52, 0.58, 0.93, Math.PI/2);

// ND filter slot
mesh(new THREE.BoxGeometry(0.11, 0.58, 0.030), M.accent, 1.32, 0.13, 0.92);

/* ── INITIAL POSE ────────────────────────────────────────────  */
cg.rotation.y = -Math.PI * 0.22;
cg.rotation.x =  0.07;
cg.scale.setScalar(1.08);
scene.add(cg);

/* ── POST-PROCESSING ─────────────────────────────────────────  */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cam));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.30,  // strength
  0.25,  // radius
  0.88   // threshold
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

window.addEventListener('resize', onResize);
onResize();

/* ── SCROLL ──────────────────────────────────────────────────  */
let scrollY = 0, rawY = 0;
window.addEventListener('scroll', () => { rawY = window.scrollY; }, { passive: true });

/* Smooth cubic ease — same curve Apple uses */
function ease(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

/* ── RENDER LOOP ─────────────────────────────────────────────  */
let t = 0;
(function loop(ts) {
  requestAnimationFrame(loop);
  t = ts * 0.001;

  /* smooth scroll */
  scrollY += (rawY - scrollY) * 0.075;

  const heroH = (document.querySelector('.hero') || {}).offsetHeight || window.innerHeight;
  const rawP  = Math.min(1, scrollY / heroH);
  const p     = ease(rawP);

  /* scroll-driven animation */
  cg.rotation.y = -Math.PI * 0.22 + p * Math.PI * 1.30;   // 234° sweep
  cg.rotation.x =  0.07 + Math.sin(p * Math.PI) * 0.14;   // arc tilt

  /* idle float (fades when scrolling) */
  const idle = Math.max(0, 1 - rawP * 4);
  cg.position.y = Math.sin(t * 0.65) * 0.055 * idle - p * 2.6;
  cg.position.x = -p * 0.5;

  /* lens glow + bloom peaks when lens faces viewer (~50% scroll) */
  const facing     = Math.max(0, Math.sin(p * Math.PI));
  lensGlow.intensity = 4.0 + Math.sin(t * 1.3) * 0.9;
  goldSpot.intensity = 24 + Math.sin(t * 0.8) * 4;
  bloom.strength   = 0.28 + facing * 0.55;

  /* fade canvas as camera exits */
  canvas.style.opacity = Math.max(0, 1 - rawP * 1.85).toString();

  composer.render();
})();
