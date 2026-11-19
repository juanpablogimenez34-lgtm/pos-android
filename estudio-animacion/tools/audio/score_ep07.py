#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 07 (hongo y hormigas), por síntesis.

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep07/:
  musica.m4a        suspenso sutil: selva, amenaza invisible, infección, cambio, mordida, días después, ciclo
  ambiente.m4a      selva húmeda: rumor, insectos, aves lejanas y gotas de agua
  movimiento.m4a    pasos diminutos de las hormigas (muy suaves), roce de mandíbulas, caída de esporas
  tension.m4a       pulsos graves del cambio de comportamiento y de la mordida (sin dramatismo)
  transiciones.m4a  entradas y salidas microscópicas (campanillas, barridos), título y final
Tiempos coherentes con src/episodes/ep07-hongo-hormigas/Timeline/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep07')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261207)
S.rng = rng

MICRO = [(27.0, 45.6), (52.4, 65.6)]
CLIMB = (77.0, 90.0)
CLAMP = 106.5  # en pantalla (cámara lenta)
DAYS = 120.4
RELEASE = 158.0
TITLE_HIT, FINAL_HIT = 16.0, 174.8


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 11.0, [45, 52, 57, 60, 64], 1300),   # Am(add9) — selva
        (10.0, 21.0, [41, 48, 53, 57, 64], 1200),  # Fmaj7
        (20.0, 33.0, [38, 45, 50, 53], 800),       # Dm — amenaza invisible
        (32.0, 46.0, [40, 47, 50, 55], 700),       # Em(b6) misterio
        (45.0, 58.0, [45, 52, 55, 60], 800),       # Am
        (57.0, 71.0, [41, 46, 50, 53], 650),       # Bb/F — infección
        (70.0, 84.0, [40, 47, 52, 56], 700),       # E — cambio
        (83.0, 96.0, [38, 44, 50, 53], 600),       # Dm(b5) — asciende
        (95.0, 112.0, [33, 40, 45, 48], 550),      # Am grave — mordida
        (111.0, 122.0, [36, 43, 48, 51], 600),     # Cm — silencio tras la muerte
        (121.0, 136.0, [41, 48, 53, 56], 800),     # Fm — días después
        (135.0, 151.0, [43, 50, 55, 58], 900),     # Gm — el hongo emerge
        (150.0, 165.0, [45, 52, 57, 60], 1000),    # Am — esporas
        (164.0, 180.0, [41, 48, 53, 57, 64], 1300),# Fmaj7 — el ciclo continúa
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.4, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.38)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # motivo de suspenso: dos notas punteadas, cada vez más cercanas
    t0, gap = 20.5, 2.4
    while t0 < 116:
        for j, m in enumerate([69, 70]):
            n = int(1.0 * SR)
            tt = np.arange(n) / SR
            tone = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 4) * 0.045
            st = S.pan(tone, -0.3 + 0.6 * j)
            S.place(L, st[:, 0], t0 + j * 0.3)
            S.place(R, st[:, 1], t0 + j * 0.3)
        t0 += gap
        gap = max(1.1, gap * 0.985)
    x = S.reverb(np.stack([L, R], axis=1), 4.0, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 3, 105, 107, 118, 121, 172, 179.8], [0.0, 0.85, 0.85, 0.45, 0.45, 0.8, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    hum = S.lp(S.hp(rng.standard_normal((N, 2)), 150), 1400) * 0.25
    chir = (np.sin(2 * np.pi * 9 * tt) > 0.55).astype(float) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * tt))
    insects = S.bp(rng.standard_normal(N), 5000, 7500) * chir * 0.05
    x = hum
    x[:, 0] += insects
    x[:, 1] += np.roll(insects, int(0.011 * SR))
    for tb in np.arange(0.6, 179, 5.3):
        n = int(0.4 * SR)
        t2 = np.arange(n) / SR
        f = 2200 + 900 * np.sin(2 * np.pi * 6 * t2) + rng.uniform(-300, 300)
        c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 7) * 0.025
        st = S.pan(c, rng.uniform(-0.8, 0.8))
        o = tb + rng.uniform(0, 2)
        S.place(x[:, 0], st[:, 0], o)
        S.place(x[:, 1], st[:, 1], o)
    # gotas de agua
    t0 = 0.4
    while t0 < 179:
        n = int(0.2 * SR)
        t2 = np.arange(n) / SR
        f0 = rng.uniform(900, 1700)
        d = np.sin(2 * np.pi * f0 * (1 - 0.4 * t2 / 0.2) * t2) * np.exp(-t2 * 28) * 0.08
        st = S.pan(d, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.8, 3.2) if (t0 < 25 or t0 > 165) else rng.uniform(2.0, 5.0)
    x = S.reverb(x, 2.6, 0.35, seed=71)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # pasos diminutos (muy suaves) en los planos macro de marcha y ascenso
    for a, b, rate in [(10, 20, 9), (20, 27, 7), (45, 52, 8), (65, 77, 7), CLIMB + (6,), (90, 103, 5), (173, 180, 9)]:
        t0 = a
        while t0 < b:
            n = int(0.04 * SR)
            t2 = np.arange(n) / SR
            add(S.bp(rng.standard_normal(n), 2500, 7000) * np.exp(-t2 * 120) * 0.035, t0, rng.uniform(-0.3, 0.3))
            t0 += 1.0 / rate * rng.uniform(0.7, 1.3)
    # roce de mandíbulas (exploración y fijación)
    for tc in [24.6, 25.0, 25.3, CLAMP]:
        n = int(0.08 * SR)
        t2 = np.arange(n) / SR
        add(S.bp(rng.standard_normal(n), 1800, 6000) * np.exp(-t2 * 50) * (0.12 if tc != CLAMP else 0.2), tc, 0.1)
    # liberación de esporas: soplo tenue y polvo fino
    n = int(8 * SR)
    t2 = np.arange(n) / SR
    add(S.bp(rng.standard_normal(n), 3000, 9000) * np.sin(np.pi * t2 / 8) ** 2 * 0.05, RELEASE)
    x = S.reverb(x, 1.5, 0.25, seed=73)
    S.save('movimiento.m4a', x, -3.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    t0 = 70.0
    while t0 < 104.0:
        g = 0.15 + 0.35 * (t0 - 70) / 34
        S.place(x[:, 0], S.thump(46, 0.6, g), t0)
        S.place(x[:, 1], S.thump(46, 0.6, g), t0)
        t0 += 1.3 - 0.5 * (t0 - 70) / 34
    hit = S.thump(40, 1.8, 0.5)
    S.place(x[:, 0], hit, CLAMP)
    S.place(x[:, 1], hit, CLAMP)
    x = S.reverb(x, 2.6, 0.3, seed=75)
    S.save('tension.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for a, b in MICRO:
        for ts, notes in [(a, [84, 88, 91, 96]), (b - 0.8, [96, 91, 88, 84])]:
            for j, m in enumerate(notes):
                n = int(1.6 * SR)
                tt = np.arange(n) / SR
                bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.8) * 0.045
                S.place(x[:, 0], bell, ts + j * 0.08)
                S.place(x[:, 1], bell, ts + j * 0.08 + 0.012)
        w = S.whoosh(1.0, 300, 2400, 0.25)
        S.place(x[:, 0], w, a - 0.5)
        S.place(x[:, 1], w, a - 0.5)
    for c in [20.0, 45.0, 77.0, DAYS, 173.0]:
        w = S.whoosh(1.0, 200, 1300, 0.25)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.5)
    for ti, g in [(TITLE_HIT, 0.7), (FINAL_HIT, 0.65)]:
        hit = S.thump(46, 2.0, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.07
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.2, 0.4, seed=77)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
