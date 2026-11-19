// Entorno espacial del Ep. 03 (pantalla): ascenso, cápsula en órbita con la
// instalación de exposición abierta, bandeja de muestras y la Tierra.
// Representación ILUSTRATIVA del experimento TARDIS (misión FOTON-M3, 2007):
// los tardígrados viajaron deshidratados, dentro de un equipo científico.
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {clamp, easeInOut, hash1, mixColor, rng, smoothstep} from '../../engine/math';
import {FONT_FAMILY} from '../../engine/fonts';
import {Tardigrade, tardiPose} from '../../creatures/tardigrade/Tardigrade';

const Stars: React.FC<{o: number; t: number}> = ({o, t}) => {
  const {width, height} = useVideoConfig();
  const stars = useMemo(() => {
    const r = rng(91);
    return Array.from({length: 220}, () => ({x: r() * width, y: r() * height, s: 0.6 + r() * 1.8, ph: r() * 10}));
  }, [width, height]);
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#ffffff" opacity={0.5 + 0.5 * Math.sin(t * 1.5 + s.ph) * 0.4} />
      ))}
    </g>
  );
};

const Earth: React.FC<{cx: number; cy: number; R: number; t: number}> = ({cx, cy, R, t}) => {
  const clouds = useMemo(() => {
    const r = rng(92);
    return Array.from({length: 26}, () => ({a: Math.PI * (1.1 + r() * 0.8), d: 0.55 + r() * 0.42, w: 120 + r() * 260, ph: r()}));
  }, []);
  const land = useMemo(() => {
    const r = rng(93);
    return Array.from({length: 7}, () => ({a: Math.PI * (1.15 + r() * 0.7), d: 0.6 + r() * 0.35, w: 160 + r() * 220, h: 60 + r() * 120}));
  }, []);
  const rot = t * 0.006;
  return (
    <g>
      <defs>
        <radialGradient id="sp-earth" cx="0.42" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#3f8fd8" />
          <stop offset="0.6" stopColor="#1a4f96" />
          <stop offset="1" stopColor="#081a3a" />
        </radialGradient>
        <clipPath id="sp-earth-clip">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
      </defs>
      {[1.06, 1.04, 1.025, 1.012].map((k, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * k} fill="none" stroke="#7fc8ff" strokeOpacity={0.08 + i * 0.07} strokeWidth={R * 0.02} />
      ))}
      <circle cx={cx} cy={cy} r={R} fill="url(#sp-earth)" />
      <g clipPath="url(#sp-earth-clip)">
        {land.map((l, i) => {
          const a = l.a + rot;
          return <ellipse key={i} cx={cx + Math.cos(a) * R * l.d} cy={cy + Math.sin(a) * R * l.d} rx={l.w} ry={l.h} fill="#5f7f4a" opacity={0.55} transform={`rotate(${(a * 57).toFixed(1)} ${cx + Math.cos(a) * R * l.d} ${cy + Math.sin(a) * R * l.d})`} />;
        })}
        {clouds.map((c, i) => {
          const a = c.a + rot * 1.6;
          const x = cx + Math.cos(a) * R * c.d;
          const y = cy + Math.sin(a) * R * c.d;
          return <ellipse key={`c${i}`} cx={x} cy={y} rx={c.w} ry={c.w * 0.18} fill="#ffffff" opacity={0.55} transform={`rotate(${(a * 57 + 90).toFixed(1)} ${x} ${y})`} />;
        })}
        {/* terminador día/noche */}
        <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="url(#sp-night)" />
      </g>
      <defs>
        <linearGradient id="sp-night" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0.55" stopColor="#000814" stopOpacity={0} />
          <stop offset="1" stopColor="#000814" stopOpacity={0.75} />
        </linearGradient>
      </defs>
    </g>
  );
};

/** Cápsula esférica de descenso con módulo de servicio y la instalación de exposición (tapa abatible). */
const Capsule: React.FC<{x: number; y: number; s: number; lid: number; t: number}> = ({x, y, s, lid, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${-90 + Math.sin(t * 0.3) * 3})`}>
    <line x1={0} y1={100} x2={0} y2={170} stroke="#c9c2a8" strokeWidth={4} />
    <circle cx={0} cy={172} r={6} fill="#c9c2a8" />
    <defs>
      <radialGradient id="sp-cap" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#f4f4ee" />
        <stop offset="0.6" stopColor="#a9aca4" />
        <stop offset="1" stopColor="#4a4d48" />
      </radialGradient>
    </defs>
    <rect x={-70} y={60} width={140} height={150} rx={18} fill="#8a8f86" />
    <rect x={-70} y={60} width={140} height={150} rx={18} fill="none" stroke="#3a3d38" strokeWidth={3} />
    {[90, 130, 170].map((yy) => (
      <line key={yy} x1={-70} y1={yy} x2={70} y2={yy} stroke="#3a3d38" strokeWidth={2} opacity={0.6} />
    ))}
    <circle r={100} fill="url(#sp-cap)" />
    <path d="M-100,0 Q0,30 100,0" stroke="#4a4d48" strokeWidth={3} fill="none" opacity={0.5} />
    {/* instalación de exposición con tapa abatible */}
    <g transform="translate(0 -96)">
      <rect x={-38} y={-14} width={76} height={18} rx={4} fill="#c9c2a8" stroke="#3a3d38" strokeWidth={2} />
      <rect x={-30} y={-12} width={60} height={8} rx={3} fill="#7fd0ff" opacity={0.25 + 0.75 * lid} />
      <g transform={`rotate(${(-lid * 110).toFixed(1)} -38 -14)`}>
        <rect x={-38} y={-24} width={76} height={10} rx={4} fill="#d8d0b4" stroke="#3a3d38" strokeWidth={2} />
      </g>
    </g>
  </g>
);

export const SpaceScene: React.FC<{t: number; start: number}> = ({t, start}) => {
  const {width, height} = useVideoConfig();
  const u = t - start;
  const ascent = smoothstep(0, 6.5, u);
  const sky = mixColor(mixColor('#7fb8e8', '#0b1a3a', clamp(ascent * 1.4)), '#01030a', smoothstep(0.4, 1, ascent));
  const trayK = smoothstep(12.6, 13.4, u) * (1 - smoothstep(18.6, 19.4, u));
  const wide = smoothstep(18.6, 20, u);
  // Tierra: el horizonte sube al ascender; al final, vista amplia
  const R = 1500 - wide * 300;
  const earthCy = height + R - (ascent * 520 + wide * 360);
  const capT = smoothstep(6, 12.5, u);
  const capX = width + 260 - easeInOut(capT) * (width / 2 + 260) - wide * (u - 19) * 40;
  const capY = 640 + (1 - capT) * 120 + wide * 80;
  const capS = 1.1 - wide * 0.75;
  const lid = smoothstep(9.5, 11.5, u);
  const tun = tardiPose({t, x: 0, y: 0, scale: 0.42, facing: 1, slope: 0, dist: 0, activity: 0, tun: 1, look: 0});
  return (
    <AbsoluteFill style={{background: sky}}>
      <svg width={width} height={height}>
        <Stars o={smoothstep(0.35, 0.8, ascent)} t={t} />
        {/* nubes que caen al ascender */}
        {ascent < 0.7 &&
          Array.from({length: 10}, (_, i) => {
            const y = ((hash1(i) * height + u * 520 * (0.6 + hash1(i + 2))) % (height + 400)) - 200;
            return <ellipse key={i} cx={hash1(i + 4) * width} cy={y} rx={260 + hash1(i + 6) * 200} ry={50} fill="#ffffff" opacity={0.55 * (1 - ascent / 0.7)} />;
          })}
        {/* sol */}
        <circle cx={140} cy={220} r={60} fill="#fff8e0" opacity={smoothstep(0.4, 0.9, ascent)} />
        <defs>
          <radialGradient id="sp-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff1c0" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff1c0" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={140} cy={220} r={220} fill="url(#sp-sun)" opacity={smoothstep(0.4, 0.9, ascent)} />
        <Earth cx={width / 2} cy={earthCy} R={R} t={t} />
        {u > 6 && <Capsule x={capX} y={capY} s={capS} lid={lid} t={t} />}
      </svg>
      {/* rótulos */}
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: smoothstep(7, 8, u) * (1 - smoothstep(12.4, 13, u))}}>
        <div style={{color: '#eafffb', fontWeight: 900, fontSize: 44, letterSpacing: 4}}>FOTON-M3 · 2007</div>
        <div style={{color: '#7fd0ff', fontWeight: 600, fontSize: 26, marginTop: 6}}>experimento en órbita baja · representación ilustrativa</div>
      </div>
      {trayK > 0.01 && (
        <AbsoluteFill style={{opacity: trayK}}>
          <AbsoluteFill style={{background: 'rgba(1,4,12,0.82)'}} />
          <svg width={width} height={height}>
            <rect x={70} y={460} width={width - 140} height={900} rx={40} fill="#0d1626" stroke="#7fd0ff" strokeOpacity={0.4} strokeWidth={2} />
            {[0, 1].map((side) => {
              const x0 = side ? width / 2 + 20 : 110;
              const uv = side === 1;
              return (
                <g key={side}>
                  <rect x={x0} y={600} width={width / 2 - 130} height={620} rx={26} fill={uv ? '#1a1030' : '#0a1a2a'} />
                  {uv &&
                    Array.from({length: 7}, (_, k) => {
                      const ph = (u * 0.8 + k / 7) % 1;
                      return <line key={k} x1={x0 + 40 + k * 50 - 120 + ph * 120} y1={470} x2={x0 + 40 + k * 50 + ph * 120} y2={1200} stroke="#b07aff" strokeOpacity={0.35 * (1 - ph)} strokeWidth={6} />;
                    })}
                  {Array.from({length: 6}, (_, k) => {
                    const cx = x0 + 90 + (k % 2) * 200;
                    const cy = 720 + Math.floor(k / 2) * 180;
                    const res = smoothstep(16.3, 17, u);
                    const ok = uv ? k === 4 : k !== 3;
                    return (
                      <g key={k}>
                        <circle cx={cx} cy={cy} r={70} fill="#16223a" stroke="#4a6a8a" strokeWidth={3} />
                        <g transform={`translate(${cx} ${cy + 30})`}>
                          <Tardigrade id={`tr${side}${k}`} pose={tun} dryness={1} light={0.6} />
                        </g>
                        {res > 0.01 && <circle cx={cx + 48} cy={cy - 48} r={18 * res} fill={ok ? '#5fe08a' : '#ff6a6a'} />}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          <div style={{position: 'absolute', top: 500, left: 110, width: width / 2 - 130, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#7fd0ff', fontWeight: 800, fontSize: 30}}>SOLO VACÍO</div>
          <div style={{position: 'absolute', top: 500, left: width / 2 + 20, width: width / 2 - 130, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#c9a0ff', fontWeight: 800, fontSize: 30}}>VACÍO + RADIACIÓN</div>
          <div style={{position: 'absolute', top: 1250, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#eafffb', fontWeight: 700, fontSize: 28, opacity: smoothstep(16.3, 17, u)}}>
            <span style={{color: '#5fe08a'}}>●</span> muchos recuperaron su actividad &nbsp; <span style={{color: '#ff6a6a'}}>●</span> supervivencia muy reducida
          </div>
          <div style={{position: 'absolute', top: 1310, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, color: '#9fb3c2', fontWeight: 600, fontSize: 22, opacity: smoothstep(16.3, 17, u)}}>
            ilustración cualitativa · tardígrados deshidratados, en estado de tonel
          </div>
        </AbsoluteFill>
      )}
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: smoothstep(19.5, 20.5, u)}}>
        <div style={{color: '#eafffb', fontWeight: 900, fontSize: 40, letterSpacing: 3}}>10 DÍAS EN ÓRBITA</div>
      </div>
    </AbsoluteFill>
  );
};
