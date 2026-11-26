// PERSONAJES SIN ESPINA Y ORGANISMOS ESPECIALES (vista lateral, mirando a +x salvo indicación):
//  03 banco de peces (individuos con trayectorias propias y reacción ante depredadores)
//  06 medusa corona (Atolla wyvillei): campana que se contrae, tentáculos con desfase, tentáculo largo,
//     bioluminiscencia en "rueda" azul (la especie es bioluminiscente)
//  11 pez pelícano (Eurypharynx pelecanoides): mandíbula extensible, cuerpo en látigo, órgano caudal luminoso
//  12 pulpo dumbo (Grimpoteuthis): 8 brazos con cirros, membrana, dos aletas, manto flexible
//  13 pepino de mar abisal (Psychropotes longicauda): reptación peristáltica, apéndice dorsal, tentáculos orales
//  15 anfípodo hadal (Hirondellea gigas): segmentos, 7 pares de patas articuladas, antenas, pleópodos, urópodos
import React from 'react';
import {clamp, hash1, lerp, mixColor, smoothPath} from '../../../engine/math';

type V = {x: number; y: number};
const f1 = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0);

// ------------------------------------------------------------------ 03 banco de peces
export const FishSchool: React.FC<{c: V; t: number; n?: number; r?: number; seed?: number; dir?: 1 | -1; threat?: V; flee?: number; s?: number; col?: string; belly?: string; speed?: number; turn?: number; tone?: number}> = ({c, t, n = 40, r = 220, seed = 1, dir = 1, threat, flee = 0, s = 1, col = '#4a6a8a', belly = '#d8e4ec', speed = 1, turn = 0, tone = 0}) => {
  const back = mixColor(col, '#02060c', tone * 0.7);
  const bel = mixColor(belly, '#02060c', tone * 0.7);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const h1 = hash1(seed + i * 1.37);
        const h2 = hash1(seed + i * 2.71);
        const h3 = hash1(seed + i * 4.13);
        // posición propia en el banco (órbita lenta + ruido): nadie sigue exactamente la misma trayectoria
        const a = h1 * Math.PI * 2 + t * (0.12 + h3 * 0.1) * speed;
        const rr = Math.sqrt(h2) * r;
        let x = c.x + Math.cos(a) * rr * 1.5 + Math.sin(t * 0.7 + i) * 8;
        let y = c.y + Math.sin(a) * rr * 0.55 + Math.sin(t * 1.1 + i * 0.5) * 6;
        let hd = turn + (dir < 0 ? Math.PI : 0) + Math.sin(t * 0.5 + h1 * 6) * 0.12;
        let beat = 9 + h3 * 5;
        if (threat && flee > 0) {
          const dx = x - threat.x;
          const dy = y - threat.y;
          const d = Math.hypot(dx, dy) || 1;
          const push = flee * clamp(1 - d / (r * 2.4)) * 260;
          x += (dx / d) * push;
          y += (dy / d) * push;
          hd = lerp(hd, Math.atan2(dy, dx), clamp(push / 160));
          beat += push * 0.06;
        }
        const sc = s * (0.75 + h2 * 0.5);
        const w = Math.sin(t * beat + i) * 5;
        return (
          <g key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1((hd * 180) / Math.PI)}) scale(${f1(sc * 100) / 100})`}>
            <path d={`M-18 0L-30 ${f1(-7 + w)}L-27 0L-30 ${f1(7 + w)}Z`} fill={back} />
            <path d="M22 0C16 -7 -4 -8 -20 0C-4 8 16 7 22 0Z" fill={bel} />
            <path d="M22 0C16 -7 -4 -8 -20 0C-4 -2 14 -2 22 0Z" fill={back} />
            <circle cx={14} cy={-1.5} r={1.8} fill="#0a0a0a" />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------ 06 medusa corona (Atolla wyvillei)
export const Atolla: React.FC<{x: number; y: number; s?: number; t: number; glow?: number; tilt?: number; phase?: number; op?: number}> = ({x, y, s = 1, t, glow = 0, tilt = 0, phase = 0, op = 1}) => {
  const per = 2.6;
  const u = (((t + phase) % per) + per) % per / per;
  const con = u < 0.35 ? Math.sin((u / 0.35) * Math.PI / 2) : Math.cos(((u - 0.35) / 0.65) * Math.PI / 2); // contracción rápida, expansión lenta
  const R = 90 * (1 - con * 0.18);
  const Hh = 52 * (1 + con * 0.25);
  const lap = 22;
  const rim: V[] = [];
  for (let i = 0; i <= lap; i++) {
    const a = Math.PI + (i / lap) * Math.PI;
    rim.push({x: Math.cos(a) * R, y: Math.sin(a) * Hh * (1 + 0.04 * Math.sin(i * 3))});
  }
  const bell = smoothPath([...rim, {x: R * 0.92, y: 10}, ...Array.from({length: lap + 1}, (_, i) => ({x: R * 0.92 - (i / lap) * R * 1.84, y: 10 + Math.sin(i * 1.7 + t * 2) * 2 + (i % 2) * 6}))], true);
  const ten = Array.from({length: 20}, (_, i) => {
    const bx = -R * 0.9 + (i / 19) * R * 1.8;
    const ph = t * 2.2 - i * 0.35 + hash1(i) * 2;
    const len = 90 + hash1(i * 3) * 50;
    const lag = con * 30;
    return `M${f1(bx)} 12q${f1(Math.sin(ph) * 14)} ${f1(len * 0.5 - lag)} ${f1(Math.sin(ph - 1) * 22 - bx * 0.08)} ${f1(len - lag)}`;
  });
  const long = `M${f1(R * 0.3)} 14C${f1(R * 0.4 + Math.sin(t * 0.8) * 30)} 140 ${f1(R * 0.1 + Math.sin(t * 0.6 + 1) * 60)} 300 ${f1(R * 0.5 + Math.sin(t * 0.5 + 2) * 90)} 460`;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(tilt * 57.3)}) scale(${s})`} opacity={op}>
      <defs>
        <radialGradient id="atolla-b" cx="0.5" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#5a0a1a" />
          <stop offset="0.6" stopColor="#8a1a2a" stopOpacity={0.9} />
          <stop offset="1" stopColor="#c84a5a" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      {ten.map((d, i) => <path key={i} d={d} stroke="#d87a8a" strokeWidth={1.6} fill="none" opacity={0.6} />)}
      <path d={long} stroke="#e8a0aa" strokeWidth={2.4} fill="none" opacity={0.7} />
      <path d={bell} fill="url(#atolla-b)" stroke="#ffb0bc" strokeWidth={1.2} opacity={0.92} />
      {/* surco coronal y estómago */}
      <ellipse cx={0} cy={-Hh * 0.35} rx={R * 0.55} ry={Hh * 0.28} fill="none" stroke="#ffb8c4" strokeWidth={1.5} opacity={0.5} />
      <ellipse cx={0} cy={-Hh * 0.38} rx={R * 0.32} ry={Hh * 0.22} fill="#3a0410" opacity={0.85} />
      <path d={`M${-R * 0.7} ${-Hh * 0.6}Q0 ${-Hh * 1.05} ${R * 0.5} ${-Hh * 0.7}`} stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.3} />
      {/* bioluminiscencia en rueda (alarma) */}
      {glow > 0.01 && Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const k = Math.max(0, Math.cos(a - t * 7)) ** 6;
        return <circle key={`g${i}`} cx={f1(Math.cos(a) * R * 0.85)} cy={f1(4 + Math.sin(a) * 9)} r={4 + 9 * k} fill="#6ad8ff" opacity={glow * (0.25 + 0.75 * k)} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ 11 pez pelícano
export const Gulper: React.FC<{x: number; y: number; s?: number; t: number; open?: number; dir?: 1 | -1; angle?: number; glow?: number}> = ({x, y, s = 1, t, open = 0, dir = 1, angle = 0, glow = 0.5}) => {
  const o = clamp(open);
  const n = 26;
  const body: V[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    body.push({x: -60 - u * 620, y: Math.sin(t * 2.4 - u * 6) * (6 + u * 46)});
  }
  const top = body.map((p, i) => ({x: p.x, y: p.y - lerp(22, 1.5, i / n)}));
  const bot = body.map((p, i) => ({x: p.x, y: p.y + lerp(22, 1.5, i / n)}));
  const tail = body[n];
  // mandíbulas: superior fija, inferior con bolsa elástica que se abre
  const jawA = o * 0.9;
  const lowTip = {x: Math.cos(jawA) * 150, y: Math.sin(jawA) * 150};
  const pouch = `M-40 10Q${f1(lowTip.x * 0.5)} ${f1(40 + o * 130)} ${f1(lowTip.x)} ${f1(lowTip.y + 4)}L${f1(lowTip.x - 6)} ${f1(lowTip.y - 4)}Q${f1(lowTip.x * 0.4)} ${f1(10 + o * 40)} -40 0Z`;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(angle * 57.3)}) scale(${dir * s} ${s})`}>
      <path d={smoothPath([...top, ...[...bot].reverse()], true)} fill="#2a2232" stroke="#6a5a7a" strokeWidth={2} />
      <path d={smoothPath(top.slice(4))} stroke="#3a3044" strokeWidth={2} fill="none" opacity={0.6} />
      <path d={pouch} fill="#3a2c40" stroke="#7a6a88" strokeWidth={2} opacity={0.95} />
      <path d="M-50 -22C20 -30 110 -18 150 -4L148 4C100 -6 20 -4 -50 4Z" fill="#2a2232" stroke="#7a6a88" strokeWidth={2} />
      <circle cx={136} cy={-8} r={3.2} fill="#9aa4b8" />
      {/* órgano luminoso de la punta de la cola */}
      <circle cx={f1(tail.x)} cy={f1(tail.y)} r={6} fill="#ff6a8a" opacity={0.4 + 0.6 * glow * (0.6 + 0.4 * Math.sin(t * 5))} />
      <circle cx={f1(tail.x)} cy={f1(tail.y)} r={14} fill="#ff6a8a" opacity={0.15 * glow} />
    </g>
  );
};

// ------------------------------------------------------------------ 12 pulpo dumbo
export const Dumbo: React.FC<{x: number; y: number; s?: number; t: number; swim?: number; angle?: number; tone?: number; look?: V}> = ({x, y, s = 1, t, swim = 0.5, angle = 0, tone = 0}) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
  const open = lerp(0.35, 1, pulse * swim + (1 - swim) * 0.6);
  const fin = Math.sin(t * 3.2) * 0.5;
  const col = mixColor('#e8946a', '#2a1410', tone * 0.6);
  const colD = mixColor('#c06a4a', '#1a0a08', tone * 0.6);
  const arms = Array.from({length: 8}, (_, i) => {
    const base = {x: -40 + i * 11.4, y: 30};
    const spread = (i - 3.5) * 0.22 * open;
    const pts: V[] = [base];
    let a = Math.PI / 2 + spread;
    let p = base;
    for (let k = 1; k <= 10; k++) {
      a += Math.sin(t * 2 - k * 0.5 + i * 0.8) * 0.05 + spread * 0.04;
      p = {x: p.x + Math.cos(a) * 15, y: p.y + Math.sin(a) * 15 * (0.7 + 0.3 * open)};
      pts.push(p);
    }
    return pts;
  });
  const webPts = [arms[0][7], ...arms.map((a) => a[6]), arms[7][7]];
  const web = smoothPath([{x: -42, y: 30}, ...arms.slice(0, 8).map((a, i) => a[i % 2 ? 6 : 7]), {x: 42, y: 30}], true);
  const finP = (sg: number) => `M${sg * 34} -40q${f1(sg * 40)} ${f1(-20 + fin * 30 * sg)} ${f1(sg * 58)} ${f1(-6 + fin * 40)}q${f1(-sg * 20)} 18 ${f1(-sg * 52)} 12Z`;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(angle * 57.3)}) scale(${s})`}>
      <path d={web} fill={col} opacity={0.55} />
      {arms.map((a, i) => <path key={i} d={smoothPath(a)} stroke={i % 2 ? colD : col} strokeWidth={8 - 0} strokeLinecap="round" fill="none" opacity={0.9} />)}
      {arms.map((a, i) => a.slice(2, 10).map((q, k) => <line key={`${i}-${k}`} x1={f1(q.x)} y1={f1(q.y)} x2={f1(q.x + (i < 4 ? -6 : 6))} y2={f1(q.y + 3)} stroke="#f8c8a8" strokeWidth={1.2} opacity={0.6} />))}
      <path d={finP(1)} fill={colD} opacity={0.9} />
      <path d={finP(-1)} fill={colD} opacity={0.9} />
      {/* manto */}
      <path d={`M-46 34C-56 -10 -40 -70 0 ${f1(-74 - pulse * 6)}C40 -70 56 -10 46 34Z`} fill={col} stroke={colD} strokeWidth={2} />
      <path d="M-24 -50Q0 -66 22 -54" stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.3} />
      {Array.from({length: 9}, (_, i) => <circle key={i} cx={-30 + hash1(i) * 60} cy={-40 + hash1(i * 3) * 60} r={2} fill={colD} opacity={0.5} />)}
      {/* ojos */}
      {[-20, 20].map((ex) => <g key={ex}><circle cx={ex} cy={6} r={10} fill="#1a0e0a" /><circle cx={ex + 3} cy={3} r={3} fill="#ffffff" opacity={0.7} /></g>)}
      {webPts.length > 0 && null}
    </g>
  );
};

// ------------------------------------------------------------------ 13 pepino de mar abisal (Psychropotes longicauda)
export const SeaCucumber: React.FC<{x: number; y: number; s?: number; t: number; crawl?: number; feed?: number; dir?: 1 | -1; tone?: number}> = ({x, y, s = 1, t, crawl = 0.5, feed = 0.5, dir = 1, tone = 0}) => {
  const n = 18;
  const wave = (u: number) => Math.max(0, Math.sin(u * 7 - t * 2.2 * crawl)) * 8 * crawl;
  const top: V[] = [];
  const bot: V[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const xx = 140 - u * 280;
    const h = Math.sin(Math.PI * Math.pow(u * 0.96 + 0.02, 0.8)) * 38 + 8 + wave(u);
    top.push({x: xx, y: -h});
    bot.push({x: xx, y: 2 + Math.sin(u * 9) * 1.5});
  }
  const col = mixColor('#c8a0c8', '#140a14', tone * 0.6);
  const colD = mixColor('#8a5a90', '#0a040a', tone * 0.6);
  const sail = `M-90 ${f1(top[13].y + 4)}C-110 -110 ${f1(-150 + Math.sin(t * 0.8) * 10)} -170 ${f1(-120 + Math.sin(t * 0.8) * 14)} -190C-90 -150 -80 -90 -60 ${f1(top[11].y + 4)}Z`;
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${dir * s} ${s})`}>
      <ellipse cx={0} cy={6} rx={170} ry={12} fill="#000" opacity={0.25} />
      <path d={sail} fill={colD} opacity={0.85} stroke={mixColor(colD, '#ffffff', 0.2)} strokeWidth={1.5} />
      <path d={smoothPath([...top, ...[...bot].reverse()], true)} fill={col} opacity={0.88} stroke={colD} strokeWidth={2} />
      {/* papilas y textura */}
      {top.slice(2, 16).map((p, i) => <path key={i} d={`M${f1(p.x)} ${f1(p.y + 2)}l${f1(-3 + hash1(i) * 6)} -10`} stroke={colD} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />)}
      {Array.from({length: 14}, (_, i) => <circle key={`d${i}`} cx={f1(120 - i * 18)} cy={f1(-14 - hash1(i * 4) * 18)} r={2} fill={colD} opacity={0.5} />)}
      {/* pies ambulacrales */}
      {Array.from({length: 12}, (_, i) => <path key={`p${i}`} d={`M${f1(110 - i * 20)} 2l${f1(Math.sin(t * 3 * crawl + i) * 4)} 8`} stroke={colD} strokeWidth={4} strokeLinecap="round" />)}
      {/* tentáculos orales que barren el sedimento */}
      {Array.from({length: 6}, (_, i) => {
        const a = 0.4 + i * 0.25 + Math.sin(t * 2.6 + i) * 0.35 * feed;
        return <path key={`t${i}`} d={`M140 -8q${f1(Math.cos(a) * 16)} ${f1(Math.sin(a) * 6)} ${f1(Math.cos(a) * 26)} ${f1(Math.sin(a) * 18)}`} stroke={col} strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      {feed > 0.1 && [0, 1, 2].map((k) => {
        const ph = ((t * 0.6 + k / 3) % 1);
        return <ellipse key={`s${k}`} cx={160 + ph * 30} cy={4 - ph * 16} rx={6 + ph * 16} ry={3 + ph * 6} fill="#b8b0a0" opacity={0.35 * (1 - ph) * feed} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ 15 anfípodo hadal (Hirondellea gigas)
export const Amphipod: React.FC<{x: number; y: number; s?: number; t: number; walk?: number; dir?: 1 | -1; swim?: number; feed?: number; tone?: number; seed?: number}> = ({x, y, s = 1, t, walk = 0.5, dir = 1, swim = 0, feed = 0, tone = 0, seed = 0}) => {
  const segs = 13;
  const flex = Math.sin(t * 1.5 + seed) * 0.03 + swim * Math.sin(t * 9 + seed) * 0.06;
  const col = mixColor('#f2e2d8', '#1a1412', tone * 0.6);
  const colD = mixColor('#c8a898', '#0a0806', tone * 0.6);
  // eje dorsal curvado (cuerpo comprimido lateralmente y arqueado)
  const axis: V[] = [];
  let a = -0.25;
  let p = {x: 70, y: -20};
  for (let i = 0; i <= segs; i++) {
    axis.push(p);
    a += 0.16 + flex;
    const len = i < 1 ? 14 : i < 8 ? 12 : 10 - (i - 8) * 0.8;
    p = {x: p.x - Math.cos(a) * len, y: p.y + Math.sin(a) * len * 0.9};
  }
  const height = (i: number) => (i < 1 ? 16 : i < 8 ? 22 - (i - 1) * 0.2 : 18 - (i - 8) * 2.4);
  const plates = axis.slice(0, -1).map((q, i) => {
    const h = height(i);
    const n = axis[i + 1];
    return `M${f1(q.x)} ${f1(q.y)}L${f1(n.x)} ${f1(n.y)}L${f1(n.x + 2)} ${f1(n.y + h)}L${f1(q.x + 2)} ${f1(q.y + h + 2)}Z`;
  });
  const legBase = (i: number) => {
    const q = axis[1 + i];
    return {x: q.x, y: q.y + height(1 + i) + 1};
  };
  return (
    <g transform={`translate(${f1(x)} ${f1(y)}) scale(${dir * s} ${s})`}>
      {/* 7 pares de patas (pereiópodos) con desfase propio: andar sobre el fondo */}
      {Array.from({length: 7}, (_, i) => {
        const b = legBase(i);
        const ph = t * 7 * walk - i * 0.9 + seed;
        const reach = i < 2 ? 1 : i < 4 ? -0.2 : -0.8;
        const k1 = {x: b.x + (reach * 10 + Math.cos(ph) * 7 * walk), y: b.y + 12};
        const k2 = {x: k1.x + reach * 6 + Math.cos(ph + 1) * 5 * walk, y: k1.y + 12 - Math.max(0, Math.sin(ph)) * 5 * walk};
        return <path key={`l${i}`} d={`M${f1(b.x)} ${f1(b.y)}L${f1(k1.x)} ${f1(k1.y)}L${f1(k2.x)} ${f1(k2.y)}`} stroke={colD} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      })}
      {/* placas del cuerpo */}
      {plates.map((d, i) => <path key={i} d={d} fill={i % 2 ? col : mixColor(col, colD, 0.25)} stroke={colD} strokeWidth={1} />)}
      {/* placas coxales */}
      {Array.from({length: 4}, (_, i) => {
        const b = legBase(i);
        return <path key={`c${i}`} d={`M${f1(b.x - 6)} ${f1(b.y - 4)}q6 12 12 0Z`} fill={mixColor(col, colD, 0.4)} stroke={colD} strokeWidth={0.8} />;
      })}
      {/* pleópodos (natación) y urópodos */}
      {[8, 9, 10].map((i, k) => {
        const q = axis[i];
        return <path key={`pl${k}`} d={`M${f1(q.x)} ${f1(q.y + height(i))}l${f1(Math.sin(t * 12 * (0.3 + swim) + k) * 4)} 9`} stroke={colD} strokeWidth={2} />;
      })}
      {[segs - 1, segs].map((i, k) => {
        const q = axis[i];
        return <path key={`u${k}`} d={`M${f1(q.x)} ${f1(q.y + 6)}l${f1(-10 - k * 3)} ${f1(6 + k * 3)}`} stroke={colD} strokeWidth={2.5} strokeLinecap="round" />;
      })}
      {/* cabeza, ojo reducido y dos pares de antenas articuladas */}
      <path d={`M${f1(axis[0].x)} ${f1(axis[0].y)}q12 2 14 14q-4 6 -14 6Z`} fill={col} stroke={colD} strokeWidth={1} />
      <ellipse cx={f1(axis[0].x + 6)} cy={f1(axis[0].y + 7)} rx={3} ry={4} fill={mixColor('#c87a5a', '#000', tone * 0.5)} opacity={0.6} />
      {[0, 1].map((k) => {
        const b = {x: axis[0].x + 12, y: axis[0].y + 4 + k * 6};
        const sw = Math.sin(t * (2.2 + k) + seed + feed * 3) * 0.3;
        const a1 = -0.5 + k * 0.5 + sw;
        const j1 = {x: b.x + Math.cos(a1) * 14, y: b.y + Math.sin(a1) * 14};
        const a2 = a1 + 0.3 + Math.sin(t * 3 + k + seed) * 0.25;
        const j2 = {x: j1.x + Math.cos(a2) * (k ? 16 : 22), y: j1.y + Math.sin(a2) * (k ? 16 : 22)};
        return <path key={`a${k}`} d={`M${f1(b.x)} ${f1(b.y)}L${f1(j1.x)} ${f1(j1.y)}L${f1(j2.x)} ${f1(j2.y)}`} stroke={colD} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
      })}
      {/* brillo del exoesqueleto */}
      <path d={smoothPath(axis.slice(1, 10).map((q) => ({x: q.x, y: q.y + 4})))} stroke="#ffffff" strokeWidth={2.5} fill="none" opacity={0.35 * (1 - tone)} />
    </g>
  );
};
