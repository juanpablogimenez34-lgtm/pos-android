#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 08 (medusa inmortal), por síntesis (derechos propios).

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep08/:
  musica.m4a          ambiental, misteriosa y suave (pads en modo menor, destellos de celesta)
  ambiente.m4a        rumor submarino, corrientes y burbujas suaves
  movimiento.m4a      pulsos de agua de cada contracción de la campana; sobresalto ante el peligro
  descubrimiento.m4a  transformación y nuevo ciclo: arpegios que crecen; laboratorio: señales suaves
  transiciones.m4a    barridos entre escenas, golpe del título y del cierre
Tiempos coherentes con src/episodes/ep08-medusa-inmortal/Timeline/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep08')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261208)
S.rng = rng

PULSE_T0, PULSE_PERIOD = 1.0, 1.6  # contracción de la campana (igual que Animation/jellyMotion.ts)
SWIM = [(0.8, 45.5), (96.0, 120.0), (145.0, 180.0)]
DANGER = (100.0, 119.5)
STARTLE = [104.2, 110.6]
TRANSFORM = (45.0, 71.0)
NEWCYCLE = (71.0, 96.0)
LAB = (120.0, 145.0)
TITLE_HIT, FINAL_HIT = 4.4, 166.0
CUTS = [8.0, 25.0, 45.0, 71.0, 96.0, 120.0, 145.0, 165.0]


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 9.0, [38, 45, 50, 53], 700),          # Dm — oscuridad, aparición
        (8.0, 26.0, [41, 48, 53, 57, 64], 1300),    # Fmaj7(9) — océano lleno de vida
        (25.0, 46.0, [46, 53, 57, 62], 1100),       # Bbmaj7 — el secreto
        (45.0, 72.0, [38, 45, 50, 53, 57], 900),    # Dm(add9) — transformación
        (71.0, 97.0, [43, 50, 55, 58, 62], 1100),   # Gm — un nuevo comienzo
        (96.0, 121.0, [37, 44, 49, 52], 600),       # C#dim/ tensión suave — peligros
        (120.0, 146.0, [45, 52, 57, 60, 64], 1200), # Am(add9) — ciencia
        (145.0, 166.0, [41, 48, 53, 57, 60], 1300), # F — revelación
        (165.0, 180.0, [38, 45, 50, 53, 57, 62], 1500),  # Dm(add9) — cierre sereno
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.5, 3.2)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.38)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # destellos de celesta (bioluminiscencia) en momentos clave
    sparkle = [(1.5, 81), (2.6, 86), (4.4, 89), (9.0, 84), (11.2, 88), (15.6, 91), (26.5, 86), (47.0, 81), (58.0, 84), (66.8, 88), (72.0, 86), (84.0, 89), (90.0, 93),
               (146.5, 84), (153.0, 88), (157.0, 91), (166.0, 86), (168.0, 89), (170.4, 93), (173.0, 91)]
    for tb, m in sparkle:
        n = int(2.4 * SR)
        tt = np.arange(n) / SR
        f = S.midi(m)
        tone = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2.01 * f * tt) + 0.15 * np.sin(2 * np.pi * 3.0 * f * tt)) * np.exp(-tt * 2.2) * 0.05
        st = S.pan(tone, rng.uniform(-0.6, 0.6))
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 2.5, 95, 97, 119, 121, 165, 172, 179.8], [0.0, 0.8, 0.8, 0.65, 0.65, 0.8, 0.95, 1.05, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    under = S.lp(rng.standard_normal((N, 2)), 360) * 1.6
    current = S.bp(rng.standard_normal((N, 2)), 120, 900) * (0.4 + 0.3 * np.sin(2 * np.pi * tt / 9.0))[:, None]
    deep = 1 + 0.5 * np.clip((tt - 96) / 3, 0, 1) * np.clip((121 - tt) / 3, 0, 1)
    x = (under * 0.6 + current * 0.35) * deep[:, None]
    lab = np.clip((tt - 120.5) / 1.0, 0, 1) * np.clip((144.5 - tt) / 1.0, 0, 1)
    x *= (1 - 0.75 * lab)[:, None]
    hum = (np.sin(2 * np.pi * 120 * tt) * 0.012 + S.lp(rng.standard_normal(N), 4000) * 0.02) * lab
    x[:, 0] += hum
    x[:, 1] += hum
    t0 = 1.0
    while t0 < 179:
        if not (LAB[0] + 0.5 < t0 < LAB[1] - 0.5):
            n = int(0.12 * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(500, 1500)
            b = np.sin(2 * np.pi * f0 * (1 + 2.5 * t2) * t2) * np.exp(-t2 * 35) * 0.045
            st = S.pan(b, rng.uniform(-0.8, 0.8))
            S.place(x[:, 0], st[:, 0], t0)
            S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.7, 2.6)
    x = S.reverb(x, 2.8, 0.35, seed=81)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # cada contracción de la campana empuja agua: pulso grave y suave
    for a, b in SWIM:
        k = int(np.ceil((a - PULSE_T0) / PULSE_PERIOD))
        while True:
            tp = PULSE_T0 + k * PULSE_PERIOD
            if tp > b:
                break
            n = int(0.5 * SR)
            t2 = np.arange(n) / SR
            w = S.lp(rng.standard_normal(n), 260) * np.sin(np.pi * np.clip(t2 / 0.5, 0, 1)) ** 2 * 0.4
            add(w, tp, rng.uniform(-0.15, 0.15))
            k += 1
    for ts in STARTLE:
        add(S.whoosh(0.45, 500, 1600, 0.25), ts - 0.05, 0.15)
    # transformación: tejido que se contrae (crujidos muy suaves y graves)
    t0 = TRANSFORM[0] + 6
    while t0 < TRANSFORM[1] - 1:
        n = int(0.3 * SR)
        t2 = np.arange(n) / SR
        add(S.lp(rng.standard_normal(n), 500) * np.exp(-t2 * 12) * 0.12, t0, rng.uniform(-0.3, 0.3))
        t0 += rng.uniform(0.8, 1.6)
    x = S.reverb(x, 2.0, 0.32, seed=83)
    S.save('movimiento.m4a', x, -3.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    for (a, b), pattern in [(TRANSFORM, [62, 65, 69, 74, 72, 69, 65, 62]), (NEWCYCLE, [67, 70, 74, 79, 77, 74, 70, 67])]:
        t0, k = a + 0.5, 0
        while t0 < b:
            prog = (t0 - a) / (b - a)
            m = pattern[k % len(pattern)] + (12 if prog > 0.6 and k % 4 == 0 else 0)
            n = int(0.9 * SR)
            tt = np.arange(n) / SR
            f = S.midi(m)
            tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 5) * (0.03 + 0.035 * prog)
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(x[:, 0], st[:, 0], t0)
            S.place(x[:, 1], st[:, 1], t0)
            t0 += 0.52 - 0.18 * prog
            k += 1
    t0 = LAB[0] + 1.0
    while t0 < LAB[1]:
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * S.midi(81 + (int(t0 * 3) % 3) * 2) * tt) * np.exp(-tt * 8) * 0.035
        S.place(x[:, 0], s, t0)
        S.place(x[:, 1], s, t0 + 0.02)
        t0 += 0.66
    x = S.reverb(x, 3.6, 0.45, seed=85)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in CUTS:
        w = S.whoosh(1.0, 180, 1200, 0.26)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.48)
    for ti, g in [(TITLE_HIT, 0.7), (FINAL_HIT, 0.6)]:
        hit = S.thump(46, 2.0, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.06
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.2, 0.4, seed=87)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
