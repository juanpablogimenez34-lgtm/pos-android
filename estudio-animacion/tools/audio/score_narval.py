#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «El narval: el unicornio del océano» (síntesis propia, sin muestras de terceros ni
grabaciones reales de narvales: las vocalizaciones y los clics son sintéticos e ilustrativos). Reutiliza score.py sin
modificarlo. Pistas en public/audio/narval/:
  musica.m4a              música (pads glaciales, coro sintético, celesta; pulso suave en la caza; final al atardecer)
  ambiente-submarino.m4a  rumor grave bajo el agua y bajo el hielo; aire y viento en las vistas aéreas
  oceano-olas.m4a         superficie del océano y olas suaves (vistas aéreas y planos junto a la superficie)
  salpicaduras.m4a        entrada de la cámara al agua, salidas a respirar, ondas de la caza
  hielo.m4a               crujidos, chasquidos y "canto" del hielo marino
  movimiento-agua.m4a     empujes de la caudal (batido vertical), giros de la cabeza y pasadas cercanas
  vocalizaciones.m4a      silbidos, llamadas pulsadas y clics sociales (sintéticos)
  ecolocalizacion.m4a     trenes de clics y ecos (escena 5)
  burbujas-soplos.m4a     burbujas, soplos del espiráculo y succión al capturar
  tension.m4a             drones de suspenso (aproximación al pez, orca a distancia)
  transiciones.m4a        barridos entre planos, contacto del colmillo, golpes de título y cierre
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/narval')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 180.0
N = int(SR * D)
rng = np.random.default_rng(20261126)
S.rng = rng
tt = np.arange(N) / SR

# tiempos derivados de la animación (character/motion.ts: strikeChoreo)
def strike_times(t0, slow):
    base = t0 + 4.3
    contact = base + 0.7 * slow + 0.35 * slow * 0.55
    suck = base + (0.7 + 0.35 + 0.9 + 0.9 + 1.0) * slow
    wind = base
    return wind, contact, suck

STRIKES = [strike_times(0.8, 1.15), strike_times(70.6, 1.3), strike_times(81.7, 1.8)]
AERIAL = [(0.0, 11.3), (70.0, 81.5), (137.6, 150.0), (167.8, 172.4)]
NEAR_SURF = [(26.6, 31.6), (119.0, 121.0), (125.5, 130.5), (155.5, 168.0), (172.4, 180.0)]
SPLASH = [(11.3, 1.2), (29.5, 0.35), (120.6, 0.6), (127.5, 0.5), (128.3, 0.4), (166.9, 0.7), (167.9, 0.4)]
BLOWS = [(29.6, 0.45), (30.0, 0.7), (120.7, 0.9), (127.7, 0.6), (128.1, 0.6), (128.5, 0.5), (128.9, 0.4), (167.0, 0.9)]
CLICKS = [104.9 + i * 0.32 for i in range(16)]
CALLS = [(21.0, 26.0), (33.0, 36.0), (64.5, 69.5), (121.5, 126.0), (150.5, 157.0), (157.5, 164.0)]
ICE = [(0, 20, 0.5), (95, 104, 0.9), (121, 137.6, 0.8), (137.6, 150, 0.6), (150, 180, 0.3)]
CUTS = [11.3, 20.0, 45.0, 48.6, 56.1, 63.6, 70.0, 81.5, 95.0, 104.0, 110.4, 116.0, 121.0, 137.6, 150.0, 155.5, 167.8, 172.4]
HITS = [16.2, 175.2]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def env_of(spans, smooth=2):
    e = np.zeros(N)
    for a, b in spans:
        e[int(a * SR):int(min(D, b) * SR)] = 1.0
    return S.lp(e, smooth)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [  # pads glaciales (modo lidio/dórico), brillo según el momento
        (0, 11.4, [40, 47, 52, 56, 59], 1300, 0.7), (11.2, 20.2, [45, 52, 57, 61, 64, 68], 2300, 0.9),
        (20, 33.2, [43, 50, 55, 59, 62], 1400, 0.65), (33, 45.2, [45, 52, 57, 60, 64], 1600, 0.68),
        (45, 56.2, [38, 45, 50, 54, 57], 1200, 0.6), (56, 64.2, [40, 47, 52, 55, 59, 62], 1700, 0.62), (64, 70.2, [43, 50, 55, 59, 62], 1500, 0.62),
        (70, 81.6, [36, 43, 48, 51, 55], 1000, 0.58), (81.5, 95.2, [38, 45, 50, 53, 57], 1100, 0.6),
        (95, 104.2, [35, 42, 47, 50, 54], 800, 0.55), (104, 110.6, [33, 40, 45, 48, 52], 700, 0.5), (110.4, 121.2, [38, 45, 50, 54, 57], 1300, 0.62),
        (121, 130.6, [40, 47, 52, 55, 59], 1200, 0.6), (130.4, 137.8, [36, 43, 48, 51, 54], 900, 0.55), (137.6, 150.2, [41, 48, 53, 57, 60, 64], 1600, 0.65),
        (150, 160.2, [43, 50, 55, 59, 62, 66], 1800, 0.75), (160, 172.6, [45, 52, 57, 61, 64, 69], 2500, 0.9), (172.4, 180, [40, 47, 52, 56, 59, 64], 2200, 0.85),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.7, 0.7) * g
        add(x, sig, a)
    # coro sintético (vocal "ah": dos formantes) en los momentos de asombro
    for a, b, m in [(11.5, 20, 64), (45, 52, 62), (160, 178, 64)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        f = S.midi(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * ts))
        src = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in range(1, 12))
        voice = S.bp(src, 600, 1300) + 0.5 * S.bp(src, 2300, 3200)
        add(x, voice * S.env_adsr(n, 1.5, 1.5) * 0.18, a, 1, 0.0)
    # celesta: arpegios lentos y transparentes (silencio en la profundidad y ante la orca)
    scale = [64, 66, 68, 71, 73, 76, 80, 83]
    t0, k = 0.6, 0
    while t0 < 179:
        quiet = (95 < t0 < 110) or (130 < t0 < 137.5)
        if not quiet:
            n = int(1.8 * SR)
            ts = np.arange(n) / SR
            f = S.midi(scale[(k * 3 + k // 5) % len(scale)])
            s = (np.sin(2 * np.pi * f * ts) * 0.8 + 0.25 * np.sin(2 * np.pi * 3 * f * ts) * np.exp(-ts * 6)) * np.exp(-ts * 2.8)
            add(x, s, t0, 0.11, rng.uniform(-0.6, 0.6))
        t0 += 0.5 if (11 < t0 < 20 or 160 < t0 < 172) else 0.8
        k += 1
    # pulso suave durante el seguimiento del pez (fases 1–5)
    for wind, contact, _ in STRIKES:
        t0 = wind - 3.0
        while t0 < contact:
            add(x, S.thump(46, 0.5, 0.45), t0)
            t0 += 0.5
    for at in HITS:
        n = int(3.2 * SR)
        hit = sum(S.pad_voice(S.midi(m), n, 2600) for m in (40, 52, 59, 64, 68)) / 5 * np.exp(-np.arange(n) / SR * 0.9)
        add(x, hit, at, 0.9)
    x = S.reverb(x, 3.8, 0.38, seed=21)
    master = np.interp(tt, [0, 2.5, 177.5, 180], [0.0, 1.0, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente submarino…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    rumble = S.lp(S.hp(w, 16), 220, 3)
    rumble /= np.abs(rumble).max()
    hiss = S.lp(S.hp(rng.standard_normal((N, 2)), 1500), 5000) * 0.035
    deep = env_of([(102, 112)], 3)
    x = rumble * (0.75 + 0.25 * np.sin(2 * np.pi * 0.04 * tt))[:, None] * (1 + 0.4 * deep)[:, None] + hiss * (1 - 0.7 * deep)[:, None]
    e = env_of(AERIAL)
    air = S.bp(rng.standard_normal((N, 2)), 250, 3000) * 0.22 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * tt))[:, None]
    x = x * (1 - 0.75 * e)[:, None] + air * e[:, None]
    S.save('ambiente-submarino.m4a', S.reverb(x, 2.6, 0.3, seed=25), -7.0)


def make_ocean():
    print('Océano y olas…')
    e = np.clip(env_of(AERIAL) + 0.6 * env_of(NEAR_SURF), 0, 1)
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt) * np.sin(2 * np.pi * 0.031 * tt + 1)
    surf = S.lp(S.hp(rng.standard_normal((N, 2)), 180), 2200) * swell[:, None] * 0.4
    lap = S.bp(rng.standard_normal((N, 2)), 500, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * tt) ** 8)[:, None] * 0.25
    x = (surf + lap) * e[:, None]
    S.save('oceano-olas.m4a', S.reverb(x, 1.8, 0.25, seed=26), -6.0)


def make_splashes():
    print('Salpicaduras…')
    x = np.zeros((N, 2))
    for at, g in SPLASH:
        n = int(1.8 * SR)
        ts = np.arange(n) / SR
        add(x, S.lp(S.hp(rng.standard_normal(n), 250), 7000) * np.exp(-ts * 3.0) * g, at)
        add(x, S.thump(62, 0.6, g * 0.8), at)
        for k in range(int(10 * g)):
            m = int(0.05 * SR)
            add(x, S.bp(rng.standard_normal(m), 1500, 6000) * np.exp(-np.arange(m) / SR * 55) * 0.3 * g, at + 0.25 + k * 0.07, 1, rng.uniform(-0.8, 0.8))
    for _, contact, suck in STRIKES[:2]:  # ondas de la caza vista desde arriba
        n = int(0.9 * SR)
        add(x, S.bp(rng.standard_normal(n), 400, 3000) * np.exp(-np.arange(n) / SR * 5) * 0.35, contact)
        add(x, S.bp(rng.standard_normal(n), 300, 2000) * np.exp(-np.arange(n) / SR * 5) * 0.3, suck)
    S.save('salpicaduras.m4a', S.reverb(x, 1.6, 0.25, seed=27), -4.5)


def creak(dur, f0):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.sin(np.pi * ts / dur) + 0.1 * np.sin(2 * np.pi * 7 * ts))
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.92).astype(float)  # fricción a tirones
    s = S.bp(pulses + 0.2 * rng.standard_normal(n), f0 * 2, f0 * 10)
    return s * np.sin(np.pi * ts / dur)


def crack():
    n = int(0.9 * SR)
    ts = np.arange(n) / SR
    f = rng.uniform(1800, 3600) * np.exp(-ts * 2.5)  # "canto" del hielo: tono descendente
    ping = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts * 5)
    snap = S.hp(rng.standard_normal(n), 1500) * np.exp(-ts * 60)
    return snap + 0.35 * ping


def make_ice():
    print('Hielo…')
    x = np.zeros((N, 2))
    for a, b, dens in ICE:
        t0 = a + rng.uniform(0, 1.5)
        while t0 < b:
            if rng.random() < 0.55:
                add(x, creak(rng.uniform(0.8, 2.2), rng.uniform(70, 180)) * 0.5 * dens, t0, 1, rng.uniform(-0.8, 0.8))
            else:
                add(x, crack() * 0.35 * dens, t0, 1, rng.uniform(-0.8, 0.8))
            t0 += rng.uniform(1.2, 3.5) / max(0.3, dens)
    S.save('hielo.m4a', S.reverb(x, 2.8, 0.4, seed=28), -6.0)


def make_movement():
    print('Movimiento del agua…')
    x = np.zeros((N, 2))
    for a, b, f in [(11.3, 20, 0.7), (20, 45, 0.55), (45, 70, 0.5), (81.5, 95, 0.4), (95, 121, 0.7), (121, 137.6, 0.6), (150, 168, 0.5), (172.4, 180, 0.4)]:
        t0 = a
        while t0 < b:
            add(x, S.whoosh(0.8, 80, 380, 0.22 + f * 0.1), t0, 1, rng.uniform(-0.3, 0.3))
            t0 += 1 / f
    for wind, contact, _ in STRIKES:  # giro rápido de la cabeza
        add(x, S.swish(0.5, 900, 2600, 0.5), contact - 0.25)
        add(x, S.whoosh(0.9, 200, 900, 0.35), wind)
    for at in [13.0, 99.5, 131.5]:
        add(x, S.whoosh(1.4, 150, 1100, 0.45), at)
    S.save('movimiento-agua.m4a', S.reverb(x, 1.6, 0.25, seed=29), -6.0)


def call(f0, dur, kind):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    if kind == 0:  # llamada pulsada (tren de pulsos con tono)
        f = f0 * (1 + 0.2 * np.sin(np.pi * ts / dur))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = sum(np.sin(ph * h) / h for h in range(1, 6)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rng.uniform(60, 140) * ts)))
    elif kind == 1:  # silbido con inflexión
        f = f0 * (1 + 0.35 * np.sin(2 * np.pi * ts / dur + rng.uniform(0, 3)))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    else:  # ráfaga de clics sociales
        s = np.zeros(n)
        rate = rng.uniform(25, 60)
        for c in np.arange(0, dur, 1 / rate):
            i = int(c * SR)
            m = min(n - i, int(0.004 * SR))
            s[i:i + m] += S.hp(rng.standard_normal(m), 3000) * np.exp(-np.arange(m) / SR * 900)
    return s * np.sin(np.pi * ts / dur) ** 1.2


def make_calls():
    print('Vocalizaciones…')
    x = np.zeros((N, 2))
    for a, b in CALLS:
        t0 = a
        while t0 < b:
            kind = int(rng.integers(0, 3))
            f0 = [rng.uniform(800, 1500), rng.uniform(3000, 7000), 0][kind]
            dur = rng.uniform(0.5, 1.2)
            add(x, S.bp(call(f0, dur, kind), 400, 11000) * 0.28, t0, 1, rng.uniform(-0.7, 0.7))
            t0 += dur + rng.uniform(0.3, 0.9)
    S.save('vocalizaciones.m4a', S.reverb(x, 2.8, 0.42, seed=30), -6.0)


def make_clicks():
    print('Ecolocalización…')
    x = np.zeros((N, 2))
    for c in CLICKS:
        n = int(0.008 * SR)
        ts = np.arange(n) / SR
        s = S.hp(rng.standard_normal(n), 2000) * np.exp(-ts * 700) + np.sin(2 * np.pi * 6000 * ts) * np.exp(-ts * 900) * 0.6
        add(x, s, c, 0.9, -0.15)
        add(x, S.lp(s, 3000) * 0.3, c + 0.4, 1, 0.35)  # eco del calamar
    S.save('ecolocalizacion.m4a', x, -5.0)


def make_bubbles():
    print('Burbujas y soplos…')
    x = np.zeros((N, 2))
    t0 = 0.4
    while t0 < 179:
        aerial = any(a <= t0 < b for a, b in AERIAL)
        if not aerial:
            add(x, S.bubble(rng.uniform(350, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.1), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.6)
    for k in range(40):  # nube de burbujas al entrar la cámara
        add(x, S.bubble(rng.uniform(300, 1500), rng.uniform(0.02, 0.07)) * 0.12, 11.3 + k * 0.035, 1, rng.uniform(-0.9, 0.9))
    for at, g in BLOWS:  # soplo: exhalación potente + inhalación breve
        n = int(0.9 * SR)
        ts = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 250, 4000) * np.exp(-ts * 3) * np.minimum(1, ts / 0.02) * g, at)
        m = int(0.6 * SR)
        add(x, S.bp(rng.standard_normal(m), 400, 2500) * np.sin(np.pi * np.arange(m) / m) * 0.45 * g, at + 1.0)
    for _, _, suck in STRIKES + [(0, 0, 108.9)]:  # succión al capturar
        n = int(0.5 * SR)
        ts = np.arange(n) / SR
        add(x, S.lp(rng.standard_normal(n), 900) * np.sin(np.pi * ts / 0.5) * 0.5, suck)
    S.save('burbujas-soplos.m4a', S.reverb(x, 1.6, 0.25, seed=31), -5.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    spans = [(w - 3.5, c + 0.4, 44) for w, c, _ in STRIKES] + [(130.2, 137.4, 39)]
    for a, b, f in spans:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        drone = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 1.0, 0.8)
        add(x, S.lp(drone * (1 + 0.2 * np.sin(2 * np.pi * 2.5 * ts)), 800) * 0.38, a)
    S.save('tension.m4a', S.reverb(x, 2.6, 0.3, seed=32), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(1.0, 160, 1800, 0.42), at - 0.5, 1, rng.uniform(-0.4, 0.4))
    for _, contact, _ in STRIKES:  # contacto del colmillo: golpe seco y suave (sin efectos violentos)
        add(x, S.thump(110, 0.25, 0.5), contact)
        n = int(0.5 * SR)
        add(x, S.bp(rng.standard_normal(n), 1800, 6000) * np.exp(-np.arange(n) / SR * 12) * 0.25, contact)
    for at in HITS:
        add(x, S.thump(42, 1.4, 0.85), at)
        n = int(2.6 * SR)
        add(x, S.bp(rng.standard_normal(n), 1800, 8000) * np.exp(-np.arange(n) / SR * 1.8) * 0.22, at)
    S.save('transiciones.m4a', S.reverb(x, 2.2, 0.3, seed=33), -5.0)


if __name__ == '__main__':
    make_music()
    make_ambience()
    make_ocean()
    make_splashes()
    make_ice()
    make_movement()
    make_calls()
    make_clicks()
    make_bubbles()
    make_tension()
    make_transitions()
