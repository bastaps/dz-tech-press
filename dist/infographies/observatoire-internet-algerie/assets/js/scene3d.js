/**
 * Scène 3D — "Constellation des Données"
 * Mix créatif :
 *  - Un cristal central (icosaèdre filaire) = cœur du marché
 *  - 3 orbes orbitant = opérateurs (Mobilis / Ooredoo / Djezzy) avec tailles proportionnelles au M2M
 *  - Champ de particules = 60,46M abonnés (représentation symbolique)
 *  - Lignes de connexion énergétiques entre cristal et orbes
 *  - Auto-rotation + OrbitControls (drag/zoom)
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { DATASET } from './data.js';

export function initScene3D(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  // === SCENE ===
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

  // === CAMERA ===
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 2, 12);

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
  const ambient = new THREE.AmbientLight(0xf4ede0, 0.3);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(0xd4a437, 2.5, 30);
  goldLight.position.set(5, 5, 5);
  scene.add(goldLight);

  const emeraldLight = new THREE.PointLight(0x2d8a5f, 1.5, 25);
  emeraldLight.position.set(-5, -3, 4);
  scene.add(emeraldLight);

  const crimsonLight = new THREE.PointLight(0xb85042, 1, 20);
  crimsonLight.position.set(3, -5, -3);
  scene.add(crimsonLight);

  // === CRISTAL CENTRAL ===
  // Icosaèdre filaire — symbolise le réseau / cœur du marché
  const crystalGroup = new THREE.Group();
  scene.add(crystalGroup);

  // Squelette filaire principal
  const crystalGeom = new THREE.IcosahedronGeometry(2.2, 1);
  const crystalMat = new THREE.MeshBasicMaterial({
    color: 0xd4a437,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });
  const crystal = new THREE.Mesh(crystalGeom, crystalMat);
  crystalGroup.add(crystal);

  // Cristal solide intérieur — verre subtil
  const innerGeom = new THREE.IcosahedronGeometry(1.6, 0);
  const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2238,
    metalness: 0.3,
    roughness: 0.15,
    transmission: 0.5,
    thickness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.85,
    emissive: 0xd4a437,
    emissiveIntensity: 0.05
  });
  const inner = new THREE.Mesh(innerGeom, innerMat);
  crystalGroup.add(inner);

  // Halo lumineux autour du cristal
  const haloGeom = new THREE.SphereGeometry(2.6, 32, 32);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPos;
      uniform float uTime;
      void main() {
        float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        vec3 color = mix(vec3(0.83, 0.64, 0.21), vec3(0.18, 0.54, 0.37), sin(uTime * 0.3) * 0.5 + 0.5);
        gl_FragColor = vec4(color * intensity, intensity * 0.5);
      }
    `
  });
  const halo = new THREE.Mesh(haloGeom, haloMat);
  crystalGroup.add(halo);

  // === ORBES ORBITANT (OPERATEURS) ===
  // 3 orbes, taille proportionnelle à part M2M, lumière à la couleur de la marque
  const operatorsGroup = new THREE.Group();
  scene.add(operatorsGroup);

  const operators = DATASET.m2m.operateurs;
  const orbiters = operators.map((op, i) => {
    const baseRadius = 0.25 + (op.part / 100) * 0.8; // 0.25 à ~0.6
    const angle = (i / operators.length) * Math.PI * 2;
    const distance = 4.5;

    const grp = new THREE.Group();
    grp.userData = { angle, distance, speed: 0.15 + i * 0.05, op };

    // Sphère
    const sphereGeom = new THREE.SphereGeometry(baseRadius, 32, 32);
    const colorHex = parseInt(op.couleur.replace('#', ''), 16);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 0.6,
      roughness: 0.25,
      emissive: colorHex,
      emissiveIntensity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    grp.add(sphere);

    // Petit halo autour
    const orbHaloGeom = new THREE.SphereGeometry(baseRadius * 1.4, 24, 24);
    const orbHaloMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    grp.add(new THREE.Mesh(orbHaloGeom, orbHaloMat));

    operatorsGroup.add(grp);
    return grp;
  });

  // === LIGNES DE CONNEXION (cristal <-> orbiters) ===
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xd4a437,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const lines = orbiters.map(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    return new THREE.Line(geom, lineMat);
  });
  lines.forEach(l => scene.add(l));

  // === CHAMP DE PARTICULES (abonnés) ===
  // 3000 points qui symbolisent les 60M+ abonnés
  const particleCount = 3000;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  const goldRGB = new THREE.Color(0xd4a437);
  const emeraldRGB = new THREE.Color(0x2d8a5f);
  const creamRGB = new THREE.Color(0xf4ede0);

  for (let i = 0; i < particleCount; i++) {
    // Distribution sphérique avec préférence couche externe
    const r = 5 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = Math.random() * 0.05 + 0.02;

    // 88,72% mobile -> couleur or, 11,28% fixe -> couleur cream
    const isMobile = Math.random() < 0.8872;
    const c = isMobile ? goldRGB : (Math.random() < 0.5 ? emeraldRGB : creamRGB);
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeom = new THREE.BufferGeometry();
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec3 pos = position;
        // Rotation lente du champ
        float a = uTime * 0.05;
        float c = cos(a), s = sin(a);
        pos.xz = mat2(c, -s, s, c) * pos.xz;
        // Petite respiration
        pos *= 1.0 + sin(uTime * 0.3 + position.x * 0.5) * 0.02;

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * 300.0 / -mvPos.z;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Point rond avec halo
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, alpha * 0.9);
      }
    `
  });

  const particles = new THREE.Points(particleGeom, particleMat);
  scene.add(particles);

  // === ANNEAUX ORBITAUX SUBTILS ===
  const ringGeom = new THREE.RingGeometry(4.4, 4.55, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd4a437,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = Math.PI / 2.3;
  scene.add(ring);

  // === CONTROLS ===
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 18;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minPolarAngle = Math.PI * 0.15;

  // === RAYCASTER (hover sur orbes) ===
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredOp = null;
  let tooltip = document.getElementById('scene-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'scene-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      pointer-events: none;
      background: rgba(17, 23, 41, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(212, 164, 55, 0.4);
      border-radius: 8px;
      padding: 8px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #f4ede0;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
      white-space: nowrap;
    `;
    container.appendChild(tooltip);
  }

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
    tooltip.style.top = (e.clientY - rect.top + 12) + 'px';
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

  // === ANIMATION LOOP ===
  const clock = new THREE.Clock();
  let frameId;

  function animate() {
    frameId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    // Cristal — rotation lente sur 2 axes
    crystalGroup.rotation.y += dt * 0.15;
    crystalGroup.rotation.x += dt * 0.05;
    inner.rotation.y -= dt * 0.1;

    // Halo shader
    haloMat.uniforms.uTime.value = t;
    particleMat.uniforms.uTime.value = t;

    // Orbiters — orbites autour du cristal
    orbiters.forEach((grp, i) => {
      grp.userData.angle += dt * grp.userData.speed;
      const a = grp.userData.angle;
      const d = grp.userData.distance;
      // Plan orbital légèrement incliné, différent par opérateur
      const tilt = (i - 1) * 0.3;
      grp.position.set(
        Math.cos(a) * d,
        Math.sin(a * 0.7 + tilt) * 1.2,
        Math.sin(a) * d
      );
      // Pulsation légère
      const s = 1 + Math.sin(t * 2 + i) * 0.05;
      grp.scale.set(s, s, s);

      // Update ligne de connexion
      const linePos = lines[i].geometry.attributes.position;
      linePos.setXYZ(0, 0, 0, 0);
      linePos.setXYZ(1, grp.position.x, grp.position.y, grp.position.z);
      linePos.needsUpdate = true;
    });

    // Hover detection
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(operatorsGroup.children, true);
    if (intersects.length > 0) {
      const grp = intersects[0].object.parent;
      if (grp && grp.userData.op) {
        hoveredOp = grp.userData.op;
        tooltip.textContent = `${hoveredOp.marque} — ${hoveredOp.part}% (${hoveredOp.unites.toLocaleString('fr-FR')})`;
        tooltip.style.opacity = '1';
        renderer.domElement.style.cursor = 'pointer';
      }
    } else {
      hoveredOp = null;
      tooltip.style.opacity = '0';
      renderer.domElement.style.cursor = 'grab';
    }

    // Ring pulse
    ring.material.opacity = 0.08 + Math.sin(t * 0.5) * 0.06;

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
      container.removeChild(renderer.domElement);
    }
  };
}
