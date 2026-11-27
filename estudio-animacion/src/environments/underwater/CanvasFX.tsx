import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {screenToWorld, useCamera, worldToScreen} from '../../engine/camera';
import {clamp, profileAt, rng} from '../../engine/math';
import {useQuality} from '../../engine/quality';
import {useTime} from '../../engine/useTime';

/**
 * Nieve marina + destellos dorados + bokeh de primer plano, en UN canvas.
 * Cada partícula vive en un plano de profundidad propio (parallax real) y su
 * posición es función pura del tiempo (determinista, sin estado entre fotogramas).
 */
export const Particles: React.FC<{seed?: number; lightX?: number}> = ({seed = 9, lightX = 1100}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useTime();
  const cam = useCamera();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const parts = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: q.particles}, () => ({
      x: r() * 3000 - 600,
      y: r() * 2600 - 300,
      depth: 0.35 + r() * 0.95,
      size: 0.8 + r() * 2.4,
      vx: 4 + r() * 10,
      vy: -3 - r() * 6,
      ph: r() * 100,
      gold: r() < 0.22,
    }));
  }, [seed, q.particles]);
  const bokeh = useMemo(() => {
    const r = rng(seed + 1);
    return Array.from({length: q.bokeh}, () => ({x: r() * 1600, y: r() * 2200, r: 18 + r() * 40, d: 1.5 + r() * 0.5, ph: r() * 10}));
  }, [seed, q.bokeh]);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, width, height);
    const spanX = width + 160;
    const spanY = height + 160;
    for (const p of parts) {
      const wx = p.x + p.vx * t + Math.sin(t * 0.6 + p.ph) * 12;
      const wy = p.y + p.vy * t + Math.cos(t * 0.45 + p.ph) * 10;
      const s = worldToScreen(cam, p.depth, {x: wx, y: wy});
      const sx = ((((s.x + 80) % spanX) + spanX) % spanX) - 80;
      const sy = ((((s.y + 80) % spanY) + spanY) % spanY) - 80;
      const rad = p.size * s.scale;
      const lit = clamp(1 - Math.abs(sx - (lightX - cam.camera.x) * 0.3 - width / 2) / 700);
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + p.ph);
      if (p.gold) {
        g.fillStyle = `rgba(255,222,150,${(0.25 + 0.55 * tw * lit).toFixed(3)})`;
      } else {
        g.fillStyle = `rgba(200,245,240,${(0.18 + 0.25 * p.depth).toFixed(3)})`;
      }
      g.beginPath();
      g.arc(sx, sy, rad, 0, Math.PI * 2);
      g.fill();
    }
    for (const b of bokeh) {
      const s = worldToScreen(cam, b.d, {x: b.x + t * 6, y: b.y - t * 4 + Math.sin(t * 0.5 + b.ph) * 15});
      const sx = ((((s.x + 200) % (width + 400)) + width + 400) % (width + 400)) - 200;
      const sy = ((((s.y + 200) % (height + 400)) + height + 400) % (height + 400)) - 200;
      const rad = b.r * s.scale;
      const grd = g.createRadialGradient(sx, sy, 0, sx, sy, rad);
      grd.addColorStop(0, 'rgba(190,255,240,0.10)');
      grd.addColorStop(0.7, 'rgba(160,240,230,0.06)');
      grd.addColorStop(1, 'rgba(160,240,230,0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(sx, sy, rad, 0, Math.PI * 2);
      g.fill();
    }
  }, [t, cam, parts, bokeh, width, height, lightX]);

  return (
    <AbsoluteFill>
      <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

/**
 * Cáusticas: red de luz que se proyecta sobre las superficies del suelo.
 * Se calcula a baja resolución (1/5) y el navegador la escala con suavizado:
 * ~80k píxeles por fotograma en lugar de 2 millones.
 */
export const Caustics: React.FC<{profile: [number, number][]; strength?: number}> = ({profile, strength = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useTime();
  const cam = useCamera();
  const q = useQuality();
  const {width, height} = useVideoConfig();
  const w = Math.ceil(width / q.causticsRes);
  const h = Math.ceil(height / q.causticsRes);

  useLayoutEffect(() => {
    if (!q.caustics) return;
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d');
    if (!g) return;
    // en primeros planos extremos la red se vería gigante: se desvanece (zoom 2,5 → 4)
    const zoomFade = 1 - Math.min(1, Math.max(0, (cam.camera.zoom - 2.5) / 1.5));
    const img = g.createImageData(w, h);
    const data = img.data;
    const tl = screenToWorld(cam, 1, {x: 0, y: 0});
    const br = screenToWorld(cam, 1, {x: width, y: height});
    const ground = new Float32Array(w);
    for (let i = 0; i < w; i++) ground[i] = profileAt(profile, tl.x + ((br.x - tl.x) * i) / w);
    for (let j = 0; j < h; j++) {
      const wy = tl.y + ((br.y - tl.y) * j) / h;
      for (let i = 0; i < w; i++) {
        const below = wy - ground[i];
        const mask = clamp((below + 24) / 30) * (0.25 + 0.75 * clamp(1 - below / 70)) * clamp(1 - below / 260);
        const o = (j * w + i) * 4;
        if (mask <= 0) {
          data[o + 3] = 0;
          continue;
        }
        const wx = tl.x + ((br.x - tl.x) * i) / w;
        let px = wx * 0.02;
        let py = wy * 0.034;
        for (let k = 0; k < 3; k++) {
          const nx = px + 0.55 * Math.sin(py * 1.3 + t * 0.7 + k * 1.7);
          py = py + 0.55 * Math.cos(px * 1.1 - t * 0.6 + k * 2.3);
          px = nx;
        }
        const v = Math.abs(Math.sin(px) * Math.sin(py * 1.1));
        const line = Math.pow(clamp(1 - v * 3.2), 3);
        const a = line * mask * 0.55 * strength * zoomFade;
        data[o] = 255;
        data[o + 1] = 236;
        data[o + 2] = 180;
        data[o + 3] = Math.round(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
  }, [t, cam, w, h, profile, width, height, strength, q.caustics]);

  if (!q.caustics) return null;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      <canvas ref={ref} width={w} height={h} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
