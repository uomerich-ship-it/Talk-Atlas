import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function createStarColor(): THREE.Color {
  const r = Math.random();
  if (r < 0.02) return new THREE.Color(0.55, 0.65, 1.00);
  if (r < 0.10) return new THREE.Color(0.75, 0.82, 1.00);
  if (r < 0.30) return new THREE.Color(0.95, 0.97, 1.00);
  if (r < 0.55) return new THREE.Color(1.00, 0.98, 0.88);
  if (r < 0.75) return new THREE.Color(1.00, 0.85, 0.55);
  if (r < 0.90) return new THREE.Color(1.00, 0.65, 0.35);
  return new THREE.Color(1.00, 0.40, 0.30);
}

function createStarLayer(count: number, radius: number, milkyWayBias: boolean): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(2 * Math.random() - 1);
    if (milkyWayBias && Math.random() < 0.4) {
      phi = Math.PI / 2 + (Math.random() - 0.5) * 0.45;
    }
    const r = radius + (Math.random() - 0.5) * radius * 0.25;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = createStarColor();
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    const roll = Math.random();
    if (roll > 0.996) sizes[i] = 3.5 + Math.random() * 1.5;
    else if (roll > 0.97) sizes[i] = 2.0 + Math.random() * 1.0;
    else if (roll > 0.80) sizes[i] = 1.0 + Math.random() * 0.8;
    else sizes[i] = 0.2 + Math.random() * 0.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 1.8, vertexColors: true, transparent: true, opacity: 0.92,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
}

function createMilkyWayCore(): THREE.Group {
  const group = new THREE.Group();
  const makeLayer = (w: number, h: number, r: number, g: number, b: number, opacity: number, z: number) => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(256, 64, 0, 256, 64, 220);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${opacity})`);
    grad.addColorStop(0.3, `rgba(${r},${g},${b},${opacity * 0.5})`);
    grad.addColorStop(0.7, `rgba(${r},${g},${b},${opacity * 0.15})`);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 128);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    mesh.position.z = z;
    return mesh;
  };
  group.add(makeLayer(900, 220, 200, 185, 160, 0.12, -700));
  group.add(makeLayer(700, 120, 220, 200, 180, 0.18, -680));
  group.add(makeLayer(500,  60, 255, 230, 200, 0.22, -660));
  return group;
}

function createNebula(x: number, y: number, z: number, baseW: number, baseH: number, palette: [number, number, number][], layerCount = 7): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < layerCount; i++) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d')!;
    const cx = 90 + Math.random() * 76;
    const cy = 90 + Math.random() * 76;
    const outerR = 70 + Math.random() * 60;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
    const [ri, gi, bi] = palette[i % palette.length];
    grad.addColorStop(0,    `rgba(${ri},${gi},${bi},0.55)`);
    grad.addColorStop(0.25, `rgba(${ri},${gi},${bi},0.30)`);
    grad.addColorStop(0.55, `rgba(${Math.round(ri*0.6)},${Math.round(gi*0.6)},${Math.round(bi*0.6)},0.12)`);
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    if (i % 2 === 0) {
      const cx2 = 160 + (Math.random() - 0.5) * 60;
      const cy2 = 160 + (Math.random() - 0.5) * 60;
      const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 50 + Math.random() * 30);
      g2.addColorStop(0,   `rgba(${ri},${gi},${bi},0.35)`);
      g2.addColorStop(0.5, `rgba(${ri},${gi},${bi},0.10)`);
      g2.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, 256, 256);
    }
    const w = baseW * (0.7 + Math.random() * 0.6);
    const h = baseH * (0.7 + Math.random() * 0.6);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.55 + Math.random() * 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    mesh.position.set(x + (Math.random() - 0.5) * baseW * 0.5, y + (Math.random() - 0.5) * baseH * 0.5, z + (Math.random() - 0.5) * 25);
    mesh.rotation.z = Math.random() * Math.PI;
    group.add(mesh);
  }
  return group;
}

function createGasGiant(): THREE.Group {
  const group = new THREE.Group();
  const pc = document.createElement('canvas');
  pc.width = 512; pc.height = 256;
  const pctx = pc.getContext('2d')!;
  const base = pctx.createLinearGradient(0, 0, 0, 256);
  base.addColorStop(0.00, '#c8a060'); base.addColorStop(0.12, '#e0b870'); base.addColorStop(0.22, '#8a5a20');
  base.addColorStop(0.30, '#c89848'); base.addColorStop(0.40, '#e8d088'); base.addColorStop(0.50, '#b87030');
  base.addColorStop(0.60, '#d8a858'); base.addColorStop(0.72, '#9a6820'); base.addColorStop(0.82, '#d0a050');
  base.addColorStop(1.00, '#a06830');
  pctx.fillStyle = base; pctx.fillRect(0, 0, 512, 256);
  for (let b = 0; b < 18; b++) {
    const by = Math.random() * 256; const bh = 3 + Math.random() * 16;
    const bg = pctx.createLinearGradient(0, by - bh, 0, by + bh);
    const alpha = 0.10 + Math.random() * 0.22; const warm = Math.random() > 0.45;
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(0.5, warm ? `rgba(220,150,60,${alpha})` : `rgba(60,30,10,${alpha})`);
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    pctx.fillStyle = bg; pctx.fillRect(0, by - bh, 512, bh * 2);
  }
  pctx.save(); pctx.translate(195, 152); pctx.scale(1.9, 1);
  const rsg = pctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  rsg.addColorStop(0, 'rgba(190,55,25,0.90)'); rsg.addColorStop(0.5, 'rgba(150,40,18,0.55)'); rsg.addColorStop(1, 'rgba(0,0,0,0)');
  pctx.fillStyle = rsg; pctx.beginPath(); pctx.arc(0, 0, 20, 0, Math.PI * 2); pctx.fill(); pctx.restore();
  group.add(new THREE.Mesh(new THREE.SphereGeometry(22, 64, 64), new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(pc), shininess: 12 })));
  [{ inner: 26, outer: 38, op: 0.55 }, { inner: 38, outer: 52, op: 0.35 }, { inner: 52, outer: 62, op: 0.18 }].forEach(({ inner, outer, op }) => {
    const rc = document.createElement('canvas'); rc.width = 256; rc.height = 1;
    const rctx = rc.getContext('2d')!; const rg = rctx.createLinearGradient(0, 0, 256, 0);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(0.1, `rgba(210,185,130,${op})`);
    rg.addColorStop(0.5, `rgba(230,200,150,${op * 0.8})`); rg.addColorStop(0.9, `rgba(200,170,110,${op * 0.5})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
    rctx.fillStyle = rg; rctx.fillRect(0, 0, 256, 1);
    const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 128), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    ring.rotation.x = Math.PI / 2.4; group.add(ring);
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(28, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.65, 0.25), transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })));
  group.position.set(320, 185, -600); group.rotation.z = 0.12;
  return group;
}

function createIceGiant(): THREE.Group {
  const group = new THREE.Group();
  const ic = document.createElement('canvas'); ic.width = 256; ic.height = 256;
  const ictx = ic.getContext('2d')!;
  const base = ictx.createLinearGradient(0, 0, 0, 256);
  base.addColorStop(0.00, '#0d2d55'); base.addColorStop(0.20, '#1a5090'); base.addColorStop(0.40, '#1060a8');
  base.addColorStop(0.60, '#0e4878'); base.addColorStop(0.80, '#1a5898'); base.addColorStop(1.00, '#0a2040');
  ictx.fillStyle = base; ictx.fillRect(0, 0, 256, 256);
  for (let b = 0; b < 10; b++) {
    const by = Math.random() * 256; const bh = 2 + Math.random() * 10;
    const bg = ictx.createLinearGradient(0, by - bh, 0, by + bh);
    bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.5, `rgba(80,180,255,${0.08 + Math.random() * 0.12})`); bg.addColorStop(1, 'rgba(0,0,0,0)');
    ictx.fillStyle = bg; ictx.fillRect(0, by - bh, 256, bh * 2);
  }
  group.add(new THREE.Mesh(new THREE.SphereGeometry(15, 48, 48), new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(ic), shininess: 25 })));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(16.8, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.15, 0.55, 1.0), transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.05, 0.25, 0.65), transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })));
  group.position.set(-285, -165, -550);
  return group;
}

function createDistantGalaxy(): THREE.Mesh {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.save(); ctx.translate(128, 64); ctx.rotate(0.4);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
  g.addColorStop(0,    'rgba(230,210,180,0.30)'); g.addColorStop(0.20, 'rgba(200,180,150,0.18)');
  g.addColorStop(0.50, 'rgba(160,140,120,0.08)'); g.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.scale(2.5, 1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 60),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  mesh.position.set(-180, 200, -800); mesh.rotation.z = 0.3;
  return mesh;
}

export function UniverseBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x000204);
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const isMobile = window.innerWidth < 768;
    const layer1 = createStarLayer(isMobile ? 1800 : 3500, 500, false);
    const layer2 = createStarLayer(isMobile ? 1800 : 3500, 700, true);
    const layer3 = createStarLayer(isMobile ? 1200 : 2500, 900, false);
    scene.add(layer1, layer2, layer3);
    const milkyWay = createMilkyWayCore();
    milkyWay.rotation.z = Math.PI / 5;
    scene.add(milkyWay);
    const nebula1 = createNebula(210, 160, -500, 280, 230, [[70,30,200],[90,20,160],[50,50,220],[60,10,180]], 8);
    const nebula2 = createNebula(-240, -115, -480, 260, 210, [[0,180,155],[10,160,130],[0,200,160],[5,140,120]], 7);
    const nebula3 = createNebula(310, -75, -520, 240, 195, [[220,55,15],[190,40,10],[240,80,20],[200,60,5]], 7);
    const nebula4 = createNebula(-120, 180, -560, 200, 160, [[160,20,200],[130,10,180],[180,30,210]], 5);
    scene.add(nebula1, nebula2, nebula3, nebula4);
    const gasGiant = createGasGiant();
    const iceGiant = createIceGiant();
    scene.add(gasGiant, iceGiant);
    scene.add(createDistantGalaxy());
    const sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
    sun.position.set(600, 300, 250);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x1a1a3a, 0.5));
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.0001;
      layer1.rotation.y = t * 0.018; layer2.rotation.y = t * 0.012; layer3.rotation.y = t * 0.008;
      layer1.rotation.x = Math.sin(t * 0.12) * 0.008;
      milkyWay.rotation.y = t * 0.010;
      [nebula1, nebula2, nebula3, nebula4].forEach((neb, ni) => {
        neb.children.forEach((m, mi) => {
          const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
          if (mat) mat.opacity = 0.45 + Math.sin(t * 1.8 + ni * 1.2 + mi * 0.4) * 0.12;
        });
      });
      if (gasGiant.children[0]) (gasGiant.children[0] as THREE.Mesh).rotation.y += 0.0006;
      if (iceGiant.children[0]) (iceGiant.children[0] as THREE.Mesh).rotation.y += 0.0004;
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m: any) => { if (m.map) m.map.dispose(); m.dispose(); });
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} data-testid="universe-background" />;
}
