#!/usr/bin/env python3
"""Mapa temporal del videoclip a partir del audio REAL (complementa analyze_song.py).

1. Calcula la energía (RMS cada 20 ms) y localiza los cambios bruscos de intensidad cerca de
   cada frontera observada en el espectrograma, y los ajusta al pulso detectado más cercano.
2. Calcula la envolvente de la voz principal (banda 300–3500 Hz del canal central, restando el
   lateral) a 30 Hz: sirve para mover la boca de forma APROXIMADA (sin análisis de fonemas).
3. Escribe song-map.json con duración, fotogramas, pulsos, compases, secciones y envolvente.

Las fronteras de partida (SEEDS) se leyeron en el espectrograma y la curva de energía de la
propia canción (ver informe); el script las refina con el audio.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import stft

HERE = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HERE, 'song-map.json')
SR = 22050
FPS = 30

# (etiqueta, segundo aproximado observado en el espectrograma, ventana de búsqueda ±s)
SEEDS = [
    ('verse1', 5.0, 0.8),
    ('verse1b', 19.6, 0.8),
    ('countdown', 30.4, 0.0),  # sin cambio de energía claro: se fija a 2 compases antes del estribillo
    ('chorus1', 34.5, 0.8),
    ('break', 64.8, 0.8),
    ('verse2', 66.5, 0.8),
    ('zumi', 75.6, 0.0),  # mitad de la estrofa 2 (compás más cercano)
    ('hold', 80.6, 0.6),  # nota sostenida
    ('chorus2', 84.6, 0.8),
    ('interlude', 114.8, 0.8),
    ('verse3', 119.6, 0.8),
    ('outro', 134.5, 0.8),
]


def main():
    path = sys.argv[1]
    sm = json.load(open(MAP, encoding='utf-8'))
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'])
    y = np.frombuffer(raw, np.float32).reshape(-1, 2)
    mono = y.mean(axis=1)
    hop = int(SR * 0.02)
    rms = np.sqrt(uniform_filter1d(mono ** 2, hop * 5))[::hop]
    lr = np.log(rms + 1e-5)
    d = np.gradient(uniform_filter1d(lr, 10))
    beats = np.array(sm['beats'])
    downs = np.array(sm['downbeats'])
    bar = float(np.median(np.diff(downs)))

    def snap(t, arr):
        return float(arr[np.argmin(np.abs(arr - t))])

    starts = {}
    for label, t0, win in SEEDS:
        if win > 0:
            i0, i1 = int((t0 - win) / 0.02), int((t0 + win) / 0.02)
            i = i0 + int(np.argmax(np.abs(d[i0:i1])))
            starts[label] = snap(i * 0.02, beats)
        else:
            starts[label] = snap(t0, downs)
    starts['countdown'] = snap(starts['chorus1'] - 2 * bar, beats)
    order = ['intro'] + [s[0] for s in SEEDS]
    starts['intro'] = 0.0
    dur = sm['durationSec']
    sections = []
    for i, lab in enumerate(order):
        end = starts[order[i + 1]] if i + 1 < len(order) else dur
        sections.append({'label': lab, 'start': round(starts[lab], 3), 'end': round(end, 3)})
    # envolvente de la voz principal (canal central)
    mid = (y[:, 0] + y[:, 1]) / 2
    side = (y[:, 0] - y[:, 1]) / 2
    f, t, M = stft(mid, fs=SR, nperseg=1024, noverlap=1024 - 256, boundary=None)
    _, _, S = stft(side, fs=SR, nperseg=1024, noverlap=1024 - 256, boundary=None)
    C = np.maximum(np.abs(M) - 1.2 * np.abs(S), 0)
    v = C[(f > 300) & (f < 3500)].sum(axis=0)
    v = uniform_filter1d(v, 3)
    tt = np.arange(len(v)) * 256 / SR
    frames = int(np.ceil(dur * FPS))
    vf = np.interp(np.arange(frames) / FPS, tt, v)
    vf = np.clip(vf / np.percentile(vf, 97), 0, 1)
    sm['frames'] = frames  # el último fotograma contiene el final del audio (no se corta)
    sm['sections'] = sections
    sm['barSec'] = round(bar, 4)
    sm['vocalEnvelope30'] = [round(float(x), 3) for x in vf]
    sm.pop('energy10Hz', None)
    json.dump(sm, open(MAP, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f"{frames} fotogramas ({frames / FPS:.3f} s ≥ {dur:.3f} s) · compás {bar:.3f} s")
    for s in sections:
        print(f"  {s['label']:10s} {s['start']:7.3f} → {s['end']:7.3f}")


if __name__ == '__main__':
    main()
