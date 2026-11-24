#!/usr/bin/env python3
"""Banda sonora ORIGINAL de los cinco Shorts (reutiliza las funciones de síntesis de score.py).
Por Short genera en public/audio/shortN/: musica.m4a, ambiente.m4a, efectos.m4a (efectos + transiciones),
con la duración exacta de la narración medida (src/shorts/data/shortN.json → durationSec).
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import score as S  # noqa: E402

ROOT = S.ROOT
SR = S.SR


def clicks(a, buzz, b):
    out, x, dt = [], a, 0.3
    while x < buzz:
        out.append(x)
        x += 0.7
    while x < b:
        out.append(x)
        x += dt
        dt = max(0.045, dt * 0.85)
    return out


SHORT4_CLICKS = clicks(0.6, 5.6, 5.7) + clicks(17.2, 34.0, 38.6)

# por Short: acordes (inicio relativo 0–1 de la duración, notas), pulsos, golpes, depth, eventos
SPEC = {
    1: dict(chords=[(0, [33, 40, 45, 48]), (0.36, [32, 39, 44, 47, 51]), (0.62, [36, 43, 47, 52, 55]), (0.86, [36, 43, 48, 52, 55, 60])], pulses=[(26.5, 31.4, 33, 3.0)], hits=[0.4, 4.8, 31.4, 61.6], depth=1500,
             fx=lambda x: (strike(x, 31.4))),
    2: dict(chords=[(0, [31, 38, 43, 46]), (0.4, [34, 41, 45, 50, 53]), (0.65, [31, 38, 43, 47, 50]), (0.86, [36, 43, 48, 52, 55, 60])], pulses=[(19.4, 26.0, 31, 3.0)], hits=[0.4, 5.0, 26.0, 56.0], depth=1100,
             fx=lambda x: (strike(x, 26.0))),
    3: dict(chords=[(0, [41, 48, 53, 57, 60]), (0.25, [38, 45, 50, 53, 57]), (0.42, [41, 48, 53, 57, 64]), (0.65, [38, 45, 50, 55, 57]), (0.88, [36, 43, 48, 52, 55, 60])], pulses=[], hits=[0.4, 15.4, 27.5, 38.8, 59.6], depth=700,
             fx=lambda x: (jets(x, 38.8, 43))),
    4: dict(chords=[(0, [31, 38, 43, 46, 50]), (0.09, [33, 40, 45, 48, 52]), (0.25, [31, 38, 43, 46, 50]), (0.68, [29, 36, 41, 44, 48]), (0.86, [36, 43, 48, 52, 55, 60])], pulses=[(47, 56, 29, 2.0)], hits=[0.4, 6.3, 28.4, 47.1, 59.5], depth=1000,
             fx=lambda x: (whale_fx(x))),
    5: dict(chords=[(0, [38, 45, 50, 53, 57]), (0.23, [35, 42, 47, 50, 54]), (0.5, [33, 40, 45, 50, 52]), (0.78, [36, 43, 48, 52, 55, 60])], pulses=[], hits=[0.4, 6.7, 15.1, 50.5, 56.6], depth=1200,
             fx=lambda x: None),
}
CUTS = {
    1: [4.6, 10, 15.2, 21.2, 26.4, 35, 44.4, 52.2, 56.4],
    2: [4.8, 9.2, 14.4, 19.4, 25.2, 31.2, 42, 49.4],
    3: [4.4, 9.6, 15.2, 21.6, 27.2, 38.6, 43.4, 52.4],
    4: [5.8, 13.2, 17.2, 23, 34, 38.8, 46.6],
    5: [6.6, 15, 23.6, 33, 39.8, 50.4, 55.8],
}


def strike(x, at):
    S.place(x, S.pan(S.whoosh(0.35, 300, 1600, 0.6), 0), at - 0.1)
    S.place(x, S.thump(70, 0.5, 0.7), at + 0.05)


def jets(x, a, b):
    t0 = a
    while t0 < b:
        S.place(x, S.pan(S.whoosh(0.6, 200, 900, 0.4), -0.3), t0)
        t0 += 0.9


def whale_fx(x):
    for c in SHORT4_CLICKS:
        S.place(x, S.pan(S.click(0.8), 0.1), c)
    for c in [v + 30 for v in SHORT4_CLICKS if v + 30 < 56]:
        S.place(x, S.pan(S.click(0.55), -0.1), c)
    n = int(2.6 * SR)
    S.place(x, S.pan(S.lp(S.hp(S.rng.standard_normal(n), 300), 4000) * S.env(n, 0.1, 1.8) * 0.6, 0), 8.0)
    for k in range(3):
        S.place(x, S.pan(S.whoosh(1.2, 80, 300, 0.6), 0), 13.4 + k * 1.3)
    jets(x, 50, 55)


def build(n):
    spec = SPEC[n]
    meta = json.load(open(os.path.join(ROOT, f'src/shorts/data/short{n}.json'), encoding='utf-8'))
    D = float(meta['durationSec'])
    out = os.path.join(ROOT, f'public/audio/short{n}')
    os.makedirs(out, exist_ok=True)
    N = int(D * SR)
    print(f'Short {n} ({D:.0f} s)…')
    # música
    m = np.zeros((N, 2))
    ch = spec['chords'] + [(1.0, None)]
    for (a, notes), (b, _) in zip(ch, ch[1:]):
        ta, tb = a * D, min(D, b * D + 0.6)
        k = int((tb - ta) * SR)
        sig = sum(S.pad(S.midi(q), k, 1400) for q in notes) / len(notes) * S.env(k, 1.0, 1.0)
        S.place(m, S.pan(sig, 0), ta, 0.7)
        tt = np.arange(k) / SR
        S.place(m, S.pan(np.sin(2 * np.pi * S.midi(notes[0] - 12) * tt) * S.env(k, 1.5, 1.5) * 0.3, 0), ta)
    for a, b, root, rate in spec['pulses']:
        t0, i = a, 0
        while t0 < b:
            k = int(0.18 * SR)
            ts = np.arange(k) / SR
            f = S.midi(root + (7 if i % 4 == 3 else 0))
            S.place(m, S.pan(S.lp(np.sin(2 * np.pi * f * ts) + 0.4 * np.sign(np.sin(2 * np.pi * f * ts)), 600) * np.exp(-ts * 16), 0.1), t0, 0.5)
            S.place(m, S.thump(55, 0.4, 0.4), t0)
            t0 += 1 / rate
            i += 1
    for at in spec['hits']:
        k = int(2.5 * SR)
        hit = sum(S.pad(S.midi(q), k, 2000) for q in (33, 45, 52)) / 3 * np.exp(-np.arange(k) / SR * 1.4)
        S.place(m, S.pan(hit, 0), at, 0.75)
    m = S.reverb(m, 3.0, 0.3, seed=7 + n)
    S.save(out, 'musica.m4a', m, -4.0)
    # ambiente
    tt = np.arange(N) / SR
    w = S.rng.standard_normal((N, 2))
    a = S.lp(S.hp(np.cumsum(w, axis=0), 15), 320, 3)
    a /= np.abs(a).max()
    a = a * (0.6 + 0.25 * np.sin(2 * np.pi * 0.05 * tt))[:, None]
    t0 = 0.3
    while t0 < D - 1:
        S.place(a, S.pan(S.bubble(S.rng.uniform(380, 1300), S.rng.uniform(0.03, 0.09)) * S.rng.uniform(0.03, 0.08), S.rng.uniform(-0.8, 0.8)), t0)
        t0 += S.rng.exponential(1.2)
    a = S.reverb(a, 2.5, 0.3, seed=5)
    S.save(out, 'ambiente.m4a', a, -7.0)
    # efectos + transiciones
    x = np.zeros((N, 2))
    spec['fx'](x)
    for at in CUTS[n]:
        S.place(x, S.pan(S.whoosh(0.7, 250, 1500, 0.16), S.rng.uniform(-0.4, 0.4)), at - 0.4)
    x[0, 0] += 1e-4  # pista nunca vacía
    S.save(out, 'efectos.m4a', x, -4.0)


if __name__ == '__main__':
    for n in (int(a) for a in (sys.argv[1:] or ['1', '2', '3', '4', '5'])):
        build(n)
