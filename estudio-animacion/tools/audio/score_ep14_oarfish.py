#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL PEZ REMO GIGANTE — EL DRAGÓN DE LAS PROFUNDIDADES"
(síntesis propia, sin muestras de terceros: apta para YouTube, Facebook y TikTok). Reutiliza
score.py sin modificarlo. Pistas en public/audio/ep07-pez-remo/: (cuatro etapas: misterio → exploración → leyendas → asombro)
  musica.m4a          misterio abisal, tensión de caza, asombro científico, cierre emotivo
  ambiente.m4a        rumor submarino profundo, corrientes, burbujas lejanas
  movimiento.m4a      desplazamiento de agua en los ataques y en el paso del tiburón
  descubrimiento.m4a  pulsos graves, tensión, señales científicas
  transiciones.m4a    impactos del ataque, barridos y golpe final
Tiempos coherentes con src/episodes/ep14-pez-remo/data/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep07-pez-remo')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261124)
S.rng = rng

HOOK_STRIKE = 0.05           # impacto grave inicial
HOOK_CUT = 2.9               # destello que revela las escamas
STRIKE_REAL = 13.0           # la cámara llega a la zona iluminada
STRIKE_SLOW = 120.3          # paso de leyenda a ciencia
SCENES = [15.0 * i for i in range(1, 12)]
PASSES = [2.0, 18.0, 33.0, 62.0, 151.0, 166.0]   # el pez pasa cerca de cámara
LOGO = 176.6
SHIP = (90.0, 105.0)          # escena del barco
ROV = (135.0, 150.0)          # motores del vehículo submarino


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [26, 33, 38, 41, 45], 600),      # Dm grave — misterio e impacto
        (15.0, 30.5, [38, 45, 50, 53, 57], 1200),    # Dm(add9) — revelación
        (30.0, 45.5, [41, 48, 53, 57, 64], 1400),    # F(add9) — cuerpo extraordinario
        (45.0, 60.5, [33, 40, 45, 48, 52], 800),     # Am(add9) — océano profundo
        (60.0, 75.5, [36, 43, 48, 52, 55], 1300),    # C — su forma de nadar
        (75.0, 90.5, [43, 50, 55, 59, 62], 1300),    # G — alimentación
        (90.0, 105.5, [28, 35, 40, 43, 46], 650),    # Em(b9) — la serpiente de las leyendas
        (105.0, 120.5, [33, 40, 45, 48, 51], 700),   # Am(b6) — terremotos (leyenda)
        (120.0, 135.5, [36, 43, 48, 52, 57], 1100),  # C(add6) — la ciencia
        (135.0, 150.5, [38, 45, 50, 53, 57], 1100),  # Dm(add9) — encuentro con el ROV
        (150.0, 165.5, [41, 48, 53, 57, 60, 65], 1600),  # F(add9) — el verdadero misterio
        (165.0, 180.0, [34, 41, 46, 50, 53, 58], 1500),  # Bb(add9) — cierre de asombro
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
    tb, gap = 90.5, 1.1
    while tb < 119.5:  # tensión moderada en las leyendas
        hit = S.thump(48, 0.7, 0.12 + 0.06 * (tb - 90.5) / 29)
        S.place(L, hit, tb)
        S.place(R, hit, tb + 0.01)
        tb += gap
        gap = max(0.7, gap * 0.99)
    # celesta de asombro (ciencia y cierre)
    for a, b, base in [(15.5, 44.5, 76), (60.5, 89.5, 74), (135.5, 149.5, 76), (150.5, 178.5, 79)]:
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
    master = np.interp(tt, [0, 0.3, 60, 90, 120, 150, 165, 177, 179.9], [0.85, 1.0, 1.0, 0.95, 0.9, 1.0, 1.1, 1.05, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    deep = S.lp(rng.standard_normal((N, 2)), 180) * 2.0
    current = S.bp(rng.standard_normal((N, 2)), 90, 600) * (0.35 + 0.25 * np.sin(2 * np.pi * tt / 9.0))[:, None]
    # en el descenso (8–22 s) el ambiente pasa de agua iluminada a profundidad
    shallow = S.bp(rng.standard_normal((N, 2)), 400, 2400) * (np.clip((tt - 12) / 1.5, 0, 1) * np.clip((52 - tt) / 6, 0, 1))[:, None] * 0.2
    ship = np.clip((tt - SHIP[0]) / 0.8, 0, 1) * np.clip((SHIP[1] - tt) / 0.8, 0, 1)
    wind = S.bp(rng.standard_normal((N, 2)), 500, 3000) * (ship * (0.5 + 0.3 * np.sin(2 * np.pi * tt / 3.7)))[:, None] * 0.5
    rov = np.clip((tt - ROV[0]) / 1.0, 0, 1) * np.clip((ROV[1] - tt) / 1.0, 0, 1)
    motor = (np.sin(2 * np.pi * 96 * tt) * 0.5 + np.sin(2 * np.pi * 192 * tt + 0.3) * 0.2)[:, None] * (rov * 0.05)[:, None]
    shallow = shallow + wind + motor
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
    t0 = SHIP[0] + 0.5
    while t0 < SHIP[1] - 0.5:  # madera del barco que cruje y olas contra el casco
        n = int(0.5 * SR)
        t2 = np.arange(n) / SR
        f = rng.uniform(140, 260)
        creak = np.sin(2 * np.pi * f * t2 * (1 + 0.3 * t2)) * np.exp(-t2 * 6) * S.bp(rng.standard_normal(n), 300, 2000) * 0.25
        add(creak, t0, rng.uniform(-0.5, 0.5))
        n2 = int(1.8 * SR)
        t3 = np.arange(n2) / SR
        add(S.bp(rng.standard_normal(n2), 200, 2500) * np.sin(np.pi * t3 / 1.8) ** 2 * 0.18, t0 + 0.6)
        t0 += rng.uniform(1.6, 2.8)
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
    for c in [15.6, 30.6, 63.8, 81.5, 120.6, 126.9, 140.7]:
        for j, m in enumerate([84, 88, 91]):
            n = int(1.6 * SR)
            tt = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * tt) * np.exp(-tt * 2.8) * 0.04
            S.place(x[:, 0], bell, c + j * 0.08)
            S.place(x[:, 1], bell, c + j * 0.08 + 0.012)
    # zumbido eléctrico muy suave durante la visualización de campos (38–54 s)
    tt = S.t_axis()
    hum = np.sin(2 * np.pi * 55 * tt) * 0.02 * (np.clip((tt - 105) / 1.5, 0, 1) * np.clip((119 - tt) / 1.5, 0, 1))  # vibración sísmica simbólica
    x[:, 0] += hum
    x[:, 1] += hum
    x = S.reverb(x, 3.0, 0.4, seed=135)
    S.save('descubrimiento.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c, g in [(HOOK_STRIKE, 0.7), (HOOK_CUT, 0.35), (STRIKE_SLOW, 0.35)]:
        hit = S.thump(42, 2.0, g)
        n = int(1.4 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 2500, 8000) * np.exp(-st * 3.0) * 0.06
        S.place(x[:, 0], hit, c)
        S.place(x[:, 1], hit, c)
        S.place(x[:, 0], sh, c)
        S.place(x[:, 1], sh, c + 0.02)
    for c in SCENES:
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
