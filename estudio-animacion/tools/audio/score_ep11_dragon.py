#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EP05 · El dragón azul" (síntesis propia, sin muestras de terceros:
apta para publicar y monetizar en Shorts/TikTok/Reels). Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep05-dragon-azul/:
  musica.m4a          gancho, misterio, descubrimiento, tensión (carabela), asombro, cierre emotivo
  ambiente.m4a        oleaje de superficie, viento, rumor submarino, burbujas
  movimiento.m4a      chapoteo de olas, mordiscos de alimentación, salpicaduras
  descubrimiento.m4a  destellos de revelación (campanas cristalinas)
  transiciones.m4a    impacto inicial, barridos entre escenas, golpe del logotipo
Tiempos coherentes con src/episodes/ep11-dragon-azul/config/episode.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep05-dragon-azul')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261121)
S.rng = rng

HOOK_HIT = 0.05
MANOWAR_STING = 4.9
HOOK_TRANSITION = 8.2
SCENES = [15.0 * i for i in range(1, 12)]
FEED = [(79.5, 85.5)]
WAVES = [3.0, 11.0, 33.0, 39.0, 52.0, 66.0, 152.0, 156.0, 160.0]
REVEALS = [2.3, 15.4, 34.2, 48.2, 78.6, 120.6, 135.6, 154.6, 170.6]
LOGO = 177.1


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 8.5, [33, 40, 45, 48, 52], 700),       # Am(add9) grave — gancho misterioso
        (8.0, 30.5, [38, 45, 50, 53, 57], 1100),     # Dm(add9) — un dragón real
        (30.0, 45.5, [41, 48, 53, 57, 64], 1400),    # F(add9) — el mundo al revés
        (45.0, 60.5, [43, 50, 55, 59, 62], 1500),    # G — camuflaje (descubrimiento)
        (60.0, 75.5, [40, 47, 52, 55], 700),         # Em — presa peligrosa
        (75.0, 90.5, [40, 47, 52, 55, 58], 900),     # Em(b9) — robar las armas
        (90.0, 105.5, [45, 52, 57, 60, 64], 900),    # Am — advertencia
        (105.0, 135.5, [36, 43, 48, 52, 55, 62], 1500),  # C(add9) — viajero del océano, anatomía
        (135.0, 150.5, [41, 48, 53, 57, 60], 1300),  # F — vida en miniatura
        (150.0, 165.5, [38, 45, 50, 53, 57, 62], 1700),  # Dm(add9) — belleza y peligro (épico)
        (165.0, 180.0, [41, 48, 53, 57, 60, 65], 1500),  # F(add9) — cierre emotivo
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.4 if a < 1 else 2.2, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.36)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # pulso de tensión con la carabela (60–90 s)
    tb = 60.5
    while tb < 89.0:
        hit = S.thump(52, 0.6, 0.16 + 0.1 * (tb - 60.5) / 28)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
        tb += 0.75 if tb < 75 else 0.6
    # arpegio cristalino de descubrimiento y de cierre
    for a, b, base in [(30.5, 59.5, 72), (105.5, 134.5, 72), (150.5, 164.5, 74), (165.5, 177.0, 77)]:
        tb = a
        k = 0
        steps = [0, 7, 12, 16, 19, 16, 12, 7]
        while tb < b:
            n = int(1.6 * SR)
            tt = np.arange(n) / SR
            f = S.midi(base + steps[k % 8])
            tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 3.0) * 0.035
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += 0.375
            k += 1
    # timbales épicos (belleza y peligro)
    for tb in np.arange(150.0, 165.0, 1.5):
        hit = S.thump(46, 1.2, 0.22)
        S.place(L, hit, tb)
        S.place(R, hit, tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.4, 8.0, 9.0, 88, 90, 104, 106, 150, 165, 176, 179.9], [0.6, 1.0, 1.0, 0.75, 1.0, 0.7, 0.7, 0.9, 1.0, 1.05, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * tt / 6.5)
    surf = S.bp(rng.standard_normal((N, 2)), 250, 2600) * swell[:, None] * 0.55
    wind = S.bp(rng.standard_normal((N, 2)), 400, 1800) * (0.25 + 0.15 * np.sin(2 * np.pi * tt / 11.0))[:, None]
    under = S.lp(rng.standard_normal((N, 2)), 300) * 1.4
    # el gancho empieza casi en silencio oscuro: sube el ambiente con la luz
    k = np.clip(tt / 9.0, 0.25, 1.0)
    x = (surf * 0.5 + wind * 0.3 + under * 0.4) * k[:, None]
    t0 = 0.8
    while t0 < 179.5:
        n = int(0.12 * SR)
        t2 = np.arange(n) / SR
        f0 = rng.uniform(600, 1700)
        b = np.sin(2 * np.pi * f0 * (1 + 2.5 * t2) * t2) * np.exp(-t2 * 35) * 0.04
        st = S.pan(b, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.6, 2.2)
    x = S.reverb(x, 2.6, 0.32, seed=111)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    for w in WAVES:  # paso de una ola: chapoteo que crece y rompe
        n = int(2.2 * SR)
        t2 = np.arange(n) / SR
        env = np.sin(np.pi * np.clip(t2 / 2.2, 0, 1)) ** 2
        add(S.bp(rng.standard_normal(n), 300, 3500) * env * 0.12, w - 1.0, rng.uniform(-0.4, 0.4))
    for a, b in FEED:  # mordiscos suaves de alimentación
        t0 = a
        while t0 < b:
            n = int(0.08 * SR)
            t2 = np.arange(n) / SR
            add(S.bp(rng.standard_normal(n), 1200, 5000) * np.exp(-t2 * 50) * 0.08, t0, 0.1)
            t0 += rng.uniform(0.35, 0.7)
    x = S.reverb(x, 1.4, 0.25, seed=113)
    S.save('movimiento.m4a', x, -4.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    for c in REVEALS:
        for j, m in enumerate([84, 88, 91, 96]):
            n = int(1.8 * SR)
            tt = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.6) * 0.045
            S.place(x[:, 0], bell, c + j * 0.07)
            S.place(x[:, 1], bell, c + j * 0.07 + 0.012)
    # aguijón disonante cuando aparece la carabela
    n = int(2.5 * SR)
    tt = np.arange(n) / SR
    sting = (np.sin(2 * np.pi * S.midi(70) * tt) + np.sin(2 * np.pi * S.midi(71) * tt)) * np.exp(-tt * 1.6) * 0.05
    S.place(x[:, 0], sting, MANOWAR_STING)
    S.place(x[:, 1], sting, MANOWAR_STING + 0.01)
    x = S.reverb(x, 3.2, 0.45, seed=115)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    # impacto del primer fotograma (sub grave + brillo)
    hit = S.thump(40, 2.4, 0.7)
    n = int(2.0 * SR)
    st = np.arange(n) / SR
    sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 2.2) * 0.07
    for t0 in (HOOK_HIT,):
        S.place(x[:, 0], hit + 0, t0)
        S.place(x[:, 1], hit, t0)
        S.place(x[:, 0], sh, t0)
        S.place(x[:, 1], sh, t0 + 0.02)
    # transición cinematográfica del gancho al documental
    w = S.whoosh(1.6, 120, 2400, 0.3)
    S.place(x[:, 0], w, HOOK_TRANSITION - 0.9)
    S.place(x[:, 1], w, HOOK_TRANSITION - 0.88)
    h2 = S.thump(46, 1.6, 0.45)
    S.place(x[:, 0], h2, HOOK_TRANSITION + 0.6)
    S.place(x[:, 1], h2, HOOK_TRANSITION + 0.6)
    for c in SCENES:
        w = S.whoosh(1.0, 180, 1300, 0.2)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.48)
    h3 = S.thump(44, 2.4, 0.55)
    S.place(x[:, 0], h3, LOGO)
    S.place(x[:, 1], h3, LOGO)
    S.place(x[:, 0], sh, LOGO)
    S.place(x[:, 1], sh, LOGO + 0.02)
    x = S.reverb(x, 3.0, 0.4, seed=117)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
