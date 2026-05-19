/**
 * Scène 3D — « Champ de Signaux »
 *
 * Métaphore visuelle de la téléphonie mobile :
 *  - Une plaine low-poly (sol avec relief subtil) = territoire algérien stylisé
 *  - 3 antennes lumineuses verticales = opérateurs (Mobilis / Djezzy / Ooredoo),
 *    hauteurs proportionnelles à leurs parts de marché
 *  - Anneaux d'ondes radio qui émanent de chaque antenne et se propagent
 *  - Particules de communication qui voyagent en arcs paraboliques entre les
 *    antennes (= appels et SMS qui transitent)
 *  - Atmosphère : brume, halo, vol stationnaire de "spec dust"
 *  - Auto-rotation lente + OrbitControls + tooltip au survol des antennes
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { DATASET } from './data.js';

export function initScene3D(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  // === SCENE ===
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.035);

  // === CAMERA ===
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
  camera.position.set(8, 6, 12);
  camera.lookAt(0, 1, 0);

  // === RENDERER ===
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // === LIGHTS ===
  scene.add(new THREE.AmbientLight(0xf4ede0, 0.25));

  const moonLight = new THREE.DirectionalLight(0xc9d6f5, 0.4);
  moonLight.position.set(5, 10, 5);
  scene.add(moonLight);

  const goldRim = new THREE.PointLight(0xd4a437, 0.8, 25);
  goldRim.position.set(-6, 4, -4);
  scene.add(goldRim);

  // === SOL — plaine low-poly avec relief subtil ===
  const groundSize = 24;
  const groundSegments = 48;
  const groundGeom = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);

  // Déplacement vertical pour créer un terrain doux
  const gPos = groundGeom.attributes.position;
  for (let i = 0; i < gPos.count; i++) {
    const x = gPos.getX(i);
    const y = gPos.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    const z = Math.sin(x * 0.5) * 0.15
            + Math.cos(y * 0.4) * 0.12
            + Math.sin(dist * 0.3) * 0.1
            - dist * 0.05; // bord descendant pour effet horizon
    gPos.setZ(i, z);
  }
  groundGeom.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a2238,
    flatShading: true,
    metalness: 0.05,
    roughness: 0.85,
    wireframe: false
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  scene.add(ground);

  // Couche filaire dorée par-dessus pour le grain "technique"
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xd4a437,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const groundWire = new THREE.Mesh(groundGeom.clone(), wireMat);
  groundWire.rotation.x = -Math.PI / 2;
  groundWire.position.y = -0.998;
  scene.add(groundWire);

  // === ANTENNES (3 opérateurs) ===
  // Positions disposées en triangle, échelle relative aux parts de marché
  const operators = DATASET.operateurs;
  const positions3D = [
    { x: -3.5, z:  1.0 },  // Mobilis (gauche)
    { x:  3.5, z:  1.5 },  // Djezzy (droite)
    { x:  0,   z: -3.0 }   // Ooredoo (arrière)
  ];

  // Échelle de hauteur : la plus grande part de marché = 4.5, la plus petite = 2.8
  const maxPart = Math.max(...operators.map(o => o.part));
  const minPart = Math.min(...operators.map(o => o.part));
  const minH = 2.8, maxH = 4.5;

  const antennas = operators.map((op, i) => {
    const grp = new THREE.Group();
    const colorHex = parseInt(op.couleur.replace('#', ''), 16);
    const h = minH + ((op.part - minPart) / (maxPart - minPart)) * (maxH - minH);

    // Mât (cylindre fin)
    const mastGeom = new THREE.CylinderGeometry(0.05, 0.08, h, 8);
    const mastMat = new THREE.MeshStandardMaterial({
      color: 0x1a2238,
      metalness: 0.7,
      roughness: 0.3,
      emissive: colorHex,
      emissiveIntensity: 0.15
    });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.y = h / 2 - 1;
    grp.add(mast);

    // Structure haubanée — 3 lignes obliques vers la base
    const haubanMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.35
    });
    for (let a = 0; a < 3; a++) {
      const ang = (a / 3) * Math.PI * 2;
      const baseR = 0.6;
      const points = [
        new THREE.Vector3(0, h - 1, 0),
        new THREE.Vector3(Math.cos(ang) * baseR, -1, Math.sin(ang) * baseR)
      ];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      grp.add(new THREE.Line(lineGeom, haubanMat));
    }

    // Sphère lumineuse au sommet (signal)
    const tipGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const tipMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 1.5
    });
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.y = h - 1;
    grp.add(tip);

    // Halo autour de la sphère
    const haloGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.y = h - 1;
    grp.add(halo);

    // Lampe ponctuelle (illumination locale)
    const pointLight = new THREE.PointLight(colorHex, 1.2, 8);
    pointLight.position.y = h - 1;
    grp.add(pointLight);

    grp.position.set(positions3D[i].x, 0, positions3D[i].z);
    grp.userData = {
      op,
      tipPos: new THREE.Vector3(positions3D[i].x, h - 1, positions3D[i].z),
      basePos: new THREE.Vector3(positions3D[i].x, -1, positions3D[i].z),
      height: h,
      colorHex,
      tip
    };

    scene.add(grp);
    return grp;
  });

  // === ANNEAUX D'ONDES RADIO ===
  // Chaque antenne émet périodiquement un anneau qui s'étend horizontalement,
  // grandit, et s'estompe.
  const ringPool = [];
  const RING_COUNT_PER_ANTENNA = 5;

  antennas.forEach((ant) => {
    for (let i = 0; i < RING_COUNT_PER_ANTENNA; i++) {
      const ringGeom = new THREE.RingGeometry(1, 1.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ant.userData.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(ant.userData.basePos);
      ring.position.y = -0.92; // juste au-dessus du sol
      ring.userData = {
        antenna: ant,
        // Décalage temporel pour étaler les ondes
        phase: (i / RING_COUNT_PER_ANTENNA) * 3.0
      };
      scene.add(ring);
      ringPool.push(ring);
    }
  });

  // === ARCS DE COMMUNICATION ===
  // Particules qui voyagent en arc parabolique d'une antenne vers une autre
  // Beaucoup plus de "voix" (épais) que de "SMS" (fins) pour refléter les volumes.
  const ARC_PARTICLE_COUNT = 24;
  const arcs = [];

  function pickArcPair() {
    const i = Math.floor(Math.random() * 3);
    let j = Math.floor(Math.random() * 2);
    if (j >= i) j++;
    return [i, j];
  }

  for (let i = 0; i < ARC_PARTICLE_COUNT; i++) {
    const [a, b] = pickArcPair();
    const size = Math.random() < 0.7 ? 0.08 : 0.05;
    const isVoice = Math.random() < 0.85;
    const colorChoice = isVoice
      ? new THREE.Color(0xd4a437)         // voix = or chaud
      : new THREE.Color(0xf4ede0);        // sms = blanc cream

    const particleGeom = new THREE.SphereGeometry(size, 12, 12);
    const particleMat = new THREE.MeshBasicMaterial({
      color: colorChoice,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const particle = new THREE.Mesh(particleGeom, particleMat);

    // Petite traînée derrière (sprite plus grand, plus transparent)
    const trailGeom = new THREE.SphereGeometry(size * 2.5, 8, 8);
    const trailMat = new THREE.MeshBasicMaterial({
      color: colorChoice,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const trail = new THREE.Mesh(trailGeom, trailMat);

    scene.add(particle);
    scene.add(trail);

    arcs.push({
      particle,
      trail,
      from: a,
      to: b,
      // Paramètre 0..1 — position le long de la courbe
      t: Math.random(),
      // Vitesse — voix plus rapides que SMS pour effet visuel
      speed: 0.18 + Math.random() * 0.2,
      // Hauteur max de l'arc
      arcHeight: 2.5 + Math.random() * 2.5,
      isVoice
    });
  }

  function resetArc(arc) {
    const [a, b] = pickArcPair();
    arc.from = a;
    arc.to = b;
    arc.t = 0;
    arc.arcHeight = 2.5 + Math.random() * 2.5;
    arc.speed = 0.18 + Math.random() * 0.2;
  }

  // === POUSSIERE ATMOSPHERIQUE ===
  // Petites particules flottantes pour donner du grain à l'air
  const dustCount = 200;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3]     = (Math.random() - 0.5) * 22;
    dustPos[i * 3 + 1] = Math.random() * 8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }
  const dustGeom = new THREE.BufferGeometry();
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xd4a437,
    size: 0.04,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dust = new THREE.Points(dustGeom, dustMat);
  scene.add(dust);

  // === CONTROLS ===
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.target.set(0, 0.5, 0);

  // === RAYCASTER ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute; pointer-events: none;
    background: rgba(17, 23, 41, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(212, 164, 55, 0.4);
    border-radius: 8px; padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: #f4ede0;
    opacity: 0; transition: opacity 0.2s;
    z-index: 10; white-space: nowrap;
  `;
  container.appendChild(tooltip);

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    tooltip.style.left = (e.clientX - rect.left + 14) + 'px';
    tooltip.style.top = (e.clientY - rect.top + 14) + 'px';
  }
  renderer.domElement.addEventListener('pointermove', onPointerMove);

  // === RESIZE ===
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  // === ANIMATION ===
  const clock = new THREE.Clock();
  let frameId;
  const tmpVec = new THREE.Vector3();

  function animate() {
    frameId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.getElapsedTime();

    // Pulse des sphères de sommet
    antennas.forEach((ant, i) => {
      const pulse = 1 + Math.sin(t * 2.5 + i * 1.3) * 0.15;
      ant.userData.tip.scale.set(pulse, pulse, pulse);
    });

    // Anneaux d'ondes — cycle expansion/fade
    const RING_CYCLE = 3.5; // secondes
    const RING_MAX_SCALE = 7.5;
    ringPool.forEach(ring => {
      const cycleT = ((t + ring.userData.phase) % RING_CYCLE) / RING_CYCLE;
      const scale = 0.5 + cycleT * RING_MAX_SCALE;
      ring.scale.set(scale, scale, scale);
      // Opacité : monte rapidement puis s'estompe
      const fadeIn = Math.min(cycleT * 6, 1);
      const fadeOut = 1 - cycleT;
      ring.material.opacity = 0.65 * fadeIn * fadeOut;
    });

    // Arcs de communication
    arcs.forEach(arc => {
      arc.t += dt * arc.speed;
      if (arc.t >= 1) {
        resetArc(arc);
      }
      // Position sur courbe parabolique entre from.tip et to.tip
      const fromPos = antennas[arc.from].userData.tipPos;
      const toPos = antennas[arc.to].userData.tipPos;
      tmpVec.lerpVectors(fromPos, toPos, arc.t);
      // Hauteur ajoutée — parabole : 4 * t * (1-t)
      const h = 4 * arc.t * (1 - arc.t) * arc.arcHeight;
      arc.particle.position.set(tmpVec.x, tmpVec.y + h, tmpVec.z);
      arc.trail.position.copy(arc.particle.position);
      // Fade in/out
      const alpha = Math.sin(arc.t * Math.PI);
      arc.particle.material.opacity = 0.9 * alpha;
      arc.trail.material.opacity = 0.2 * alpha;
    });

    // Poussière atmosphérique — léger mouvement
    const dPos = dust.geometry.attributes.position;
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3 + 1;
      dPos.array[idx] += dt * 0.15;
      if (dPos.array[idx] > 8) dPos.array[idx] = 0;
    }
    dPos.needsUpdate = true;
    dust.rotation.y += dt * 0.02;

    // Raycaster — survol des antennes
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(antennas, true);
    if (hits.length > 0) {
      let parent = hits[0].object;
      while (parent && !parent.userData.op) parent = parent.parent;
      if (parent && parent.userData.op) {
        const op = parent.userData.op;
        tooltip.textContent = `${op.marque} · ${op.part}% · ${(op.abonnes / 1e6).toFixed(2)}M`;
        tooltip.style.opacity = '1';
        renderer.domElement.style.cursor = 'pointer';
      }
    } else {
      tooltip.style.opacity = '0';
      renderer.domElement.style.cursor = 'grab';
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // === API ===
  return {
    dispose() {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      renderer.dispose();
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
      if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
