#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL PEZ QUE DISPARA AGUA COMO UN FRANCOTIRADOR" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros ni sonidos de armas. Reutiliza score.py sin modificarlo. Pistas en public/audio/ep21-pez-arquero/
(con la voz, 10):
  musica.m4a               música de exploración (manglar tropical, marimba suave y cuerdas)
  ambiente-manglar.m4a     aire húmedo, hojas, aves e insectos lejanos; bajo el agua, rumor verde
  agua.m4a                 movimiento del agua: natación, aceleraciones, carrera con el rival
  disparos.m4a             expulsión del chorro: chasquido húmedo y siseo del agua (sin tono de arma)
  impactos.m4a             impacto en la hoja, salpicaduras, insecto que cae al agua, lluvia del fallo
  hojas.m4a                hojas que reaccionan al golpe y al viento
  insectos.m4a             zumbido de vuelo y aleteos
  suspenso.m4a             tensión antes de cada disparo (respiración contenida)
  transiciones-cierre.m4a  barridos entre escenas, señales de diagramas y cierre musical
Tiempos coherentes con src/episodes/ep21-pez-arquero/data/timeline.ts (EV, tiempo real).
Uso:  python3 tools/audio/score_ep21_pez_arquero.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep21-pez-arquero')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261126)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
# disparos: (salida, llegada/impacto, acierta, factor de cámara lenta)
SHOTS = [(1.2, 1.54, True, 1.0), (71.5, 71.84, True, 1.0), (86.0, 91.0, True, 0.07), (126.0, 126.34, False, 1.0), (145.6, 145.94, True, 1.0), (170.6, 172.13, True, 0.19)]
# insecto que cae al agua y capturas (instantes reales calculados con el motor de caza)
LANDS = [3.65, 72.55, 103.47, 146.75, 173.1]
CAPTURES = [5.18, 73.35, 116.19, 147.75, 173.9]
CHASE = [(3.5, 5.2), (72.4, 73.4), (105.0, 116.3), (146.6, 147.8), (173.0, 174.0)]
SWIM = [(7.0, 15.0), (15.0, 30.0), (150.0, 165.0), (175.0, 180.0)]
LEAF_HITS = [1.54, 71.84, 91.0, 126.4, 145.94, 172.13]
FLY = [(160.0, 165.0), (150.0, 160.0)]
DIAGRAMS = [40.0, 50.0, 64.8]
HOOK_TEXT = 2.2
END_TEXT = 176.2
FADE = 179.4


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


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [38, 45, 50, 54, 57], 1300), (15.0, 30.5, [43, 50, 55, 59, 62], 1500), (30.0, 45.5, [40, 47, 52, 55, 59], 1200),
        (45.0, 60.5, [36, 43, 48, 52, 55, 59], 1400), (60.0, 75.5, [38, 45, 50, 54, 57], 1300), (75.0, 90.5, [33, 40, 45, 48, 52], 900),
        (90.0, 105.5, [35, 42, 47, 50, 54], 1000), (105.0, 120.5, [38, 45, 50, 54, 57], 1500), (120.0, 135.5, [40, 47, 52, 55, 58], 1000),
        (135.0, 150.5, [43, 50, 55, 59, 62], 1400), (150.0, 165.5, [36, 43, 48, 52, 55, 62], 1500), (165.0, 177.0, [38, 45, 50, 54, 57, 62], 1600),
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.8, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.28)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for a, b, base, dt in [(15.5, 29.5, 69, 0.45), (30.5, 44.5, 71, 0.5), (105.5, 116.0, 74, 0.3), (135.5, 149.5, 69, 0.45), (150.5, 164.5, 71, 0.5)]:
        tb, k = a, 0
        steps = [0, 4, 7, 9, 12, 9, 7, 4]
        while tb < b:
            tone = bell(S.midi(base + steps[k % 8]), 0.9, 0.035, 6)
            st = S.pan(tone, 0.5 * np.sin(k * 0.9))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 4.2, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 75, 86, 91, 105, 165, 176, 177.5, 180], [0.85, 0.95, 0.95, 0.6, 0.6, 1.0, 1.0, 0.8, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente del manglar…')
    tt = S.t_axis()
    x = S.lp(rng.standard_normal((N, 2)), 300) * 0.9 + S.bp(rng.standard_normal((N, 2)), 1500, 6000) * 0.06 * (0.6 + 0.4 * np.sin(2 * np.pi * tt / 5.0))[:, None]
    t0 = 0.6
    while t0 < 179:
        r = rng.random()
        if r < 0.35:  # ave tropical lejana
            n = int(0.35 * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(1800, 3200)
            add(x, np.sin(2 * np.pi * (f0 + 600 * np.sin(2 * np.pi * 7 * t2)) * t2) * np.sin(np.pi * t2 / 0.35) ** 2 * 0.03, t0, rng.uniform(-0.9, 0.9))
        elif r < 0.6:  # chicharra
            n = int(0.8 * SR)
            t2 = np.arange(n) / SR
            add(x, np.sin(2 * np.pi * 4500 * t2) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * t2))) * np.sin(np.pi * t2 / 0.8) * 0.008, t0, rng.uniform(-0.9, 0.9))
        else:  # gota o burbuja
            add(x, S.bubble(rng.uniform(400, 1200), 0.06) * 0.06, t0, rng.uniform(-0.7, 0.7))
        t0 += rng.uniform(0.5, 1.8)
    x = S.reverb(x, 2.8, 0.35, seed=231)
    fade = np.interp(tt, [0, 0.3, FADE, 180], [0.5, 1, 1, 0])
    S.save('ambiente-manglar.m4a', x * fade[:, None], -7.0)


def make_water():
    print('Agua…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    sw = window(tt, SWIM, 0.8)
    x += S.lp(rng.standard_normal((N, 2)), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.2 * tt))[:, None] ** 2 * 0.1 * sw[:, None]
    for a, b in CHASE:  # aceleración hacia la presa
        d = b - a
        n = int(d * SR)
        t2 = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 200, 1800) * np.sin(np.pi * t2 / d) * 0.3, a, 0.2)
    x = S.reverb(x, 1.6, 0.25, seed=233)
    S.save('agua.m4a', x, -3.0)


def make_shots():
    print('Disparos de agua…')
    x = np.zeros((N, 2))
    for t0, t1, hit, slow in SHOTS:
        n = int(0.06 * SR / max(slow, 0.25))
        t2 = np.arange(n) / SR
        pop = S.lp(rng.standard_normal(n), 2500) * np.exp(-t2 * 60 * slow) * 0.5
        add(x, pop, t0)
        d = max(0.2, t1 - t0)
        m = int(d * SR)
        t3 = np.arange(m) / SR
        hiss = S.bp(rng.standard_normal(m), 2500 if slow > 0.5 else 900, 9000 if slow > 0.5 else 4000) * np.exp(-t3 * 3 / d) * 0.25
        add(x, hiss, t0 + 0.01, 0.2)
    x = S.reverb(x, 1.2, 0.2, seed=235)
    S.save('disparos.m4a', x, -3.0)


def make_impacts():
    print('Impactos…')
    x = np.zeros((N, 2))
    for t0, t1, hit, slow in SHOTS:
        if hit:
            n = int(0.35 * SR)
            t2 = np.arange(n) / SR
            add(x, S.bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t2 * 12) * 0.45 + np.sin(2 * np.pi * 380 * t2) * np.exp(-t2 * 30) * 0.2, t1, 0.3)
            for k in range(10):  # gotitas que caen
                add(x, S.bubble(rng.uniform(800, 2000), 0.03) * 0.08, t1 + 0.2 + k * 0.06, rng.uniform(-0.6, 0.6))
        else:  # fallo: el agua vuelve a caer como lluvia
            for k in range(18):
                q = int(0.04 * SR)
                add(x, S.bp(rng.standard_normal(q), 2000, 7000) * np.exp(-np.arange(q) / SR * 80) * 0.12, t1 + 0.4 + k * 0.035, rng.uniform(-0.5, 0.5))
    for t in LANDS:  # el insecto cae al agua
        n = int(0.3 * SR)
        t2 = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 600, 4000) * np.exp(-t2 * 14) * 0.35, t, 0.2)
    for t in CAPTURES:  # captura (succión breve)
        n = int(0.25 * SR)
        t2 = np.arange(n) / SR
        add(x, S.lp(rng.standard_normal(n), 900) * np.sin(np.pi * t2 / 0.25) * 0.3 + np.sin(2 * np.pi * 140 * t2) * np.exp(-t2 * 16) * 0.25, t - 0.1)
    x = S.reverb(x, 1.4, 0.25, seed=237)
    S.save('impactos.m4a', x, -3.0)


def make_leaves():
    print('Hojas…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    x += S.bp(rng.standard_normal((N, 2)), 2000, 7000) * (0.03 + 0.03 * np.sin(2 * np.pi * tt / 6.0) ** 2)[:, None]
    for t in LEAF_HITS:
        n = int(0.8 * SR)
        t2 = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 1200, 6000) * np.exp(-t2 * 4) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t2 / (2 * np.pi))) * 0.3, t, 0.3)
    x = S.reverb(x, 1.2, 0.2, seed=239)
    S.save('hojas.m4a', x, -6.0)


def make_insects():
    print('Insectos…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    fly = window(tt, FLY, 0.6)
    buzz = (np.sin(2 * np.pi * 210 * tt + 3 * np.sin(2 * np.pi * 3 * tt)) * 0.5 + np.sin(2 * np.pi * 420 * tt) * 0.2)
    x += (S.lp(buzz, 1500) * 0.06 * fly)[:, None] * np.array([1.0, 0.8])
    for t in LEAF_HITS:  # aleteo de sobresalto
        n = int(0.4 * SR)
        t2 = np.arange(n) / SR
        add(x, np.sin(2 * np.pi * 180 * t2) * np.sign(np.sin(2 * np.pi * 60 * t2)) * np.exp(-t2 * 6) * 0.05, t + 0.05, 0.3)
    x = S.reverb(x, 1.0, 0.2, seed=241)
    S.save('insectos.m4a', x, -6.0)


def make_suspense():
    print('Suspenso…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for t0, t1, hit, slow in SHOTS:
        a = t0 - 2.2
        w = np.clip((tt - a) / 1.0, 0, 1) * (tt < t0)
        x += (np.sin(2 * np.pi * 55 * tt) * 0.04 + S.bp(rng.standard_normal(N), 200, 700) * 0.02)[:, None] * w[:, None]
        add(x, S.thump(50, 0.4, 0.12), t0 - 0.5)
    for c, base in [(HOOK_TEXT, 76), (91.0, 79), (END_TEXT, 74)]:
        for j, m in enumerate([0, 7, 12]):
            add(x, bell(S.midi(base + m), 2.0, 0.045, 2.4), c + j * 0.08, -0.3 + j * 0.3)
    x = S.reverb(x, 3.0, 0.4, seed=243)
    S.save('suspenso.m4a', x, -3.0)


def make_transitions():
    print('Transiciones y cierre…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 160, 1100, 0.14), c - 0.55)
    for c in DIAGRAMS:
        add(x, S.whoosh(0.7, 900, 3000, 0.08), c - 0.3)
    # cierre musical
    melody = [(176.2, 74), (176.8, 78), (177.4, 81), (178.0, 86)]
    for c, m in melody:
        add(x, bell(S.midi(m), 2.2, 0.08, 2.0), c)
    add(x, S.thump(44, 2.0, 0.35), END_TEXT)
    x = S.reverb(x, 3.2, 0.42, seed=245)
    S.save('transiciones-cierre.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_water()
    make_shots()
    make_impacts()
    make_leaves()
    make_insects()
    make_suspense()
    make_transitions()
