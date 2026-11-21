#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EP05 v2 · El dragón azul: la criatura que roba el veneno de sus presas" (síntesis propia, sin muestras de terceros:
apta para publicar y monetizar en Shorts/TikTok/Reels). Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep05-dragon-azul-v2/:
  musica.m4a          gancho, misterio, descubrimiento, tensión (carabela), asombro, cierre emotivo
  ambiente.m4a        oleaje de superficie, viento, rumor submarino, burbujas
  movimiento.m4a      chapoteo de olas, mordiscos de alimentación, salpicaduras
  descubrimiento.m4a  destellos de revelación (campanas cristalinas)
  transiciones.m4a    impacto inicial, barridos entre escenas, golpe del logotipo
Tiempos coherentes con src/episodes/ep12-dragon-azul-v2/config/episode.ts (estudio 2.0).
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep05-dragon-azul-v2')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261122)
S.rng = rng

HOOK_HIT = 0.03
MANOWAR_STING = 3.3          # segunda imagen del gancho (ceratas cargadas)
HOOK_TRANSITION = 5.2        # del gancho al misterio
SCENES = [20.0, 45.0, 70.0, 95.0, 120.0, 145.0, 165.0]   # segmentos de la estructura 2.0
FEED = [(0.0, 3.0), (49.5, 55.5)]
WAVES = [8.0, 24.0, 31.0, 40.0, 126.0, 132.0, 134.5, 137.0, 140.0]
REVEALS = [3.3, 20.4, 28.7, 70.6, 83.0, 107.8, 120.6, 145.6, 165.6]
LOGO = 177.6


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 5.5, [33, 40, 45, 48, 52], 900),        # Am(add9) — gancho
        (5.0, 20.5, [38, 45, 50, 53, 57], 1000),      # Dm(add9) — el misterio
        (20.0, 45.5, [41, 48, 53, 57, 64], 1400),     # F(add9) — primera revelación
        (45.0, 70.5, [40, 47, 52, 55], 700),          # Em — demostración (tensión)
        (70.0, 95.5, [43, 50, 55, 59, 62], 1400),     # G — segunda sorpresa
        (95.0, 120.5, [45, 52, 57, 60, 64], 1100),    # Am — explicación profunda
        (120.0, 145.5, [36, 43, 48, 52, 55, 62], 1500),  # C(add9) — flota azul / varamientos
        (145.0, 165.5, [38, 45, 50, 53, 57, 62], 1700),  # Dm(add9) — revelación final
        (165.0, 180.0, [41, 48, 53, 57, 60, 65], 1500),  # F(add9) — cierre
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
    tb = 45.5
    while tb < 69.0:
        hit = S.thump(52, 0.6, 0.15 + 0.1 * (tb - 45.5) / 23)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
        tb += 0.75 if tb < 58 else 0.6
    # arpegio cristalino de descubrimiento y de cierre
    for a, b, base in [(20.5, 44.5, 72), (70.5, 94.5, 74), (120.5, 144.5, 72), (165.5, 177.0, 77)]:
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
    for tb in np.arange(145.5, 165.0, 1.5):
        hit = S.thump(46, 1.2, 0.22)
        S.place(L, hit, tb)
        S.place(R, hit, tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 5.0, 6.0, 67.3, 70.2, 70.8, 145.2, 145.8, 165, 177, 179.9], [0.8, 1.0, 1.0, 0.75, 0.9, 0.35, 1.0, 0.4, 1.05, 1.0, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * tt / 6.5)
    surf = S.bp(rng.standard_normal((N, 2)), 250, 2600) * swell[:, None] * 0.55
    wind = S.bp(rng.standard_normal((N, 2)), 400, 1800) * (0.25 + 0.15 * np.sin(2 * np.pi * tt / 11.0))[:, None]
    under = S.lp(rng.standard_normal((N, 2)), 300) * 1.4
    # el gancho empieza casi en silencio oscuro: sube el ambiente con la luz
    k = np.clip(0.6 + tt / 10.0, 0.6, 1.0)
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
    for c in [101.0, 103.2, 105.0]:  # disparo del filamento del nematocisto
        n = int(0.25 * SR)
        tt2 = np.arange(n) / SR
        f = 900 + 5000 * (tt2 / 0.25)
        zip_ = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt2 * 10) * 0.06
        S.place(x[:, 0], zip_, c)
        S.place(x[:, 1], zip_, c + 0.01)
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
    S.place(x[:, 0], w, HOOK_TRANSITION - 0.9)  # barrido de burbujas
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
