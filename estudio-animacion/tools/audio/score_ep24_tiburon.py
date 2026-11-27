#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL TIBURÓN QUE PUEDE VIVIR MÁS DE 400 AÑOS" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Sin rugidos de tiburón (los tiburones no vocalizan). Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep24-tiburon-groenlandia/ (12 con la voz):
  narracion.m4a               narración (Piper es_MX, tools/audio/narration.py)
  musica-misteriosa.m4a       música misteriosa (pads graves en re menor, campanas heladas)
  ambiente-submarino.m4a      rumor del océano frío, partículas, crujidos del hielo bajo el agua
  movimiento-agua.m4a         batidos lentos de la cola y desplazamiento del agua junto al tiburón
  olas.m4a                    olas de superficie (Ártico y escenas de barcos)
  barcos-madera.m4a           crujidos de cascos de madera, cabos y poleas
  viento-velas.m4a            viento y velas que gualdrapean
  motores-vapor.m4a           máquina de vapor y ruedas de paletas; motores modernos del s. XX–XXI
  laboratorio.m4a             ambiente de laboratorio: zumbido, pitidos, pipeta, datos
  impactos.m4a                impactos cinematográficos (gancho, 392, margen, cierre)
  transiciones-temporales.m4a barridos y destellos del paso del tiempo y entre escenas
  musica-cierre.m4a           tema emocional del cierre (escena 12) y golpe del gancho
Tiempos coherentes con src/episodes/ep24-tiburon-groenlandia/data/timeline.ts y las escenas.
Uso:  python3 tools/audio/score_ep24_tiburon.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep24-tiburon-groenlandia')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261125)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
HOOK_SHIP, BACK_DOWN, ARCTIC_DIVE = 3.4, 10.0, 19.0
AGE_MORPH = (40.5, 44.8)
SHIPS = [45.0, 49.0, 53.0, 57.0]
GROWTH = (80.0, 85.0)
MATURITY, FEED = 85.5, 102.8
LAB, LENS, NUM392, RANGE = 125.0, 130.0, 140.0, 145.0
MONTAGE = [170.0, 171.25, 172.5, 173.75]
END_TEXT, FADE = 176.0, 179.4
SURFACE = [(3.4, 13.4), (15.0, 23.0), (45.0, 59.4), (120.0, 125.0), (155.0, 160.0), (170.0, 175.0)]
WOOD = [(3.4, 13.0), (45.0, 52.8), (170.0, 172.5)]
WIND = [(3.4, 13.0), (15.0, 22.6), (45.0, 53.0), (170.0, 172.5)]
STEAM = [(53.0, 57.6), (172.5, 173.75)]
MOTOR = [(120.0, 125.0), (155.0, 160.0), (173.75, 175.0)]
LABS = [(125.0, 135.0)]
GRAPHICS = [70.0, 85.5, 110.4, 140.0, 145.0]


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
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * decay) * gain


def noise(n, lo, hi):
    return S.bp(rng.standard_normal(n), lo, hi)


def make_music():
    print('Música misteriosa…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [26, 38, 45, 50, 53], 700), (15.0, 30.5, [31, 43, 50, 55, 58], 1000), (30.0, 45.5, [29, 41, 48, 53, 57], 1100),
        (45.0, 60.5, [33, 45, 52, 57, 60], 1200), (60.0, 75.5, [26, 38, 45, 50, 53], 700), (75.0, 90.5, [34, 46, 53, 58, 62], 900),
        (90.0, 105.5, [24, 36, 43, 48, 51], 600), (105.0, 120.5, [26, 38, 44, 50, 53], 600), (120.0, 135.5, [29, 41, 48, 53, 60], 1200),
        (135.0, 150.5, [31, 43, 50, 55, 59, 62], 1300), (150.0, 165.5, [26, 38, 45, 50, 53], 800),
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 3.0) * SR)
        e = S.env_adsr(n, 2.2, 3.4)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, bright) * e * (0.9 if j == 0 else 0.26), (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for a, b, base, dt in [(15.5, 29.5, 69, 1.6), (30.5, 44.5, 72, 1.3), (60.5, 74.5, 65, 1.8), (135.5, 149.5, 67, 1.2), (150.5, 164.5, 69, 1.6)]:
        tb, k = a, 0
        steps = [0, 3, 7, 10, 12, 7]
        while tb < b:
            st = S.pan(bell(S.midi(base + steps[k % 6]), 2.4, 0.03, 1.6), 0.6 * np.sin(k * 1.3))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 125, 126, 135, 163, 166.5, 180], [0.85, 0.95, 0.95, 0.55, 0.9, 0.9, 0.0, 0.0])
    S.save('musica-misteriosa.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente submarino…')
    tt = S.t_axis()
    under = 1 - window(tt, LABS + [(135.0, 150.0)], 0.5) * 0.85
    x = (S.lp(rng.standard_normal((N, 2)), 120) * 1.1 + S.bp(rng.standard_normal((N, 2)), 250, 1000) * 0.04) * under[:, None]
    t0 = 0.6
    while t0 < 179:
        if under[int(t0 * SR)] > 0.5:
            if rng.random() < 0.3:  # crujido lejano del hielo
                n = int(0.8 * SR)
                t2 = np.arange(n) / SR
                add(x, noise(n, 200, 1400) * np.exp(-t2 * 4) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 23 * t2))) * 0.06, t0, rng.uniform(-0.9, 0.9))
            else:
                add(x, bell(rng.uniform(1600, 3400), 0.4, 0.006, 9), t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.9, 2.6)
    x = S.reverb(x, 3.4, 0.42, seed=531)
    fade = np.interp(tt, [0, 0.3, FADE, 180], [0.5, 1, 1, 0])
    S.save('ambiente-submarino.m4a', x * fade[:, None], -7.0)


def make_water():
    print('Movimiento del agua…')
    tt = S.t_axis()
    swim = 1 - window(tt, LABS + [(135.0, 150.0)], 0.5)
    beat = (0.5 + 0.5 * np.sin(2 * np.pi * 0.32 * tt)) ** 3
    x = S.lp(rng.standard_normal((N, 2)), 300) * (beat * 0.22 * swim)[:, None]
    n = int(1.6 * SR)
    add(x, S.lp(rng.standard_normal(n), 600) * np.sin(np.pi * np.arange(n) / SR / 1.6) * 0.35, FEED - 0.4, 0.1)  # bocado
    x = S.reverb(x, 1.8, 0.3, seed=533)
    S.save('movimiento-agua.m4a', x, -4.0)


def make_waves():
    print('Olas…')
    tt = S.t_axis()
    w = window(tt, SURFACE, 0.5)
    waves = S.bp(rng.standard_normal((N, 2)), 150, 2800) * (0.35 + 0.65 * np.clip(np.sin(2 * np.pi * tt / 4.8) * 0.5 + 0.5, 0, 1) ** 2)[:, None]
    x = waves * (0.3 * w)[:, None]
    x = S.reverb(x, 1.6, 0.25, seed=535)
    S.save('olas.m4a', x, -5.0)


def make_wood():
    print('Barcos de madera…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for a, b in WOOD:
        t0 = a + 0.2
        while t0 < b - 0.5:
            d = rng.uniform(0.4, 0.9)
            n = int(d * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(140, 320)
            creak = np.sin(2 * np.pi * (f0 + 40 * np.sin(2 * np.pi * 3 * t2)) * t2) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rng.uniform(25, 45) * t2)))
            add(x, S.bp(creak, 120, 1800) * np.sin(np.pi * t2 / d) ** 2 * 0.12, t0, rng.uniform(-0.5, 0.5))
            if rng.random() < 0.4:  # polea / cabo
                add(x, bell(rng.uniform(600, 900), 0.15, 0.04, 30), t0 + d * 0.5, rng.uniform(-0.6, 0.6))
            t0 += rng.uniform(0.7, 1.6)
    x = S.reverb(x, 1.4, 0.25, seed=537)
    S.save('barcos-madera.m4a', x, -4.0)


def make_wind():
    print('Viento y velas…')
    tt = S.t_axis()
    w = window(tt, WIND, 0.6)
    gust = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 3.7) * np.sin(2 * np.pi * tt / 9.1)
    x = S.bp(rng.standard_normal((N, 2)), 400, 3500) * ((0.08 + 0.12 * gust) * w)[:, None]
    for a, b in WOOD:  # velas que gualdrapean
        t0 = a + 0.6
        while t0 < b - 0.4:
            n = int(0.35 * SR)
            t2 = np.arange(n) / SR
            add(x, noise(n, 200, 2500) * np.exp(-t2 * 9) * 0.25, t0, rng.uniform(-0.4, 0.4))
            t0 += rng.uniform(1.4, 2.8)
    x = S.reverb(x, 1.6, 0.25, seed=539)
    S.save('viento-velas.m4a', x, -5.0)


def make_engines():
    print('Motores (vapor y modernos)…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for a, b in STEAM:  # chuf-chuf de la máquina y golpeteo de las paletas
        t0 = a
        k = 0
        while t0 < b:
            n = int(0.18 * SR)
            t2 = np.arange(n) / SR
            add(x, noise(n, 300, 3000) * np.exp(-t2 * 18) * (0.3 if k % 2 == 0 else 0.18), t0, 0.1)
            add(x, S.thump(70, 0.15, 0.12), t0 + 0.09)
            t0 += 0.42
            k += 1
        n = int((b - a) * SR)
        add(x, np.sin(2 * np.pi * 55 * np.arange(n) / SR) * 0.03 * np.sin(np.pi * np.arange(n) / n), a)
    m = window(tt, MOTOR, 0.6)
    hum = (np.sin(2 * np.pi * 48 * tt) * 0.05 + np.sin(2 * np.pi * 96 * tt) * 0.025 + S.lp(rng.standard_normal(N), 200) * 0.25)
    x += (hum * m)[:, None]
    x = S.reverb(x, 1.6, 0.25, seed=541)
    S.save('motores-vapor.m4a', x, -4.0)


def make_lab():
    print('Laboratorio…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    w = window(tt, LABS, 0.4)
    x += ((np.sin(2 * np.pi * 120 * tt) * 0.02 + S.bp(rng.standard_normal(N), 2000, 6000) * 0.01) * w)[:, None]
    t0 = LAB + 0.3
    while t0 < 134.8:  # pitidos del instrumento y datos
        add(x, bell(rng.choice([1320, 1760, 2093]), 0.12, 0.05, 25), t0, rng.uniform(-0.4, 0.4))
        t0 += rng.uniform(0.35, 0.9)
    for c in [126.4, 127.7, 129.0, 131.6, 133.0]:  # pipeta (clic)
        n = int(0.03 * SR)
        add(x, noise(n, 2000, 8000) * np.exp(-np.arange(n) / SR * 200) * 0.3, c, -0.2)
    for c in GRAPHICS:  # aparición de gráficos científicos
        for j, f in enumerate([1568, 2093, 2637]):
            add(x, bell(f, 0.3, 0.03, 14), c + j * 0.06, 0.2)
    x = S.reverb(x, 1.2, 0.2, seed=543)
    S.save('laboratorio.m4a', x, -4.0)


def make_impacts():
    print('Impactos…')
    x = np.zeros((N, 2))
    for c, g in [(0.0, 0.5), (HOOK_SHIP, 0.35), (NUM392, 0.45), (RANGE, 0.3), (END_TEXT, 0.4)]:
        add(x, S.thump(38, 2.4, g), c)
        n = int(2.0 * SR)
        add(x, S.lp(rng.standard_normal(n), 180) * np.exp(-np.arange(n) / SR * 2.2) * g * 0.6, c)
    x = S.reverb(x, 3.6, 0.4, seed=545)
    S.save('impactos.m4a', x, -3.0)


def make_time():
    print('Transiciones temporales…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 140, 1000, 0.12), c - 0.55)
    for c in [HOOK_SHIP, SHIPS[1], SHIPS[2], *MONTAGE, BACK_DOWN, ARCTIC_DIVE]:  # paso del tiempo: barrido + destello agudo invertido
        add(x, S.whoosh(1.4, 1600, 300, 0.12), c - 0.6)
        add(x, bell(2637, 1.6, 0.03, 2.5)[::-1].copy(), c - 1.5, 0.3)
    for a, b in [AGE_MORPH, GROWTH]:  # crecimiento: brillo ascendente
        n = int((b - a) * SR)
        tt = np.arange(n) / SR
        f = 400 + 900 * tt / (b - a)
        add(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.03 * np.sin(np.pi * tt / (b - a)), a)
    x = S.reverb(x, 3.0, 0.4, seed=547)
    S.save('transiciones-temporales.m4a', x, -3.0)


def make_end_music():
    print('Música del cierre…')
    L = np.zeros(N)
    R = np.zeros(N)
    for m in [26, 38, 45, 50]:
        v = S.pad_voice(S.midi(m), int(3.4 * SR), 800) * S.env_adsr(int(3.4 * SR), 0.03, 2.8) * 0.35
        S.place(L, v, 0.0)
        S.place(R, v, 0.0)
    for a, b, notes in [(164.5, 172.5, [26, 38, 45, 50, 53, 57]), (172.0, 180.0, [34, 46, 53, 58, 62, 65])]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, 1400) * e * (0.9 if j == 0 else 0.3), (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for c, m in [(166.0, 69), (167.6, 72), (169.2, 74), (171.0, 77), (173.0, 76), (174.6, 74), (176.0, 70), (176.6, 74), (177.2, 77), (177.8, 82)]:
        st = S.pan(bell(S.midi(m), 2.6, 0.07, 1.6), 0.3 * np.sin(c))
        S.place(L, st[:, 0], c)
        S.place(R, st[:, 1], c)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.48, seed=549)
    tt = S.t_axis()
    fade = np.interp(tt, [0, FADE - 0.2, 180], [1, 1, 0])
    S.save('musica-cierre.m4a', x * fade[:, None], -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_water()
    make_waves()
    make_wood()
    make_wind()
    make_engines()
    make_lab()
    make_impacts()
    make_time()
    make_end_music()
