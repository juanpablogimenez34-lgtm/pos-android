#!/usr/bin/env python3
"""Banda sonora ORIGINAL del documental "El leopardo — el fantasma de la selva", por síntesis
(sin muestras de terceros: apta para publicar y monetizar). Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep04-leopardo/:
  musica.m4a          suspense (noche, acecho), descubrimiento (árboles, adaptación), cierre emotivo
  ambiente.m4a        selva: aves de día, insectos y grillos de noche, viento en la sabana
  movimiento.m4a      pasos sobre hojas y hierba, carrera, salto, garras en la corteza
  descubrimiento.m4a  pulsos de tensión del ataque y arpegios de descubrimiento
  transiciones.m4a    barridos entre escenas, golpe del título y del cierre
Tiempos coherentes con src/episodes/ep09-leopardo/config/episode.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep04-leopardo')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261209)
S.rng = rng

NIGHT = [(0.0, 15.5), (96.0, 106.0)]
WALKS = [(17.0, 29.0, 1.4), (30.5, 44.5, 0.9), (106.0, 119.5, 1.5), (136.0, 149.5, 1.5), (166.0, 170.0, 1.0)]
RUN = (46.0, 51.6)
JUMP = 51.6
LAND = 53.2
CLIMB = (61.0, 74.5)
DRAG = (76.0, 89.0)
TITLE_HIT, FINAL_HIT = 11.6, 174.0
CUTS = [15.0, 30.0, 45.0, 60.0, 75.0, 90.0, 105.0, 120.0, 135.0, 150.0, 165.0]


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 16.0, [38, 45, 50, 53], 600),          # Dm — noche, el fantasma
        (15.0, 31.0, [41, 48, 53, 57, 64], 1300),    # F(add9) — camuflaje a la luz
        (30.0, 46.0, [40, 47, 52, 55], 800),         # Em — acecho
        (45.0, 61.0, [40, 47, 52, 55, 59], 1000),    # Em7 — ataque (pulsos aparte)
        (60.0, 76.0, [43, 50, 55, 59, 62], 1300),    # G — el rey de los árboles
        (75.0, 91.0, [45, 52, 57, 60], 1100),        # Am — fuerza
        (90.0, 106.0, [38, 45, 50, 53, 57], 700),    # Dm(add9) — ojos de la noche
        (105.0, 121.0, [41, 48, 53, 57], 1000),      # F — solitario
        (120.0, 136.0, [48, 55, 60, 64, 67], 1400),  # C(add9) — madre
        (135.0, 151.0, [43, 50, 55, 59, 64], 1400),  # G(add6) — adaptación
        (150.0, 166.0, [45, 52, 57, 60, 64], 900),   # Am(add9) — futuro incierto
        (165.0, 180.0, [41, 48, 53, 57, 60, 67], 1600),  # Fmaj9 — amanecer, cierre
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.38)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # tambores graves de suspense (acecho y ataque)
    for tb in np.arange(30.5, 60.0, 0.75):
        g = 0.18 if tb < 45 else 0.3
        if 51.4 < tb < 55.0:
            continue  # silencio en la cámara lenta del salto
        hit = S.thump(52, 0.9, g)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
    # melodía emotiva (flauta sintética suave) en la madre y en el cierre
    melody = [(121.5, 72, 1.4), (123.2, 76, 1.2), (124.8, 74, 1.6), (127.0, 72, 2.4), (166.0, 72, 1.4), (167.6, 77, 1.4), (169.2, 76, 1.6), (171.2, 74, 1.2), (172.8, 72, 4.0)]
    for tb, m, dur in melody:
        n = int((dur + 1.4) * SR)
        tt = np.arange(n) / SR
        f = S.midi(m)
        vib = 1 + 0.005 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt / 0.5, 0, 1)
        tone = np.sin(2 * np.pi * f * np.cumsum(vib) / SR) + 0.25 * np.sin(4 * np.pi * f * np.cumsum(vib) / SR)
        breath = S.bp(rng.standard_normal(n), 1500, 5000) * 0.05
        x = (tone * 0.1 + breath) * S.env_adsr(n, 0.2, 1.0)
        st = S.pan(x, 0.15)
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.0, 0.45)
    tt = S.t_axis()
    master = np.interp(tt, [0, 2, 44, 46, 51.5, 52, 55, 56, 165, 172, 179.8], [0.0, 0.8, 0.8, 1.0, 1.0, 0.45, 0.45, 0.85, 0.95, 1.05, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def chirp(f0, dur, gain):
    n = int(dur * SR)
    t2 = np.arange(n) / SR
    f = f0 + 0.3 * f0 * np.sin(2 * np.pi * 12 * t2)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 8) * gain


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    night = np.zeros(N)
    for a, b in NIGHT:
        night = np.maximum(night, np.clip((tt - a) / 1.5, 0, 1) * np.clip((b - tt) / 1.5, 0, 1))
    night = np.maximum(night, np.clip((tt - 92) / 4, 0, 1) * np.clip((106 - tt) / 1.5, 0, 1))
    wind = S.lp(S.hp(rng.standard_normal((N, 2)), 150), 1800) * (0.25 + 0.15 * np.sin(2 * np.pi * tt / 11))[:, None]
    savanna = np.clip((tt - 30) / 1, 0, 1) * np.clip((61 - tt) / 1, 0, 1) + np.clip((tt - 136) / 1, 0, 1) * np.clip((165 - tt) / 1, 0, 1)
    x = wind * (0.4 + 0.6 * savanna)[:, None]
    # grillos nocturnos (pulsos rápidos agudos)
    cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > 0.6) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt)) * 0.03
    x[:, 0] += cr * night
    x[:, 1] += np.roll(cr, 900) * night
    # aves de día (trinos), nunca de noche
    t0 = 15.5
    while t0 < 179:
        day = not any(a <= t0 <= b for a, b in NIGHT) and not (92 < t0 < 106)
        if day:
            for k in range(rng.integers(2, 5)):
                c = chirp(rng.uniform(2200, 4200), 0.12, 0.035)
                st = S.pan(c, rng.uniform(-0.8, 0.8))
                S.place(x[:, 0], st[:, 0], t0 + k * 0.14)
                S.place(x[:, 1], st[:, 1], t0 + k * 0.14)
        t0 += rng.uniform(1.2, 3.5)
    x = S.reverb(x, 2.6, 0.32, seed=91)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # pasos suaves sobre hojas y hierba
    for a, b, hz in WALKS:
        t0 = a
        while t0 < b:
            n = int(0.14 * SR)
            t2 = np.arange(n) / SR
            add(S.bp(rng.standard_normal(n), 400, 3000) * np.exp(-t2 * 28) * 0.07, t0, rng.uniform(-0.3, 0.3))
            t0 += 0.5 / hz
    # carrera (pasos rápidos y fuertes)
    t0 = RUN[0]
    while t0 < RUN[1]:
        n = int(0.12 * SR)
        t2 = np.arange(n) / SR
        add(S.lp(rng.standard_normal(n), 900) * np.exp(-t2 * 25) * 0.22, t0, rng.uniform(-0.2, 0.2))
        t0 += 0.21
    add(S.whoosh(1.2, 300, 1500, 0.32), JUMP - 0.1, 0.1)
    add(S.thump(70, 0.6, 0.35), LAND)
    n = int(1.2 * SR)
    t2 = np.arange(n) / SR
    add(S.bp(rng.standard_normal(n), 300, 2500) * np.exp(-t2 * 3) * 0.18, LAND)  # polvo
    # garras en la corteza
    for a, b in [CLIMB, DRAG]:
        t0 = a
        while t0 < b:
            n = int(0.18 * SR)
            t2 = np.arange(n) / SR
            add(S.bp(rng.standard_normal(n), 1200, 5000) * np.exp(-t2 * 18) * 0.09, t0, rng.uniform(-0.3, 0.3))
            t0 += rng.uniform(0.45, 0.8) * (1.6 if a == DRAG[0] else 1.0)
    x = S.reverb(x, 1.6, 0.25, seed=93)
    S.save('movimiento.m4a', x, -3.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    for (a, b), pattern in [((60.5, 75.0), [67, 71, 74, 79, 76, 74, 71, 67]), ((135.5, 150.0), [62, 67, 71, 74, 72, 71, 67, 64])]:
        t0, k = a, 0
        while t0 < b:
            prog = (t0 - a) / (b - a)
            m = pattern[k % len(pattern)]
            n = int(0.9 * SR)
            tt = np.arange(n) / SR
            f = S.midi(m)
            tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 5) * (0.03 + 0.03 * prog)
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(x[:, 0], st[:, 0], t0)
            S.place(x[:, 1], st[:, 1], t0)
            t0 += 0.5
            k += 1
    x = S.reverb(x, 3.4, 0.45, seed=95)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in CUTS:
        w = S.whoosh(1.0, 200, 1300, 0.24)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.48)
    for ti, g in [(TITLE_HIT, 0.75), (FINAL_HIT, 0.6)]:
        hit = S.thump(44, 2.2, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.06
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.0, 0.4, seed=97)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
