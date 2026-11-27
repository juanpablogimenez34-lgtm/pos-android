#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «Batallas de la naturaleza · Orca vs. tiburón blanco» (línea global de 140 s).
Síntesis propia, sin muestras de terceros. Vocalizaciones y clics de orca SINTÉTICOS e ilustrativos; el tiburón
no tiene "rugidos" (no emite sonidos vocales). Reutiliza score.py sin modificarlo. Pistas en public/audio/batalla/:
  musica.m4a              E1 misterio y descubrimiento · E2 acción y tensión · E3 suspenso creciente · E4 clímax y resolución
  ambiente-submarino.m4a  rumor del océano · oceano-olas.m4a superficie y olas (final)
  orcas.m4a               llamadas pulsadas y silbidos · ecolocalizacion.m4a trenes de clics y ecos (E3)
  movimiento-agua.m4a     pasadas, aceleraciones y giros · burbujas-turbulencia.m4a estelas, contacto y soplo
  tension.m4a             drones de suspenso · transiciones.m4a golpes de inicio de cada episodio y barridos
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/batalla')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 140.0
N = int(SR * D)
rng = np.random.default_rng(20261201)
S.rng = rng
tt = np.arange(N) / SR
EP = [0, 35, 70, 105]
CONTACT = 110.8  # tiempo real del contacto (cámara lenta 109,5–111,5)
PASSES = [(36.5, 0.6), (38.0, 0.8), (48.6, 1.0), (49.4, 0.9), (55.5, 0.5), (71.5, 0.7), (96.5, 0.6), (104.0, 0.8), (114.8, 1.0), (116.5, 0.8)]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [  # E1 misterio (modal, abierto) · E2 acción · E3 suspenso · E4 clímax → resolución mayor
        (0, 12.2, [38, 45, 50, 53, 57], 900, 0.6), (12, 22.2, [41, 48, 53, 57, 60], 1300, 0.62), (22, 35.2, [36, 43, 48, 51, 55], 1000, 0.66),
        (35, 47.2, [38, 45, 50, 53], 1500, 0.75), (47, 57.2, [36, 43, 48, 51, 55], 1700, 0.8), (57, 70.2, [34, 41, 46, 50, 53], 1300, 0.72),
        (70, 82.2, [33, 40, 45, 48], 800, 0.6), (82, 92.2, [31, 38, 43, 46, 50], 700, 0.58), (92, 105.2, [33, 40, 45, 48, 51], 1100, 0.7),
        (105, 112.2, [33, 40, 45, 48, 52], 1600, 0.85), (112, 124.2, [36, 43, 48, 52, 55], 1800, 0.8), (124, 140, [38, 45, 50, 54, 57, 62], 2400, 0.9),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.6, 0.6) * g, a)
    # pulso rítmico: crece de E1 a E3 y estalla en el contacto
    for a, b, rate in [(22, 35, 1.5), (35, 70, 2.6), (70, 82, 1.2), (92, 109.4, 3.2), (111.6, 118, 2.0)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(46, 0.45, 0.55 + 0.25 * ((t0 - a) / (b - a))), t0)
            t0 += 1 / rate
    # celesta/arpa de "descubrimiento" (E1) y resolución (E4)
    for a, b, sc in [(3, 22, [62, 65, 69, 72, 74]), (124, 139, [66, 69, 71, 74, 78, 81])]:
        t0, k = a, 0
        while t0 < b:
            n = int(1.6 * SR)
            ts = np.arange(n) / SR
            f = S.midi(sc[(k * 2) % len(sc)])
            add(x, np.sin(2 * np.pi * f * ts) * np.exp(-ts * 3), t0, 0.12, rng.uniform(-0.6, 0.6))
            t0 += 0.6
            k += 1
    # golpe orquestal en el contacto y acorde final
    for at, notes in [(CONTACT, (33, 45, 52, 57, 64)), (133.5, (38, 50, 57, 62, 66))]:
        n = int(3.5 * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, 2800) for m in notes) / 5 * np.exp(-np.arange(n) / SR * 0.9), at, 1.0)
    x = S.reverb(x, 3.4, 0.36, seed=71)
    S.save('musica.m4a', x * np.interp(tt, [0, 0.4, 138.5, 140], [0.4, 1, 1, 0])[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    r = S.lp(S.hp(w, 18), 260, 3)
    r /= np.abs(r).max()
    x = r + S.lp(S.hp(rng.standard_normal((N, 2)), 1500), 5000) * 0.04
    S.save('ambiente-submarino.m4a', S.reverb(x, 2.5, 0.3, seed=72), -7.0)


def make_ocean():
    print('Océano y olas…')
    e = S.lp(np.interp(tt, [0, 124, 128, 140], [0.25, 0.25, 1, 1]), 2)
    surf = S.lp(S.hp(rng.standard_normal((N, 2)), 200), 2400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * tt))[:, None] * 0.4
    S.save('oceano-olas.m4a', S.reverb(surf * e[:, None], 1.8, 0.25, seed=73), -7.0)


def make_orcas():
    print('Orcas (sintéticas)…')
    x = np.zeros((N, 2))
    for a, b in [(1.5, 4.5), (8.5, 11), (24, 29), (58, 63), (70.2, 72.5), (118, 123), (128, 133)]:
        t0 = a
        while t0 < b:
            dur = rng.uniform(0.5, 1.1)
            n = int(dur * SR)
            ts = np.arange(n) / SR
            if rng.random() < 0.6:
                f = rng.uniform(900, 1500) * (1 + 0.25 * np.sin(np.pi * ts / dur) ** 2)
                ph = 2 * np.pi * np.cumsum(f) / SR
                s = sum(np.sin(ph * h) / h for h in range(1, 6))
            else:
                f = rng.uniform(4500, 8000) * (1 + 0.4 * np.sin(2 * np.pi * ts / dur))
                s = np.sin(2 * np.pi * np.cumsum(f) / SR)
            add(x, S.bp(s * np.sin(np.pi * ts / dur), 400, 10000) * 0.3, t0, 1, rng.uniform(-0.7, 0.7))
            t0 += dur + rng.uniform(0.3, 0.9)
    S.save('orcas.m4a', S.reverb(x, 2.8, 0.42, seed=74), -6.0)


def make_echo():
    print('Ecolocalización…')
    x = np.zeros((N, 2))
    for i in range(18):
        c = 74.2 + i * 0.4
        n = int(0.008 * SR)
        ts = np.arange(n) / SR
        s = S.hp(rng.standard_normal(n), 2000) * np.exp(-ts * 700) + np.sin(2 * np.pi * 5000 * ts) * np.exp(-ts * 900) * 0.6
        add(x, s, c, 0.9, -0.2)
        add(x, S.lp(s, 3000) * 0.3, c + 0.75, 1, 0.4)
    S.save('ecolocalizacion.m4a', x, -5.0)


def make_movement():
    print('Movimiento del agua…')
    x = np.zeros((N, 2))
    for at, g in PASSES:
        add(x, S.whoosh(1.4, 100, 1200, 0.5 * g), at - 0.5, 1, rng.uniform(-0.5, 0.5))
    for a, b, f in [(0, 35, 0.5), (35, 70, 0.9), (70, 105, 0.6), (105, 124, 0.8), (124, 140, 0.5)]:
        t0 = a
        while t0 < b:
            add(x, S.whoosh(0.8, 80, 380, 0.22 + f * 0.1), t0, 1, rng.uniform(-0.3, 0.3))
            t0 += 1 / f
    S.save('movimiento-agua.m4a', S.reverb(x, 1.6, 0.25, seed=75), -6.0)


def make_bubbles():
    print('Burbujas y turbulencia…')
    x = np.zeros((N, 2))
    t0 = 0.3
    while t0 < 139:
        add(x, S.bubble(rng.uniform(350, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.1), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.6)
    for at, g in PASSES:  # estelas turbulentas
        n = int(1.4 * SR)
        add(x, S.lp(rng.standard_normal(n), 700) * np.sin(np.pi * np.arange(n) / n) * 0.5 * g, at - 0.3)
    # contacto: golpe sordo bajo el agua (sin efectos violentos) y nube de burbujas
    add(x, S.thump(38, 1.6, 1.2), CONTACT)
    n = int(2.5 * SR)
    add(x, S.lp(rng.standard_normal(n), 500) * np.exp(-np.arange(n) / SR * 1.5) * 0.9, CONTACT)
    for k in range(40):
        add(x, S.bubble(rng.uniform(300, 1400), rng.uniform(0.02, 0.07)) * 0.14, CONTACT + 0.05 + k * 0.06, 1, rng.uniform(-0.9, 0.9))
    # soplo de la orca en la superficie
    n = int(1.0 * SR)
    ts = np.arange(n) / SR
    add(x, S.bp(rng.standard_normal(n), 250, 4000) * np.exp(-ts * 3) * np.minimum(1, ts / 0.02), 131.0)
    S.save('burbujas-turbulencia.m4a', S.reverb(x, 1.6, 0.25, seed=76), -5.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    for a, b, f in [(0, 4, 40), (22, 35, 43), (44, 50, 46), (82, 92, 37), (96, 110, 41)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        dr = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 0.8, 0.8)
        add(x, S.lp(dr * (1 + 0.25 * np.sin(2 * np.pi * 3 * ts)), 800) * 0.42 * np.linspace(0.6, 1.2, n), a)
    S.save('tension.m4a', S.reverb(x, 2.6, 0.3, seed=77), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in EP:  # gancho de cada episodio: impacto + barrido ascendente
        add(x, S.thump(44, 1.2, 1.0), at + 0.05)
        add(x, S.whoosh(0.9, 200, 2400, 0.5), at)
        n = int(2.0 * SR)
        add(x, S.bp(rng.standard_normal(n), 1800, 8000) * np.exp(-np.arange(n) / SR * 2.2) * 0.25, at + 0.05)
    for at in [12.4, 52, 57, 82, 92]:
        add(x, S.whoosh(1.0, 160, 1800, 0.4), at - 0.5, 1, rng.uniform(-0.4, 0.4))
    S.save('transiciones.m4a', S.reverb(x, 2.0, 0.3, seed=78), -5.0)


if __name__ == '__main__':
    for fn in [make_music, make_ambience, make_ocean, make_orcas, make_echo, make_movement, make_bubbles, make_tension, make_transitions]:
        fn()
