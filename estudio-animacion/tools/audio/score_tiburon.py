#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «El tiburón blanco» (180 s, Reels). Síntesis propia, sin muestras de terceros;
las llamadas de orca son SINTÉTICAS e ilustrativas. Reutiliza score.py sin modificarlo. Pistas en public/audio/tiburon/:
  musica.m4a · ambiente-submarino.m4a · movimiento-agua.m4a · tension.m4a · transiciones.m4a
  olas-salpicaduras.m4a · burbujas.m4a · orcas.m4a · senales.m4a (pulsos de la visualización de los sentidos)
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/tiburon')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 180.0
N = int(SR * D)
rng = np.random.default_rng(20261127)
S.rng = rng
tt = np.arange(N) / SR
BREACHES = [(10.4, 2.6), (106.4, 2.4)]  # (salida, cámara lenta)
SURFACE = [(0, 20), (97.6, 121), (150, 180)]
CUTS = [20, 46.5, 70, 97.6, 121, 150]
HITS = [14.6, 175.0]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def env(spans, sm=2):
    e = np.zeros(N)
    for a, b in spans:
        e[int(a * SR):int(min(D, b) * SR)] = 1
    return S.lp(e, sm)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [(0, 10.6, [33, 40, 45, 48], 700, 0.6), (10.4, 20.2, [38, 45, 50, 53, 57], 1900, 0.9), (20, 46.7, [36, 43, 48, 52, 55], 1300, 0.65), (46.5, 70.2, [38, 45, 50, 53, 57], 1200, 0.6),
              (70, 97.8, [41, 48, 53, 57, 60], 1500, 0.65), (97.6, 106.6, [33, 40, 45, 48], 700, 0.55), (106.4, 121.2, [38, 45, 50, 53, 58], 1700, 0.8), (121, 150.2, [31, 38, 43, 46], 650, 0.6), (150, 180, [41, 48, 53, 57, 60, 64], 2200, 0.85)]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.7, 0.7) * g, a)
    # ostinato grave en el acecho y la persecución
    for a, b, r in [(4, 10.4, 2.5), (98, 106.4, 3), (126, 140, 2.5)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(44, 0.45, 0.55), t0)
            t0 += 1 / r
    sc = [62, 65, 69, 72, 74, 77]
    t0, k = 20.5, 0
    while t0 < 178:
        if not (97 < t0 < 121 or 124 < t0 < 140):
            n = int(1.8 * SR)
            ts = np.arange(n) / SR
            f = S.midi(sc[(k * 2) % len(sc)])
            add(x, np.sin(2 * np.pi * f * ts) * np.exp(-ts * 2.6), t0, 0.1, rng.uniform(-0.6, 0.6))
        t0 += 0.8
        k += 1
    for at in HITS:
        n = int(3 * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, 2600) for m in (38, 50, 57, 62)) / 4 * np.exp(-np.arange(n) / SR * 0.9), at, 0.9)
    x = S.reverb(x, 3.5, 0.36, seed=61)
    S.save('musica.m4a', x * np.interp(tt, [0, 2, 178, 180], [0, 1, 1, 0])[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    r = S.lp(S.hp(w, 18), 260, 3)
    r /= np.abs(r).max()
    x = r + S.lp(S.hp(rng.standard_normal((N, 2)), 1500), 5000) * 0.04
    S.save('ambiente-submarino.m4a', S.reverb(x, 2.5, 0.3, seed=62), -7.0)


def make_waves():
    print('Olas y salpicaduras…')
    x = np.zeros((N, 2))
    e = env(SURFACE)
    x += S.lp(S.hp(rng.standard_normal((N, 2)), 200), 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * tt))[:, None] * 0.3 * e[:, None]
    for tex, slow in BREACHES:
        for at, g in [(tex, 1.2), (tex + 0.91 * slow, 1.5)]:
            n = int(2.4 * SR)
            ts = np.arange(n) / SR
            add(x, S.lp(S.hp(rng.standard_normal(n), 250), 7000) * np.exp(-ts * 2.2) * g, at)
            add(x, S.thump(55, 0.9, g), at)
            for k in range(16):
                m = int(0.06 * SR)
                add(x, S.bp(rng.standard_normal(m), 1500, 6000) * np.exp(-np.arange(m) / SR * 50) * 0.3 * g, at + 0.3 + k * 0.1, 1, rng.uniform(-0.8, 0.8))
    S.save('olas-salpicaduras.m4a', S.reverb(x, 1.8, 0.25, seed=63), -4.0)


def make_bubbles():
    print('Burbujas…')
    x = np.zeros((N, 2))
    t0 = 0.5
    while t0 < 179:
        add(x, S.bubble(rng.uniform(350, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.1), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.7)
    for tex, slow in BREACHES:
        for k in range(30):
            add(x, S.bubble(rng.uniform(300, 1500), rng.uniform(0.02, 0.07)) * 0.12, tex + 0.91 * slow + 0.2 + k * 0.05, 1, rng.uniform(-0.9, 0.9))
    S.save('burbujas.m4a', S.reverb(x, 1.6, 0.25, seed=64), -5.0)


def make_orcas():
    print('Orcas (sintéticas)…')
    x = np.zeros((N, 2))
    t0 = 125.0
    while t0 < 150:
        dur = rng.uniform(0.6, 1.2)
        n = int(dur * SR)
        ts = np.arange(n) / SR
        f = rng.uniform(900, 1500) * (1 + 0.25 * np.sin(np.pi * ts / dur) ** 2)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(ph * h) / h for h in range(1, 6)) * np.sin(np.pi * ts / dur)
        add(x, S.bp(s, 400, 9000) * 0.3, t0, 1, rng.uniform(-0.7, 0.7))
        t0 += dur + rng.uniform(0.5, 1.5)
    S.save('orcas.m4a', S.reverb(x, 3.0, 0.45, seed=65), -6.0)


def make_signals():
    print('Señales de los sentidos…')
    x = np.zeros((N, 2))
    for a, b, f in [(49.2, 56.6, 520), (57.8, 63.2, 260)]:
        t0 = a
        while t0 < b:
            n = int(0.35 * SR)
            ts = np.arange(n) / SR
            add(x, np.sin(2 * np.pi * f * ts) * np.exp(-ts * 9) * 0.3, t0, 1, 0.2)
            t0 += 1 / 0.7 / 4
    S.save('senales.m4a', S.reverb(x, 1.6, 0.3, seed=66), -8.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    for a, b, f in [(20, 46, 0.6), (46.5, 70, 0.5), (70, 97, 0.55), (121, 133, 0.6), (133, 140, 1.4), (150, 175, 0.5)]:
        t0 = a
        while t0 < b:
            add(x, S.whoosh(0.8, 90, 420, 0.25 + f * 0.1), t0, 1, rng.uniform(-0.3, 0.3))
            t0 += 1 / f
    for tex, _ in BREACHES:
        add(x, S.whoosh(2.2, 80, 1400, 0.6), tex - 2.2)
    S.save('movimiento-agua.m4a', S.reverb(x, 1.6, 0.25, seed=67), -6.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    for a, b, f in [(3, 11, 44), (97.6, 107, 42), (124, 141, 39)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        dr = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 1.0, 0.8)
        add(x, S.lp(dr * (1 + 0.25 * np.sin(2 * np.pi * 3 * ts)), 800) * 0.4, a)
    S.save('tension.m4a', S.reverb(x, 2.6, 0.3, seed=68), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(1.0, 160, 1800, 0.45), at - 0.5, 1, rng.uniform(-0.4, 0.4))
    for at in HITS:
        add(x, S.thump(42, 1.4, 0.9), at)
    S.save('transiciones.m4a', S.reverb(x, 2.2, 0.3, seed=69), -5.0)


if __name__ == '__main__':
    for fn in [make_music, make_ambience, make_waves, make_bubbles, make_orcas, make_signals, make_movement, make_tension, make_transitions]:
        fn()
