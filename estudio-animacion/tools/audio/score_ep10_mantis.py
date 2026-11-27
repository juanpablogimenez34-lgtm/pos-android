#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "El camarón mantis: el pequeño gigante del océano" (síntesis propia,
sin muestras de terceros: apta para publicar y monetizar). Reutiliza score.py sin modificarlo.
Pistas en public/audio/ep04-camaron-mantis/:
  musica.m4a          misterio (descubrimiento), tensión (acecho y golpe), ciencia, cierre
  ambiente.m4a        rumor submarino, corrientes, burbujas, sedimento
  movimiento.m4a      patas sobre la arena, roce de sedimento, golpes del mazo y chasquido de la concha
  descubrimiento.m4a  burbujas de cavitación (colapso), señales científicas
  transiciones.m4a    barridos entre actos, título final
Tiempos coherentes con src/episodes/ep10-camaron-mantis/config/sequences.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep04-camaron-mantis')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261210)
S.rng = rng

WALKS = [(19.0, 26.5), (140.0, 152.0), (153.0, 156.5)]
STRIKE_REAL = 83.0
STRIKE_SLOW = (86.2, 88.6)  # repetición a cámara lenta (sonido estirado)
EXTRA_STRIKES = [100.4, 101.6, 102.8]
CRACK = 103.0
CAVITATION = (90.6, 98.6)
ACTS = [36.0, 63.0, 108.0, 144.0]
TITLE_HIT = 172.0


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 19.0, [38, 45, 50, 53, 57], 800),     # Dm(add9) — misterio
        (18.0, 37.0, [41, 48, 53, 57, 64], 1300),   # F(add9) — aparece el protagonista
        (36.0, 64.0, [43, 50, 55, 58, 62], 1100),   # Gm — los ojos del cazador
        (63.0, 82.0, [40, 47, 52, 55], 700),        # Em — tensión
        (81.0, 100.0, [40, 47, 52, 55, 58], 800),   # Em(b9 color) — el golpe
        (99.0, 109.0, [45, 52, 57, 60], 1000),      # Am — la presa
        (108.0, 136.0, [48, 55, 60, 64, 67], 1300), # C(add9) — ingeniería
        (135.0, 163.0, [41, 48, 53, 57, 60], 1300), # F — regreso, territorio
        (162.0, 180.0, [38, 45, 50, 53, 57, 62], 1600),  # Dm(add9) — final
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.2, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.38)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # pulso de tensión antes del golpe (se acelera)
    tb = 63.5
    gap = 0.9
    while tb < 82.6:
        hit = S.thump(50, 0.7, 0.18 + 0.12 * (tb - 63.5) / 19)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
        tb += gap
        gap = max(0.38, gap * 0.97)
    # destellos de celesta en el descubrimiento y en el final
    for tb, m in [(2.0, 81), (5.0, 86), (19.5, 84), (23.0, 88), (37.0, 86), (46.0, 89), (50.0, 93), (118.0, 84), (127.0, 88), (164.0, 84), (168.0, 88), (172.0, 91), (175.0, 93)]:
        n = int(2.4 * SR)
        tt = np.arange(n) / SR
        f = S.midi(m)
        tone = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * 2.2) * 0.05
        st = S.pan(tone, rng.uniform(-0.6, 0.6))
        S.place(L, st[:, 0], tb)
        S.place(R, st[:, 1], tb)
    x = S.reverb(np.stack([L, R], axis=1), 4.4, 0.48)
    tt = S.t_axis()
    master = np.interp(tt, [0, 2.5, 82.6, 83.0, 89.0, 90.0, 168, 176, 179.9], [0.0, 0.8, 1.0, 0.35, 0.35, 0.85, 0.95, 1.05, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    under = S.lp(rng.standard_normal((N, 2)), 340) * 1.6
    current = S.bp(rng.standard_normal((N, 2)), 120, 900) * (0.4 + 0.3 * np.sin(2 * np.pi * tt / 8.0))[:, None]
    lab = np.clip((tt - 126.5) / 1.0, 0, 1) * np.clip((135.5 - tt) / 1.0, 0, 1)
    x = (under * 0.6 + current * 0.35) * (1 - 0.7 * lab)[:, None]
    t0 = 1.0
    while t0 < 179.5:
        if not (126.5 < t0 < 135.5):
            n = int(0.12 * SR)
            t2 = np.arange(n) / SR
            f0 = rng.uniform(500, 1500)
            b = np.sin(2 * np.pi * f0 * (1 + 2.5 * t2) * t2) * np.exp(-t2 * 35) * 0.045
            st = S.pan(b, rng.uniform(-0.8, 0.8))
            S.place(x[:, 0], st[:, 0], t0)
            S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.7, 2.6)
    x = S.reverb(x, 2.8, 0.35, seed=101)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    for a, b in WALKS:
        t0 = a
        while t0 < b:
            n = int(0.09 * SR)
            t2 = np.arange(n) / SR
            add(S.bp(rng.standard_normal(n), 900, 4500) * np.exp(-t2 * 35) * 0.05, t0, rng.uniform(-0.3, 0.3))
            t0 += rng.uniform(0.13, 0.22)
    # golpe real: chasquido seco y potente
    def snap(t0, g=0.5, stretch=1.0):
        n = int(0.25 * stretch * SR)
        t2 = np.arange(n) / SR
        click = S.bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t2 * 60 / stretch) * g
        body = np.sin(2 * np.pi * (180 / stretch) * t2) * np.exp(-t2 * 18 / stretch) * g * 0.8
        add(click + body, t0)
    snap(STRIKE_REAL, 0.6)
    snap(STRIKE_SLOW[0] + 1.0, 0.55, 3.5)
    for ts in EXTRA_STRIKES:
        snap(ts, 0.45)
    n = int(0.4 * SR)
    t2 = np.arange(n) / SR
    add(S.bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t2 * 14) * 0.3, CRACK, 0.1)  # la concha se agrieta
    x = S.reverb(x, 1.6, 0.25, seed=103)
    S.save('movimiento.m4a', x, -3.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    a, b = CAVITATION
    t0 = a
    while t0 < b:
        # burbuja que crece y colapsa: tono que sube y chasquido final
        n = int(0.35 * SR)
        t2 = np.arange(n) / SR
        f = 300 + 2400 * (t2 / 0.35) ** 2
        grow = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t2 / 0.35) * 0.03
        pop = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-np.maximum(0, t2 - 0.32) * 120) * (t2 > 0.32) * 0.12
        st = S.pan(grow + pop, rng.uniform(-0.4, 0.4))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(0.6, 1.1)
    for c in [45.6, 72.6, 117.6, 126.6]:
        for j, m in enumerate([84, 88, 91, 96]):
            n = int(1.6 * SR)
            tt = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.8) * 0.04
            S.place(x[:, 0], bell, c + j * 0.08)
            S.place(x[:, 1], bell, c + j * 0.08 + 0.012)
    x = S.reverb(x, 3.0, 0.4, seed=105)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in ACTS + [9.0, 54.0, 90.0, 126.0, 135.0, 162.0]:
        w = S.whoosh(1.0, 180, 1200, 0.22)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.48)
    hit = S.thump(44, 2.2, 0.6)
    n = int(3 * SR)
    st = np.arange(n) / SR
    sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.06
    S.place(x[:, 0], hit, TITLE_HIT)
    S.place(x[:, 1], hit, TITLE_HIT)
    S.place(x[:, 0], sh, TITLE_HIT)
    S.place(x[:, 1], sh, TITLE_HIT + 0.02)
    x = S.reverb(x, 3.0, 0.4, seed=107)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
