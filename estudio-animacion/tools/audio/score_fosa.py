#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «La fosa de las Marianas: ¿qué vive a 11.000 metros bajo el mar?» (600 s).
Síntesis propia, sin muestras de terceros. Las vocalizaciones y clics de cetáceos son SINTÉTICOS e ilustrativos,
no grabaciones reales. Reutiliza score.py sin modificarlo. Pistas en public/audio/fosa/:
  musica.m4a                 evoluciona con la profundidad: aventura (superficie) → misterio (crepuscular) →
                             oscuridad cinematográfica (profunda) → inmensidad y aislamiento (hadal) → final emotivo
  ambiente-submarino.m4a     rumor del océano, cada vez más grave y vacío al descender
  oceano-olas.m4a            superficie: olas y oleaje
  burbujas-salpicaduras.m4a  entrada en el agua, burbujas, nubes de sedimento al tocar el fondo
  cetaceos.m4a               silbidos de delfines y codas del cachalote (sintéticos)
  ecolocalizacion.m4a        trenes de clics y ecos (delfines y cachalote)
  sumergible.m4a             zumbido interior, sónar, crujidos del casco, encendido de focos
  propulsores.m4a            propulsores según el empuje (descenso, maniobras, aterrizaje)
  instrumentos.m4a           escáner, sensores, cámara, brazo manipulador
  movimiento-agua.m4a        pasadas de animales y desplazamientos
  tension.m4a                tiburón, caza del rape, pez dragón, gigantes, entrada en la fosa
  transiciones.m4a           cambios de secuencia, paneles y golpes de título
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/fosa')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 600.0
N = int(SR * D)
rng = np.random.default_rng(20261126)
S.rng = rng
tt = np.arange(N, dtype=np.float32) / SR

DEPTH = [(0, 0), (30, 0), (45, 60), (60, 200), (120, 1000), (180, 2000), (240, 3000), (300, 4000), (360, 6000), (420, 7000), (480, 8200), (540, 10000), (564, 10935), (600, 10935)]
dep = np.interp(tt, [a for a, _ in DEPTH], [b for _, b in DEPTH]).astype(np.float32)
CUTS = [8, 18.3, 30, 60, 120, 180, 240, 300, 360, 420, 480, 540, 587]
PANELS = [8.4, 18.3, 51.6, 78.2, 130, 199.8, 246.8, 330, 379.8, 391, 447.2, 464.6, 501, 531, 559.8, 572.8, 589]
HITS = [4.6, 595.2]


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def span_env(spans, smooth=2):
    e = np.zeros(N, dtype=np.float32)
    for a, b in spans:
        e[int(a * SR):int(min(D, b) * SR)] = 1.0
    return S.lp(e, smooth)


def blank():
    return np.zeros((N, 2))


def make_music():
    print('Música…')
    x = blank()
    # (inicio, fin, notas, brillo, ganancia): la armonía se oscurece y se abre con la profundidad
    chords = [
        (0, 8.4, [43, 50, 55, 59, 62], 2200, 0.8), (8.2, 30.2, [45, 52, 57, 61, 64], 2000, 0.7), (30, 45.2, [48, 55, 60, 64, 67], 2600, 0.85), (45, 60.2, [45, 52, 57, 60, 64], 2000, 0.75),
        (60, 75.2, [40, 47, 52, 55, 59], 1400, 0.65), (75, 90.2, [41, 48, 53, 56, 60], 1300, 0.62), (90, 105.2, [38, 45, 50, 53, 57], 1200, 0.6), (105, 120.2, [40, 47, 52, 55, 58], 1000, 0.6),
        (120, 150.2, [36, 43, 48, 51], 800, 0.55), (150, 180.2, [35, 42, 47, 50], 760, 0.55), (180, 210.2, [33, 40, 45, 48, 52], 900, 0.6), (210, 240.2, [31, 38, 43, 46, 50], 820, 0.6),
        (240, 270.2, [34, 41, 46, 49], 650, 0.5), (270, 300.2, [36, 43, 48, 52], 700, 0.52), (300, 330.2, [33, 40, 45, 49], 600, 0.5), (330, 360.2, [31, 38, 43, 47], 600, 0.5),
        (360, 390.2, [29, 36, 41, 44, 48], 520, 0.55), (390, 420.2, [28, 35, 40, 43], 500, 0.55), (420, 450.2, [31, 38, 43, 47, 50], 700, 0.55), (450, 480.2, [29, 36, 41, 45], 600, 0.55),
        (480, 510.2, [28, 35, 40, 44], 480, 0.55), (510, 540.2, [26, 33, 38, 42], 460, 0.55),
        (540, 556.2, [33, 40, 45, 48, 52], 1100, 0.65), (556, 572.2, [36, 43, 48, 52, 55, 60], 1800, 0.8), (572, 588.2, [38, 45, 50, 54, 57, 62], 2400, 0.9), (588, 600, [43, 50, 55, 59, 62, 67], 2600, 0.95),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 1.0, 1.0) * g
        add(x, sig, a)
    # superficie: pulso de aventura y arpegios brillantes
    for a, b, rate in [(30, 58, 2.0)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(50, 0.4, 0.5), t0)
            t0 += 1 / rate
    scales = {0: [67, 71, 74, 76, 79, 83], 1: [64, 67, 71, 72, 76], 2: [60, 63, 67, 70], 3: [55, 58, 62], 4: [72, 76, 79, 81, 84, 88]}
    t0, k = 0.5, 0
    while t0 < 599:
        zone = 0 if t0 < 60 else 1 if t0 < 120 else 2 if t0 < 300 else 3 if t0 < 540 else 4
        dens = [0.45, 0.9, 1.8, 3.2, 0.5][zone]
        sc = scales[zone]
        n = int(2.2 * SR)
        ts = np.arange(n) / SR
        f = S.midi(sc[(k * 2 + k // 4) % len(sc)])
        s = (np.sin(2 * np.pi * f * ts) * 0.8 + 0.25 * np.sin(2 * np.pi * 2 * f * ts) * np.exp(-ts * 5)) * np.exp(-ts * (2.4 if zone != 3 else 1.2))
        add(x, s, t0, [0.11, 0.09, 0.07, 0.06, 0.12][zone], rng.uniform(-0.7, 0.7))
        t0 += dens + rng.uniform(0, dens * 0.3)
        k += 1
    # coro sintético en la llegada y el final
    for a, b, m in [(556, 600, 67), (4, 12, 62)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        f = S.midi(m) * (1 + 0.004 * np.sin(2 * np.pi * 5 * ts))
        src = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in range(1, 10))
        add(x, (S.bp(src, 600, 1300) + 0.5 * S.bp(src, 2300, 3200)) * S.env_adsr(n, 2, 2) * 0.16, a)
    for at in HITS:
        n = int(3.5 * SR)
        hit = sum(S.pad_voice(S.midi(m), n, 2600) for m in (43, 55, 62, 67, 71)) / 5 * np.exp(-np.arange(n) / SR * 0.8)
        add(x, hit, at, 0.9)
    x = S.reverb(x, 4.5, 0.42, seed=41)
    master = np.interp(tt, [0, 2, 597, 600], [0.0, 1.0, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente submarino…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    rumble = S.lp(S.hp(w, 15), 200, 3)
    rumble /= np.abs(rumble).max()
    hiss = S.lp(S.hp(rng.standard_normal((N, 2)), 1400), 5000)
    deep = np.clip(dep / 6000, 0, 1)
    x = rumble * (0.7 + 0.3 * deep)[:, None] + hiss * (0.05 * (1 - deep) + 0.01)[:, None]
    air = span_env([(0, 4.2), (30, 33.4)])
    wind = S.bp(rng.standard_normal((N, 2)), 300, 3500) * 0.25
    x = x * (1 - 0.8 * air)[:, None] + wind * air[:, None]
    S.save('ambiente-submarino.m4a', S.reverb(x, 3.0, 0.3, seed=42), -7.0)


def make_ocean():
    print('Océano y olas…')
    e = span_env([(0, 7.8), (30, 37)])
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * tt) * np.sin(2 * np.pi * 0.03 * tt + 1)
    surf = S.lp(S.hp(rng.standard_normal((N, 2)), 180), 2400) * swell[:, None] * 0.45
    x = surf * e[:, None]
    under = span_env([(4.2, 30), (33.4, 60)]) * 0.25
    x += S.lp(rng.standard_normal((N, 2)), 500) * (under * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * tt)))[:, None]
    S.save('oceano-olas.m4a', S.reverb(x, 1.8, 0.25, seed=43), -6.0)


def make_bubbles():
    print('Burbujas y salpicaduras…')
    x = blank()
    t0 = 4.0
    while t0 < 598:
        rate = 0.4 if t0 < 120 else 1.2 if t0 < 360 else 2.0
        add(x, S.bubble(rng.uniform(350, 1400), rng.uniform(0.03, 0.08)) * rng.uniform(0.04, 0.09), t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(rate)
    for at, g in [(3.9, 1.0), (33.0, 1.2)]:  # la cámara y el sumergible atraviesan la superficie
        n = int(2.2 * SR)
        ts = np.arange(n) / SR
        add(x, S.lp(S.hp(rng.standard_normal(n), 250), 7000) * np.exp(-ts * 2.4) * g, at)
        add(x, S.thump(60, 0.8, g), at)
        for k in range(36):
            add(x, S.bubble(rng.uniform(300, 1500), rng.uniform(0.02, 0.07)) * 0.12 * g, at + 0.2 + k * 0.04, 1, rng.uniform(-0.9, 0.9))
    for at in [305, 341, 460.3, 563.6]:  # nubes de sedimento
        n = int(2.5 * SR)
        add(x, S.lp(rng.standard_normal(n), 400) * np.exp(-np.arange(n) / SR * 1.6) * 0.6, at)
        add(x, S.thump(40, 0.9, 0.6), at)
    S.save('burbujas-salpicaduras.m4a', S.reverb(x, 1.6, 0.25, seed=44), -5.0)


def whistle(f0, dur):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 * (1 + 0.45 * np.sin(2 * np.pi * ts / dur * rng.uniform(0.6, 1.4) + rng.uniform(0, 3)))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * ts / dur) ** 1.3


def click(n_ms=6, f=6000):
    n = int(n_ms / 1000 * SR)
    ts = np.arange(n) / SR
    return S.hp(rng.standard_normal(n), 2000) * np.exp(-ts * 700) + np.sin(2 * np.pi * f * ts) * np.exp(-ts * 900) * 0.6


def make_cetaceans():
    print('Cetáceos (sintéticos)…')
    x = blank()
    t0 = 34.2
    while t0 < 45:
        dur = rng.uniform(0.4, 1.0)
        add(x, S.bp(whistle(rng.uniform(6000, 12000), dur), 3000, 16000) * 0.3, t0, 1, rng.uniform(-0.7, 0.7))
        t0 += dur + rng.uniform(0.2, 0.7)
    for a in [212.0, 216.5, 225.5, 233.0]:  # codas del cachalote: grupos rítmicos de clics graves
        for i, dt in enumerate([0, 0.22, 0.44, 0.58, 0.72]):
            add(x, S.lp(click(10, 2500), 4000) * 0.8, a + dt, 1, -0.2)
    S.save('cetaceos.m4a', S.reverb(x, 2.8, 0.4, seed=45), -6.0)


def make_echo():
    print('Ecolocalización…')
    x = blank()
    for a in [36.5, 39.5, 42.0]:  # delfines: ráfagas rápidas
        for i in range(30):
            add(x, click(4, 9000) * 0.5, a + i * 0.025, 1, 0.3)
    for i in range(22):  # cachalote
        c = 219.6 + i * 0.42
        add(x, S.lp(click(10, 3000), 5000), c, 0.9, -0.2)
        add(x, S.lp(click(10, 3000), 2500) * 0.3, c + 0.45, 1, 0.4)
    S.save('ecolocalizacion.m4a', x, -5.0)


def make_sub():
    print('Sumergible…')
    x = blank()
    on = span_env([(30, 600)])
    hum = (np.sin(2 * np.pi * 60 * tt) * 0.4 + np.sin(2 * np.pi * 120 * tt) * 0.2 + np.sin(2 * np.pi * 180 * tt) * 0.08) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.1 * tt))
    x += np.stack([hum, hum], axis=1) * on[:, None] * 0.12
    x += S.bp(rng.standard_normal((N, 2)), 800, 2000) * (on * 0.015)[:, None]  # soporte vital (ventilación)
    t0 = 36.0
    while t0 < 596:  # sónar
        n = int(1.2 * SR)
        ts = np.arange(n) / SR
        add(x, np.sin(2 * np.pi * 1400 * ts) * np.exp(-ts * 4) * 0.35, t0, 1, 0.1)
        t0 += rng.uniform(6.5, 9.5)
    t0 = 365.0
    while t0 < 595:  # crujidos del casco bajo presión
        n = int(rng.uniform(0.3, 0.9) * SR)
        ts = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 300, 1200) * np.sin(np.pi * ts / ts[-1]) * 0.25, t0, 1, rng.uniform(-0.5, 0.5))
        t0 += rng.uniform(9, 18)
    for i, at in enumerate([121.6, 122.4, 123.1, 124.0, 125.2]):  # encendido de focos (relés)
        add(x, S.hp(rng.standard_normal(int(0.03 * SR)), 1500) * 0.6, at)
        n = int(0.6 * SR)
        add(x, np.sin(2 * np.pi * (300 + 80 * i) * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 6) * 0.2, at)
    S.save('sumergible.m4a', S.reverb(x, 1.2, 0.2, seed=46), -7.0)


def make_thrusters():
    print('Propulsores…')
    th = np.interp(tt, [0, 30, 33, 36, 60, 120, 240, 300, 352, 360, 420, 480, 540, 552, 562, 566, 600], [0, 0, 0.7, 0.4, 0.45, 0.4, 0.35, 0.55, 0.6, 0.5, 0.45, 0.5, 0.55, 0.7, 0.9, 0.05, 0.05]).astype(np.float32)
    f = 140 + th * 260
    ph = 2 * np.pi * np.cumsum(f) / SR
    whine = (np.sin(ph) * 0.5 + np.sin(ph * 2.01) * 0.25 + np.sin(ph * 3.03) * 0.1) * th
    wash = S.lp(rng.standard_normal((N, 2)), 900) * th[:, None] * 0.6
    x = np.stack([whine, whine * 0.95], axis=1) * 0.3 + wash
    S.save('propulsores.m4a', S.reverb(x, 1.5, 0.25, seed=47), -8.0)


def make_instruments():
    print('Instrumentos científicos…')
    x = blank()
    for a, b in [(303, 312), (555, 562)]:  # escáner
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        sweep = np.sin(2 * np.pi * np.cumsum(2000 + 800 * np.sin(2 * np.pi * 0.6 * ts)) / SR) * 0.15 * S.env_adsr(n, 0.4, 0.4)
        add(x, sweep, a, 1, 0.2)
    t0 = 48.0
    while t0 < 595:  # sensores (CTD) y cámara
        n = int(0.12 * SR)
        add(x, np.sin(2 * np.pi * 2600 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 25) * 0.25, t0, 1, -0.3)
        t0 += rng.uniform(11, 17)
    for a, b in [(566, 570), (584, 588)]:  # brazo manipulador (servos)
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        servo = np.sin(2 * np.pi * np.cumsum(500 + 200 * np.sin(2 * np.pi * 0.8 * ts)) / SR) * 0.12 * S.env_adsr(n, 0.3, 0.3)
        add(x, servo, a, 1, 0.1)
    S.save('instrumentos.m4a', S.reverb(x, 1.0, 0.2, seed=48), -8.0)


def make_movement():
    print('Movimiento del agua…')
    x = blank()
    passes = [34.5, 36.0, 37.5, 40.5, 42.0, 45.5, 47.0, 49.0, 67, 72, 90, 112, 153, 159.6, 163.5, 186, 196, 211, 222, 231.0, 232.0, 266, 269, 276, 281, 320, 401, 410, 431, 436, 458, 460.4]
    for at in passes:
        add(x, S.whoosh(1.3, 120, 900, 0.45), at, 1, rng.uniform(-0.5, 0.5))
    S.save('movimiento-agua.m4a', S.reverb(x, 1.6, 0.25, seed=49), -6.0)


def make_tension():
    print('Tensión…')
    x = blank()
    for a, b, f in [(45, 54, 46), (151, 160.5, 41), (163.5, 172, 44), (225, 236, 39), (360, 380, 33), (464, 476, 36)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        drone = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 1.2, 1.0)
        add(x, S.lp(drone * (1 + 0.2 * np.sin(2 * np.pi * 2.4 * ts)), 800) * 0.4, a)
    S.save('tension.m4a', S.reverb(x, 2.8, 0.3, seed=50), -6.0)


def make_transitions():
    print('Transiciones…')
    x = blank()
    for at in CUTS:
        add(x, S.whoosh(1.2, 140, 1600, 0.4), at - 0.6, 1, rng.uniform(-0.4, 0.4))
    for at in PANELS:
        n = int(0.8 * SR)
        add(x, np.sin(2 * np.pi * 880 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 5) * 0.12, at, 1, 0.2)
    for at in HITS:
        add(x, S.thump(42, 1.6, 0.85), at)
        n = int(3 * SR)
        add(x, S.bp(rng.standard_normal(n), 1800, 8000) * np.exp(-np.arange(n) / SR * 1.6) * 0.2, at)
    S.save('transiciones.m4a', S.reverb(x, 2.4, 0.3, seed=51), -5.0)


if __name__ == '__main__':
    for fn in [make_music, make_ambience, make_ocean, make_bubbles, make_cetaceans, make_echo, make_sub, make_thrusters, make_instruments, make_movement, make_tension, make_transitions]:
        fn()
