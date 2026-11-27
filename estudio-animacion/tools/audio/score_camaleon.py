#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «El camaleón: el maestro de la transformación» (síntesis propia, sin muestras de
terceros). Reutiliza score.py sin modificarlo (longitudes explícitas de 180 s).
Pistas en public/audio/camaleon/:
  musica.m4a            música cinematográfica (pads, marimba y kalimba pentatónicas, pulso en la acción, final)
  ambiente-selva.m4a    bosque tropical: follaje, insectos lejanos, goteo
  hojas-viento.m4a      ráfagas de viento suave y roce de hojas
  insectos.m4a          zumbido de las moscas y estridulación del grillo cuando están en pantalla
  aves.m4a              trinos sintéticos lejanos + aleteo del ave de la escena 6
  movimiento.m4a        roces de corteza y pequeños agarres de los dedos al caminar
  lengua.m4a            proyección (chasquido elástico), impacto y retracción; versión ralentizada en cámara lenta
  tension.m4a           drones de suspenso (fijación del objetivo, acecho, ave)
  transiciones.m4a      barridos entre planos, golpes de título y cierre
Tiempos coherentes con src/episodes/camaleon-maestro-transformacion/scenes/*.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/camaleon')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 180.0
N = int(SR * D)
rng = np.random.default_rng(20261126)
S.rng = rng
tt = np.arange(N) / SR

STRIKES = [(13.3, 0.48, 1.5, True), (88.7, 0.72, 2.28, True), (165.7, 0.36, 1.14, True)]  # (lanzamiento, duración, retracción, cámara lenta)
WALKS = [(36.0, 40.5, 0.36), (70.3, 85.0, 1.0), (121.2, 134.0, 1.0), (155.6, 162.0, 1.0)]
FLIES = [(6.0, 13.8), (70.0, 80.0), (150.0, 166.1)]
CRICKET = [(45.0, 89.5)]
BIRD = (135.6, 144.6)
CUTS = [20.0, 35.6, 45.0, 58.4, 64.4, 70.0, 74.0, 86.6, 95.0, 104.0, 116.0, 121.0, 150.0, 168.6]
HITS = [15.6, 174.0]
UNDER = (20.0, 35.6)  # bajo tierra: ambiente apagado


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def env_windows(wins, lo=0.0, ramp=0.3):
    e = np.full(N, lo)
    for a, b in wins:
        e[int(a * SR):int(b * SR)] = 1.0
    return S.lp(e, 1 / ramp)


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    # progresión por escenas: (inicio, fin, notas MIDI, brillo, ganancia)
    chords = [
        (0, 10.2, [38, 45, 50, 53, 57], 1100, 0.75), (10, 20.2, [41, 48, 53, 57, 60], 1500, 0.8),
        (20, 35.8, [36, 43, 48, 52, 55], 900, 0.6), (35.6, 45.2, [43, 50, 55, 59, 62], 1500, 0.7),
        (45, 58.6, [40, 47, 52, 55, 59], 1300, 0.62), (58.4, 70.2, [38, 45, 50, 53, 57], 1400, 0.66),
        (70, 86.8, [36, 43, 48, 51, 55], 1000, 0.62), (86.6, 95.2, [41, 48, 53, 56, 60], 1700, 0.75),
        (95, 104.2, [43, 50, 55, 59, 62, 66], 2200, 0.72), (104, 116.2, [40, 47, 52, 56, 59], 1800, 0.62), (116, 121.2, [45, 52, 57, 61, 64], 2400, 0.75),
        (121, 135.6, [38, 45, 50, 54, 57], 1300, 0.6), (135.4, 146, [37, 44, 49, 52, 56], 800, 0.55), (145.8, 150.2, [38, 45, 50, 54, 57], 1300, 0.6),
        (150, 163, [41, 48, 53, 57, 60], 1600, 0.72), (163, 172, [43, 50, 55, 59, 62, 67], 2400, 0.85), (172, 180, [36, 43, 48, 52, 55, 60, 64], 2600, 0.9),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.5, 0.5) * g
        add(x, sig, a)
    # marimba / kalimba pentatónica (cálida, tropical): más densa en las escenas de descubrimiento
    scale = [62, 65, 67, 69, 72, 74, 77, 79]
    t0, k = 0.5, 0
    while t0 < 179:
        quiet = (135.4 < t0 < 146) or (20 < t0 < 28)
        if not quiet:
            n = int(1.0 * SR)
            ts = np.arange(n) / SR
            f = S.midi(scale[(k * 3 + k // 5) % len(scale)] - (12 if 20 < t0 < 45 else 0))
            s = (np.sin(2 * np.pi * f * ts) + 0.4 * np.sin(2 * np.pi * f * 3.98 * ts) * np.exp(-ts * 26)) * np.exp(-ts * 5.5)
            add(x, s, t0, 0.15, rng.uniform(-0.6, 0.6))
        fast = (95 < t0 < 104) or (150 < t0 < 163) or (0 < t0 < 10)
        t0 += 0.25 if fast else 0.375
        k += 1
    # pulso en la acción (acecho y capturas)
    for a, b, rate in [(10.5, 13.3, 3), (82, 88.7, 3), (160, 165.7, 4)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(48, 0.5, 0.5), t0)
            n = int(0.06 * SR)
            add(x, S.bp(rng.standard_normal(n), 5000, 9000) * np.exp(-np.arange(n) / SR * 70), t0 + 0.5 / rate, 0.07, rng.uniform(-0.3, 0.3))
            t0 += 1 / rate
    for at in HITS:
        n = int(3 * SR)
        hit = sum(S.pad_voice(S.midi(m), n, 2800) for m in (38, 50, 57, 62)) / 4 * np.exp(-np.arange(n) / SR * 1.1)
        add(x, hit, at, 0.9)
    x = S.reverb(x, 3.0, 0.3, seed=11)
    master = np.interp(tt, [0, 3, 20, 21, 35, 36, 95, 96, 178, 180], [0.0, 0.9, 0.9, 0.7, 0.7, 0.9, 0.9, 1.0, 1.1, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_jungle():
    print('Ambiente de selva…')
    w = rng.standard_normal((N, 2))
    insects = S.bp(w, 3800, 8000) * (0.55 + 0.45 * np.sin(2 * np.pi * 7.2 * tt))[:, None] * 0.12
    canopy = S.lp(S.hp(rng.standard_normal((N, 2)), 250), 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * tt))[:, None] * 0.18
    x = insects + canopy
    t0 = 0.2
    while t0 < 179:  # goteo sobre hojas
        n = int(0.05 * SR)
        ts = np.arange(n) / SR
        f = rng.uniform(1400, 2600)
        add(x, np.sin(2 * np.pi * f * ts * (1 - ts * 4)) * np.exp(-ts * 90) * 0.12, t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.9)
    under = env_windows([UNDER], 0.0, 0.5)
    x = x * (1 - under)[:, None] + S.lp(x, 350) * under[:, None] * 0.8
    dusk = np.interp(tt, [0, 150, 158, 180], [1, 1, 0.75, 0.6])
    S.save('ambiente-selva.m4a', S.reverb(x * dusk[:, None], 1.8, 0.25, seed=3), -8.0)


def make_wind():
    print('Hojas y viento…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    wind = S.lp(S.hp(w, 30), 600, 3)
    wind /= np.abs(wind).max()
    gust = np.clip(S.lp(rng.standard_normal(N), 0.15) * 40, 0, None)
    gust = gust / (gust.max() + 1e-9)
    rustle = S.bp(rng.standard_normal((N, 2)), 1200, 6000) * (gust ** 1.5)[:, None] * 0.6
    x = wind * (0.3 + 0.7 * gust)[:, None] * 0.6 + rustle
    under = env_windows([UNDER], 0.0, 0.5)
    x = x * (1 - under * 0.9)[:, None]
    S.save('hojas-viento.m4a', S.reverb(x, 2.0, 0.3, seed=4), -9.0)


def make_insects():
    print('Insectos…')
    x = np.zeros((N, 2))
    for a, b in FLIES:  # zumbido con vibrato que se acerca y se aleja
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        f = 210 + 25 * np.sin(2 * np.pi * 3.1 * ts) + 12 * np.sin(2 * np.pi * 0.7 * ts)
        ph = 2 * np.pi * np.cumsum(f) / SR
        buzz = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * (0.4 + 0.6 * np.sin(np.pi * ts / (b - a)) ** 0.5)
        pan = np.sin(2 * np.pi * 0.23 * ts) * 0.6
        st = np.stack([buzz * np.cos((pan + 1) * np.pi / 4), buzz * np.sin((pan + 1) * np.pi / 4)], axis=1) * 0.25
        add(x, S.bp(st, 150, 3000), a)
    for a, b in CRICKET:  # estridulación (pulsos)
        t0 = a
        while t0 < b:
            for k in range(4):
                n = int(0.018 * SR)
                ts = np.arange(n) / SR
                add(x, np.sin(2 * np.pi * 4600 * ts) * np.sin(np.pi * ts / 0.018) * 0.12, t0 + k * 0.035, 1, 0.4)
            t0 += rng.uniform(0.5, 1.1)
    S.save('insectos.m4a', S.reverb(x, 1.2, 0.2, seed=6), -9.0)


def chirp(f0, f1, dur, g):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    f = f0 + (f1 - f0) * (ts / dur) ** 1.4
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * ts / dur) ** 1.5 * g


def make_birds():
    print('Aves…')
    x = np.zeros((N, 2))
    t0 = 0.6
    while t0 < 179:
        if not (UNDER[0] < t0 < UNDER[1]):
            p = rng.uniform(-0.9, 0.9)
            kind = rng.integers(0, 3)
            if kind == 0:
                add(x, chirp(2100, 1600, 0.3, 0.16), t0, 1, p)
                add(x, chirp(1900, 1400, 0.4, 0.16), t0 + 0.45, 1, p)
            elif kind == 1:
                for k in range(rng.integers(4, 8)):
                    add(x, chirp(3000, 4000, 0.05, 0.1), t0 + k * 0.08, 1, p)
            else:
                add(x, chirp(1300, 1700, 0.5, 0.12), t0, 1, p)
        t0 += rng.exponential(2.2)
    a, b = BIRD
    t0 = a
    while t0 < b:  # aleteo del ave que cruza (de derecha a izquierda)
        p = 0.8 - 1.6 * (t0 - a) / (b - a)
        add(x, S.swish(0.12, 300, 2500, 0.35), t0, 1, p)
        t0 += 1 / 7 * 2 * np.pi / (2 * np.pi)
    add(x, chirp(1800, 2600, 0.35, 0.3), a + 2.5, 1, 0.2)
    S.save('aves.m4a', S.reverb(x, 2.4, 0.35, seed=7), -8.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    for a, b, s in WALKS:
        t0 = a
        while t0 < b:  # cada paso: roce de corteza + agarre de los dedos
            add(x, S.swish(0.22, 800, 4000, 0.18 * s), t0, 1, rng.uniform(-0.3, 0.3))
            n = int(0.02 * SR)
            add(x, S.bp(rng.standard_normal(n), 1500, 5000) * np.exp(-np.arange(n) / SR * 200) * 0.3 * s, t0 + 0.18)
            t0 += 0.52 / max(0.4, s) * 0.9
    for at in [138.2, 145.6]:  # deslizarse tras la rama y volver
        add(x, S.swish(1.2, 400, 2500, 0.35), at)
    for a, b in [(0.4, 3.0)]:  # hojas apartándose al inicio
        add(x, S.swish(b - a, 600, 5000, 0.4), a)
    S.save('movimiento.m4a', S.reverb(x, 1.4, 0.2, seed=9), -6.0)


def make_tongue():
    print('Lengua…')
    x = np.zeros((N, 2))
    for at, dur, ret, slow in STRIKES:
        k = 1.0 / max(1.0, dur / 0.12)  # factor de ralentización → tono más grave
        n = int((dur + 0.2) * SR)
        ts = np.arange(n) / SR
        f = (2600 * k + 300) * (1 - 0.6 * ts / (dur + 0.2))
        twang = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-ts * 6 / (dur + 0.2)) * 0.35
        noise = S.bp(rng.standard_normal(n), 400, 4000) * np.exp(-ts * 4 / (dur + 0.2)) * 0.5
        add(x, twang + noise, at - 0.05)
        add(x, S.thump(140 * k + 60, 0.35, 0.8), at + dur)  # impacto en la presa
        m = int(ret * SR)
        tr = np.arange(m) / SR
        zip_ = S.bp(rng.standard_normal(m), 600, 3000) * np.sin(np.pi * tr / ret) ** 0.7 * 0.35
        add(x, zip_, at + dur + 0.1)
        add(x, S.thump(90, 0.3, 0.6), at + dur + 0.1 + ret + 0.3)  # cierre de la mandíbula
    S.save('lengua.m4a', S.reverb(x, 1.0, 0.18, seed=10), -2.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    for a, b, f in [(10.4, 13.4, 55), (62.6, 70, 49), (80, 88.8, 52), (135.4, 146, 46), (160, 165.8, 55)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        drone = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 2, 3, 4.01)) * S.env_adsr(n, 1.0, 0.8)
        trem = 1 + 0.3 * np.sin(2 * np.pi * (4 + 3 * ts / (b - a)) * ts)
        add(x, S.lp(drone * trem, 900) * 0.4, a)
    S.save('tension.m4a', S.reverb(x, 2.5, 0.3, seed=12), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(0.9, 200, 2200, 0.5), at - 0.45, 1, rng.uniform(-0.4, 0.4))
    for at in HITS:
        add(x, S.thump(45, 1.2, 0.9), at)
        n = int(2.5 * SR)
        add(x, S.bp(rng.standard_normal(n), 2000, 9000) * np.exp(-np.arange(n) / SR * 2.0) * 0.25, at)
    n = int(1.6 * SR)  # zoom a la piel (escena 5)
    add(x, S.bp(rng.standard_normal(n), 300, 6000) * (np.arange(n) / n) ** 2 * 0.5, 102.6)
    S.save('transiciones.m4a', S.reverb(x, 2.2, 0.3, seed=13), -5.0)


if __name__ == '__main__':
    make_music()
    make_jungle()
    make_wind()
    make_insects()
    make_birds()
    make_movement()
    make_tongue()
    make_tension()
    make_transitions()
