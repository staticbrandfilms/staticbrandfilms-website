/* ============================================================
   STATIC BRAND FILMS — 3D Cinema Camera Hero
   Scroll-driven Three.js animation
   ============================================================ */

(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(max-width: 760px)').matches) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  /* ── Renderer ──────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ── Scene & Camera ────────────────────────────────────── */
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  cam.position.set(0, 0.8, 8);

  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  /* ── Lights ────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xfaf5ea, 0.5));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(5, 7, 6);
  scene.add(keyLight);

  const goldLight = new THREE.PointLight(0xF0C885, 5, 12);
  goldLight.position.set(-3, 2, 5);
  scene.add(goldLight);

  const rimLight = new THREE.DirectionalLight(0x4a9ab5, 2.0);
  rimLight.position.set(-6, 1, -3);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xfaf5ea, 0.7);
  fillLight.position.set(0, -4, 3);
  scene.add(fillLight);

  /* ── Materials ─────────────────────────────────────────── */
  const M = {
    body:     new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.22, metalness: 0.95 }),
    accent:   new THREE.MeshStandardMaterial({ color: 0xF0C885, roughness: 0.10, metalness: 1.00 }),
    grip:     new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.98, metalness: 0.00 }),
    lens:     new THREE.MeshStandardMaterial({ color: 0x020810, roughness: 0.00, metalness: 0.20, transparent: true, opacity: 0.88 }),
    lensBody: new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.14, metalness: 0.98 }),
    screen:   new THREE.MeshStandardMaterial({ color: 0x052839, roughness: 0.05, metalness: 0.10, emissive: 0x0a3347, emissiveIntensity: 0.7 }),
    red:      new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.40, metalness: 0.30 }),
  };

  /* ── Build cinema camera model ─────────────────────────── */
  const cg = new THREE.Group();

  const add = (geo, mat, pos, rot) => {
    const mesh = new THREE.Mesh(geo, mat);
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    cg.add(mesh);
    return mesh;
  };

  // Main body block
  add(new THREE.BoxGeometry(2.6, 1.55, 1.65), M.body);

  // Top & bottom accent strips
  add(new THREE.BoxGeometry(2.6, 0.055, 1.65), M.accent, [0,  0.802, 0]);
  add(new THREE.BoxGeometry(2.6, 0.045, 1.65), M.accent, [0, -0.797, 0]);

  // Lens mount ring
  add(new THREE.TorusGeometry(0.57, 0.048, 16, 48), M.accent, [0, 0, 0.86], [Math.PI/2, 0, 0]);

  // Lens barrel — 3 segments
  add(new THREE.CylinderGeometry(0.53, 0.49, 0.40, 32), M.lensBody, [0, 0, 1.06], [Math.PI/2, 0, 0]);
  add(new THREE.CylinderGeometry(0.47, 0.47, 0.18, 32), M.accent,   [0, 0, 1.34], [Math.PI/2, 0, 0]); // focus ring
  add(new THREE.CylinderGeometry(0.45, 0.45, 0.62, 32), M.lensBody, [0, 0, 1.70], [Math.PI/2, 0, 0]);
  add(new THREE.CylinderGeometry(0.40, 0.37, 0.58, 32), M.lensBody, [0, 0, 2.26], [Math.PI/2, 0, 0]);

  // Lens front glass element
  add(new THREE.CylinderGeometry(0.29, 0.29, 0.055, 32), M.lens,   [0, 0, 2.57], [Math.PI/2, 0, 0]);
  add(new THREE.TorusGeometry(0.29, 0.026, 8, 32),        M.accent, [0, 0, 2.59], [Math.PI/2, 0, 0]);

  // Top handle arch
  add(new THREE.BoxGeometry(0.24, 0.30, 1.5), M.body,   [0, 0.925, -0.08]);
  add(new THREE.BoxGeometry(2.0,  0.18, 0.30), M.body,  [0, 1.075, -0.08]);
  add(new THREE.BoxGeometry(1.1,  0.17, 0.26), M.grip,  [0.32, 1.075, -0.08]);

  // Viewfinder
  add(new THREE.BoxGeometry(0.58, 0.44, 0.58), M.body,     [-0.68, 0.94, -0.68]);
  add(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16), M.lensBody, [-0.68, 0.94, -0.99], [Math.PI/2, 0, 0]);

  // 15mm support rails
  const rail = new THREE.CylinderGeometry(0.044, 0.044, 3.0, 16);
  add(rail, M.accent, [0, -0.85, 0.40],  [0, 0, Math.PI/2]);
  add(rail, M.accent, [0, -0.85, -0.30], [0, 0, Math.PI/2]);

  // Baseplate
  add(new THREE.BoxGeometry(3.0, 0.09, 0.85), M.lensBody, [0, -0.895, 0.05]);

  // Flip-out monitor (left side)
  add(new THREE.BoxGeometry(0.065, 0.80, 1.02), M.screen, [-1.35, 0.0, -0.05]);
  add(new THREE.BoxGeometry(0.042, 0.86, 1.08), M.accent, [-1.364, 0.0, -0.05]);

  // Control buttons (front face)
  add(new THREE.CylinderGeometry(0.058, 0.058, 0.04, 12), M.red,    [0.92, 0.52, 0.86], [Math.PI/2, 0, 0]);
  add(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 12), M.accent, [0.67, 0.52, 0.86], [Math.PI/2, 0, 0]);
  add(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 12), M.body,   [0.46, 0.52, 0.86], [Math.PI/2, 0, 0]);

  // ND filter slot
  add(new THREE.BoxGeometry(0.09, 0.50, 0.025), M.accent, [1.26, 0.1, 0.86]);

  /* ── Initial pose — dramatic 3/4 front-left ────────────── */
  cg.rotation.y = -0.5;
  cg.rotation.x =  0.12;
  cg.position.set(1.4, -0.3, 0);
  scene.add(cg);

  /* ── Scroll state ──────────────────────────────────────── */
  let scrollY = 0, rawScrollY = 0;
  window.addEventListener('scroll', () => { rawScrollY = window.scrollY; }, { passive: true });

  /* ── Render loop ───────────────────────────────────────── */
  let time = 0;
  function animate(ts) {
    requestAnimationFrame(animate);
    time = ts * 0.001;

    // Smooth scroll lerp
    scrollY += (rawScrollY - scrollY) * 0.065;

    const hero = document.querySelector('.hero');
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    const p = Math.min(1, scrollY / heroH); // 0 at top → 1 at bottom of hero

    // Scroll-driven camera rotation and movement
    cg.rotation.y = -0.5 + p * Math.PI * 0.55;
    cg.rotation.x =  0.12 + p * 0.08;
    cg.position.x =  1.4 - p * 1.0;

    // Subtle idle float (dampens as user scrolls)
    cg.position.y = -0.3 + Math.sin(time * 0.65) * 0.055 * (1 - p) - p * 2.2;

    // Gold lens light breathing
    goldLight.intensity = 4.0 + Math.sin(time * 1.6) * 0.9;

    // Fade out canvas as camera exits
    canvas.style.opacity = Math.max(0, 1 - p * 1.9).toString();

    renderer.render(scene, cam);
  }
  requestAnimationFrame(animate);
})();
