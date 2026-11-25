#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «El delfín rosado que nada entre los árboles» (síntesis propia, sin muestras de
terceros ni sonidos de animales marinos). Reutiliza score.py sin modificarlo (longitudes explícitas de 60 s).
Pistas en public/audio/delfin-rosado/:
  musica.m4a             música cinematográfica (pads cálidos, arpegio de marimba, pulso suave, revelación final)
  ambiente-selva.m4a     insectos y follaje: nítido fuera del agua, apagado bajo el agua
  aves.m4a               silbidos y trinos sintéticos de aves de la selva (en los planos con superficie)
  corrientes.m4a         corriente del río bajo el agua (grave, apagada)
  burbujas.m4a           burbujas, salpicaduras al cruzar la superficie y al sumergirse
  movimiento-delfin.m4a  golpes de cola (al ritmo de los estados), aletas
  respiracion.m4a        exhalación e inhalación por el espiráculo al asomar
  clics.m4a              ecolocalización ilustrativa (trenes de clics)
  transiciones.m4a       barridos entre escenas
Tiempos coherentes con src/episodes/delfin-rosado/data/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/delfin-rosado')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 60.0
N = int(SR * D)
rng = np.random.default_rng(20261125)
S.rng = rng
tt = np.arange(N) / SR
ABOVE = [(5.0, 8.4), (53.4, 56.2)]  # planos con la cámara fuera del agua
CLICKS = [34.8 + i * 0.31 for i in range(22)] + [43.2, 43.45, 43.65, 43.82, 43.95, 44.05]
SPLASH = [(8.6, 1.0), (53.6, 0.9), (56.3, 1.0), (6.6, 0.5)]
CUTS = [5.0, 12.0, 15.2, 20.2, 22.0, 26.4, 29.2, 32.0, 42.0, 51.0, 53.4, 56.0]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def above_env():
    e = np.full(N, 0.18)
    for a, b in ABOVE:
        e[int(a * SR):int(b * SR)] = 1.0
    return S.lp(e, 3)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [(0, 5.2, [40, 47, 52, 55, 59], 1400, 0.85), (5, 12.2, [40, 47, 52, 54, 59], 1700, 0.7), (12, 22.2, [43, 50, 55, 59, 62], 1500, 0.6),
              (22, 32.2, [38, 45, 50, 54, 57], 1300, 0.6), (32, 42.2, [36, 43, 48, 52, 55], 900, 0.55), (42, 51.2, [40, 47, 52, 55, 59], 1500, 0.7),
              (51, 56.2, [36, 43, 48, 52, 55, 60, 64], 2400, 0.85), (56, 60, [40, 47, 52, 55, 59], 1400, 0.75)]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.4, 0.4) * g
        add(x, sig, a)
    # arpegio de marimba (pulsado, cálido) con patrón pentatónico
    scale = [64, 67, 69, 71, 74, 76, 79]
    t0, k = 0.2, 0
    while t0 < 59.6:
        if not (32.5 < t0 < 41.5):  # en la turbidez solo pads (misterio)
            n = int(0.9 * SR)
            ts = np.arange(n) / SR
            f = S.midi(scale[(k * 3 + (k // 7)) % len(scale)] - (12 if 12 < t0 < 32 else 0))
            s = (np.sin(2 * np.pi * f * ts) + 0.35 * np.sin(2 * np.pi * f * 4 * ts) * np.exp(-ts * 30)) * np.exp(-ts * 6)
            add(x, s, t0, 0.16, rng.uniform(-0.5, 0.5))
        t0 += 0.25 if (t0 < 5 or 42 < t0 < 51) else 0.375
        k += 1
    # pulso de percusión suave (shaker + bombo grave) en las secciones de acción
    for a, b, rate in [(0, 5, 4), (42, 51, 4), (5, 12, 2)]:
        t0 = a
        while t0 < b:
            n = int(0.08 * SR)
            add(x, S.bp(rng.standard_normal(n), 4000, 9000) * np.exp(-np.arange(n) / SR * 60), t0, 0.08, rng.uniform(-0.3, 0.3))
            if round((t0 - a) * rate) % 2 == 0:
                add(x, S.thump(50, 0.5, 0.5), t0)
            t0 += 1 / rate
    for at in [0.25, 51.2]:
        hit = sum(S.pad_voice(S.midi(m), int(2.5 * SR), 2600) for m in (40, 52, 59, 64)) / 4 * np.exp(-np.arange(int(2.5 * SR)) / SR * 1.2)
        add(x, hit, at, 0.9)
    n = int(3 * SR)
    add(x, S.bp(rng.standard_normal(n), 300, 5000) * (np.arange(n) / n) ** 2 * 0.2, 48.2)
    x = S.reverb(x, 2.8, 0.28, seed=11)
    S.save('musica.m4a', x, -4.0)


def make_jungle():
    print('Ambiente de selva…')
    w = rng.standard_normal((N, 2))
    insects = S.bp(w, 3500, 7500) * (0.6 + 0.4 * np.sin(2 * np.pi * 6.5 * tt))[:, None] * 0.18
    leaves = S.lp(S.hp(rng.standard_normal((N, 2)), 300), 2000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt))[:, None] * 0.15
    x = insects + leaves
    e = above_env()
    under = S.lp(x, 500) * 2.0
    x = x * e[:, None] + under * (1 - e)[:, None]
    S.save('ambiente-selva.m4a', S.reverb(x, 1.8, 0.25, seed=3), -8.0)


def chirp(f0, f1, dur, g):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 + (f1 - f0) * (ts / dur) ** 1.4
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * ts / dur) ** 1.5 * g


def make_birds():
    print('Aves…')
    x = np.zeros((N, 2))
    t0 = 0.4
    while t0 < 59:
        kind = rng.integers(0, 3)
        p = rng.uniform(-0.8, 0.8)
        if kind == 0:  # silbido descendente (tipo tinamú), dos notas
            add(x, chirp(1900, 1500, 0.35, 0.3), t0, 1, p)
            add(x, chirp(1700, 1300, 0.45, 0.3), t0 + 0.5, 1, p)
        elif kind == 1:  # trino rápido
            for k in range(rng.integers(4, 9)):
                add(x, chirp(3200, 4200, 0.05, 0.18), t0 + k * 0.07, 1, p)
        else:  # llamada aguda ascendente
            add(x, chirp(2400, 3600, 0.22, 0.22), t0, 1, p)
        t0 += rng.exponential(1.4)
    e = above_env()
    x = x * e[:, None] + S.lp(x, 400) * (1 - e)[:, None] * 0.6
    S.save('aves.m4a', S.reverb(x, 2.5, 0.35, seed=7), -8.0)


def make_currents():
    print('Corrientes…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    x = S.lp(S.hp(w, 20), 300, 3)
    x /= np.abs(x).max()
    x = x * (0.6 + 0.3 * np.sin(2 * np.pi * 0.07 * tt))[:, None]
    x += S.bp(rng.standard_normal((N, 2)), 200, 900) * 0.05
    e = above_env()
    x = x * (1 - 0.6 * e)[:, None]
    S.save('corrientes.m4a', S.reverb(x, 2.2, 0.3, seed=5), -7.0)


def make_bubbles():
    print('Burbujas…')
    x = np.zeros((N, 2))
    t0 = 0.3
    while t0 < 59.5:
        add(x, S.bubble(rng.uniform(400, 1400), rng.uniform(0.03, 0.08)) * rng.uniform(0.05, 0.12), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.7)
    for at, g in SPLASH:
        n = int(1.2 * SR)
        add(x, S.lp(S.hp(rng.standard_normal(n), 400), 6000) * np.exp(-np.arange(n) / SR * 4) * 0.6 * g, at)
        for k in range(18):
            add(x, S.bubble(rng.uniform(300, 1500), 0.07) * 0.14 * g, at + 0.1 + k * 0.04, 1, rng.uniform(-0.8, 0.8))
    S.save('burbujas.m4a', x, -5.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    # (inicio, fin, Hz del batido de cola) aproximados a los estados de las escenas
    segs = [(0, 2.6, 1.3), (2.6, 5, 0.25), (8, 12, 0.55), (12, 22, 0.55), (22, 29.2, 0.3), (29.2, 32, 0.5), (32, 42, 0.45), (42, 44.4, 0.4), (44.4, 49.4, 1.3), (49.4, 51, 0.55), (51, 53.4, 0.9), (56, 60, 0.9)]
    for a, b, f in segs:
        t0 = a
        while t0 < b:
            add(x, S.whoosh(0.5, 120, 500, 0.22 + f * 0.12), t0, 1, rng.uniform(-0.2, 0.2))
            t0 += 1 / f
    for at in [44.4, 48.6]:
        add(x, S.whoosh(0.4, 300, 1600, 0.4), at)
    S.save('movimiento-delfin.m4a', S.reverb(x, 1.5, 0.2, seed=9), -6.0)


def make_breath():
    print('Respiración…')
    x = np.zeros((N, 2))
    n = int(0.7 * SR)
    ts = np.arange(n) / SR
    exhale = S.bp(rng.standard_normal(n), 300, 3500) * np.exp(-ts * 4) * np.minimum(1, ts / 0.03)
    add(x, exhale + S.thump(90, 0.3, 0.3)[:n] if len(S.thump(90, 0.3, 0.3)) >= n else exhale, 54.0)
    n2 = int(0.6 * SR)
    ts2 = np.arange(n2) / SR
    inhale = S.bp(rng.standard_normal(n2), 500, 2500) * np.sin(np.pi * ts2 / 0.6) * 0.5
    add(x, inhale, 54.75)
    S.save('respiracion.m4a', x, -3.0)


def make_clicks():
    print('Clics…')
    x = np.zeros((N, 2))
    for c in CLICKS:
        n = int(0.01 * SR)
        ts = np.arange(n) / SR
        s = S.hp(rng.standard_normal(n), 1500) * np.exp(-ts * 600) + np.sin(2 * np.pi * 3500 * ts) * np.exp(-ts * 800) * 0.5
        add(x, s, c, 0.8)
        add(x, S.lp(s, 2500) * 0.25, c + 0.12, 1, 0.3)  # eco
    S.save('clics.m4a', x, -4.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(0.6, 300, 1800, 0.2), at - 0.3, 1, rng.uniform(-0.4, 0.4))
    n = int(1.6 * SR)
    add(x, S.lp(S.hp(rng.standard_normal(n), 200), 3000) * np.sin(np.pi * np.arange(n) / n) * 0.3, 8.0)  # cruce de superficie
    S.save('transiciones.m4a', x, -6.0)


if __name__ == '__main__':
    make_music()
    make_jungle()
    make_birds()
    make_currents()
    make_bubbles()
    make_movement()
    make_breath()
    make_clicks()
    make_transitions()
