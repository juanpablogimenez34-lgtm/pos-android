import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeOut} from './math';
import {FONT_FAMILY} from './fonts';
import {useTime} from './useTime';

type Props = {
  start: number; // segundos
  kicker: string; // línea pequeña superior
  title: string; // línea principal
  accent?: string;
  /** Centro vertical como fracción de la altura. */
  centerY?: number;
  /** Iconos decorativos que laten en secuencia (p.ej. 3 corazones). */
  icons?: number;
  iconColor?: string;
};

const Heart: React.FC<{size: number; color: string; beat: number}> = ({size, color, beat}) => (
  <svg width={size} height={size} viewBox="-12 -12 24 24" style={{transform: `scale(${1 + beat * 0.22})`, overflow: 'visible'}}>
    <path d="M0,9 C-9,3 -11,-2 -10,-5 C-9,-9 -3,-10 0,-5 C3,-10 9,-9 10,-5 C11,-2 9,3 0,9Z" fill={color} />
    <path d="M-6,-6 C-8,-5 -8,-3 -7.5,-2" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.6} fill="none" strokeLinecap="round" />
  </svg>
);

/** Rótulo cinematográfico: letras que entran escalonadas + barrido de luz + iconos con latido. */
export const TitleCard: React.FC<Props> = ({start, kicker, title, accent = '#ffd27a', centerY = 0.2, icons = 0, iconColor = '#5fd0ff'}) => {
  const t = useTime() - start;
  const {width, height} = useVideoConfig();
  if (t < 0) return null;
  const kickIn = easeOut(t / 0.5);
  const sweep = clamp((t - 0.55) / 0.9);
  const letters = title.split('');
  return (
    <div style={{position: 'absolute', left: 0, width, top: height * centerY, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT_FAMILY}}>
      <div
        style={{
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: 10 + (1 - kickIn) * 18,
          color: '#e9fffb',
          opacity: kickIn,
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}
      >
        {kicker}
      </div>
      <div style={{position: 'relative', marginTop: 6, fontWeight: 900, fontSize: 104, lineHeight: 1.0, letterSpacing: 1}}>
        {letters.map((ch, i) => {
          const p = easeOut((t - 0.15 - i * 0.035) / 0.45);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                minWidth: ch === ' ' ? 28 : undefined,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`,
                color: accent,
                textShadow: `0 0 28px ${accent}55, 0 5px 16px rgba(0,0,0,0.65)`,
              }}
            >
              {ch}
            </span>
          );
        })}
        {/* barrido de luz */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep * 140 - 30}%, rgba(255,255,255,0.55) ${sweep * 140 - 15}%, rgba(255,255,255,0) ${sweep * 140}%)`,
            mixBlendMode: 'overlay',
            opacity: sweep > 0 && sweep < 1 ? 1 : 0,
          }}
        />
      </div>
      {icons > 0 && (
        <div style={{display: 'flex', justifyContent: 'center', gap: 26, marginTop: 22}}>
          {Array.from({length: icons}, (_, i) => {
            const appear = easeOut((t - 0.8 - i * 0.15) / 0.35);
            const ph = (t * 1.2 - i * 0.18) % 1;
            const beat = ph > 0 && ph < 0.15 ? Math.sin((ph / 0.15) * Math.PI) : 0;
            return (
              <div key={i} style={{opacity: appear, transform: `translateY(${(1 - appear) * 16}px)`}}>
                <Heart size={46} color={iconColor} beat={beat * appear} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
