// ESCENAS 6–9 (96–180 s): ¿es inmortal? · la ciencia · revelación · cierre.
import React from 'react';
import {clamp, easeInOut, hash1, lerp, smoothstep} from '../../../engine/math';
import {FONT_FAMILY} from '../../../engine/fonts';
import {alarmed, jellyPose, swim} from '../Animation/jellyMotion';
import {Cam, camAt, drift, layerT, toScreen} from '../Camera/cam';
import {ImmortalJellyfish} from '../Characters/ImmortalJellyfish';
import {Cyst, Polyp, reversalMorph} from '../Characters/LifeCycleTransformation';
import {OceanParticles} from '../Environments/OceanParticles';
import {Fish, Reef, WaterBack} from '../Environments/UnderwaterEnvironment';
import {CinematicLighting} from '../Lighting/CinematicLighting';
import {win} from './Middle';
import {SceneOut} from './Opening';

const f1 = (n: number) => (Number.isFinite(n) ? n : 0).toFixed(1);
const seg = (t: number, a: number, b: number) => easeInOut(clamp((t - a) / (b - a)));

const Caption: React.FC<{text: string; k: number; top?: number; color?: string; size?: number}> = ({text, k, top = 260, color = '#e8fbff', size = 38}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
    <span style={{display: 'inline-block', background: 'rgba(6,16,40,0.7)', borderRadius: 18, padding: '12px 26px', color, fontSize: size, fontWeight: 800, lineHeight: 1.25}}>{text}</span>
  </div>
);

// ---------------------------------------------------------------- escena 6: peligros
/** Depredador estilizado (pez grande en contraluz). */
const Predator: React.FC<{x: number; y: number; s: number; t: number; dir: 1 | -1; seed: number}> = ({x, y, s, t, dir, seed}) => <Fish x={x} y={y} s={s} t={t} seed={seed} dir={dir} c1="#1c2a4a" c2="#121c36" />;

export function scene6(t: number): SceneOut {
  const base = swim(t, {x0: -40, y0: 120, dir: 0.25, step: 34, current: 0.25, glow: 0.8, t0: 96.2});
  const al = Math.max(win(t, 104.0, 106.0, 0.25), win(t, 110.4, 112.4, 0.25));
  const p = alarmed(base, al);
  const cam: Cam = drift({x: p.x + 30, y: p.y - 80 + lerp(0, -200, seg(t, 108.4, 110)), zoom: lerp(1.9, 1.35, seg(t, 102, 104)), roll: 0}, t, 1);
  const s = toScreen(cam, p.x, p.y - 60);
  // depredadores que pasan; en f4, medusas lejanas y peces que se acercan (sin mostrar el ataque)
  const pass1 = (t - 102.4) / 4.0;
  const pass2 = (t - 109.0) / 4.5;
  const far = t > 108.4 && t < 115.5;
  const cover = win(t, 112.6, 114.6, 0.6);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.72} rays={0.15} floorY={1500} />
        <Reef cam={cam} t={t} tone={0.75} floorY={1500} reef={0.6} fish={0}>
          <OceanParticles cam={cam} t={t} current={0.3} density={0.7} tint="#c8d8ff" />
        </Reef>
        <g transform={layerT(cam, 0.6)}>
          {far &&
            [0, 1, 2, 3].map((i) => (
              <ImmortalJellyfish key={i} uid={`fj${i}`} p={swim(t, {x0: p.x * 0.6 - 500 + i * 300, y0: -700 + (i % 2) * 160, dir: 0.1, step: 20, t0: 96 + i * 0.4, glow: 0.4, scale: 0.35})} />
            ))}
          {far && <Predator x={lerp(p.x * 0.6 + 900, p.x * 0.6 - 300, seg(t, 109.5, 114))} y={-640} s={3.2} t={t} dir={-1} seed={5} />}
        </g>
        <g transform={layerT(cam, 1)}>
          <ImmortalJellyfish uid="j6" p={p} />
        </g>
        <g transform={layerT(cam, 1.25)}>
          {pass1 > 0 && pass1 < 1 && <Predator x={lerp(p.x - 1200, p.x + 1200, pass1)} y={p.y - 380} s={4.2} t={t} dir={1} seed={2} />}
          {pass2 > 0 && pass2 < 1 && <Predator x={lerp(p.x + 1300, p.x - 1300, pass2)} y={p.y + 320} s={5.2} t={t} dir={-1} seed={8} />}
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 420, k: 0.6}} grade={0.7} violet={0.8} vignette={1} dark={0.25 * cover} />
        <Caption text="depredadores · enfermedades · otros peligros" k={win(t, 103.6, 108.2, 0.4)} />
        <Caption text="Su capacidad no la protege de todo" k={win(t, 115.8, 119.6, 0.4)} color="#ffd2c8" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- escena 7: laboratorio
const Scientist: React.FC<{t: number; look: number}> = ({t, look}) => {
  const bob = Math.sin(t * 0.8) * 2;
  const lean = lerp(0, 10, look);
  return (
    <g transform={`translate(200 ${f1(980 + bob)})`}>
      {/* silla y cuerpo con bata */}
      <rect x={-70} y={160} width={140} height={20} rx={10} fill="#2a3a5a" />
      <rect x={-10} y={180} width={20} height={150} fill="#2a3a5a" />
      <g transform={`rotate(${f1(lean)} 0 160)`}>
        <path d="M-70,170 Q-80,40 -20,-10 L50,-10 Q100,40 80,170Z" fill="#eef4fa" stroke="#9ab0c8" strokeWidth={3} />
        <path d="M10,-10 L20,60 L30,-10" fill="#7fb8e8" />
        {/* brazo hacia el tornillo de enfoque */}
        <path d={`M50,10 Q120,${f1(60 + Math.sin(t * 2) * 4)} 170,${f1(70 + Math.sin(t * 2) * 6)}`} stroke="#eef4fa" strokeWidth={30} strokeLinecap="round" fill="none" />
        <circle cx={172} cy={70 + Math.sin(t * 2) * 6} r={14} fill="#c98a6a" />
        {/* cabeza: piel morena, pelo recogido */}
        <circle cx={30} cy={-60} r={46} fill="#c98a6a" />
        <path d="M-14,-70 Q-10,-120 40,-112 Q86,-104 74,-60 Q60,-92 20,-88 Q-4,-84 -14,-70Z" fill="#2a1a14" />
        <circle cx={-18} cy={-92} r={22} fill="#2a1a14" />
        <path d="M60,-58 q10,2 12,10" stroke="#5a3a2a" strokeWidth={3} fill="none" />
        <circle cx={58} cy={-66} r={4} fill="#1a1010" />
      </g>
    </g>
  );
};

const Microscope: React.FC<{t: number}> = () => (
  <g transform="translate(470 900)">
    <rect x={-90} y={250} width={220} height={30} rx={8} fill="#3a4a6a" />
    <path d="M0,250 L0,120 Q0,40 60,0" stroke="#4a5a7a" strokeWidth={30} fill="none" strokeLinecap="round" />
    <rect x={20} y={-80} width={36} height={130} rx={10} fill="#5a6a8a" transform="rotate(-25 38 -15)" />
    <rect x={-60} y={150} width={180} height={18} rx={6} fill="#6a7a9a" />
    <rect x={30} y={60} width={24} height={80} rx={6} fill="#8a9aba" />
    <ellipse cx={42} cy={168} rx={50} ry={8} fill="#8fe9ff" opacity={0.6} />
  </g>
);

const Helix: React.FC<{t: number; x: number; y: number; h: number; label: string; hl: number; color: string}> = ({t, x, y, h, label, hl, color}) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({length: 22}, (_, i) => {
      const u = i / 21;
      const a = u * Math.PI * 4 + t * 1.2;
      const yy = -h / 2 + u * h;
      const x1 = Math.sin(a) * 60;
      const x2 = -x1;
      const front = Math.cos(a) > 0;
      const mark = hl > 0 && i >= 8 && i <= 12;
      return (
        <g key={i}>
          <line x1={x1} y1={yy} x2={x2} y2={yy} stroke={mark ? '#ffd27a' : '#bfe6ff'} strokeWidth={mark ? 6 : 3} opacity={mark ? 0.5 + 0.5 * hl : 0.6} />
          <circle cx={x1} cy={yy} r={front ? 9 : 6} fill={color} />
          <circle cx={x2} cy={yy} r={front ? 6 : 9} fill="#c38aff" />
        </g>
      );
    })}
    <text y={h / 2 + 50} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fontStyle="italic" fill="#e8fbff">
      {label}
    </text>
  </g>
);

export function scene7(t: number): SceneOut {
  const view = seg(t, 126.0, 127.2) * (1 - seg(t, 138.6, 139.4));
  const dna = seg(t, 139.0, 140.0);
  const cells = seg(t, 132.6, 133.6);
  // vista del microscopio: medusa → masa → pólipo, en bucle
  const loopU = ((t - 126) % 8) / 8;
  const m = reversalMorph(clamp(loopU * 1.25));
  return {
    svg: (
      <g>
        <defs>
          <linearGradient id="e8lab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14223e" />
            <stop offset="1" stopColor="#0a1226" />
          </linearGradient>
          <clipPath id="e8scope">
            <circle cx={540} cy={560} r={330} />
          </clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#e8lab)" />
        {/* estantes con frascos y acuarios */}
        {Array.from({length: 3}, (_, r) => (
          <g key={r} transform={`translate(0 ${260 + r * 230})`} opacity={1 - view * 0.7}>
            <rect x={40} y={150} width={1000} height={14} fill="#22345a" />
            {Array.from({length: 7}, (_, i) => (
              <g key={i} transform={`translate(${110 + i * 140} 150)`}>
                <rect x={-36} y={-110} width={72} height={110} rx={10} fill="#8fe9ff" opacity={0.12 + 0.08 * hash1(i + r)} stroke="#8fe9ff" strokeOpacity={0.4} strokeWidth={2} />
                <circle cx={Math.sin(t + i) * 10} cy={-60 + Math.cos(t * 0.7 + i) * 10} r={7} fill="#bff6ff" opacity={0.5} />
              </g>
            ))}
          </g>
        ))}
        <rect x={0} y={1180} width={1080} height={40} fill="#2a3a5a" />
        <rect x={0} y={1220} width={1080} height={700} fill="#16223c" />
        <Microscope t={t} />
        <Scientist t={t} look={1} />
        {/* monitor con la imagen del microscopio */}
        <g opacity={view}>
          <circle cx={540} cy={560} r={350} fill="#020818" stroke="#8fe9ff" strokeWidth={8} />
          <g clipPath="url(#e8scope)">
            <rect x={190} y={210} width={700} height={700} fill="#06243a" />
            {cells < 0.5 ? (
              <g transform="translate(540 640) scale(1.2)">
                {loopU < 0.82 ? <ImmortalJellyfish uid="ms" p={jellyPose({t, contract: 0.3 + 0.2 * Math.sin(t * 3), retract: m.retract, glow: 0.6})} morph={{evert: m.evert, blob: m.blob, tissue: m.tissue, cells: m.cells}} /> : <><Cyst x={0} y={60} r={46} attach={1} t={t} /><Polyp x={60} y={60} h={140} grow={seg(t % 8, 6.6, 8)} t={t} seed={1} /></>}
              </g>
            ) : (
              <g>
                {Array.from({length: 30}, (_, i) => {
                  const cx = 240 + (i % 6) * 120 + (Math.floor(i / 6) % 2) * 60;
                  const cy = 300 + Math.floor(i / 6) * 120;
                  const k = (Math.sin(t * 1.2 + i * 0.7) + 1) / 2;
                  return (
                    <g key={i}>
                      <ellipse cx={cx} cy={cy} rx={lerp(46, 26, k)} ry={lerp(46, 60, k)} fill={k > 0.5 ? '#ff9a7a' : '#8fe9ff'} opacity={0.75} stroke="#ffffff" strokeWidth={2} />
                      <circle cx={cx} cy={cy} r={12} fill="#2a1a4a" opacity={0.7} />
                    </g>
                  );
                })}
              </g>
            )}
            {/* retícula del microscopio */}
            <path d="M190,560 L890,560 M540,210 L540,910" stroke="#8fe9ff" strokeWidth={1.5} opacity={0.3} />
          </g>
        </g>
        <g opacity={dna}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0a1226" opacity={0.85} />
          <Helix t={t} x={320} y={720} h={700} label="T. dohrnii" hl={seg(t, 141, 142.5)} color="#8fe9ff" />
          <Helix t={t + 0.6} x={760} y={720} h={700} label="especie cercana" hl={0} color="#7fa0c8" />
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting grade={0.4} violet={0.3} vignette={0.8} />
        <Caption text="finales de los años 80 · ejemplares de Italia" k={win(t, 120.6, 125.9, 0.4)} />
        <Caption text="1996 · se describe la reversión del desarrollo" k={win(t, 126.3, 132.4, 0.4)} top={1000} />
        <Caption text="cómo cambian las células · cómo se regula el desarrollo" k={win(t, 132.9, 138.6, 0.4)} top={1000} />
        <Caption text="2022 · diferencias en genes de reparación del ADN" k={win(t, 140.2, 144.9, 0.4)} top={1260} color="#ffd27a" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- escena 8: revelación
const StageIcon: React.FC<{kind: number; t: number}> = ({kind, t}) => {
  if (kind === 0) return <g transform="scale(0.5)"><ImmortalJellyfish uid="si0" p={jellyPose({t, contract: 0.3 + 0.3 * Math.sin(t * 3), glow: 0.5})} /></g>;
  if (kind === 1) return <Cyst x={0} y={40} r={36} attach={0.5} t={t} />;
  if (kind === 2) return <g><Polyp x={0} y={70} h={130} grow={1} t={t} seed={3} /></g>;
  return <g transform="scale(0.32)"><ImmortalJellyfish uid="si3" p={jellyPose({t, contract: 0.4 + 0.3 * Math.sin(t * 4), young: 1, glow: 0.5})} /></g>;
};

export function scene8(t: number): SceneOut {
  const p = swim(t, {x0: 0, y0: 160, dir: 0.12, step: 34, current: 0.2, glow: 0.9, t0: 145.4});
  const cam: Cam = drift({x: p.x, y: p.y - 140, zoom: lerp(1.5, 1.2, seg(t, 153, 160)), roll: 0}, t, 1);
  const s = toScreen(cam, p.x, p.y - 60);
  const orbit = seg(t, 153.9, 155.2);
  const labels = ['medusa adulta', 'masa de tejido', 'pólipo', 'medusa joven'];
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.45} rays={0.6} floorY={1500} />
        <Reef cam={cam} t={t} tone={0.45} floorY={1500} reef={0.6} fish={0.5}>
          <OceanParticles cam={cam} t={t} current={0.2} density={0.8} glow={0.5} />
        </Reef>
        <g transform={layerT(cam, 1)}>
          <ImmortalJellyfish uid="j8" p={p} />
          {orbit > 0.01 &&
            labels.map((lb, i) => {
              const a = (i / 4) * Math.PI * 2 + t * 0.25;
              const R = 265 * orbit;
              const x = p.x + Math.cos(a) * R;
              const y = p.y - 60 + Math.sin(a) * R * 0.9;
              return (
                <g key={i} transform={`translate(${f1(x)} ${f1(y)})`} opacity={orbit}>
                  <circle r={95} fill="rgba(6,16,40,0.5)" stroke="#8fe9ff" strokeWidth={3} />
                  <g transform="translate(0 -10)">
                    <StageIcon kind={i} t={t} />
                  </g>
                  <text y={135} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={28} fill="#e8fbff">
                    {lb}
                  </text>
                </g>
              );
            })}
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 460, k: 0.7}} grade={0.55} violet={0.5} vignette={0.9} />
        <Caption text="Ninguna cura demostrada contra el envejecimiento humano" k={win(t, 146.4, 153.6, 0.5)} color="#ffd2c8" />
      </>
    ),
  };
}

// ---------------------------------------------------------------- escena 9: cierre
export function scene9(t: number): SceneOut {
  const p = swim(t, {x0: 0, y0: 100, dir: 0.05, step: 26, current: 0.1, glow: 1, t0: 165.2});
  const cam = drift(camAt([[165, 0, -40, 2.1], [172, 0, -120, 1.1], [180, 0, -200, 0.62]], t), t, 0.6);
  const s = toScreen(cam, p.x, p.y - 60);
  const out = smoothstep(178.8, 180, t);
  return {
    svg: (
      <g>
        <WaterBack cam={cam} t={t} tone={0.95} rays={0} floorY={1800} />
        <OceanParticles cam={cam} t={t} current={0.1} density={0.9} glow={1} tint="#bfe6ff" />
        <g transform={layerT(cam, 1)}>
          <ImmortalJellyfish uid="j9" p={p} />
        </g>
      </g>
    ),
    overlay: (
      <>
        <CinematicLighting subject={{x: s.x, y: s.y, r: 600 * cam.zoom * 0.5, k: 0.95}} grade={0.7} violet={0.8} vignette={1} dark={out} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 167.6, 179.4, 0.8)}}>
          <div style={{fontSize: 96, fontWeight: 900, color: '#ffffff', letterSpacing: 6, textShadow: '0 0 30px rgba(127,233,255,0.8)'}}>MUNDO INSÓLITO</div>
          <div style={{fontSize: 40, fontWeight: 700, color: '#bff6ff', marginTop: 10}}>Descubre lo que parece imposible.</div>
        </div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 1180, textAlign: 'center', fontFamily: FONT_FAMILY, opacity: win(t, 172.6, 179.4, 0.6)}}>
          <span style={{fontSize: 48, fontWeight: 800, color: '#ffd27a', lineHeight: 1.25, textShadow: '0 0 20px rgba(0,0,0,0.6)'}}>¿Qué otro misterio del océano te gustaría descubrir?</span>
        </div>
      </>
    ),
  };
}
