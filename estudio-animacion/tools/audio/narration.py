#!/usr/bin/env python3
"""Locución del episodio con Piper (voz neuronal es_MX-claude-high, licencia Apache-2.0).

1. Sintetiza cada frase de narration.json por separado.
2. MIDE su duración real (recortando el silencio de los extremos).
3. Verifica que ninguna frase se solape con la siguiente ni se salga del video.
4. Monta la pista completa (180 s) colocando cada frase en su instante `at`.
5. Escribe narration-timing.json (lo usa el video para subtítulos y ducking).

Uso:
  pip install piper-tts==1.3.0 numpy soundfile
  python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'src/episodes/ep01-pulpo/narration.json')
TIMING = os.path.join(ROOT, 'src/episodes/ep01-pulpo/narration-timing.json')
OUT_DIR = os.path.join(ROOT, 'public/audio/ep01')
SR = 44100
MIN_GAP = 0.18  # silencio mínimo entre frases (s)
MAX_DRIFT = 1.0  # retraso máximo tolerado respecto al instante deseado


def synth(text, voice, cfg, path, length=None):
    cmd = [sys.executable, '-m', 'piper', '-m', voice, '-f', path,
           '--length-scale', str(length or cfg.get('lengthScale', 1.0)),
           '--noise-scale', str(cfg.get('noiseScale', 0.667)),
           '--noise-w-scale', str(cfg.get('noiseW', 0.8))]
    subprocess.run(cmd, input=text.encode('utf-8'), check=True, capture_output=True)


def load_trim(path):
    data, sr = sf.read(path, dtype='float32')
    if data.ndim > 1:
        data = data.mean(axis=1)
    # remuestreo lineal a 44.1 kHz (suficiente para voz)
    if sr != SR:
        n = int(round(len(data) * SR / sr))
        data = np.interp(np.linspace(0, len(data) - 1, n), np.arange(len(data)), data).astype(np.float32)
    env = np.abs(data)
    thr = 0.012 * env.max()
    idx = np.where(env > thr)[0]
    a = max(0, idx[0] - int(0.02 * SR))
    b = min(len(data), idx[-1] + int(0.06 * SR))
    seg = data[a:b]
    fade = int(0.01 * SR)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    return seg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', required=True)
    # por defecto, Episodio 01 (comportamiento original); otros episodios pasan sus rutas
    ap.add_argument('--src', default=SRC)
    ap.add_argument('--timing', default=TIMING)
    ap.add_argument('--out-dir', default=OUT_DIR)
    args = ap.parse_args()
    spec = json.load(open(args.src, encoding='utf-8'))
    total = spec['durationSec']
    cfg = spec['voice']
    os.makedirs(args.out_dir, exist_ok=True)
    track = np.zeros(int(total * SR), dtype=np.float32)
    timing = []
    problems = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, line in enumerate(spec['lines']):
            p = os.path.join(tmp, f"{line['id']}.wav")
            synth(line['text'], args.voice, cfg, p, line.get('lengthScale'))
            seg = load_trim(p)
            dur = len(seg) / SR
            prev_end = timing[-1]['end'] if timing else 0.0
            start = max(line['at'], prev_end + MIN_GAP + 0.07)
            drift = start - line['at']
            if drift > MAX_DRIFT:
                problems.append(f"{line['id']} tuvo que retrasarse {drift:.2f}s (máx {MAX_DRIFT}s): acortar el texto anterior")
            end = start + dur
            timing.append({**line, 'drift': round(drift, 3), 'start': round(start, 3), 'end': round(end, 3), 'duration': round(dur, 3)})
            s = int(start * SR)
            track[s:s + len(seg)] += seg[: max(0, len(track) - s)]
            print(f"{line['id']:4s} {start:7.2f} → {end:7.2f}  ({dur:4.2f}s)  {line['text'][:60]}")
    for a, b in zip(timing, timing[1:]):
        if a['end'] + MIN_GAP > b['start']:
            problems.append(f"SOLAPE {a['id']} termina {a['end']:.2f} y {b['id']} empieza {b['start']:.2f}")
    if timing[-1]['end'] > total - 0.5:
        problems.append(f"La última frase termina en {timing[-1]['end']:.2f}s (límite {total - 0.5}s)")
    # normalización de pico a -1 dBFS
    peak = np.abs(track).max()
    track *= (10 ** (-1 / 20)) / peak
    wav = os.path.join(tmp_dir := tempfile.mkdtemp(), 'narracion.wav')
    sf.write(wav, track, SR)
    out = os.path.join(args.out_dir, 'narracion.m4a')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', '128k', out], check=True)
    speech = sum(t['duration'] for t in timing)
    report = {
        'voice': cfg,
        'lines': len(timing),
        'speechSeconds': round(speech, 2),
        'coverage': round(speech / total, 3),
        'problems': problems,
        'timing': timing,
    }
    json.dump(report, open(args.timing, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"\nVoz total {speech:.1f}s de {total}s ({100 * speech / total:.0f}%) → {out}")
    if problems:
        print('PROBLEMAS:\n  ' + '\n  '.join(problems))
        sys.exit(2)


if __name__ == '__main__':
    main()
