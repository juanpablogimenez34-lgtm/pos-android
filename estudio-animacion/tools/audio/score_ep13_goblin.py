#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL TIBURÓN DUENDE: LA CRIATURA QUE DISPARA SU MANDÍBULA"
(síntesis propia, sin muestras de terceros: apta para YouTube, Facebook y TikTok). Reutiliza
score.py sin modificarlo. Pistas en public/audio/ep-tiburon-duende/:
  musica.m4a          misterio abisal, tensión de caza, asombro científico, cierre emotivo
  ambiente.m4a        rumor submarino profundo, corrientes, burbujas lejanas
  movimiento.m4a      desplazamiento de agua en los ataques y en el paso del tiburón
  descubrimiento.m4a  pulsos graves, tensión, señales científicas
  transiciones.m4a    impactos del ataque, barridos y golpe final
Tiempos coherentes con src/episodes/ep13-tiburon-duende/config/episode.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep-tiburon-duende')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261123)
S.rng = rng

HOOK_STRIKE = 1.0
HOOK_CUT = 2.45
STRIKE_REAL = 74.6
STRIKE_SLOW = 81.6          # golpe estirado de la repetición a cámara lenta
SCENES = [8.0, 22.0, 38.0, 54.0, 70.0, 88.0, 104.0, 120.0, 136.0, 152.0, 168.0]
PASSES = [24.5, 57.0, 105.5, 153.5, 170.0]   # paso del tiburón cerca de cámara
LOGO = 175.0


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 8.4, [28, 35, 40, 43], 500),           # Em grave — gancho
        (8.0, 22.5, [33, 40, 45, 48, 52], 700),      # Am(add9) — descenso
        (22.0, 38.5, [36, 43, 48, 52, 55], 900),     # C — apariencia extraordinaria
        (38.0, 54.5, [38, 45, 50, 53, 57], 1100),    # Dm(add9) — electrorrecepción
        (54.0, 70.5, [28, 35, 40, 43], 600),         # Em — caza (tensión)
        (70.0, 88.5, [28, 35, 40, 43, 46], 650),     # Em(b9) — el ataque
        (88.0, 104.5, [40, 47, 52, 55, 59], 1200),   # Em9 — el mecanismo (ciencia)
        (104.0, 120.5, [33, 40, 45, 48], 800),       # Am — cazador profundo
        (120.0, 136.5, [36, 43, 48, 52, 57], 1100),  # C(add6) — ¿peligroso?
        (136.0, 152.5, [31, 38, 43, 47, 50], 1100),  # G — linaje antiguo
        (152.0, 168.5, [33, 40, 45, 48, 52, 55], 1300),  # Am(add9) — misterio
        (168.0, 180.0, [36, 43, 48, 52, 55, 60], 1500),  # C(add9) — cierre emotivo
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.85 if j == 0 else 0.34)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # latido de tensión durante la caza (se acelera hasta el ataque)
    tb, gap = 54.5, 1.0
    while tb < STRIKE_REAL - 0.3:
        hit = S.thump(48, 0.7, 0.16 + 0.14 * (tb - 54.5) / 20)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
        tb += gap
        gap = max(0.42, gap * 0.965)
    # celesta de asombro (ciencia y cierre)
    for a, b, base in [(22.5, 37.5, 76), (88.5, 103.5, 76), (136.5, 151.5, 74), (168.5, 178.5, 79)]:
        tb, k = a, 0
        steps = [0, 7, 12, 15, 19, 15, 12, 7]
        while tb < b:
            n = int(1.6 * SR)
            tt = np.arange(n) / SR
            f = S.midi(base + steps[k % 8])
            tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 3.0) * 0.03
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += 0.5
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.52)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.2, 2.3, 2.6, 3.4, 74.4, 74.7, 78.0, 79.0, 176, 179.9], [0.9, 1.0, 1.0, 0.25, 0.85, 1.0, 0.3, 0.3, 0.9, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    deep = S.lp(rng.standard_normal((N, 2)), 180) * 2.0
    current = S.bp(rng.standard_normal((N, 2)), 90, 600) * (0.35 + 0.25 * np.sin(2 * np.pi * tt / 9.0))[:, None]
    # en el descenso (8–22 s) el ambiente pasa de agua iluminada a profundidad
    shallow = S.bp(rng.standard_normal((N, 2)), 400, 2400) * (np.clip((22 - tt) / 6, 0, 1) * np.clip((tt - 8) / 1, 0, 1))[:, None] * 0.25
    x = deep * 0.55 + current * 0.35 + shallow
    t0 = 1.5
    while t0 < 179.5:
        n = int(0.14 * SR)
        t2 = np.arange(n) / SR
        f0 = rng.uniform(300, 900)
        b = np.sin(2 * np.pi * f0 * (1 + 2.0 * t2) * t2) * np.exp(-t2 * 30) * 0.03
        st = S.pan(b, rng.uniform(-0.8, 0.8))
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)
        t0 += rng.uniform(1.0, 3.5)
    x = S.reverb(x, 3.4, 0.4, seed=131)
    S.save('ambiente.m4a', x, -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    for c in PASSES:  # el tiburón pasa cerca: desplazamiento de agua que crece y se aleja
        n = int(3.0 * SR)
        t2 = np.arange(n) / SR
        env = np.sin(np.pi * np.clip(t2 / 3.0, 0, 1)) ** 2
        add(S.lp(rng.standard_normal(n), 500) * env * 0.35, c - 1.5, rng.uniform(-0.5, 0.5))
    for c, stretch in [(HOOK_STRIKE, 1.0), (STRIKE_REAL, 1.0), (STRIKE_SLOW, 3.2)]:
        n = int(0.6 * stretch * SR)
        t2 = np.arange(n) / SR
        rush = S.bp(rng.standard_normal(n), 200, 1800) * np.exp(-t2 * 9 / stretch) * 0.45
        add(rush, c - 0.05 * stretch)
    x = S.reverb(x, 1.8, 0.3, seed=133)
    S.save('movimiento.m4a', x, -3.0)


def make_discovery():
    print('Descubrimiento…')
    x = np.zeros((N, 2))
    # pulso grave del inicio (se escucha antes de ver el ojo)
    for c in [0.0, 0.55]:
        h = S.thump(38, 1.4, 0.55)
        S.place(x[:, 0], h, c)
        S.place(x[:, 1], h, c)
    # señales científicas (campos eléctricos, mecanismo, linaje)
    for c in [39.0, 44.5, 89.0, 93.0, 97.0, 137.0, 144.0]:
        for j, m in enumerate([84, 88, 91]):
            n = int(1.6 * SR)
            tt = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.8) * 0.04
            S.place(x[:, 0], bell, c + j * 0.08)
            S.place(x[:, 1], bell, c + j * 0.08 + 0.012)
    # zumbido eléctrico muy suave durante la visualización de campos (38–54 s)
    tt = S.t_axis()
    hum = np.sin(2 * np.pi * 110 * tt) * 0.012 * (np.clip((tt - 44) / 1.5, 0, 1) * np.clip((53 - tt) / 1.5, 0, 1))
    x[:, 0] += hum
    x[:, 1] += hum
    x = S.reverb(x, 3.0, 0.4, seed=135)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c, g in [(HOOK_STRIKE, 0.75), (STRIKE_REAL, 0.7), (STRIKE_SLOW, 0.55)]:
        hit = S.thump(42, 2.0, g)
        n = int(1.4 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 2500, 8000) * np.exp(-st * 3.0) * 0.06
        S.place(x[:, 0], hit, c)
        S.place(x[:, 1], hit, c)
        S.place(x[:, 0], sh, c)
        S.place(x[:, 1], sh, c + 0.02)
    for c in SCENES + [HOOK_CUT + 0.2]:
        w = S.whoosh(1.0, 140, 1100, 0.18)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.48)
    h = S.thump(44, 2.6, 0.5)
    S.place(x[:, 0], h, LOGO)
    S.place(x[:, 1], h, LOGO)
    x = S.reverb(x, 3.2, 0.42, seed=137)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_discovery()
    make_transitions()
