#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 06 (ajolote), por síntesis.

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep06/:
  musica.m4a          ambiental cinematográfica: canal, encuentro, exploración, final emotivo
  ambiente.m4a        agua: rumor bajo el agua, burbujas suaves; superficie y aves al inicio
  movimiento.m4a      pasos sobre el limo, nado (ondulación), succión de la presa, sobresalto
  descubrimiento.m4a  música de descubrimiento durante la regeneración (arpegios que crecen)
  transiciones.m4a    entrada al agua, transición científica, destellos, título y final
Tiempos coherentes con src/episodes/ep06-ajolote/Timeline/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep06')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261206)
S.rng = rng

UNDERWATER = 7.6
WALKS = [(9.4, 14.6, 1.3), (34.0, 40.0, 1.1), (46.2, 48.2, 1.0), (51.2, 58.6, 1.0), (150.0, 158.0, 0.9), (172.4, 178.2, 1.1)]
SWIMS = [(15.8, 20.0), (40.0, 46.2), (158.0, 166.0)]
FEED, STARTLE = 50.25, 55.2
SCI_IN, LESION = 59.4, 62.2
REGEN = (70.0, 120.0)
PANEL = (120.6, 145.0)
TITLE_HIT, FINAL_HIT = 16.0, 174.8


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 8.0, [48, 55, 60, 64, 67], 1500),    # C — canal soleado
        (7.0, 20.0, [45, 52, 57, 60, 64], 1100),   # Am(add9) — bajo el agua
        (19.0, 34.0, [41, 48, 53, 57, 64], 1200),  # Fmaj9 — conocemos al ajolote
        (33.0, 46.0, [43, 50, 55, 59, 62], 1300),  # G
        (45.0, 59.0, [45, 52, 57, 60], 1000),      # Am — exploración
        (58.0, 71.0, [41, 48, 51, 56], 700),       # Fm — el accidente (sin dramatismo excesivo)
        (70.0, 96.0, [38, 45, 50, 53, 57], 900),   # Dm(add9) — regeneración
        (95.0, 121.0, [41, 48, 53, 57, 60], 1200), # F — una nueva extremidad
        (120.0, 146.0, [43, 50, 55, 59, 62], 1100),# G — células
        (145.0, 158.0, [48, 55, 60, 64], 1400),    # C — regreso
        (157.0, 166.0, [45, 52, 57, 60, 64], 1300),# Am
        (165.0, 180.0, [41, 48, 53, 57, 60, 67], 1600),  # Fmaj9 — final esperanzador
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.2, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.4)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # melodía tierna (flauta sintética suave) al conocer al protagonista y en el final
    melody = [(21.5, 72, 1.4), (23.2, 76, 1.2), (24.6, 74, 1.6), (26.6, 72, 2.4), (166.0, 72, 1.4), (167.6, 77, 1.4), (169.2, 76, 1.6), (171.2, 74, 1.2), (172.6, 72, 3.6)]
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
    x = S.reverb(np.stack([L, R], axis=1), 4.2, 0.48)
    tt = S.t_axis()
    master = np.interp(tt, [0, 3, 69, 71, 120, 122, 170, 179.8], [0.0, 0.85, 0.85, 0.6, 0.6, 0.85, 1.1, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    # sobre el agua (0–7,6 s): brisa y aves; bajo el agua: rumor grave y amortiguado
    above = np.clip((UNDERWATER - tt) / 1.2, 0, 1)
    above = np.maximum(above, np.clip((tt - 165.5) / 1.5, 0, 1) * np.clip((172.5 - tt) / 1.0, 0, 1) * 0.5)
    breeze = S.lp(S.hp(rng.standard_normal((N, 2)), 200), 2500) * 0.25
    under = S.lp(rng.standard_normal((N, 2)), 380) * 1.6
    x = breeze * above[:, None] + under * (1 - above[:, None]) * 0.6
    for tb in np.arange(0.4, 7.2, 1.3):
        n = int(0.3 * SR)
        t2 = np.arange(n) / SR
        f = 3000 + 800 * np.sin(2 * np.pi * 10 * t2)
        c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 10) * 0.04
        st = S.pan(c, rng.uniform(-0.7, 0.7))
        S.place(x[:, 0], st[:, 0], tb)
        S.place(x[:, 1], st[:, 1], tb)
    # burbujas suaves bajo el agua
    t0 = 8.0
    while t0 < 179:
        n = int(0.12 * SR)
        t2 = np.arange(n) / SR
        f0 = rng.uniform(500, 1400)
        b = np.sin(2 * np.pi * f0 * (1 + 2.5 * t2) * t2) * np.exp(-t2 * 35) * 0.05
        st = S.pan(b, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.6, 2.4)
    x = S.reverb(x, 2.8, 0.35, seed=61)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # pasos sobre el limo: roces suaves y apagados
    for a, b, hz in WALKS:
        t0 = a
        while t0 < b:
            n = int(0.12 * SR)
            t2 = np.arange(n) / SR
            add(S.lp(rng.standard_normal(n), 700) * np.exp(-t2 * 30) * 0.12, t0, rng.uniform(-0.3, 0.3))
            t0 += 0.5 / hz
    # nado: ondulación (pulsos de agua desplazada)
    for a, b in SWIMS:
        n = int((b - a) * SR)
        t2 = np.arange(n) / SR
        w = S.lp(rng.standard_normal(n), 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.7 * t2)) * np.sin(np.pi * t2 / (b - a)) * 0.5
        add(w, a)
    # succión de la presa (rápida y suave) y sobresalto
    n = int(0.25 * SR)
    t2 = np.arange(n) / SR
    add(S.bp(rng.standard_normal(n), 300, 1600) * np.exp(-t2 * 18) * 0.35, FEED - 0.05, -0.1)
    add(S.whoosh(0.5, 400, 1400, 0.25), STARTLE - 0.05, 0.1)
    n = int(0.15 * SR)
    t3 = np.arange(n) / SR
    add(np.sin(2 * np.pi * 220 * t3) * np.exp(-t3 * 25) * 0.15, STARTLE - 0.35, 0.2)  # ramita que toca el fondo
    x = S.reverb(x, 1.8, 0.3, seed=63)
    S.save('movimiento.m4a', x, -3.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    a, b = REGEN
    # arpegios que crecen en densidad y registro con las etapas de la regeneración
    pattern = [62, 65, 69, 72, 74, 72, 69, 65]
    t0, k = a + 0.5, 0
    while t0 < b:
        prog = (t0 - a) / (b - a)
        m = pattern[k % len(pattern)] + (12 if prog > 0.55 and k % 4 == 0 else 0)
        n = int(0.9 * SR)
        tt = np.arange(n) / SR
        f = S.midi(m)
        tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 5) * (0.035 + 0.04 * prog)
        st = S.pan(tone, 0.5 * np.sin(k * 0.7))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += 0.5 - 0.2 * prog
        k += 1
    # panel celular: pulsos suaves de "señales"
    t0 = PANEL[0] + 1.0
    while t0 < PANEL[1]:
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * S.midi(81 + (int(t0 * 3) % 3) * 2) * tt) * np.exp(-tt * 8) * 0.04
        S.place(x[:, 0], s, t0)
        S.place(x[:, 1], s, t0 + 0.02)
        t0 += 0.62
    x = S.reverb(x, 3.6, 0.45, seed=65)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    # entrada al agua: chapoteo grave y barrido amortiguado
    n = int(1.4 * SR)
    t2 = np.arange(n) / SR
    splash = S.lp(rng.standard_normal(n), 1200) * np.exp(-t2 * 3) * 0.35
    S.place(x[:, 0], splash, UNDERWATER - 0.2)
    S.place(x[:, 1], splash, UNDERWATER - 0.18)
    for c in [17.6, 45.0, 70.0, 145.0, 165.0]:
        w = S.whoosh(1.0, 200, 1300, 0.28)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.5)
    for ts in [SCI_IN, LESION, PANEL[0], 137.0]:
        for j, m in enumerate([84, 88, 91, 96]):
            n = int(1.8 * SR)
            tt = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.6) * 0.045
            S.place(x[:, 0], bell, ts + j * 0.08)
            S.place(x[:, 1], bell, ts + j * 0.08 + 0.012)
    for ti, g in [(TITLE_HIT, 0.7), (FINAL_HIT, 0.65)]:
        hit = S.thump(48, 2.0, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.07
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.2, 0.4, seed=67)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
