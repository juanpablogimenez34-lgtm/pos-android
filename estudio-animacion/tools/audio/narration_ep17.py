#!/usr/bin/env python3
"""Locución de la demo «De huevo a sapo» (15 s) con Piper es_MX-claude-high + lecho sonoro suave.

Cada frase se sintetiza, se mide y se coloca en su instante; si no cabe antes de la siguiente,
se acelera (length-scale) hasta que quepa. Salida: public/audio/ep17-de-huevo-a-sapo/
  narracion.wav, mezcla.wav (voz + lecho, -14 LUFS aprox.) y narracion-timing.json.
Uso: python3 tools/audio/narration_ep17.py --voice /ruta/es_MX-claude-high.onnx
"""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public/audio/ep17-de-huevo-a-sapo')
SR, DUR, GAP = 44100, 15.0, 0.15
LINES = [  # (instante, fin máximo, texto)
    (0.30, 2.70, 'Todo empieza en un cordón de huevos.'),
    (2.50, 5.05, 'En diez días, el embrión se forma'),
    (5.10, 6.45, 'y nace un renacuajo.'),
    (6.50, 8.35, 'Semanas nadando y creciendo.'),
    (8.40, 10.30, 'Le salen las patas.'),
    (10.35, 11.35, 'Adiós a la cola.'),
    (11.40, 12.85, 'Su primer salto.'),
    (12.95, 13.90, 'Años después.'),
    (13.95, 14.95, 'De huevo a sapo.'),
]

def synth(text, voice, length):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: p = f.name
    subprocess.run([sys.executable, '-m', 'piper', '-m', voice, '-f', p, '--length-scale', str(length),
                    '--noise-scale', '0.6', '--noise-w-scale', '0.7'], input=text.encode(), check=True, capture_output=True)
    d, sr = sf.read(p, dtype='float32'); os.unlink(p)
    if d.ndim > 1: d = d.mean(1)
    d = np.interp(np.linspace(0, len(d) - 1, int(len(d) * SR / sr)), np.arange(len(d)), d).astype(np.float32)
    idx = np.where(np.abs(d) > 0.012 * np.abs(d).max())[0]
    d = d[max(0, idx[0] - 880): idx[-1] + 2600].copy()
    fz = 441; d[:fz] *= np.linspace(0, 1, fz); d[-fz:] *= np.linspace(1, 0, fz)
    return d

def bed(n):
    """Lecho ambiental sintetizado: pad suave (agua → bosque) y gotas; sin muestras externas."""
    t = np.arange(n) / SR; rng = np.random.default_rng(17); out = np.zeros(n, np.float32)
    under = np.clip((10.1 - t) / 0.4, 0, 1); shore = 1 - under
    for f, a in ((110, .5), (164.8, .35), (220, .25), (277.2, .18)):        # pad bajo el agua (La)
        out += a * under * np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .13 * t) * 2)
    for f, a in ((146.8, .45), (220, .3), (293.7, .22), (370, .15)):        # pad en la orilla (Re), más cálido
        out += a * shore * np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .11 * t) * 2)
    noise = rng.standard_normal(n).astype(np.float32)
    k = int(SR * .004); low = np.convolve(noise, np.ones(k) / k, 'same')   # rumor de agua filtrado
    out += 3.0 * under * low * (0.6 + 0.4 * np.sin(2 * np.pi * .3 * t))
    for s in np.arange(10.4, 15, 0.9) + rng.uniform(-.2, .2, 6):            # gotas en el bosque
        i = int(s * SR); m = min(n - i, int(.12 * SR)); tt = np.arange(m) / SR
        out[i:i + m] += .6 * np.sin(2 * np.pi * (1400 - 4000 * tt) * tt) * np.exp(-tt * 45)
    fade = np.clip(t / 0.8, 0, 1) * np.clip((DUR - t) / 0.8, 0, 1)
    return out * fade / np.abs(out).max()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--voice', required=True); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True); n = int(DUR * SR); voice = np.zeros(n, np.float32); timing = []
    for at, end, text in LINES:
        L = 1.0
        while True:
            seg = synth(text, a.voice, L)
            if at + len(seg) / SR <= end - GAP or L <= 0.82: break
            L = round(L - 0.04, 2)
        dur = len(seg) / SR
        if at + dur > end: sys.exit(f'NO CABE: «{text}» {dur:.2f}s en [{at},{end}]')
        i = int(at * SR); voice[i:i + len(seg)] += seg
        timing.append({'at': at, 'end': round(at + dur, 3), 'lengthScale': L, 'text': text})
        print(f'{at:5.2f}–{at + dur:5.2f}s  L={L:.2f}  {text}')
    voice /= np.abs(voice).max() / 0.9
    env = np.convolve((np.abs(voice) > 0.02).astype(np.float32), np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
    duck = 1 - 0.55 * np.clip(env * 3, 0, 1)                                   # el lecho baja bajo la voz
    mix = voice + 0.16 * bed(n) * duck
    sf.write(os.path.join(OUT, 'narracion.wav'), voice, SR)
    sf.write(os.path.join(OUT, 'mezcla.wav'), (mix / np.abs(mix).max() * 0.95).astype(np.float32), SR)
    json.dump(timing, open(os.path.join(OUT, 'narracion-timing.json'), 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__': main()
