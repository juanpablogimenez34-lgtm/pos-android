#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL CACHALOTE: EL GIGANTE QUE CAZA EN LA OSCURIDAD" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros ni grabaciones reales. Los clics del cachalote son RECREACIONES SONORAS ORIGINALES (pulso
de banda ancha con estructura multipulso, ≈ 4 ms entre pulsos), no grabaciones. Reutiliza score.py sin
modificarlo. Pistas en public/audio/ep23-cachalote/ (con la voz, 11 = las 10 pedidas + transiciones):
  narracion.m4a              narración (Piper es_MX, tools/audio/narration.py)
  musica-ambiental.m4a       música ambiental (pads amplios; más luminosa en superficie, grave en profundidad)
  ambiente-oceanico.m4a      superficie (olas, viento) y profundidad (rumor, presión, partículas)
  respiracion.m4a            soplos en superficie (exhalación potente + inhalación) y agua al emerger
  clics-ecolocalizacion.m4a  clics de ecolocalización y zumbido de caza (recreación original)
  movimiento-agua.m4a        batidos de la cola, desplazamiento, la cola que emerge y el agua que cae
  tension-descenso.m4a       tensión del descenso y del ascenso (graves que bajan/suben)
  encuentro-calamar.m4a      suspenso del encuentro con el calamar gigante (escenas 7–8)
  comunicacion-social.m4a    codas (patrón ilustrativo 1+1+3) y clics sociales del grupo (escenas 10–11)
  transiciones.m4a           barridos entre escenas y rótulos
  musica-cierre.m4a          tema de cierre (escena 12) y golpe del gancho
Tiempos coherentes con src/episodes/ep23-cachalote/data/timeline.ts y las escenas (listas de clics).
Uso:  python3 tools/audio/score_ep23_cachalote.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep23-cachalote')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261124)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
HOOK_CLICK, HOOK_TEXT = 0.15, 3.0
BLOWS = [45.6, 48.4, 131.0, 133.6, 171.6]
FLUKE_UP = [(50.5, 54.8), (173.8, 178.5)]
SURFACING = 130.0
CODAS = [151.4, 153.0, 154.6, 156.2, 157.6, 159.0, 160.6, 162.2]
CODA_PATTERN = [0, 0.24, 0.48, 0.6, 0.72]
END_TEXT, FADE = 176.2, 179.4
SURFACE = [(45.0, 55.0), (130.0, 180.0)]
CALLOUTS = [3.0, 24.0, 38.4, 45.8, 63.6, 69.8, 80.4, 92.0, 105.8, 131.2, 141.8, 154.8]


def every(a, b, dt):
    return [a + i * dt for i in range(int((b - a) / dt) + 1)]


CL1 = [HOOK_CLICK] + every(1.2, 4.6, 0.55) + every(6.0, 9.4, 0.7) + every(10.0, 14.8, 0.45)
CL5 = every(63.3, 68.5, 0.62) + every(69.4, 74.6, 0.75)
CL6 = []
_tc = 80.2
while _tc < 89.6:
    CL6.append(_tc)
    _u = min(1.0, max(0.0, (_tc - 80.2) / (89.6 - 80.2)))
    _tc += 0.7 + (0.05 - 0.7) * _u ** 1.6
# clics lejanos durante el descenso y el encuentro (búsqueda)
CL_EXTRA = every(56.0, 59.6, 0.8) + every(91.0, 99.0, 0.9) + every(106.0, 112.0, 1.1)


def window(tt, ranges, ramp=0.8):
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


def click(gain=1.0, bright=1.0):
    """Recreación de un clic de cachalote: pulso principal + 3 pulsos atenuados separados ≈ 4 ms."""
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    out = np.zeros(n)
    for k, g in enumerate([1.0, 0.45, 0.22, 0.1]):
        st = int((k * 0.0042) * SR)
        m = int(0.0018 * SR)
        burst = S.hp(rng.standard_normal(m), 900) * np.exp(-np.arange(m) / SR * 2200) * g
        out[st:st + m] += burst
    tone = np.sin(2 * np.pi * (3200 * bright) * tt) * np.exp(-tt * 900) * 0.25
    return (S.lp(out, 9000 * bright) + tone) * gain


def make_music():
    print('Música ambiental…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [26, 38, 45, 50, 53], 600), (15.0, 30.5, [31, 43, 50, 55, 59], 1000), (30.0, 45.5, [29, 41, 48, 53, 57], 900),
        (45.0, 55.5, [33, 45, 52, 57, 61, 64], 1700), (55.0, 60.5, [26, 38, 45, 50], 600), (60.0, 75.5, [24, 36, 43, 48, 51], 600),
        (75.0, 90.5, [26, 38, 44, 50, 53], 550), (90.0, 105.5, [22, 34, 41, 46, 49], 450), (105.0, 120.5, [24, 36, 42, 48, 51], 450),
        (120.0, 130.5, [26, 38, 45, 50, 57], 900), (130.0, 150.5, [33, 45, 52, 57, 61, 64], 1700), (150.0, 165.5, [31, 43, 50, 55, 59, 62], 1600),
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 3.0) * SR)
        e = S.env_adsr(n, 2.2, 3.4)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.9 if j == 0 else 0.26)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for a, b, base, dt in [(15.5, 29.5, 67, 1.5), (45.5, 54.5, 69, 1.0), (130.5, 149.5, 69, 1.2), (150.5, 164.0, 67, 1.4)]:
        tb, k = a, 0
        steps = [0, 4, 7, 11, 12, 7]
        while tb < b:
            st = S.pan(bell(S.midi(base + steps[k % 6]), 2.2, 0.03, 1.8), 0.6 * np.sin(k * 1.3))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 84, 89, 105, 120, 163, 166.5, 180], [0.8, 0.9, 0.9, 0.65, 0.7, 0.85, 0.9, 0.0, 0.0])
    S.save('musica-ambiental.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente oceánico…')
    tt = S.t_axis()
    surf = window(tt, SURFACE, 0.6)
    deep = 1 - surf
    rumble = S.lp(rng.standard_normal((N, 2)), 110) * 1.2
    x = rumble * deep[:, None]
    x += S.bp(rng.standard_normal((N, 2)), 300, 1100) * (0.04 * deep)[:, None]
    # superficie: olas (ruido modulado) y viento
    waves = S.bp(rng.standard_normal((N, 2)), 200, 2500) * (0.35 + 0.65 * np.clip(np.sin(2 * np.pi * tt / 5.5) * 0.5 + 0.5, 0, 1) ** 2)[:, None]
    wind = S.bp(rng.standard_normal((N, 2)), 800, 5000) * 0.05
    x += (waves * 0.28 + wind) * surf[:, None]
    t0 = 0.8
    while t0 < 179:
        if surf[int(t0 * SR)] < 0.5:
            add(x, bell(rng.uniform(1500, 3200), 0.4, 0.006, 9), t0, rng.uniform(-0.9, 0.9))
        else:
            n = int(0.25 * SR)
            add(x, noise(n, 1500, 7000) * np.exp(-np.arange(n) / SR * 14) * 0.08, t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.8, 2.4)
    x = S.reverb(x, 3.2, 0.4, seed=431)
    fade = np.interp(tt, [0, 0.4, FADE, 180], [0.4, 1, 1, 0])
    S.save('ambiente-oceanico.m4a', x * fade[:, None], -7.0)


def make_breathing():
    print('Respiración…')
    x = np.zeros((N, 2))
    for b in BLOWS:
        n = int(1.6 * SR)
        tt = np.arange(n) / SR
        env = np.clip(tt / 0.06, 0, 1) * np.exp(-tt * 2.2)
        blast = (S.bp(rng.standard_normal(n), 120, 3500) * 0.8 + S.lp(rng.standard_normal(n), 220) * 0.6) * env * 0.7
        add(x, blast, b, 0.2)
        m = int(1.0 * SR)
        t2 = np.arange(m) / SR
        inhale = S.bp(rng.standard_normal(m), 300, 2500) * np.sin(np.pi * t2 / 1.0) ** 2 * 0.22
        add(x, inhale, b + 1.7, 0.2)
        for k in range(10):  # gotas que caen tras el soplo
            add(x, S.bubble(rng.uniform(700, 1800), 0.03) * 0.05, b + 0.6 + k * 0.12, rng.uniform(-0.5, 0.6))
    # emersión: agua que se desplaza
    n = int(1.5 * SR)
    add(x, S.lp(rng.standard_normal(n), 900) * np.sin(np.pi * np.arange(n) / SR / 1.5) * 0.35, SURFACING - 0.2, 0.1)
    x = S.reverb(x, 1.6, 0.25, seed=433)
    S.save('respiracion.m4a', x, -3.0)


def make_clicks():
    print('Clics de ecolocalización (recreación original)…')
    x = np.zeros((N, 2))
    add(x, click(1.6, 1.1), HOOK_CLICK, 0.0)  # clic fuerte y controlado del gancho
    for c in CL1[1:] + CL5:
        add(x, click(0.75), c, rng.uniform(-0.15, 0.15))
    for i, c in enumerate(CL6):
        u = i / max(1, len(CL6) - 1)
        add(x, click(0.8 - 0.35 * u, 1.0 + 0.2 * u), c, 0.05)
    for c in CL_EXTRA:
        add(x, S.lp(click(0.35), 3000), c, rng.uniform(-0.6, 0.6))
    x = S.reverb(x, 2.4, 0.35, seed=435)
    S.save('clics-ecolocalizacion.m4a', x, -3.0)


def make_water():
    print('Movimiento del agua…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    deep = 1 - window(tt, SURFACE, 0.6)
    beat = (0.5 + 0.5 * np.sin(2 * np.pi * 0.26 * tt)) ** 3
    x += S.lp(rng.standard_normal((N, 2)), 260) * (beat * 0.2 * deep)[:, None]
    for a, b in FLUKE_UP:  # la cola emerge: agua que chorrea desde los lóbulos
        d = b - a
        n = int(d * SR)
        t2 = np.arange(n) / SR
        pour = S.bp(rng.standard_normal(n), 600, 6000) * np.clip(t2 / 0.6, 0, 1) * np.exp(-t2 * 0.5) * 0.3
        add(x, pour, a, 0.15)
        add(x, S.lp(rng.standard_normal(int(1.2 * SR)), 500) * np.exp(-np.arange(int(1.2 * SR)) / SR * 3) * 0.4, b - 0.6, 0.1)
    # aceleración de caza
    n = int(4.0 * SR)
    add(x, S.lp(rng.standard_normal(n), 400) * np.sin(np.pi * np.arange(n) / SR / 4.0) * 0.3, 85.5, -0.2)
    x = S.reverb(x, 1.8, 0.3, seed=437)
    S.save('movimiento-agua.m4a', x, -4.0)


def make_descent():
    print('Tensión del descenso…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for a, b, f0, f1 in [(54.8, 60.0, 90, 42), (120.0, 129.8, 40, 85)]:
        w = window(tt, [(a, b)], 0.8)
        frac = np.clip((tt - a) / (b - a), 0, 1)
        f = f0 + (f1 - f0) * frac
        ph = 2 * np.pi * np.cumsum(f) / SR
        x += ((np.sin(ph) * 0.07 + np.sin(ph * 1.5) * 0.025) * w)[:, None] + S.bp(rng.standard_normal((N, 2)), 100, 500) * (0.03 * w)[:, None]
    add(x, S.thump(44, 1.2, 0.25), 55.0)
    add(x, S.whoosh(1.6, 300, 1200, 0.15), 128.6)
    x = S.reverb(x, 3.0, 0.4, seed=439)
    S.save('tension-descenso.m4a', x, -3.0)


def make_encounter():
    print('Encuentro con el calamar…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    w = np.interp(tt, [89.5, 92, 104, 112, 118, 120.5], [0, 1, 1, 0.9, 0.3, 0])
    drone = np.sin(2 * np.pi * 36.7 * tt) * 0.06 + np.sin(2 * np.pi * 55 * tt + 0.3) * 0.03 + S.bp(rng.standard_normal(N), 120, 500) * 0.03
    x += (drone * w)[:, None]
    for c in [90.6, 100.2, 105.6, 113.0]:
        add(x, S.thump(38, 2.2, 0.3), c)
    t0 = 92.0
    while t0 < 117:  # movimientos de brazos y tentáculos (roces graves)
        d = rng.uniform(0.6, 1.2)
        n = int(d * SR)
        add(x, noise(n, 150, 900) * np.sin(np.pi * np.arange(n) / SR / d) ** 2 * 0.1, t0, rng.uniform(-0.5, 0.5))
        t0 += rng.uniform(1.0, 2.2)
    x = S.reverb(x, 3.6, 0.45, seed=441)
    S.save('encuentro-calamar.m4a', x, -3.0)


def make_social():
    print('Comunicación social (codas)…')
    x = np.zeros((N, 2))
    for i, c0 in enumerate(CODAS):
        p = -0.45 if i % 2 == 0 else 0.45
        for o in CODA_PATTERN:
            add(x, click(0.7, 0.85 if i % 2 else 1.0), c0 + o, p)
    t0 = 136.0  # clics sociales lejanos del grupo
    while t0 < 150:
        add(x, S.lp(click(0.25), 4000), t0, rng.uniform(-0.8, 0.8))
        t0 += rng.uniform(0.4, 1.4)
    t0 = 163.0
    while t0 < 168:
        add(x, S.lp(click(0.22), 4000), t0, rng.uniform(-0.8, 0.8))
        t0 += rng.uniform(0.5, 1.2)
    x = S.reverb(x, 2.6, 0.38, seed=443)
    S.save('comunicacion-social.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 140, 1000, 0.13), c - 0.55)
    for c in CALLOUTS:
        add(x, S.whoosh(0.6, 900, 2600, 0.06), c - 0.2)
    x = S.reverb(x, 2.4, 0.35, seed=445)
    S.save('transiciones.m4a', x, -3.0)


def make_end_music():
    print('Música del cierre…')
    L = np.zeros(N)
    R = np.zeros(N)
    for m in [26, 38, 45, 50]:  # golpe del gancho
        v = S.pad_voice(S.midi(m), int(4.0 * SR), 900) * S.env_adsr(int(4.0 * SR), 0.05, 3.0) * 0.35
        S.place(L, v, HOOK_TEXT)
        S.place(R, v, HOOK_TEXT)
    for a, b, notes in [(164.5, 172.5, [33, 45, 52, 57, 61, 64]), (172.0, 180.0, [29, 41, 48, 53, 57, 60])]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            st = S.pan(S.pad_voice(S.midi(m), n, 1500) * e * (0.9 if j == 0 else 0.3), (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for c, m in [(166.0, 69), (167.5, 73), (169.0, 76), (171.0, 81), (173.0, 80), (174.5, 76), (176.2, 69), (176.8, 73), (177.4, 76), (178.0, 81)]:
        st = S.pan(bell(S.midi(m), 2.6, 0.07, 1.6), 0.3 * np.sin(c))
        S.place(L, st[:, 0], c)
        S.place(R, st[:, 1], c)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.48, seed=447)
    add(x, S.thump(40, 2.2, 0.3), END_TEXT)
    tt = S.t_axis()
    fade = np.interp(tt, [0, FADE - 0.2, 180], [1, 1, 0])
    S.save('musica-cierre.m4a', x * fade[:, None], -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_breathing()
    make_clicks()
    make_water()
    make_descent()
    make_encounter()
    make_social()
    make_transitions()
    make_end_music()
