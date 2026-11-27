#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL ORNITORRINCO: EL ANIMAL QUE PARECE IMPOSIBLE" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Sin rugidos ni vocalizaciones inventadas. Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep12-ornitorrinco/ (12 con la voz):
  narracion.m4a           narración (Piper es_MX)
  musica-documental.m4a   música documental (cálida, cuerdas sintéticas y marimba suave; baja bajo la voz)
  ambiente-bosque.m4a     bosque australiano: aves lejanas, insectos, brisa en los eucaliptos
  corriente-rio.m4a       corriente del río (superficie y bajo el agua, más grave sumergido)
  hojas.m4a               hojas y hojarasca (bosque, madriguera)
  pasos.m4a               pasos sobre tierra y piedras (sincronizados con las caminatas)
  entrada-agua.m4a        entradas al agua, salidas y patas que tocan la superficie
  burbujas.m4a            burbujas al nadar y al bucear
  remadas.m4a             remadas de las patas delanteras (bajo el agua y en superficie)
  sedimentos.m4a          el pico removiendo sedimento y piedrecitas del fondo
  transiciones.m4a        barridos entre escenas y gráficos científicos
  musica-cierre.m4a       música emocional del cierre y golpe del gancho
Uso:  python3 tools/audio/score_ep12_ornitorrinco.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep12-ornitorrinco')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261127)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
# tramos: bosque/tierra, bajo el agua, superficie del agua, madriguera
LAND = [(5.4, 15.0), (15.0, 19.0), (30.0, 34.0), (87.0, 98.6), (135.0, 143.0), (147.0, 150.0), (162.0, 171.0)]
UNDER = [(3.0, 4.0), (98.6, 131.0), (150.0, 154.0), (176.0, 177.0)]
SURFACE = [(0.0, 2.0), (5.0, 6.4), (19.0, 30.0), (131.0, 135.0), (171.0, 180.0)]
BURROW = [(2.0, 3.0), (34.0, 64.0), (72.0, 87.0), (174.0, 176.0)]
WALKS = [(6.3, 9.6, 0.42), (30.0, 33.0, 0.42), (87.0, 98.6, 0.34), (135.0, 138.4, 0.42), (165.0, 170.2, 0.42), (83.0, 87.0, 0.3)]
SPLASH = [(0.05, 0.4), (5.6, 0.5), (95.0, 0.35), (96.2, 0.3), (98.6, 0.9), (131.0, 0.6), (171.0, 0.8)]
STROKES = [(3.0, 4.0, 1.15), (19.0, 30.0, 0.9), (98.6, 120.0, 1.15), (120.0, 128.2, 0.7), (128.2, 131.0, 1.2), (150.0, 154.0, 1.15), (171.0, 180.0, 0.85)]
SEDIMENT = [120.6, 121.8, 123.0, 124.4, 125.4, 126.6, 127.8]
GRAPHICS = [64.0, 110.2, 117.0, 132.2, 143.0, 154.0, 158.0]
HOOK_CUTS = [1.0, 2.0, 3.0, 4.0, 5.0]
END_TEXT, FADE = 177.0, 179.4


def window(tt, rr, ramp=0.4):
    w = np.zeros_like(tt)
    for a, b in rr:
        w = np.maximum(w, np.clip((tt - a) / ramp, 0, 1) * np.clip((b - tt) / ramp, 0, 1))
    return w


def add(x, sig, t0, p=0.0):
    st = S.pan(sig, p)
    S.place(x[:, 0], st[:, 0], t0)
    S.place(x[:, 1], st[:, 1], t0)


def bell(f, dur, gain, decay=3.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * decay) * gain


def noise(n, lo, hi):
    return S.bp(rng.standard_normal(n), lo, hi)


def make_music():
    print('Música documental…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [(0, [31, 43, 50, 55, 59]), (15, [36, 43, 48, 52, 55]), (30, [33, 45, 52, 57, 60]), (45, [29, 41, 48, 53, 57]), (60, [31, 43, 50, 55, 59]), (75, [36, 43, 48, 52, 55]),
              (90, [38, 45, 50, 54, 57]), (105, [33, 40, 45, 48, 52]), (120, [34, 41, 46, 50, 53]), (135, [28, 40, 47, 52, 55]), (150, [36, 43, 48, 52, 55])]
    for a, notes in chords:
        n = int(17.5 * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, 1300) * e * (0.85 if j == 0 else 0.26), (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for a, b, base, dt in [(15.5, 29.5, 67, 0.5), (45.5, 59.5, 72, 0.6), (75.5, 89.5, 67, 0.5), (90.5, 104.5, 74, 0.45), (150.5, 164.5, 67, 0.5)]:
        tb, k = a, 0
        steps = [0, 4, 7, 12, 7, 4, 2, 7]
        while tb < b:
            st = S.pan(bell(S.midi(base + steps[k % 8]), 0.9, 0.03, 5), 0.5 * np.sin(k * 0.9))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 4.0, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.2, 163, 166, 180], [0.85, 0.95, 0.95, 0.0, 0.0])
    S.save('musica-documental.m4a', x * master[:, None], -4.0)


def make_forest():
    print('Ambiente de bosque…')
    tt = S.t_axis()
    w = np.maximum(window(tt, LAND), window(tt, SURFACE) * 0.6)
    x = S.bp(rng.standard_normal((N, 2)), 400, 3000) * (0.05 + 0.04 * np.sin(2 * np.pi * tt / 6.0) ** 2)[:, None]
    t0 = 0.3
    while t0 < 179:
        r = rng.random()
        n = int(0.5 * SR)
        t2 = np.arange(n) / SR
        if r < 0.45:  # ave lejana (silbido descendente)
            f0 = rng.uniform(1800, 3400)
            add(x, np.sin(2 * np.pi * (f0 - 900 * t2) * t2) * np.sin(np.pi * t2 / 0.5) ** 2 * 0.02, t0, rng.uniform(-0.9, 0.9))
        elif r < 0.75:  # insecto
            add(x, np.sin(2 * np.pi * rng.uniform(4000, 6000) * t2) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 40 * t2))) * np.sin(np.pi * t2 / 0.5) * 0.008, t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.6, 1.8)
    x = S.reverb(x, 2.6, 0.35, seed=731)
    fade = np.interp(tt, [0, 0.3, FADE, 180], [0.6, 1, 1, 0])
    S.save('ambiente-bosque.m4a', x * (w * fade)[:, None], -6.0)


def make_river():
    print('Corriente del río…')
    tt = S.t_axis()
    surf = window(tt, SURFACE + LAND)
    und = window(tt, UNDER)
    x = S.bp(rng.standard_normal((N, 2)), 300, 4000) * (0.16 * (0.7 + 0.3 * np.sin(2 * np.pi * tt / 3.1)) * surf)[:, None]
    x += S.lp(rng.standard_normal((N, 2)), 200) * (0.9 * und)[:, None]
    x = S.reverb(x, 1.8, 0.3, seed=733)
    S.save('corriente-rio.m4a', x, -5.0)


def make_leaves():
    print('Hojas…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    w = np.maximum(window(tt, LAND), window(tt, BURROW) * 0.7)
    t0 = 0.5
    while t0 < 179:
        if w[int(t0 * SR)] > 0.3:
            n = int(0.3 * SR)
            add(x, noise(n, 1800, 7000) * np.exp(-np.arange(n) / SR * 10) * 0.07 * w[int(t0 * SR)], t0, rng.uniform(-0.7, 0.7))
        t0 += rng.uniform(0.5, 1.4)
    x = S.reverb(x, 1.2, 0.2, seed=735)
    S.save('hojas.m4a', x, -5.0)


def make_steps():
    print('Pasos…')
    x = np.zeros((N, 2))
    for a, b, dt in WALKS:
        t0 = a
        k = 0
        while t0 < b:
            n = int(0.07 * SR)
            add(x, noise(n, 300, 3000) * np.exp(-np.arange(n) / SR * 60) * (0.22 if k % 2 == 0 else 0.15), t0, -0.15 if k % 2 else 0.15)
            add(x, S.thump(90, 0.08, 0.05), t0)
            t0 += dt
            k += 1
    x = S.reverb(x, 1.0, 0.18, seed=737)
    S.save('pasos.m4a', x, -4.0)


def make_splash():
    print('Entrada al agua…')
    x = np.zeros((N, 2))
    for t0, g in SPLASH:
        n = int(1.4 * SR)
        tt = np.arange(n) / SR
        add(x, noise(n, 300, 6000) * np.exp(-tt * 3.2) * 0.45 * g + S.lp(rng.standard_normal(n), 300) * np.exp(-tt * 5) * 0.3 * g, t0, 0.1)
        for k in range(12):
            add(x, S.bubble(rng.uniform(600, 1800), 0.04) * 0.07 * g, t0 + 0.3 + k * 0.08, rng.uniform(-0.6, 0.6))
    x = S.reverb(x, 1.4, 0.25, seed=739)
    S.save('entrada-agua.m4a', x, -3.0)


def make_bubbles():
    print('Burbujas…')
    x = np.zeros((N, 2))
    for a, b in UNDER:
        t0 = a
        while t0 < b:
            add(x, S.bubble(rng.uniform(300, 1400), rng.uniform(0.04, 0.09)) * 0.08, t0, rng.uniform(-0.7, 0.7))
            t0 += rng.uniform(0.15, 0.7)
    x = S.reverb(x, 1.6, 0.3, seed=741)
    S.save('burbujas.m4a', x, -4.0)


def make_strokes():
    print('Remadas…')
    x = np.zeros((N, 2))
    for a, b, rate in STROKES:
        t0 = a
        k = 0
        while t0 < b:
            n = int(0.32 * SR)
            tt = np.arange(n) / SR
            add(x, S.lp(rng.standard_normal(n), 700) * np.sin(np.pi * tt / 0.32) ** 2 * 0.22, t0, -0.25 if k % 2 else 0.25)
            t0 += 0.5 / rate  # una remada por pata en cada medio ciclo (alternas)
            k += 1
    x = S.reverb(x, 1.2, 0.22, seed=743)
    S.save('remadas.m4a', x, -4.0)


def make_sediment():
    print('Sedimentos…')
    x = np.zeros((N, 2))
    for t0 in SEDIMENT:
        n = int(0.9 * SR)
        add(x, S.lp(rng.standard_normal(n), 900) * np.exp(-np.arange(n) / SR * 4) * 0.3, t0, rng.uniform(-0.3, 0.3))
        for k in range(5):
            m = int(0.04 * SR)
            add(x, noise(m, 1200, 5000) * np.exp(-np.arange(m) / SR * 90) * 0.1, t0 + 0.1 + k * 0.12, rng.uniform(-0.4, 0.4))
    x = S.reverb(x, 1.4, 0.3, seed=745)
    S.save('sedimentos.m4a', x, -4.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES + HOOK_CUTS:
        add(x, S.whoosh(0.9, 160, 1200, 0.12), c - 0.5)
    for c in GRAPHICS:
        for j, f in enumerate([1568, 2093, 2637]):
            add(x, bell(f, 0.4, 0.03, 10), c + j * 0.07, 0.2)
    x = S.reverb(x, 2.4, 0.35, seed=747)
    S.save('transiciones.m4a', x, -3.0)


def make_end_music():
    print('Música del cierre…')
    L = np.zeros(N)
    R = np.zeros(N)
    for m in [31, 43, 50, 55]:
        v = S.pad_voice(S.midi(m), int(5.0 * SR), 1100) * S.env_adsr(int(5.0 * SR), 0.05, 3.0) * 0.3
        S.place(L, v, 0.0)
        S.place(R, v, 0.0)
    for a, b, notes in [(164.5, 172.5, [31, 43, 50, 55, 59, 62]), (172.0, 180.0, [36, 48, 55, 60, 64, 67])]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 1.8, 2.6)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, 1500) * e * (0.9 if j == 0 else 0.3), (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for c, m in [(166.0, 67), (167.4, 71), (168.8, 74), (170.4, 79), (172.2, 76), (173.6, 74), (177.0, 67), (177.6, 71), (178.2, 74), (178.8, 79)]:
        st = S.pan(bell(S.midi(m), 2.4, 0.07, 1.8), 0.3 * np.sin(c))
        S.place(L, st[:, 0], c)
        S.place(R, st[:, 1], c)
    x = S.reverb(np.stack([L, R], axis=1), 4.4, 0.46, seed=749)
    add(x, S.thump(40, 1.8, 0.3), 0.0)
    add(x, S.thump(40, 2.0, 0.3), END_TEXT)
    tt = S.t_axis()
    fade = np.interp(tt, [0, FADE - 0.2, 180], [1, 1, 0])
    S.save('musica-cierre.m4a', x * fade[:, None], -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_forest()
    make_river()
    make_leaves()
    make_steps()
    make_splash()
    make_bubbles()
    make_strokes()
    make_sediment()
    make_transitions()
    make_end_music()
