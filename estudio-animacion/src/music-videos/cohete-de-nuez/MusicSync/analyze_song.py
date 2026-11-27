#!/usr/bin/env python3
"""Análisis del audio REAL del videoclip (sin inventar marcas temporales).

Uso:
  python3 src/music-videos/cohete-de-nuez/MusicSync/analyze_song.py <cancion.mp3> [letra.txt]

Escribe src/music-videos/cohete-de-nuez/MusicSync/song-map.json con:
  - durationSec / frames (30 fps): duración exacta medida con ffprobe
  - tempo (BPM) y pulsos (beats) detectados con flujo espectral + programación dinámica
  - compases (cada 4 pulsos, empezando en el pulso más fuerte)
  - energía por 0,1 s y fronteras de sección (novedad de un autosimilitud de bandas)
  - tramos con voz probable (energía en la banda de la voz con armonicidad), solo como estimación
Si se aporta la letra (secciones separadas por líneas en blanco, con una etiqueta entre
corchetes, p. ej. "[cuenta regresiva]"), las secciones se asignan EN ORDEN a los tramos de voz
detectados; el resultado debe revisarse escuchando la canción.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks, stft

SR = 22050
HOP = 512
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'song-map.json')


def load(path):
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).decode().strip())
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(raw, dtype=np.float32).copy(), dur


def spectrum(y):
    f, t, Z = stft(y, fs=SR, nperseg=2048, noverlap=2048 - HOP, boundary=None)
    return f, t, np.abs(Z)


def onset_envelope(S):
    L = np.log1p(S * 100)
    flux = np.maximum(0, np.diff(L, axis=1)).sum(axis=0)
    flux = np.concatenate([[0], flux])
    flux -= uniform_filter1d(flux, 16)
    flux = np.maximum(flux, 0)
    return flux / (flux.max() + 1e-9)


def tempo(env, fps):
    ac = np.correlate(env - env.mean(), env - env.mean(), 'full')[len(env) - 1:]
    lags = np.arange(len(ac)) / fps
    bpm = 60 / np.maximum(lags, 1e-9)
    mask = (bpm >= 60) & (bpm <= 180)
    # ligera preferencia por tempos cercanos a 110 BPM (canciones infantiles)
    w = np.exp(-0.5 * (np.log2(np.maximum(bpm, 1) / 110) / 0.9) ** 2)
    best = np.argmax(ac * mask * w)
    return 60 / lags[best]


def track_beats(env, fps, bpm, tight=100.0):
    """Seguimiento de pulsos por programación dinámica (Ellis, 2007)."""
    period = fps * 60 / bpm
    n = len(env)
    score = env.copy()
    back = -np.ones(n, dtype=int)
    lo, hi = int(round(period * 0.5)), int(round(period * 2))
    for i in range(n):
        a, b = i - hi, i - lo
        if b <= 0:
            continue
        a = max(a, 0)
        prev = np.arange(a, b)
        pen = -tight * (np.log((i - prev) / period)) ** 2
        cand = score[prev] + pen
        j = np.argmax(cand)
        score[i] = env[i] + cand[j]
        back[i] = prev[j]
    i = int(np.argmax(score[-int(period * 2):]) + n - int(period * 2))
    beats = []
    while i >= 0:
        beats.append(i)
        i = back[i]
    return np.array(beats[::-1])


def novelty(S, f, fps):
    bands = np.geomspace(60, 8000, 25)
    B = np.stack([S[(f >= bands[k]) & (f < bands[k + 1])].sum(axis=0) for k in range(24)])
    B = np.log1p(B)
    # promedio cada 0,5 s para estabilidad
    step = max(1, int(fps * 0.5))
    m = B.shape[1] // step
    X = B[:, : m * step].reshape(24, m, step).mean(axis=2)
    X = (X - X.mean(axis=1, keepdims=True)) / (X.std(axis=1, keepdims=True) + 1e-9)
    Xn = X / (np.linalg.norm(X, axis=0, keepdims=True) + 1e-9)
    SSM = Xn.T @ Xn
    K = 8
    g = np.outer(np.r_[-np.ones(K), np.ones(K)], np.r_[-np.ones(K), np.ones(K)]) * -1
    nov = np.zeros(m)
    for i in range(K, m - K):
        nov[i] = (SSM[i - K:i + K, i - K:i + K] * g).sum()
    nov = np.maximum(nov, 0)
    nov /= nov.max() + 1e-9
    peaks, _ = find_peaks(nov, height=0.25, distance=int(6 / 0.5))
    return [round(p * 0.5, 2) for p in peaks], nov


def vocal_activity(S, f, fps):
    voc = S[(f >= 250) & (f <= 3500)]
    rest = S[(f < 200) | (f > 5000)]
    ratio = np.log1p(voc.sum(axis=0)) - np.log1p(rest.sum(axis=0))
    # armonicidad simple: picos espectrales marcados en la banda de la voz
    peak = voc.max(axis=0) / (voc.mean(axis=0) + 1e-9)
    score = uniform_filter1d((ratio - np.median(ratio)) + 0.05 * (peak - np.median(peak)), int(fps * 0.4))
    on = score > np.percentile(score, 45)
    segs = []
    start = None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        if (not v or i == len(on) - 1) and start is not None:
            if (i - start) / fps > 1.2:
                segs.append([round(start / fps, 2), round(i / fps, 2)])
            start = None
    # unir tramos separados por pausas cortas (< 0,8 s)
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < 0.8:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return merged


def parse_lyrics(path):
    sections = []
    cur = None
    for line in open(path, encoding='utf-8').read().splitlines():
        line = line.strip()
        if line.startswith('[') and line.endswith(']'):
            cur = {'label': line[1:-1], 'lines': []}
            sections.append(cur)
        elif line and cur is not None:
            cur['lines'].append(line)
    return sections


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    y, dur = load(path)
    f, t, S = spectrum(y)
    fps = SR / HOP
    env = onset_envelope(S)
    bpm = tempo(env, fps)
    beats = track_beats(env, fps, bpm)
    beat_t = (beats / fps).round(3)
    # compás: el desfase (0–3) cuyo pulso tiene más energía de ataque
    strength = [env[beats[k::4]].mean() if len(beats[k::4]) else 0 for k in range(4)]
    down = int(np.argmax(strength))
    bounds, _ = novelty(S, f, fps)
    rms = np.sqrt(uniform_filter1d(y ** 2, int(SR * 0.1)))[:: int(SR * 0.1)]
    vocals = vocal_activity(S, f, fps)
    out = {
        'source': os.path.basename(path),
        'durationSec': round(dur, 3),
        'fps': 30,
        'frames': int(round(dur * 30)),
        'tempoBpm': round(float(bpm), 2),
        'beats': beat_t.tolist(),
        'downbeats': beat_t[down::4].tolist(),
        'sectionBoundaries': bounds,
        'energy10Hz': [round(float(v), 4) for v in rms / (rms.max() + 1e-9)],
        'vocalSegments': vocals,
        'notes': 'Tempo, pulsos, fronteras y voz son detecciones automáticas sobre el audio; revisar escuchando.',
    }
    if len(sys.argv) > 2:
        secs = parse_lyrics(sys.argv[2])
        out['lyricsSections'] = [{'label': s['label'], 'lines': s['lines'], 'segment': vocals[i] if i < len(vocals) else None} for i, s in enumerate(secs)]
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"Duración {dur:.3f} s · {out['frames']} fotogramas · {bpm:.1f} BPM · {len(beat_t)} pulsos · fronteras {bounds}")
    print(f"Tramos con voz probable: {vocals}")
    print(f"→ {OUT}")


if __name__ == '__main__':
    main()
