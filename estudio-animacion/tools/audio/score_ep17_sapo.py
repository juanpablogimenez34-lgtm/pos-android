#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "DE HUEVO A SAPO: UNA TRANSFORMACIÓN INCREÍBLE" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin
muestras de terceros. Reutiliza score.py sin modificarlo. Pistas en
public/audio/ep17-de-huevo-a-sapo-180/:
  musica.m4a        música documental: asombro (re mayor), crecimiento, metamorfosis, cierre
  ambiente.m4a      agua del estanque (bajo el agua) + bosque húmedo (hojas, aves, gotas)
  movimiento.m4a    natación, eclosión, patadas, pasos sobre hojarasca, saltos, lengua, salpicadura
  revelacion.m4a    tensión y revelación (gancho, título, eclosión, patas, superficie, caza, final)
  transiciones.m4a  barridos entre escenas, inmersión, cortina de burbujas y golpe final
Tiempos coherentes con src/episodes/ep17-de-huevo-a-sapo/full/data/timeline.ts (EV).
Uso:  python3 tools/audio/score_ep17_sapo.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep17-de-huevo-a-sapo-180')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261122)
S.rng = rng

# --- eventos (mismos valores que EV en timeline.ts) ---
SCENES = [20.0, 45.0, 70.0, 95.0, 120.0, 150.0]
HOOK_SURFACE = 2.3
TITLE = 3.4
DIVE = 8.4
EMBRYO = 14.0
HATCH = 46.0
LEGS = [76.0, 84.0]
EDGE = 107.0
BREAK = 115.6
HOP = (129.95 + 0.36 + 0.12, 129.95 + 0.36 + 0.12 + 0.46)  # despegue, contacto
STRIKE = 146.0
ADULT = 158.0
END_TEXT = 173.8
FADE = 179.3
WATER = [(0.0, 2.6), (8.9, 116.0)]
FOREST = [(2.6, 8.9), (107.0, 180.0)]
SWIM_BURSTS = [52.0 + 2.0 * k + 0.33 for k in range(3)]  # impulsos de la escena 3
SWIM = [(0.0, 2.4), (58.0, 70.0), (70.0, 71.6), (76.0, 101.4), (107.0, 111.5)]
WALKS = [(111.5, 120.0, 0.55), (127.2, 129.8, 0.56), (131.6, 135.0, 0.56), (135.2, 137.6, 0.56), (139.2, 141.8, 0.56), (158.4, 164.6, 1.0)]


def window(tt, ranges, ramp=0.6):
    w = np.zeros_like(tt)
    for a, b in ranges:
        w = np.maximum(w, np.clip((tt - a) / ramp, 0, 1) * np.clip((b - tt) / ramp, 0, 1))
    return w


def add(x, sig, t0, p=0.0):
    st = S.pan(sig, p)
    S.place(x[:, 0], st[:, 0], t0)
    S.place(x[:, 1], st[:, 1], t0)


def bell(f, dur, gain, decay=3.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2.01 * f * tt) + 0.12 * np.sin(2 * np.pi * 3.0 * f * tt)) * np.exp(-tt * decay) * gain


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 3.0, [38, 45, 50, 54, 57], 1500),       # D — gancho luminoso
        (2.8, 9.0, [43, 50, 55, 59, 62, 66], 1700),   # Gmaj7 — título
        (8.8, 20.5, [35, 42, 47, 50, 54], 900),       # Bm(add9) — bajo el agua, misterio suave
        (20.0, 33.0, [38, 45, 50, 52, 57], 1100),     # D(add9) — la puesta
        (32.5, 45.5, [43, 50, 55, 57, 62], 1200),     # G(add9) — el embrión crece
        (45.0, 58.0, [45, 52, 57, 61, 64], 1500),     # A — eclosión
        (57.5, 70.5, [38, 45, 50, 54, 59], 1500),     # D6 — el pequeño nadador
        (70.0, 83.0, [40, 47, 52, 55, 59], 1200),     # Em — comienza la transformación
        (82.5, 95.5, [36, 43, 48, 52, 55, 59], 1300), # Cmaj7 — metamorfosis
        (95.0, 107.5, [35, 42, 47, 50, 54], 1000),    # Bm — el adiós a la cola
        (107.0, 120.5, [43, 50, 55, 59, 62], 1500),   # G — hacia la orilla
        (120.0, 141.5, [38, 45, 50, 54, 57], 1400),   # D — el primer mundo terrestre
        (141.0, 150.5, [40, 47, 52, 55], 700),        # Em grave — la caza (deja sitio a la tensión)
        (150.0, 165.5, [43, 50, 55, 59, 62, 66], 1600),  # Gmaj7 — los años pasan
        (165.0, 173.9, [45, 52, 57, 61, 64], 1400),   # A — primeros planos
        (173.7, 180.0, [38, 45, 50, 54, 57, 62], 1800),  # D — pregunta final
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.6, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.32)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # arpegios de celesta (crecimiento): más densos en las transiciones temporales
    arps = [(0.2, 2.6, 74, 0.18), (20.5, 33.0, 74, 0.5), (33.0, 39.0, 76, 0.25), (58.0, 70.0, 74, 0.33),
            (70.5, 95.0, 71, 0.25), (101.0, 107.0, 74, 0.2), (120.5, 141.0, 76, 0.5), (150.5, 158.0, 74, 0.18), (174.0, 179.0, 78, 0.4)]
    steps = [0, 4, 7, 12, 14, 12, 7, 4]
    for a, b, base, dt in arps:
        tb, k = a, 0
        while tb < b:
            tone = bell(S.midi(base + steps[k % 8]), 1.6, 0.03)
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    # pulso suave de crecimiento (escena 4) y latido de la caza
    for tb in np.arange(76.0, 94.0, 1.0):
        h = S.thump(55, 0.6, 0.06)
        S.place(L, h, tb)
        S.place(R, h, tb + 0.01)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.2, 9, 20, 95, 141, 146.2, 150, 165, 174, 179.2, 180], [0.9, 1.0, 0.85, 0.9, 0.95, 0.9, 0.55, 1.0, 1.05, 1.15, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    water = window(tt, WATER, 0.4)
    forest = window(tt, FOREST, 0.4)
    # agua: rumor grave, corriente suave y burbujas
    deep = S.lp(rng.standard_normal((N, 2)), 220) * 1.8
    current = S.bp(rng.standard_normal((N, 2)), 120, 700) * (0.35 + 0.2 * np.sin(2 * np.pi * tt / 7.0))[:, None]
    x = (deep * 0.55 + current * 0.4) * water[:, None]
    t0 = 0.4
    while t0 < 179.5:
        if np.interp(t0, tt[::441], water[::441]) > 0.5:
            add(x, S.bubble(rng.uniform(380, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.12), t0, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.7)
    # bosque: hojas al viento, aves lejanas, gotas
    rustle = S.bp(rng.standard_normal((N, 2)), 900, 5000) * (0.25 + 0.2 * np.sin(2 * np.pi * tt / 5.3) ** 2)[:, None]
    x += rustle * 0.35 * forest[:, None]
    lap = S.bp(rng.standard_normal((N, 2)), 200, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 2.1))[:, None]
    x += lap * 0.25 * window(tt, [(2.6, 8.9), (107.0, 122.0)], 0.6)[:, None]  # agua en la orilla
    t0 = 3.0
    while t0 < 179:
        if np.interp(t0, tt[::441], forest[::441]) > 0.5:
            n = int(0.18 * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(2600, 4200)
            chirp = np.sin(2 * np.pi * (f0 + 1800 * np.sin(np.pi * t2 / 0.18)) * t2) * np.sin(np.pi * t2 / 0.18) ** 2 * 0.035
            for r in range(rng.integers(1, 4)):
                add(x, chirp, t0 + r * 0.22, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(1.8, 4.5)
    t0 = 3.2
    while t0 < 179:  # gotas
        if np.interp(t0, tt[::441], forest[::441]) > 0.5:
            n = int(0.08 * SR)
            t2 = np.arange(n) / SR
            add(x, np.sin(2 * np.pi * (1800 - 6000 * t2) * t2) * np.exp(-t2 * 50) * 0.06, t0, rng.uniform(-0.6, 0.6))
        t0 += rng.uniform(1.2, 3.0)
    x = S.reverb(x, 2.8, 0.35, seed=171)
    fade = np.interp(tt, [0, 0.3, FADE, 180], [0, 1, 1, 0])
    S.save('ambiente.m4a', x * fade[:, None], -6.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    # natación continua: roce de agua modulado por la cola
    swim = window(tt, SWIM, 0.5)
    sw = S.bp(rng.standard_normal((N, 2)), 250, 1500) * (0.5 + 0.5 * np.sin(2 * np.pi * 4.5 * tt))[:, None] ** 2
    x += sw * 0.12 * swim[:, None]
    for c in SWIM_BURSTS:  # primeros impulsos
        add(x, S.swish(0.6, 300, 1600, 0.25), c - 0.2, 0.2)
    # eclosión: la cápsula cede (chasquido húmedo y suave)
    n = int(0.25 * SR)
    t2 = np.arange(n) / SR
    add(x, S.bp(rng.standard_normal(n), 600, 3000) * np.exp(-t2 * 25) * 0.4 + np.sin(2 * np.pi * 320 * t2 * (1 - t2)) * np.exp(-t2 * 30) * 0.3, HATCH)
    # patadas en el agua (escena 5) y en la orilla
    for c in np.arange(95.0, 101.0, 1.0 / 1.3):
        add(x, S.swish(0.3, 200, 1200, 0.16), c, rng.uniform(-0.3, 0.3))
    for c in np.arange(107.0, 111.5, 1.0 / 1.6):
        add(x, S.swish(0.3, 200, 1200, 0.2), c, rng.uniform(-0.3, 0.3))
    # salpicadura al romper la superficie
    n = int(0.9 * SR)
    t2 = np.arange(n) / SR
    add(x, S.bp(rng.standard_normal(n), 800, 6000) * np.exp(-t2 * 6) * 0.35, BREAK)
    # pasos sobre hojarasca (paso diagonal: dos apoyos por ciclo)
    for a, b, sz in WALKS:
        cyc = 1.0 / (70 * sz) * (67 if a < 112 else (100 if sz > 0.9 else 45))
        step = 1.0 / max(0.8, 2 * cyc)
        c = a + 0.1
        while c < b - 0.1:
            m = int(0.07 * SR)
            t3 = np.arange(m) / SR
            crunch = S.bp(rng.standard_normal(m), 1500, 7000) * np.exp(-t3 * 60) * (0.09 + 0.08 * sz)
            add(x, crunch, c, rng.uniform(-0.3, 0.3))
            c += step * rng.uniform(0.9, 1.1)
    # salto: impulso y aterrizaje
    add(x, S.swish(0.25, 400, 2000, 0.2), HOP[0] - 0.05)
    add(x, S.thump(90, 0.3, 0.35) + S.bp(rng.standard_normal(int(0.3 * SR)), 1200, 6000) * np.exp(-np.arange(int(0.3 * SR)) / SR * 30) * 0.12, HOP[1])
    # lengua: chasquido rápido + tragar
    n = int(0.12 * SR)
    t2 = np.arange(n) / SR
    add(x, np.sin(2 * np.pi * (2200 - 9000 * t2) * t2) * np.exp(-t2 * 40) * 0.3 + S.bp(rng.standard_normal(n), 2000, 8000) * np.exp(-t2 * 50) * 0.2, STRIKE)
    add(x, S.thump(140, 0.25, 0.18), STRIKE + 0.55)
    x = S.reverb(x, 1.6, 0.25, seed=173)
    S.save('movimiento.m4a', x, -3.0)


def make_reveal():
    print('Revelación…')
    x = np.zeros((N, 2))
    tt = S.t_axis()

    def swell(t_hit, dur, gain, f=55):
        n = int(dur * SR)
        t2 = np.arange(n) / SR
        rise = (t2 / dur) ** 2.2
        s = (S.lp(rng.standard_normal(n), 900) * 0.5 + np.sin(2 * np.pi * f * t2) * 0.5) * rise * gain
        add(x, s, t_hit - dur)

    def sparkle(t0, base, gain=0.05):
        for j, m in enumerate([base, base + 7, base + 12, base + 16]):
            add(x, bell(S.midi(m), 2.0, gain, 2.4), t0 + j * 0.07, -0.4 + j * 0.25)

    add(x, S.thump(40, 1.6, 0.5), 0.0)
    sparkle(0.05, 81, 0.035)
    swell(HOOK_SURFACE, 1.4, 0.18)
    sparkle(TITLE, 79, 0.06)
    swell(EMBRYO + 1.5, 2.0, 0.08)
    sparkle(EMBRYO + 1.5, 84, 0.03)
    swell(HATCH, 2.5, 0.14)
    sparkle(HATCH + 0.05, 81)
    for c in LEGS:
        sparkle(c + 0.4, 79, 0.04)
    sparkle(90.6, 83, 0.04)  # "metamorfosis"
    swell(BREAK, 2.5, 0.16)
    sparkle(BREAK + 0.1, 79, 0.06)
    # tensión de la caza: zumbido grave y pulso que se acelera hasta la lengua
    hunt = np.clip((tt - 142.0) / 1.5, 0, 1) * (tt < STRIKE)
    x += (np.sin(2 * np.pi * 49 * tt) * 0.05 + S.bp(rng.standard_normal(N), 200, 600) * 0.03)[:, None] * hunt[:, None]
    tb, gap = 142.5, 0.8
    while tb < STRIKE - 0.1:
        add(x, S.thump(52, 0.5, 0.18), tb)
        tb += gap
        gap = max(0.32, gap * 0.82)
    sparkle(STRIKE + 0.1, 86, 0.05)
    sparkle(ADULT, 78, 0.05)
    swell(END_TEXT, 3.0, 0.15)
    sparkle(END_TEXT, 78, 0.07)
    x = S.reverb(x, 3.4, 0.45, seed=175)
    S.save('revelacion.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 160, 1200, 0.18), c - 0.55)
    # subida a la superficie (gancho) e inmersión (escena 1)
    add(x, S.whoosh(0.9, 300, 2400, 0.22), HOOK_SURFACE - 0.5)
    n = int(1.2 * SR)
    t2 = np.arange(n) / SR
    plunge = S.lp(rng.standard_normal(n), 1200) * np.exp(-t2 * 3.5) * 0.4 + np.sin(2 * np.pi * 70 * t2) * np.exp(-t2 * 5) * 0.3
    add(x, plunge, DIVE + 0.3)
    # cortina de burbujas (escena 5)
    for k in range(18):
        add(x, S.bubble(rng.uniform(400, 1600), 0.06) * 0.12, EDGE - 0.6 + k * 0.07, rng.uniform(-0.7, 0.7))
    add(x, S.thump(44, 2.6, 0.45), END_TEXT)
    x = S.reverb(x, 3.0, 0.4, seed=177)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_reveal()
    make_transitions()
