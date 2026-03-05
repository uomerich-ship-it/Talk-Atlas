import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createStarColor(): THREE.Color {
  const r = Math.random();
  if (r < 0.03) return new THREE.Color(0.6, 0.7, 1.0);
  if (r < 0.15) return new THREE.Color(0.8, 0.85, 1.0);
  if (r < 0.45) return new THREE.Color(1.0, 1.0, 0.95);
  if (r < 0.70) return new THREE.Color(1.0, 0.95, 0.8);
  if (r < 0.88) return new THREE.Color(1.0, 0.8, 0.5);
  if (r < 0.97) return new THREE.Color(1.0, 0.6, 0.3);
  return new THREE.Color(1.0, 0.4, 0.3);
}

function createStarLayer(count: number, radius: number, milkyWayBias: boolean): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(2 * Math.random() - 1);

    if (milkyWayBias && Math.random() < 0.4) {
      phi = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    }

    const r = radius + (Math.random() - 0.5) * radius * 0.3;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const color = createStarColor();
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    const brightnessRoll = Math.random();
    sizes[i] = brightnessRoll < 0.9 ? 0.3 + Math.random() * 0.7 : 1.0 + Math.random() * 2.0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

function createNebula(
  x: number, y: number, z: number,
  w: number, h: number,
  r: number, g: number, b: number,
  opacity: number
): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
  gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(w, h);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
}

function createGasGiant(): THREE.Group {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const bandColors = ['#c4a35a', '#8b6914', '#a08030', '#6b4e12', '#c4a35a', '#9c7a28', '#7a5c1a', '#b8943e'];
  const bandHeight = canvas.height / bandColors.length;
  bandColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * bandHeight, canvas.width, bandHeight + 1);
  });
  ctx.fillStyle = '#b84030';
  ctx.beginPath();
  ctx.ellipse(160, 140, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(18, 32, 32),
    new THREE.MeshPhongMaterial({ map: texture })
  );
  group.add(sphere);

  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = 256;
  ringCanvas.height = 64;
  const rctx = ringCanvas.getContext('2d')!;
  const ringGrad = rctx.createLinearGradient(0, 0, 256, 0);
  ringGrad.addColorStop(0, 'rgba(180, 160, 120, 0)');
  ringGrad.addColorStop(0.2, 'rgba(180, 160, 120, 0.3)');
  ringGrad.addColorStop(0.5, 'rgba(200, 180, 140, 0.5)');
  ringGrad.addColorStop(0.8, 'rgba(180, 160, 120, 0.3)');
  ringGrad.addColorStop(1, 'rgba(180, 160, 120, 0)');
  rctx.fillStyle = ringGrad;
  rctx.fillRect(0, 0, 256, 64);

  const ringTexture = new THREE.CanvasTexture(ringCanvas);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(22, 36, 64),
    new THREE.MeshBasicMaterial({ map: ringTexture, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(24, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xc4a35a, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(glow);

  group.position.set(320, 180, -600);
  return group;
}

function createIceGiant(): THREE.Group {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const colors = ['#1a3a6a', '#1e4a8a', '#1a3a6a', '#2a5aaa', '#1a3a6a', '#1e4a8a'];
  const bh = canvas.height / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * bh, canvas.width, bh + 1);
  });

  const texture = new THREE.CanvasTexture(canvas);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(14, 32, 32),
    new THREE.MeshPhongMaterial({ map: texture })
  );
  group.add(sphere);

  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(14.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.15, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(rim);

  group.position.set(-280, -160, -550);
  return group;
}

function createMilkyWayCore(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(256, 64, 0, 256, 64, 256);
  gradient.addColorStop(0, 'rgba(200, 180, 150, 0.08)');
  gradient.addColorStop(0.3, 'rgba(150, 140, 120, 0.04)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 200),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  plane.position.set(0, 0, -700);
  return plane;
}

export function UniverseBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const layer1 = createStarLayer(3000, 500, false);
    const layer2 = createStarLayer(3000, 700, true);
    const layer3 = createStarLayer(2000, 900, false);
    scene.add(layer1, layer2, layer3);

    scene.add(createMilkyWayCore());

    const nebulae = [
      createNebula(200, 150, -500, 300, 250, 80, 40, 180, 0.15),
      createNebula(-250, -120, -480, 280, 220, 30, 160, 140, 0.12),
      createNebula(300, -80, -520, 250, 200, 180, 60, 30, 0.10),
    ];
    nebulae.forEach(n => scene.add(n));

    scene.add(createGasGiant());
    scene.add(createIceGiant());

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(500, 300, 200);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x222244, 0.3));

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.0001;

      layer1.rotation.y = t * 0.02;
      layer2.rotation.y = t * 0.015;
      layer3.rotation.y = t * 0.01;
      layer1.rotation.x = Math.sin(t * 0.1) * 0.01;

      nebulae.forEach((n, i) => {
        (n.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 2 + i * 1.5) * 0.04;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          const materials = Array.isArray(mat) ? mat : [mat];
          materials.forEach((m: any) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => cleanupRef.current?.();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      data-testid="universe-background"
    />
  );
}
