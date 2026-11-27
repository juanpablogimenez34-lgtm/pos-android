#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 02 (rape abisal), por síntesis.

Reutiliza las herramientas de score.py (osciladores, filtros, reverberación) sin
modificar el Ep. 01. Pistas en public/audio/ep02/:
  musica.m4a · ambiente.m4a · movimiento.m4a · tension.m4a · transiciones.m4a
Los tiempos de los eventos coinciden con src/episodes/ep02-pez-abisal/timeline.ts.
"""
import os

import numpy as np

import score as S  # mismo directorio

S.OUT = os.path.join(S.ROOT, 'public/audio/ep02')
SR, N, DUR = S.SR, S.N, S.DUR
rng = np.random.default_rng(20261119)
S.rng = rng

STRIKE = 109.0
BITE = 138.6
LIGHT_OFF = (176.0, 179.5)
JIG = (77.0, 84.0)
PREY_IN = 84.5
FINAL_HIT = 176.0
TITLE_HIT = 41.9


def pulse_bass(t0, t1, bpm, gain):
    out = np.zeros(N)
    k = t0
    while k < t1:
        S.place(out, S.thump(42, 0.9, gain), k)
        S.place(out, S.thump(38, 0.9, gain * 0.6), k + 0.32)
        k += 60.0 / bpm
    return out


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    # acordes graves y misteriosos (re menor frigio / clúster), entrada muy lenta
    chords = [
        (0.0, 12.0, [38, 45, 50, 57], 1400),
        (11.0, 21.0, [37, 44, 49, 56], 900),
        (20.0, 33.0, [38, 45, 51, 53], 700),
        (32.0, 46.0, [34, 41, 46, 49], 800),
        (45.0, 58.0, [38, 45, 50, 53], 900),
        (57.0, 71.0, [36, 43, 48, 51], 900),
        (70.0, 84.0, [38, 45, 50, 56], 800),
        (83.0, 96.0, [37, 44, 49, 52], 700),
        (95.0, 120.5, [26, 33, 38], 400),
        (120.0, 133.0, [41, 48, 53, 57], 1000),
        (132.0, 146.0, [39, 46, 51, 55], 1000),
        (145.0, 158.0, [38, 45, 50, 53], 900),
        (157.0, 170.0, [34, 41, 46, 53], 800),
        (169.0, 180.0, [38, 45, 50, 57], 700),
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 3.0, 3.5)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.45)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # motivo de "luz": notas agudas tipo celesta, escasas, al aparecer y moverse el señuelo
    for tb, m in [(21.2, 86), (23.0, 81), (25.4, 84), (29.0, 79), (77.5, 86), (79.0, 84), (80.6, 81), (82.2, 79), (151.0, 86), (153.6, 84), (170.0, 81), (173.8, 79)]:
        n = int(3.5 * SR)
        tt = np.arange(n) / SR
        tone = sum(np.sin(2 * np.pi * S.midi(m) * r * tt) * w for r, w in [(1, 1), (3.0, 0.25), (4.1, 0.1)]) * np.exp(-tt * 1.6)
        st = S.pan(tone * 0.16, np.sin(tb) * 0.6)
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    x = np.stack([L, R], axis=1)
    x = S.reverb(x, 5.0, 0.55)
    tt = S.t_axis()
    master = np.interp(tt, [0, 6, 95, 97, 112, 121, 170, 176, 179.8], [0.0, 0.8, 0.8, 0.3, 0.3, 0.9, 1.0, 0.8, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    white = rng.standard_normal((N, 2))
    brown = S.lp(S.hp(np.cumsum(white, axis=0), 15), 220, 3)
    brown /= np.abs(brown).max()
    tt = S.t_axis()
    # al principio (superficie) más brillo y burbujas; en lo profundo, rumor grave
    surf = np.interp(tt, [0, 6, 12], [1.0, 0.4, 0.0])
    hiss = S.lp(S.hp(rng.standard_normal((N, 2)), 900), 3500) * 0.08 * surf[:, None]
    x = brown * (0.7 + 0.3 * np.sin(2 * np.pi * 0.03 * tt))[:, None] + hiss
    t0 = 0.3
    while t0 < 12:
        b = S.bubble(rng.uniform(500, 1500), rng.uniform(0.03, 0.08)) * rng.uniform(0.05, 0.16) * (1 - t0 / 12)
        st = S.pan(b, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.exponential(0.25)
    # tonos lejanos muy graves (presión, inmensidad), sin imitar animales concretos
    for tb in [24.0, 58.0, 88.0, 131.0, 160.0]:
        n = int(6 * SR)
        t2 = np.arange(n) / SR
        f = 55 * (1 + 0.04 * np.sin(2 * np.pi * 0.2 * t2))
        moan = np.sin(2 * np.pi * np.cumsum(f) / SR) * S.env_adsr(n, 2.0, 3.0) * 0.12
        st = S.pan(moan, rng.uniform(-0.6, 0.6))
        S.place(x[:, 0], st[:, 0], tb)
        S.place(x[:, 1], st[:, 1], tb)
    x = S.reverb(x, 4.0, 0.4, seed=21)
    S.save('ambiente.m4a', x, -6.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0, g=1.0):
        st = S.pan(sig * g, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # aleteo suave del pez en los planos cercanos
    t0 = 45.0
    while t0 < 70.0:
        add(S.swish(0.5, 150, 700, 0.12), t0, rng.uniform(-0.3, 0.3))
        t0 += rng.uniform(0.9, 1.6)
    # destellos del señuelo al moverse
    t0 = JIG[0]
    while t0 < JIG[1]:
        n = int(0.3 * SR)
        tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * rng.uniform(1800, 3400) * tt) * np.exp(-tt * 14) * 0.06, t0, rng.uniform(-0.5, 0.5))
        t0 += rng.uniform(0.25, 0.6)
    # presa: aleteo rápido
    t0 = PREY_IN
    while t0 < STRIKE:
        add(S.swish(0.12, 600, 2400, 0.06), t0, 0.4)
        t0 += rng.uniform(0.18, 0.3)
    # ATAQUE: succión + cierre de mandíbula
    add(S.whoosh(0.35, 200, 1500, 0.9), STRIKE - 0.05)
    add(S.thump(70, 0.5, 1.0), STRIKE + 0.45)
    add(S.bp(rng.standard_normal(int(0.08 * SR)), 1500, 5000) * 0.6, STRIKE + 0.45)
    # macho nadando y mordida
    t0 = 128.5
    while t0 < BITE:
        add(S.swish(0.15, 500, 2000, 0.07), t0, -0.3)
        t0 += rng.uniform(0.2, 0.35)
    add(S.thump(90, 0.3, 0.6), BITE)
    x = S.reverb(x, 2.0, 0.3, seed=23)
    S.save('movimiento.m4a', x, -3.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    a, b = 92.0, 116.0
    n = int((b - a) * SR)
    tt = np.arange(n) / SR
    drone = S.lp(sum(2 * ((S.midi(m) * tt) % 1.0) - 1 for m in (26, 27, 38)), 300) / 3
    curve = np.interp(tt + a, [92, 98, 108.8, STRIKE, 112, 116], [0, 0.5, 1.0, 1.0, 0.4, 0])
    trem = np.interp(tt + a, [92, 100, 108.8, STRIKE + 0.1, 116], [0, 0.3, 1.0, 0.0, 0])
    cluster = S.bp(sum(2 * ((S.midi(m) * tt) % 1.0) - 1 for m in (71, 72, 77)), 700, 3200) * (0.6 + 0.4 * np.sin(2 * np.pi * 8 * tt)) * trem * 0.22
    sig = drone * curve + cluster
    x[int(a * SR): int(a * SR) + n] += np.stack([sig, sig * 0.97], axis=1)
    # pulso grave muy suave del descenso y de la revelación
    x[:, 0] += pulse_bass(2.0, 44.0, 52, 0.35)
    x[:, 1] += pulse_bass(2.0, 44.0, 52, 0.35)
    hit = S.thump(38, 1.8, 1.0) + S.lp(rng.standard_normal(int(1.8 * SR)), 700) * np.exp(-np.arange(int(1.8 * SR)) / SR * 3) * 0.4
    S.place(x[:, 0], hit, STRIKE + 0.4)
    S.place(x[:, 1], hit, STRIKE + 0.4)
    x = S.reverb(x, 3.0, 0.35, seed=25)
    S.save('tension.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for tc in [19.5, 119.6, 149.6]:
        w = S.whoosh(1.4, 120, 900, 0.5)
        S.place(x[:, 0], w, tc - 0.7)
        S.place(x[:, 1], w, tc - 0.7)
    for ti, g in [(TITLE_HIT, 1.0), (FINAL_HIT, 0.8)]:
        hit = S.thump(40, 2.2, g)
        n = int(3.5 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 2500, 8000) * np.exp(-st * 1.2) * 0.1
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 4.0, 0.45, seed=27)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
