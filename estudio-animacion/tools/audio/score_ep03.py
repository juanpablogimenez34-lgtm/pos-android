#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 03 (tardígrados), por síntesis.

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep03/:
  musica.m4a        curiosidad (bosque), misterio (sequía, extremos), espacio, células, regreso
  ambiente.m4a      bosque (viento, hojas, aves estilizadas) ↔ mundo microscópico (zumbido suave)
  movimiento.m4a    agua: gotas, chapoteo, rehidratación; crujidos de sequía, hielo, calor
  tension.m4a       pulso de la desecación y del experimento espacial
  transiciones.m4a  barridos suaves entre entornos
Los tiempos coinciden con src/episodes/ep03-tardigrado/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep03')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261120)
S.rng = rng

DROP_PASS = 41.0
DRY = (45.0, 65.0)
COLD = (73.0, 84.0)
HEAT = (84.5, 90.0)
SPACE = (95.0, 120.0)
CELL = (128.0, 147.0)
SPLASH = 152.4
WALK_AGAIN = 165.0
CUTS = [10.5, 70.0, 95.0, 120.0, 150.0, 173.0]


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 12.0, [48, 55, 60, 64, 71], 1300),     # Cmaj7 — bosque, luz
        (11.0, 24.0, [45, 52, 57, 60, 67], 1400),    # Am9 — al microscopio
        (23.0, 36.0, [41, 48, 53, 57, 64], 1500),    # Fmaj7 (#11 color)
        (35.0, 46.0, [43, 50, 55, 59, 66], 1400),    # G6/9 lidio
        (45.0, 58.0, [45, 52, 57, 60], 900),         # Am — se seca
        (57.0, 71.0, [41, 48, 53, 56], 700),         # Fm — tonel
        (70.0, 84.0, [38, 45, 50, 53], 1200),        # Dm — frío
        (83.0, 96.0, [40, 47, 52, 55], 800),         # Em — calor
        (95.0, 108.0, [36, 43, 50, 55, 62], 900),    # C(sus) — espacio
        (107.0, 121.0, [34, 41, 46, 53, 60], 900),   # Bb(sus)
        (120.0, 134.0, [45, 52, 57, 59, 64], 1300),  # Am(add9) — células
        (133.0, 151.0, [41, 48, 53, 55, 60], 1300),  # F(add9)
        (150.0, 163.0, [43, 50, 55, 59, 62], 1500),  # G — regreso
        (162.0, 180.0, [48, 55, 60, 64, 67, 71], 1700),  # Cmaj7 — final
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.5, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.42)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # pizzicato/marimba curioso en el mundo microscópico y al regresar
    for a, b, rate in [(15.0, 44.0, 2.5), (165.0, 178.0, 3.0)]:
        t0, k = a, 0
        while t0 < b:
            chord = next(c for c in reversed(chords) if c[0] <= t0)
            m = chord[2][1 + (k * 2) % (len(chord[2]) - 1)] + 12
            n = int(0.9 * SR)
            tt = np.arange(n) / SR
            tone = (np.sin(2 * np.pi * S.midi(m) * tt) + 0.35 * np.sin(2 * np.pi * S.midi(m) * 3.9 * tt) * np.exp(-tt * 20)) * np.exp(-tt * 6)
            g = 0.13 * min(1, (t0 - a) / 2, (b - t0) / 2)
            st = S.pan(tone * g, np.sin(k * 1.7) * 0.6)
            S.place(L, st[:, 0], t0)
            S.place(R, st[:, 1], t0)
            t0 += 1.0 / rate
            k += 1
    # brillos espaciales
    for tb, m in [(97.0, 88), (99.5, 83), (103.0, 86), (106.5, 81), (110.0, 84), (114.5, 79), (118.0, 88)]:
        n = int(4 * SR)
        tt = np.arange(n) / SR
        bell = sum(np.sin(2 * np.pi * S.midi(m) * r * tt) * w for r, w in [(1, 1), (2.76, 0.35), (5.4, 0.15)]) * np.exp(-tt * 1.2)
        st = S.pan(bell * 0.14, np.sin(tb) * 0.7)
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.0, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 3, 160, 175, 179.8], [0.0, 0.9, 0.95, 1.15, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    forest = np.interp(tt, [0, 9, 13, 172, 176, 180], [1, 1, 0, 0, 1, 1])
    micro = 1 - forest
    wind = S.lp(S.hp(rng.standard_normal((N, 2)), 150), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * tt))[:, None]
    leaves = S.bp(rng.standard_normal((N, 2)), 2500, 7000) * (0.3 + 0.7 * np.clip(np.sin(2 * np.pi * 0.13 * tt + 1), 0, 1))[:, None] * 0.15
    x = (wind * 0.5 + leaves) * forest[:, None]
    # aves estilizadas (gorjeos FM breves) sólo en el bosque
    for tb in list(np.arange(0.8, 10.0, 1.7)) + list(np.arange(173.5, 179.5, 1.5)):
        n = int(0.35 * SR)
        t2 = np.arange(n) / SR
        f = 2800 + 900 * np.sin(2 * np.pi * 14 * t2) + rng.uniform(-300, 300)
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 9) * 0.06
        st = S.pan(chirp, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], tb + rng.uniform(0, 0.4))
        S.place(x[:, 1], st[:, 1], tb + rng.uniform(0, 0.4))
    # mundo microscópico: zumbido suave y burbujeo
    hum = S.lp(np.cumsum(rng.standard_normal((N, 2)), axis=0), 200, 3)
    hum = hum / np.abs(hum).max() * 0.6
    x += hum * micro[:, None]
    space = np.interp(tt, [94, 97, 118, 121], [0, 1, 1, 0])
    x *= (1 - 0.85 * space)[:, None]  # en el espacio casi no hay ambiente
    x = S.reverb(x, 2.5, 0.3, seed=31)
    S.save('ambiente.m4a', x, -6.0)


def drip(f0, gain):
    n = int(0.25 * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 + 1.5 * tt / 0.25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) * gain


def make_movement():
    print('Movimiento / agua…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0, g=1.0):
        st = S.pan(sig * g, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    for tb in np.arange(1.5, 10.0, 2.3):  # gotas del bosque
        add(drip(rng.uniform(700, 1200), 0.4), tb + rng.uniform(0, 0.6), rng.uniform(-0.6, 0.6))
    add(S.whoosh(1.2, 300, 1500, 0.4), DROP_PASS - 0.5)  # gota que cruza
    add(drip(500, 0.5), DROP_PASS + 0.4)
    # sequía: crujidos secos
    t0 = DRY[0] + 3
    while t0 < DRY[1]:
        add(S.bp(rng.standard_normal(int(0.03 * SR)), 2000, 7000) * rng.uniform(0.05, 0.18), t0, rng.uniform(-0.7, 0.7))
        t0 += rng.uniform(0.15, 0.8)
    # hielo: cristales que crecen (tintineos agudos)
    t0 = COLD[0] + 3
    while t0 < COLD[1]:
        n = int(0.4 * SR)
        tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * rng.uniform(3000, 6000) * tt) * np.exp(-tt * 12) * 0.08, t0, rng.uniform(-0.8, 0.8))
        t0 += rng.uniform(0.12, 0.35)
    # calor: rumor grave
    n = int((HEAT[1] - HEAT[0]) * SR)
    add(S.lp(rng.standard_normal(n), 250) * S.env_adsr(n, 1.0, 1.5) * 0.5, HEAT[0])
    # gota que cae + chapoteo + rehidratación
    add(S.whoosh(0.8, 400, 1800, 0.35), SPLASH - 0.8)
    add(S.thump(140, 0.3, 0.5), SPLASH)
    for k in range(10):
        add(drip(rng.uniform(600, 1600), 0.22), SPLASH + 0.05 + k * 0.06, rng.uniform(-0.8, 0.8))
    n = int(6 * SR)
    add(S.bp(rng.standard_normal(n), 400, 1800) * S.env_adsr(n, 2.0, 2.0) * 0.12, 156.0)
    # pasitos (muy suaves) al caminar
    for a, b in [(34.0, 44.0), (WALK_AGAIN, 173.0)]:
        t0 = a
        while t0 < b:
            add(S.swish(0.08, 800, 3000, 0.05), t0, rng.uniform(-0.3, 0.3))
            t0 += rng.uniform(0.28, 0.42)
    x = S.reverb(x, 1.8, 0.25, seed=33)
    S.save('movimiento.m4a', x, -3.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    # latido lento que se apaga durante la desecación (el metabolismo casi se detiene)
    t0, gap = 50.0, 1.0
    while t0 < 68.0:
        g = 0.6 * max(0.0, 1 - (t0 - 50) / 18)
        S.place(x[:, 0], S.thump(46, 0.7, g), t0)
        S.place(x[:, 1], S.thump(46, 0.7, g), t0)
        t0 += gap
        gap *= 1.12
    # drone del espacio
    a, b = SPACE
    n = int((b - a) * SR)
    tt = np.arange(n) / SR
    drone = S.lp(sum(2 * ((S.midi(m) * tt) % 1.0) - 1 for m in (31, 38, 43)), 400) / 3
    env = np.interp(tt + a, [95, 99, 112, 116, 120], [0, 0.7, 1.0, 0.6, 0])
    x[int(a * SR): int(a * SR) + n] += np.stack([drone * env, drone * env * 0.95], axis=1)
    x = S.reverb(x, 3.5, 0.4, seed=35)
    S.save('tension.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in CUTS:
        w = S.whoosh(1.2, 200, 1600, 0.45)
        S.place(x[:, 0], w, c - 0.6)
        S.place(x[:, 1], w, c - 0.6)
    for ti in (16.0, 175.4):
        hit = S.thump(48, 2.0, 0.8)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.1
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.5, 0.4, seed=37)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
