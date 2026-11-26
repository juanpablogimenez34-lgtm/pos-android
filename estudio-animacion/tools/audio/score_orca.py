#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «La orca: la reina de los océanos» (síntesis propia, sin muestras de terceros ni
grabaciones reales de cetáceos: las vocalizaciones son sintéticas e ilustrativas). Reutiliza score.py sin modificarlo.
Pistas en public/audio/orca/:
  musica.m4a              música cinematográfica (pads oceánicos, arpa/celesta, pulso en la caza, final)
  ambiente-submarino.m4a  rumor grave del océano, siseo, cambio arriba/abajo de la superficie
  movimiento-agua.m4a     empujes de la cola (al ritmo del batido) y pasadas cercanas
  olas-salpicaduras.m4a   olas en la superficie, la ola de la caza en equipo y salpicaduras de los saltos
  vocalizaciones.m4a      llamadas pulsadas y silbidos sintéticos (comunicación del grupo)
  ecolocalizacion.m4a     trenes de clics y ecos (escena 3)
  burbujas-soplos.m4a     burbujas y soplos del espiráculo
  tension.m4a             drones de suspenso (caza en equipo, encuentro con el tiburón)
  transiciones.m4a        barridos entre planos, golpes de título y cierre
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/orca')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 180.0
N = int(SR * D)
rng = np.random.default_rng(20261127)
S.rng = rng
tt = np.arange(N) / SR

ABOVE = [(0.0, 3.4), (95.0, 100.0), (104.6, 112.0), (160.6, 167.0)]  # cámara sobre o junto a la superficie
SPLASHES = [(14.6, 1.0), (18.04, 1.3), (163.0, 0.9), (166.1, 1.1), (89.0, 0.4), (30.0, 0.25)]
BLOWS = [(30.0, 0.6), (89.0, 1.0)]
CLICKS = [51.8 + i * 0.36 for i in range(18)]
CALLS = [(21.5, 24.0), (35.0, 38.0), (58.6, 62.4), (62.6, 69.4), (154.6, 160.0), (168.0, 171.0)]
CUTS = [20.0, 45.0, 53.4, 58.3, 70.0, 74.2, 79.7, 86.0, 95.0, 99.0, 104.2, 111.0, 121.0, 125.6, 130.1, 135.0, 150.0, 167.0, 170.2]
HITS = [15.4, 174.4]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def above_env():
    e = np.zeros(N)
    for a, b in ABOVE:
        e[int(a * SR):int(b * SR)] = 1.0
    return S.lp(e, 2)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [
        (0, 12.2, [38, 45, 50, 54, 57], 1200, 0.75), (12, 20.2, [43, 50, 55, 59, 62, 66], 2200, 0.9),
        (20, 33.2, [41, 48, 53, 57, 60], 1300, 0.65), (33, 45.2, [43, 50, 55, 58, 62], 1500, 0.65),
        (45, 58.4, [36, 43, 48, 52, 55], 1100, 0.6), (58.2, 70.2, [38, 45, 50, 53, 57], 1500, 0.65),
        (70, 86.2, [33, 40, 45, 48, 52], 900, 0.6), (86, 95.2, [41, 48, 53, 57, 60], 1800, 0.7),
        (95, 104.2, [40, 47, 52, 55, 59], 1000, 0.6), (104, 112.2, [38, 45, 50, 53, 57, 62], 1900, 0.8), (112, 121.2, [41, 48, 53, 57, 60], 1400, 0.65),
        (121, 135.2, [33, 40, 45, 48, 51], 800, 0.6), (135, 150.2, [35, 42, 47, 50, 54], 1000, 0.62),
        (150, 160.2, [41, 48, 53, 57, 60, 64], 1600, 0.75), (160, 170.2, [43, 50, 55, 59, 62, 67], 2400, 0.9), (170, 180, [38, 45, 50, 54, 57, 62], 2000, 0.85),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.6, 0.6) * g
        add(x, sig, a)
    # arpa/celesta: arpegios lentos que brillan en los momentos de descubrimiento
    scale = [62, 66, 69, 71, 74, 78, 81]
    t0, k = 0.8, 0
    while t0 < 179:
        quiet = (121 < t0 < 150) or (95 < t0 < 104)
        if not quiet:
            n = int(1.6 * SR)
            ts = np.arange(n) / SR
            f = S.midi(scale[(k * 2 + k // 6) % len(scale)])
            s = (np.sin(2 * np.pi * f * ts) * 0.8 + 0.3 * np.sin(2 * np.pi * 2 * f * ts)) * np.exp(-ts * 3.2)
            add(x, s, t0, 0.12, rng.uniform(-0.6, 0.6))
        t0 += 0.5 if (12 < t0 < 20 or 160 < t0 < 170) else 0.75
        k += 1
    # pulso de la caza en equipo y del encuentro
    for a, b, rate in [(101, 110, 2.5), (130, 141, 2)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(44, 0.6, 0.6), t0)
            t0 += 1 / rate
    for at in HITS:
        n = int(3 * SR)
        hit = sum(S.pad_voice(S.midi(m), n, 2600) for m in (38, 50, 57, 62, 66)) / 5 * np.exp(-np.arange(n) / SR * 1.0)
        add(x, hit, at, 0.9)
    x = S.reverb(x, 3.5, 0.35, seed=11)
    master = np.interp(tt, [0, 3, 178, 180], [0.0, 1.0, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente submarino…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    rumble = S.lp(S.hp(w, 18), 260, 3)
    rumble /= np.abs(rumble).max()
    hiss = S.lp(S.hp(rng.standard_normal((N, 2)), 1500), 5000) * 0.04
    x = rumble * (0.7 + 0.3 * np.sin(2 * np.pi * 0.05 * tt))[:, None] + hiss
    e = above_env()
    air = S.bp(rng.standard_normal((N, 2)), 300, 4000) * 0.25  # viento y mar abierto sobre la superficie
    x = x * (1 - 0.7 * e)[:, None] + air * e[:, None]
    S.save('ambiente-submarino.m4a', S.reverb(x, 2.5, 0.3, seed=5), -7.0)


def make_movement():
    print('Movimiento del agua…')
    x = np.zeros((N, 2))
    for a, b, f in [(4, 12, 0.6), (12, 14.6, 1.6), (20, 45, 0.5), (45, 70, 0.55), (70, 86, 0.6), (86, 95, 0.9), (99, 110, 1.1), (121, 150, 0.55), (150, 172, 0.5)]:
        t0 = a
        while t0 < b:
            add(x, S.whoosh(0.7, 90, 420, 0.25 + f * 0.1), t0, 1, rng.uniform(-0.3, 0.3))
            t0 += 1 / f
    for at in [6.0, 9.5, 133.5, 139.0]:  # pasadas cercanas
        add(x, S.whoosh(1.4, 150, 1200, 0.5), at)
    S.save('movimiento-agua.m4a', S.reverb(x, 1.6, 0.25, seed=9), -6.0)


def make_waves():
    print('Olas y salpicaduras…')
    x = np.zeros((N, 2))
    e = above_env()
    surf = S.lp(S.hp(rng.standard_normal((N, 2)), 200), 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * tt))[:, None] * 0.35
    x += surf * e[:, None]
    # la ola de la caza en equipo (crece, rompe sobre el témpano)
    n = int(8 * SR)
    ts = np.arange(n) / SR
    surge = S.lp(rng.standard_normal(n), 900) * np.sin(np.pi * np.clip(ts / 8, 0, 1)) ** 2 * 1.4
    add(x, surge, 103.6)
    n2 = int(2.2 * SR)
    add(x, S.lp(S.hp(rng.standard_normal(n2), 300), 6000) * np.exp(-np.arange(n2) / SR * 2.2), 108.6, 0.9)
    for at, g in SPLASHES:
        n = int(2.0 * SR)
        ts = np.arange(n) / SR
        add(x, S.lp(S.hp(rng.standard_normal(n), 250), 7000) * np.exp(-ts * 2.6) * g, at)
        add(x, S.thump(60, 0.8, g), at)
        for k in range(int(14 * g)):
            m = int(0.06 * SR)
            add(x, S.bp(rng.standard_normal(m), 1500, 6000) * np.exp(-np.arange(m) / SR * 50) * 0.3 * g, at + 0.3 + k * 0.08, 1, rng.uniform(-0.8, 0.8))
    S.save('olas-salpicaduras.m4a', S.reverb(x, 1.8, 0.25, seed=4), -4.0)


def call(f0, dur, kind):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    if kind == 0:  # llamada pulsada: tono con armónicos y pulsos rápidos, inflexión final
        f = f0 * (1 + 0.25 * np.sin(np.pi * ts / dur) ** 2) * (1 + 0.4 * (ts / dur) ** 6)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(ph * h) / h for h in range(1, 7)) * (0.6 + 0.4 * np.sin(2 * np.pi * 180 * ts))
    else:  # silbido tonal
        f = f0 * (1 + 0.5 * np.sin(2 * np.pi * ts / dur))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * np.sin(np.pi * ts / dur) ** 1.2


def make_calls():
    print('Vocalizaciones…')
    x = np.zeros((N, 2))
    for a, b in CALLS:
        t0 = a
        while t0 < b:
            kind = rng.integers(0, 2)
            f0 = rng.uniform(900, 1600) if kind == 0 else rng.uniform(4500, 8000)
            dur = rng.uniform(0.6, 1.3)
            add(x, S.bp(call(f0, dur, kind), 400, 10000) * 0.3, t0, 1, rng.uniform(-0.7, 0.7))
            t0 += dur + rng.uniform(0.2, 0.8)
    S.save('vocalizaciones.m4a', S.reverb(x, 2.8, 0.4, seed=8), -6.0)


def make_clicks():
    print('Ecolocalización…')
    x = np.zeros((N, 2))
    for c in CLICKS:
        n = int(0.008 * SR)
        ts = np.arange(n) / SR
        s = S.hp(rng.standard_normal(n), 2000) * np.exp(-ts * 700) + np.sin(2 * np.pi * 5000 * ts) * np.exp(-ts * 900) * 0.6
        add(x, s, c, 0.9, -0.2)
        add(x, S.lp(s, 3000) * 0.3, c + 0.55, 1, 0.4)  # eco desde el cardumen
    S.save('ecolocalizacion.m4a', x, -5.0)


def make_bubbles():
    print('Burbujas y soplos…')
    x = np.zeros((N, 2))
    t0 = 0.4
    while t0 < 179:
        add(x, S.bubble(rng.uniform(350, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.1), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.6)
    for at, g in BLOWS:  # soplo: exhalación potente + inhalación breve
        n = int(1.0 * SR)
        ts = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 250, 4000) * np.exp(-ts * 3) * np.minimum(1, ts / 0.02) * g, at)
        m = int(0.7 * SR)
        add(x, S.bp(rng.standard_normal(m), 400, 2500) * np.sin(np.pi * np.arange(m) / m) * 0.5 * g, at + 1.1)
    S.save('burbujas-soplos.m4a', S.reverb(x, 1.6, 0.25, seed=6), -5.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    for a, b, f in [(99, 110, 46), (121, 135, 41), (135, 142, 44)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        drone = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 1.2, 1.0)
        add(x, S.lp(drone * (1 + 0.25 * np.sin(2 * np.pi * 3 * ts)), 800) * 0.4, a)
    S.save('tension.m4a', S.reverb(x, 2.6, 0.3, seed=12), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(1.0, 160, 1800, 0.45), at - 0.5, 1, rng.uniform(-0.4, 0.4))
    for at in HITS:
        add(x, S.thump(42, 1.4, 0.9), at)
        n = int(2.6 * SR)
        add(x, S.bp(rng.standard_normal(n), 1800, 8000) * np.exp(-np.arange(n) / SR * 1.8) * 0.25, at)
    n = int(4.4 * SR)  # inmersión inicial
    add(x, S.lp(rng.standard_normal(n), 700) * np.sin(np.pi * np.arange(n) / n) * 0.5, 2.0)
    S.save('transiciones.m4a', S.reverb(x, 2.2, 0.3, seed=13), -5.0)


if __name__ == '__main__':
    make_music()
    make_ambience()
    make_movement()
    make_waves()
    make_calls()
    make_clicks()
    make_bubbles()
    make_tension()
    make_transitions()
