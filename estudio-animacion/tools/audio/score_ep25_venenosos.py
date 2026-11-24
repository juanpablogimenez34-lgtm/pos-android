#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "20 ANIMALES VENENOSOS QUE PARECEN DE OTRO PLANETA" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Sin rugidos ni voces inventadas para animales que no las producen. Reutiliza score.py sin
modificarlo. Pistas en public/audio/ep25-animales-venenosos/ (13 con la voz):
  narracion.m4a           narración (Piper es_MX)
  musica.m4a              música cinematográfica (pulso grave, cuerdas sintéticas; baja bajo la voz)
  ambiente-selva.m4a      selva y bosques húmedos: insectos, gotas, aves lejanas
  ambiente-desierto.m4a   desierto: viento seco, arena que sopla, chicharras lejanas
  ambiente-submarino.m4a  rumor submarino y partículas (escenas marinas)
  hojas.m4a               hojas que se mueven y transiciones con hojas
  cascabel.m4a            cascabel de la serpiente (recreación sintética: chasquidos de anillos a ~55 Hz)
  movimiento-arena.m4a    reptación, pasos de escorpiones, del monstruo de Gila y del ciempiés
  burbujas.m4a            burbujas (transiciones y escenas marinas)
  agua.m4a                agua en movimiento (cruce de la superficie, río del ornitorrinco)
  impactos.m4a            impactos cinematográficos (gancho, títulos, cierre)
  transiciones.m4a        barridos entre animales
  musica-cierre.m4a       música de cierre (170–180 s) y golpe del gancho
Uso:  python3 tools/audio/score_ep25_venenosos.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep25-animales-venenosos')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261126)
S.rng = rng

STARTS = [10 + 8 * i for i in range(20)]
HAB = ['jungle', 'desert', 'desert', 'forest', 'desert', 'desert', 'desert', 'desert', 'forest', 'forest', 'jungle', 'ocean', 'ocean', 'ocean', 'ocean', 'ocean', 'ocean', 'desert', 'river', 'jungle']
INTRO_CUTS = [(0, 1, 'jungle'), (1, 3, 'ocean'), (3, 5, 'desert'), (5, 7, 'ocean'), (7, 7.5, 'forest'), (7.5, 8, 'ocean'), (8, 8.5, 'desert'), (8.5, 9, 'desert'), (9, 10, 'river')]
OUTRO_CUTS = [(170, 171, 'jungle'), (171, 172, 'desert'), (172, 173, 'forest'), (173, 174, 'ocean'), (174, 175, 'ocean'), (175, 176, 'ocean'), (176, 180, 'river')]
RATTLE = [(43.8, 50.0), (8.5, 9.0)]
WIPES = {10: 'leaf', 18: 'dust', 26: 'dust', 34: 'leaf', 42: 'dust', 50: 'dust', 58: 'dust', 66: 'dust', 74: 'leaf', 82: 'leaf', 90: 'leaf', 98: 'bubble', 106: 'bubble', 114: 'bubble', 122: 'bubble', 130: 'bubble', 138: 'bubble', 146: 'dust', 154: 'bubble', 162: 'leaf', 170: 'leaf'}
# desplazamientos sobre el terreno (inicio, fin, tipo)
MOVES = [(10.0, 12.6, 'slither'), (18.0, 21.0, 'slither'), (26.3, 30.5, 'slither'), (42.0, 43.8, 'slither'), (50.0, 53.5, 'steps'), (58.2, 61.6, 'steps'), (66.0, 74.0, 'steps'), (82.4, 84.8, 'steps'), (90.0, 93.2, 'steps'), (146.0, 154.0, 'heavy'), (158.4, 162.0, 'heavy'), (162.0, 170.0, 'centipede'), (3.0, 5.0, 'steps')]
TITLES = [3.0] + [s + 0.25 for s in STARTS]
END_TEXT, FADE = 176.6, 179.4


def ranges(kind):
    r = [(s, s + 8) for s, h in zip(STARTS, HAB) if h == kind]
    r += [(a, b) for a, b, h in INTRO_CUTS + OUTRO_CUTS if h == kind]
    return r


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
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    roots = [26, 29, 24, 31, 26, 27, 29, 24, 26, 22, 26, 29, 24, 31, 26, 29, 24, 27, 31, 26]
    blocks = [(0.0, 10.5, 26)] + [(s, s + 8.5, r) for s, r in zip(STARTS, roots)]
    for a, b, r in blocks:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 0.8, 2.0)
        for j, m in enumerate([r, r + 12, r + 19, r + 22 if r % 2 else r + 24]):
            st = S.pan(S.pad_voice(S.midi(m), n, 900) * e * (0.85 if j == 0 else 0.24), (-0.5 + j * 0.33) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # pulso rítmico grave (tensión) cada 0,5 s
    tt = S.t_axis()
    for k in range(int(170 / 0.5)):
        t0 = k * 0.5
        if t0 < 170:
            th = S.thump(46, 0.35, 0.06 if k % 2 else 0.1)
            S.place(L, th, t0)
            S.place(R, th, t0)
    x = S.reverb(np.stack([L, R], axis=1), 3.6, 0.42)
    master = np.interp(tt, [0, 0.2, 168.5, 170.5, 180], [0.9, 1.0, 1.0, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_jungle():
    print('Ambiente de selva…')
    tt = S.t_axis()
    w = np.maximum(window(tt, ranges('jungle')), window(tt, ranges('forest')) * 0.8)
    x = S.bp(rng.standard_normal((N, 2)), 2500, 7000) * 0.025 + S.lp(rng.standard_normal((N, 2)), 300) * 0.3
    t0 = 0.3
    while t0 < 179:
        r = rng.random()
        if r < 0.4:
            n = int(0.6 * SR)
            t2 = np.arange(n) / SR
            add(x, np.sin(2 * np.pi * rng.uniform(3500, 5200) * t2) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t2))) * np.sin(np.pi * t2 / 0.6) * 0.01, t0, rng.uniform(-0.9, 0.9))
        elif r < 0.7:
            add(x, S.bubble(rng.uniform(900, 1800), 0.04) * 0.04, t0, rng.uniform(-0.8, 0.8))
        else:
            n = int(0.3 * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(1600, 2800)
            add(x, np.sin(2 * np.pi * (f0 + 500 * np.sin(2 * np.pi * 6 * t2)) * t2) * np.sin(np.pi * t2 / 0.3) ** 2 * 0.02, t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.25, 0.8)
    x = S.reverb(x, 2.4, 0.35, seed=631)
    S.save('ambiente-selva.m4a', x * w[:, None], -6.0)


def make_desert():
    print('Ambiente de desierto…')
    tt = S.t_axis()
    w = window(tt, ranges('desert'))
    gust = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 4.3) * np.sin(2 * np.pi * tt / 11.0)
    x = S.bp(rng.standard_normal((N, 2)), 300, 2600) * (0.12 + 0.12 * gust)[:, None] + S.bp(rng.standard_normal((N, 2)), 3000, 8000) * (0.02 * gust)[:, None]
    x = S.reverb(x, 2.0, 0.3, seed=633)
    S.save('ambiente-desierto.m4a', x * w[:, None], -6.0)


def make_underwater():
    print('Ambiente submarino…')
    tt = S.t_axis()
    w = np.maximum(window(tt, ranges('ocean')), window(tt, [(154.0, 158.4), (9.0, 10.0), (176.0, 180.0)]) * 0.8)
    x = S.lp(rng.standard_normal((N, 2)), 140) * 1.0 + S.bp(rng.standard_normal((N, 2)), 300, 1200) * 0.04
    x = S.reverb(x, 3.0, 0.4, seed=635)
    S.save('ambiente-submarino.m4a', x * w[:, None], -6.0)


def make_leaves():
    print('Hojas…')
    x = np.zeros((N, 2))
    for b, k in WIPES.items():
        if k == 'leaf':
            n = int(1.1 * SR)
            t2 = np.arange(n) / SR
            add(x, noise(n, 1500, 7000) * np.sin(np.pi * t2 / 1.1) * 0.3, b - 0.55, 0.0)
    for a, b in [(34.0, 42.0), (162.0, 170.0), (10.0, 18.0)]:
        t0 = a
        while t0 < b:
            n = int(0.25 * SR)
            add(x, noise(n, 2000, 6000) * np.exp(-np.arange(n) / SR * 12) * 0.08, t0, rng.uniform(-0.6, 0.6))
            t0 += rng.uniform(0.4, 1.2)
    x = S.reverb(x, 1.2, 0.2, seed=637)
    S.save('hojas.m4a', x, -5.0)


def make_rattle():
    print('Cascabel…')
    x = np.zeros((N, 2))
    for a, b in RATTLE:
        n = int((b - a) * SR)
        tt = np.arange(n) / SR
        rate = 55 + 4 * np.sin(2 * np.pi * 0.7 * tt)
        ph = np.cumsum(rate) / SR
        clicks = (np.mod(ph, 1.0) < 0.12).astype(float)
        env = np.clip(tt / 0.15, 0, 1) * np.clip((b - a - tt) / 0.2, 0, 1)
        sig = S.bp(rng.standard_normal(n) * clicks, 2500, 9000) * env * 0.6
        add(x, sig, a, 0.25)
    x = S.reverb(x, 1.2, 0.2, seed=639)
    S.save('cascabel.m4a', x, -3.0)


def make_moves():
    print('Movimiento sobre arena y suelo…')
    x = np.zeros((N, 2))
    for a, b, k in MOVES:
        n = int((b - a) * SR)
        tt = np.arange(n) / SR
        if k == 'slither':
            sig = S.bp(rng.standard_normal(n), 800, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.1 * tt)) ** 2 * 0.25
            add(x, sig, a, 0.1)
        else:
            step = {'steps': 0.12, 'heavy': 0.45, 'centipede': 0.05}[k]
            t0 = 0.0
            while t0 < b - a:
                m = int(0.05 * SR)
                g = {'steps': 0.12, 'heavy': 0.3, 'centipede': 0.05}[k]
                add(x, noise(m, 600 if k == 'heavy' else 2000, 6000) * np.exp(-np.arange(m) / SR * 80) * g, a + t0, rng.uniform(-0.3, 0.3))
                t0 += step * rng.uniform(0.8, 1.2)
    x = S.reverb(x, 1.0, 0.2, seed=641)
    S.save('movimiento-arena.m4a', x, -4.0)


def make_bubbles():
    print('Burbujas…')
    x = np.zeros((N, 2))
    for b, k in WIPES.items():
        if k == 'bubble':
            for j in range(18):
                add(x, S.bubble(rng.uniform(300, 1200), rng.uniform(0.04, 0.1)) * 0.12, b - 0.5 + j * 0.06, rng.uniform(-0.8, 0.8))
    tt = S.t_axis()
    for a, b in ranges('ocean'):
        t0 = a
        while t0 < b:
            add(x, S.bubble(rng.uniform(400, 1400), 0.05) * 0.04, t0, rng.uniform(-0.8, 0.8))
            t0 += rng.uniform(0.6, 1.8)
    x = S.reverb(x, 1.6, 0.3, seed=643)
    S.save('burbujas.m4a', x, -4.0)


def make_water():
    print('Agua…')
    tt = S.t_axis()
    x = np.zeros((N, 2))
    w = window(tt, [(154.0, 162.0), (9.0, 10.0), (176.0, 180.0)])
    x += S.bp(rng.standard_normal((N, 2)), 200, 2400) * (0.18 * (0.6 + 0.4 * np.sin(2 * np.pi * tt / 2.3)) * w)[:, None]
    n = int(1.6 * SR)
    add(x, noise(n, 300, 5000) * np.sin(np.pi * np.arange(n) / SR / 1.6) * 0.4, 98.0, 0.0)  # cruce de la superficie
    n = int(1.2 * SR)
    add(x, noise(n, 300, 5000) * np.exp(-np.arange(n) / SR * 3) * 0.35, 157.6, 0.1)  # sale del agua
    x = S.reverb(x, 1.6, 0.25, seed=645)
    S.save('agua.m4a', x, -4.0)


def make_impacts():
    print('Impactos…')
    x = np.zeros((N, 2))
    add(x, S.thump(36, 2.2, 0.5), 0.0)
    for c in TITLES:
        add(x, S.thump(48, 0.9, 0.18), c)
    add(x, S.thump(36, 2.4, 0.45), END_TEXT)
    x = S.reverb(x, 3.0, 0.35, seed=647)
    S.save('impactos.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for b in list(WIPES) + [1, 3, 5, 7]:
        add(x, S.whoosh(0.9, 180, 1400, 0.12), b - 0.5)
    x = S.reverb(x, 2.0, 0.3, seed=649)
    S.save('transiciones.m4a', x, -3.0)


def make_end_music():
    print('Música de cierre…')
    L = np.zeros(N)
    R = np.zeros(N)
    for m in [26, 38, 45]:
        v = S.pad_voice(S.midi(m), int(3.0 * SR), 900) * S.env_adsr(int(3.0 * SR), 0.03, 2.4) * 0.3
        S.place(L, v, 0.0)
        S.place(R, v, 0.0)
    for a, b, notes in [(169.5, 176.5, [26, 38, 45, 50, 53, 57]), (176.0, 180.0, [31, 43, 50, 55, 59, 62])]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 1.4, 2.4)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, 1400) * e * (0.9 if j == 0 else 0.3), (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for c, m in [(170.2, 69), (171.2, 72), (172.2, 76), (173.2, 74), (174.2, 77), (175.2, 81), (176.6, 74), (177.2, 78), (177.8, 81), (178.4, 86)]:
        st = S.pan(bell(S.midi(m), 2.4, 0.07, 1.8), 0.3 * np.sin(c))
        S.place(L, st[:, 0], c)
        S.place(R, st[:, 1], c)
    x = S.reverb(np.stack([L, R], axis=1), 4.2, 0.45, seed=651)
    tt = S.t_axis()
    fade = np.interp(tt, [0, FADE - 0.2, 180], [1, 1, 0])
    S.save('musica-cierre.m4a', x * fade[:, None], -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_jungle()
    make_desert()
    make_underwater()
    make_leaves()
    make_rattle()
    make_moves()
    make_bubbles()
    make_water()
    make_impacts()
    make_transitions()
    make_end_music()
