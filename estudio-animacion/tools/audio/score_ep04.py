#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 04 (halcón peregrino), por síntesis.

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep04/:
  musica.m4a        amanecer, tema noble, curiosidad, suspense, picada, cámara lenta, persecución, final
  ambiente.m4a      viento de montaña (ráfagas) y aves lejanas estilizadas
  movimiento.m4a    aleteos sincronizados con los estados de batido, paso de la paloma
  tension.m4a       ostinato del acecho y picada (viento que crece, cámara lenta)
  transiciones.m4a  barridos suaves y golpes de título/final
Tiempos coherentes con src/episodes/ep04-halcon-peregrino/timeline.ts.
Volúmenes contenidos: documental, no videojuego.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep04')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261121)
S.rng = rng

# ventanas de batido (inicio, fin, Hz) — coinciden con los estados del halcón
FLAPS = [(40.2, 46.0, 4.4), (46.0, 50.5, 3.8), (70.0, 72.5, 3.6), (128.6, 137.0, 4.8), (145.2, 158.0, 3.2)]
PIGEON = (120.0, 141.0, 7.0)
DIVE = (94.6, 114.0)
SLOWMO = (114.0, 120.0)
MISS = 138.2
TITLE_HIT = 16.2
FINAL_HIT = 174.8


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 11.0, [43, 50, 55, 59, 62], 1000),    # G — amanecer
        (10.0, 21.0, [40, 47, 52, 55, 62], 1200),   # Em(add9)
        (20.0, 33.0, [36, 43, 48, 52, 55], 1400),   # C — tema noble
        (32.0, 46.0, [38, 45, 50, 54, 57], 1600),   # D
        (45.0, 58.0, [43, 50, 55, 59, 64], 1600),   # G(add6) — curiosidad
        (57.0, 71.0, [40, 47, 52, 55, 59], 1500),   # Em7
        (70.0, 84.0, [36, 43, 48, 51], 900),        # Cm — vigilancia
        (83.0, 96.0, [38, 45, 50, 53], 800),        # Dm — preparación
        (95.0, 114.5, [31, 38, 43, 50, 55], 1700),  # G(sus) — picada
        (114.0, 121.0, [36, 43, 48, 50, 55], 700),  # C(sus2) suspendido — cámara lenta
        (120.0, 138.5, [40, 47, 52, 55], 1100),     # Em — persecución
        (138.0, 151.0, [36, 43, 48, 52, 59], 1300), # Cmaj7 — fallo, respiro
        (150.0, 163.0, [41, 48, 53, 57, 60], 1400), # F
        (162.0, 180.0, [36, 43, 48, 52, 55, 64], 1600),  # C — final emotivo
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.2, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.42)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # melodía noble (metal suave sintetizado) en el tema del halcón
    melody = [(21.0, 67, 1.6), (22.8, 72, 1.2), (24.2, 71, 1.0), (25.4, 67, 2.4), (29.0, 69, 1.6), (30.8, 74, 1.4), (32.4, 72, 2.6),
              (162.5, 67, 1.6), (164.3, 72, 1.4), (165.9, 76, 1.8), (168.0, 74, 1.4), (169.6, 72, 3.5)]
    for tb, m, dur in melody:
        n = int((dur + 1.5) * SR)
        tt = np.arange(n) / SR
        f = S.midi(m)
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * tt) * np.clip(tt / 0.6, 0, 1)
        tone = sum(np.sin(2 * np.pi * f * k * np.cumsum(vib) / SR) / k ** 1.4 for k in range(1, 6))
        tone = S.lp(tone, 2200) * S.env_adsr(n, 0.25, 1.2) * 0.11
        st = S.pan(tone, 0.1)
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    # timbales sintéticos suaves al empezar la picada
    for k, tb in enumerate([95.0, 95.6, 96.2, 97.0, 104.0, 108.0, 111.0]):
        S.place(L, S.thump(55 - k, 1.2, 0.5), tb)
        S.place(R, S.thump(55 - k, 1.2, 0.5), tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.0, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 4, 94, 96, 113, 115, 120, 122, 172, 179.8], [0.0, 0.85, 0.85, 1.05, 1.05, 0.6, 0.6, 0.85, 1.1, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    wind = S.lp(S.hp(rng.standard_normal((N, 2)), 120), 1100)
    gust = 0.45 + 0.35 * np.clip(np.sin(2 * np.pi * 0.07 * tt) + 0.5 * np.sin(2 * np.pi * 0.19 * tt + 1), 0, None)
    x = wind * gust[:, None] * 0.6
    # aves lejanas estilizadas (no el halcón): gorjeos breves y escasos en el amanecer y al final
    for tb in list(np.arange(1.0, 19.0, 2.6)) + list(np.arange(152.0, 178.0, 4.0)):
        n = int(0.3 * SR)
        t2 = np.arange(n) / SR
        f = 3200 + 700 * np.sin(2 * np.pi * 11 * t2) + rng.uniform(-400, 400)
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 10) * 0.035
        st = S.pan(chirp, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], tb + rng.uniform(0, 0.8))
        S.place(x[:, 1], st[:, 1], tb + rng.uniform(0, 0.8))
    x = S.reverb(x, 3.0, 0.35, seed=41)
    S.save('ambiente.m4a', x, -7.0)


def flap(gain):
    n = int(0.14 * SR)
    tt = np.arange(n) / SR
    return S.bp(rng.standard_normal(n), 120, 900) * np.sin(np.pi * tt / 0.14) ** 2 * gain


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0, g=1.0):
        st = S.pan(sig * g, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    for a, b, hz in FLAPS:
        t0 = a
        while t0 < b:
            add(flap(0.35), t0, rng.uniform(-0.2, 0.2))
            t0 += 1.0 / hz
    a, b, hz = PIGEON
    t0 = a
    while t0 < b:
        add(flap(0.12), t0, 0.4)
        t0 += 1.0 / hz
    add(S.whoosh(0.9, 300, 2400, 0.55), MISS - 0.45)
    # despegue: roce de garras y primer impulso
    add(S.bp(rng.standard_normal(int(0.2 * SR)), 1500, 5000) * 0.1, 40.1)
    x = S.reverb(x, 1.8, 0.25, seed=43)
    S.save('movimiento.m4a', x, -3.0)


def make_tension():
    print('Tensión / velocidad…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    # ostinato grave del acecho (77–95)
    t0, k = 77.0, 0
    while t0 < 95.0:
        g = 0.25 + 0.35 * (t0 - 77) / 18
        S.place(x[:, 0], S.thump(45 + (k % 2) * 5, 0.5, g), t0)
        S.place(x[:, 1], S.thump(45 + (k % 2) * 5, 0.5, g), t0)
        t0 += 0.5
        k += 1
    # viento de la picada: ruido que sube en brillo e intensidad (sin exagerar)
    a, b = DIVE
    n = int((b - a + 1) * SR)
    t2 = np.arange(n) / SR
    noise = rng.standard_normal((n, 2))
    out = np.zeros((n, 2))
    steps = 24
    for s in range(steps):
        i0, i1 = s * n // steps, (s + 1) * n // steps
        f = 500 + 3500 * (s / (steps - 1)) ** 1.5
        out[i0:i1] = S.bp(noise, 150, f)[i0:i1]
    env = np.clip(t2 / 2.0, 0, 1) * np.clip((b - a + 1 - t2) / 0.6, 0, 1) * (0.4 + 0.6 * t2 / (b - a))
    S.place(x[:, 0], out[:, 0] * env * 0.55, a)
    S.place(x[:, 1], out[:, 1] * env * 0.55, a)
    # cámara lenta: tono grave sostenido y viento apagado
    a, b = SLOWMO
    n = int((b - a + 1.5) * SR)
    t3 = np.arange(n) / SR
    low = S.lp(S.lp(rng.standard_normal(n), 300), 300) * 3 + np.sin(2 * np.pi * 41 * t3) * 0.5
    low = low * S.env_adsr(n, 0.4, 1.5) * 0.35
    S.place(x[:, 0], low, a)
    S.place(x[:, 1], low, a)
    # persecución: pulso más rápido (125–138)
    t0 = 125.0
    while t0 < 138.0:
        S.place(x[:, 0], S.thump(52, 0.35, 0.3), t0)
        S.place(x[:, 1], S.thump(52, 0.35, 0.3), t0)
        t0 += 0.4
    del tt
    x = S.reverb(x, 2.5, 0.3, seed=45)
    S.save('tension.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in [20.0, 52.0, 59.0, 65.0, 120.0]:
        w = S.whoosh(1.1, 200, 1400, 0.35)
        S.place(x[:, 0], w, c - 0.55)
        S.place(x[:, 1], w, c - 0.55)
    for ti, g in [(TITLE_HIT, 0.8), (FINAL_HIT, 0.75)]:
        hit = S.thump(46, 2.0, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.09
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.5, 0.4, seed=47)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
