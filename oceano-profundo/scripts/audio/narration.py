#!/usr/bin/env python3
"""Narración por escenas con Piper (voz neuronal local es_MX, licencia Apache-2.0).

Modo «flujo»: cada escena tiene una ventana [start, end]; sus frases se sintetizan por separado, se MIDE su
duración real (sin silencios en los extremos) y se encadenan desde start + lead con una pausa `gap`
(+ `pause` opcional por frase). Si una escena se desborda se informa como PROBLEMA (hay que acortar el texto;
nunca se acelera la voz por encima de lo previsto).

Salidas:
  <out-dir>/narracion.m4a              pista completa (duración exacta del video)
  <out-dir>/escenas/escena-NN.m4a      narración de cada escena (exigido: «generar el audio por escenas»)
  <timing>                             tiempos reales de cada frase (subtítulos, ducking, sincronía)

Uso:
  python3 scripts/audio/narration.py --voice <modelo.onnx> [--src src/data/narration.json]
         [--timing src/data/narration-timing.json] [--out-dir public/audio/documental]
Edge TTS: se intenta primero con --engine edge; si falla (sin red, servicio bloqueado), se usa Piper.
"""
import argparse
import asyncio
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 44100


def synth_piper(text, voice, cfg, path, length):
    cmd = [sys.executable, '-m', 'piper', '-m', voice, '-f', path, '--length-scale', str(length),
           '--noise-scale', str(cfg.get('noiseScale', 0.667)), '--noise-w-scale', str(cfg.get('noiseW', 0.8))]
    subprocess.run(cmd, input=text.encode('utf-8'), check=True, capture_output=True)


def synth_edge(text, path, voice='es-MX-JorgeNeural'):
    import edge_tts  # noqa: import tardío: opcional
    mp3 = path + '.mp3'
    asyncio.run(edge_tts.Communicate(text, voice).save(mp3))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, path], check=True)


def load_trim(path):
    data, sr = sf.read(path, dtype='float32')
    if data.ndim > 1:
        data = data.mean(axis=1)
    if sr != SR:
        n = int(round(len(data) * SR / sr))
        data = np.interp(np.linspace(0, len(data) - 1, n), np.arange(len(data)), data).astype(np.float32)
    env = np.abs(data)
    idx = np.where(env > 0.012 * env.max())[0]
    seg = data[max(0, idx[0] - int(0.02 * SR)): min(len(data), idx[-1] + int(0.06 * SR))].copy()
    fade = int(0.01 * SR)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    return seg


def voice_eq(x):
    """Voz documental: leve realce de graves (cuerpo) y suavizado de sibilantes."""
    from scipy.signal import butter, sosfilt
    low = sosfilt(butter(2, 220, 'low', fs=SR, output='sos'), x)
    hi = sosfilt(butter(2, 7500, 'high', fs=SR, output='sos'), x)
    return x + 0.35 * low - 0.3 * hi


def encode(track, path):
    wav = path + '.wav'
    sf.write(wav, track, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', '160k', path], check=True)
    os.remove(wav)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', required=True)
    ap.add_argument('--engine', default='piper', choices=['piper', 'edge'])
    ap.add_argument('--src', default=os.path.join(ROOT, 'src/data/narration.json'))
    ap.add_argument('--timing', default=os.path.join(ROOT, 'src/data/narration-timing.json'))
    ap.add_argument('--out-dir', default=os.path.join(ROOT, 'public/audio/documental'))
    args = ap.parse_args()
    spec = json.load(open(args.src, encoding='utf-8'))
    total = spec['durationSec']
    cfg = spec['voice']
    gap = spec.get('gap', 0.5)
    engine = args.engine
    os.makedirs(os.path.join(args.out_dir, 'escenas'), exist_ok=True)
    track = np.zeros(int(total * SR), dtype=np.float32)
    timing, problems, scenes = [], [], []
    with tempfile.TemporaryDirectory() as tmp:
        for sc in spec['scenes']:
            t = sc['start'] + sc.get('lead', 1.0)
            length = sc.get('lengthScale', cfg.get('lengthScale', 1.0))
            first = None
            for line in sc['lines']:
                p = os.path.join(tmp, f"{line['id']}.wav")
                if engine == 'edge':
                    try:
                        synth_edge(line['text'], p)
                    except Exception as e:  # sin red o servicio bloqueado → alternativa local
                        print(f'  Edge TTS no disponible ({type(e).__name__}); se usa Piper.')
                        engine = 'piper'
                if engine == 'piper':
                    synth_piper(line['text'], args.voice, cfg, p, line.get('lengthScale', length))
                seg = voice_eq(load_trim(p)).astype(np.float32)
                dur = len(seg) / SR
                start = t + line.get('pause', 0.0)
                end = start + dur
                first = first if first is not None else start
                s = int(start * SR)
                track[s:s + len(seg)] += seg[: max(0, len(track) - s)]
                timing.append({**line, 'scene': sc['n'], 'start': round(start, 3), 'end': round(end, 3), 'duration': round(dur, 3)})
                print(f"{line['id']:5s} {start:7.2f} → {end:7.2f}  ({dur:4.2f}s)  {line['text'][:64]}")
                t = end + gap
            last = timing[-1]['end']
            room = sc['end'] - 0.4 - last
            scenes.append({'n': sc['n'], 'start': sc['start'], 'end': sc['end'], 'voiceStart': round(first, 2), 'voiceEnd': round(last, 2), 'room': round(room, 2)})
            print(f"  ── escena {sc['n']}: voz {first:.1f}–{last:.1f} s (margen {room:+.1f} s)")
            if room < 0:
                problems.append(f"Escena {sc['n']} se desborda {-room:.2f} s: acortar el texto")
    peak = np.abs(track).max()
    track *= (10 ** (-1 / 20)) / peak
    encode(track, os.path.join(args.out_dir, 'narracion.m4a'))
    for sc in scenes:
        a, b = int(sc['start'] * SR), int(sc['end'] * SR)
        encode(track[a:b], os.path.join(args.out_dir, 'escenas', f"escena-{sc['n']:02d}.m4a"))
    speech = sum(x['duration'] for x in timing)
    words = sum(len(x['text'].split()) for x in timing)
    report = {'voice': {**cfg, 'engineUsed': engine}, 'lines': len(timing), 'words': words, 'speechSeconds': round(speech, 2),
              'coverage': round(speech / total, 3), 'scenes': scenes, 'problems': problems, 'timing': timing}
    json.dump(report, open(args.timing, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"\n{words} palabras · voz {speech:.1f}s de {total}s ({100 * speech / total:.0f}%) · motor {engine}")
    if problems:
        print('PROBLEMAS:\n  ' + '\n  '.join(problems))
        sys.exit(2)


if __name__ == '__main__':
    main()
