#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «Batallas de la naturaleza · Hormiga negra vs. hormiga roja» (180 s).
Síntesis propia, sin muestras de terceros; reutiliza score.py sin modificarlo. Los sonidos de insectos están
AMPLIFICADOS como recurso cinematográfico (sin rugidos ni sonidos de monstruo). Pistas en public/audio/hormigas/:
  musica.m4a            misterio (E1) · descubrimiento (E2–E3) · tensión (E4) · acción (E5–E6) · majestuosa (E7)
  ambiente-natural.m4a  aire del microbosque, rumor lejano · viento-hojas.m4a ráfagas y roce de hojas
  insectos.m4a          grillos y zumbidos lejanos · pasos.m4a pisadas sutiles de las patas (primeros planos)
  tierra.m4a            granos, serrín, túneles, rumor de la colonia · movimiento.m4a pasadas, giros y contacto
  tension.m4a           drones de suspenso · transiciones.m4a cambios de escena y barridos
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/hormigas')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
D = 180.0
N = int(SR * D)
rng = np.random.default_rng(20261127)
S.rng = rng
tt = np.arange(N) / SR
SCENES = [0, 20, 45, 70, 95, 120, 150]
SLOW = (108.0, 110.5)
CONTACT = 108.0 + (108.6 - 108.0) / 0.45  # tiempo real del contacto (cámara lenta 0,45×)


def add(x, sig, t0, g=1.0, p=0.0):
    st = S.pan(sig, p) if sig.ndim == 1 else sig
    S.place(x[:, 0], st[:, 0], t0, g)
    S.place(x[:, 1], st[:, 1], t0, g)


def click(f, dur, g):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * ts) * 0.6 + S.hp(rng.standard_normal(n), 1500) * 0.4) * np.exp(-ts / (dur / 5)) * g


def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    chords = [  # misterio · descubrimiento · tensión · acción · majestuosa
        (0, 10.2, [38, 45, 50, 53], 800, 0.55), (10, 20.2, [36, 43, 48, 51, 55], 900, 0.6),
        (20, 32.2, [41, 48, 53, 57, 60], 1400, 0.6), (32, 45.2, [43, 50, 55, 59, 62], 1500, 0.62),
        (45, 57.2, [40, 47, 52, 55, 59], 1300, 0.62), (57, 70.2, [38, 45, 50, 54, 57], 1400, 0.66),
        (70, 82.2, [33, 40, 45, 48], 900, 0.6), (82, 95.2, [34, 41, 46, 49, 53], 1000, 0.64),
        (95, 108.2, [33, 40, 45, 48, 52], 1500, 0.75), (108, 120.2, [36, 43, 48, 52, 55], 1700, 0.8),
        (120, 135.2, [31, 38, 43, 46, 50], 1500, 0.78), (135, 150.2, [33, 40, 45, 49, 52], 1900, 0.85),
        (150, 165.2, [38, 45, 50, 54, 57, 62], 2200, 0.85), (165, 180, [43, 50, 55, 59, 62, 67], 2400, 0.9),
    ]
    for a, b, notes, br, g in chords:
        n = int((b - a) * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, br) for m in notes) / len(notes) * S.env_adsr(n, 0.6, 0.6) * g, a)
    # pulso: aparece en la tensión y crece en la acción
    for a, b, rate, g in [(70, 95, 1.2, 0.4), (95, 107.8, 2.4, 0.55), (110.6, 120, 1.6, 0.5), (126, 146, 2.8, 0.6), (150, 162, 1.0, 0.35)]:
        t0 = a
        while t0 < b:
            add(x, S.thump(46, 0.4, g + 0.2 * ((t0 - a) / (b - a))), t0)
            t0 += 1 / rate
    # pizzicato de "descubrimiento" (E2–E3) y arpa del final
    for a, b, sc, step, gg in [(2, 19, [62, 65, 69, 72], 0.9, 0.08), (20.5, 69, [65, 69, 72, 74, 77], 0.45, 0.1), (150.5, 178, [66, 69, 71, 74, 78, 81], 0.5, 0.11)]:
        t0, k = a, 0
        while t0 < b:
            n = int(1.4 * SR)
            ts = np.arange(n) / SR
            f = S.midi(sc[(k * 3) % len(sc)])
            add(x, (np.sin(2 * np.pi * f * ts) + 0.3 * np.sin(4 * np.pi * f * ts)) * np.exp(-ts * 3.5), t0, gg, rng.uniform(-0.6, 0.6))
            t0 += step
            k += 1
    # golpe en el contacto, acento al llegar la colonia y acorde final
    for at, notes in [(CONTACT, (33, 45, 52, 57, 64)), (138.2, (31, 43, 50, 55, 62)), (176.6, (43, 55, 62, 67, 71))]:
        n = int(3.4 * SR)
        add(x, sum(S.pad_voice(S.midi(m), n, 2800) for m in notes) / 5 * np.exp(-np.arange(n) / SR * 0.8), at, 0.95)
    x = S.reverb(x, 3.2, 0.34, seed=81)
    S.save('musica.m4a', x * np.interp(tt, [0, 0.4, 178.6, 180], [0.4, 1, 1, 0])[:, None], -4.0)


def make_ambience():
    print('Ambiente natural…')
    w = np.cumsum(rng.standard_normal((N, 2)), axis=0)
    r = S.lp(S.hp(w, 25), 420, 3)
    r /= np.abs(r).max()
    air = S.lp(S.hp(rng.standard_normal((N, 2)), 2000), 7000) * 0.05
    # dentro de los nidos (20–70) el aire se vuelve más sordo
    inside = S.lp(np.interp(tt, [0, 20, 21, 69, 70, 180], [0, 0, 1, 1, 0, 0]), 3)[:, None]
    x = r * (1 - 0.4 * inside) + air * (1 - 0.7 * inside)
    S.save('ambiente-natural.m4a', S.reverb(x, 2.0, 0.3, seed=82), -8.0)


def make_wind():
    print('Viento y hojas…')
    g = S.lp(np.abs(np.cumsum(rng.standard_normal(N)) / np.sqrt(SR * 4)), 0.4)
    g = 0.35 + 0.65 * g / g.max()
    outside = S.lp(np.interp(tt, [0, 19.5, 20.5, 69.5, 70.5, 180], [1, 1, 0.25, 0.25, 1, 1]), 3)
    wind = S.bp(rng.standard_normal((N, 2)), 150, 1400) * (g * outside)[:, None] * 0.5
    x = wind.copy()
    t0 = 0.5
    while t0 < 179:  # roces de hojas
        if outside[int(t0 * SR)] > 0.5:
            n = int(rng.uniform(0.3, 0.9) * SR)
            s = S.bp(rng.standard_normal(n), 2500, 9000) * np.sin(np.pi * np.arange(n) / n) ** 2 * rng.uniform(0.08, 0.2)
            add(x, s, t0, 1, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(2.2)
    S.save('viento-hojas.m4a', S.reverb(x, 1.6, 0.2, seed=83), -8.0)


def make_insects():
    print('Insectos (amplificados, cinematográficos)…')
    x = np.zeros((N, 2))
    t0 = 1.0
    while t0 < 178:  # grillos lejanos: trenes de pulsos a ~4,5 kHz
        if not (20 < t0 < 70):
            f = rng.uniform(4200, 4900)
            for k in range(rng.integers(3, 6)):
                n = int(0.03 * SR)
                ts = np.arange(n) / SR
                add(x, np.sin(2 * np.pi * f * ts) * np.sin(np.pi * ts / 0.03) * 0.05, t0 + k * 0.06, 1, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.8, 2.4)
    for a in [3.0, 31.0, 88.0, 128.0, 158.0]:  # zumbido de un insecto que pasa lejos
        n = int(3.5 * SR)
        ts = np.arange(n) / SR
        f = 210 * (1 + 0.04 * np.sin(2 * np.pi * 0.8 * ts))
        s = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in range(1, 6)) * np.sin(np.pi * ts / 3.5) ** 2 * 0.07
        st = np.stack([s * np.linspace(1, 0.2, n), s * np.linspace(0.2, 1, n)], 1)
        add(x, st, a)
    S.save('insectos.m4a', S.reverb(x, 2.2, 0.35, seed=84), -9.0)


def steps(x, a, b, rate, g, f=2600):
    t0 = a
    while t0 < b:
        add(x, click(f * rng.uniform(0.85, 1.15), 0.025, g * rng.uniform(0.7, 1.0)), t0, 1, rng.uniform(-0.4, 0.4))
        t0 += 1 / rate * rng.uniform(0.9, 1.1)


def make_steps():
    print('Pasos…')
    x = np.zeros((N, 2))
    for a, b, rate, g in [(0, 9.5, 7, 0.1), (9.5, 14.5, 9, 0.08), (21, 27, 8, 0.05), (36, 40, 6, 0.06), (46, 50, 9, 0.04),
                          (61, 66, 6, 0.06), (70, 72.6, 8, 0.08), (95.4, 108, 7, 0.09), (110.5, 119, 11, 0.07), (126, 146, 22, 0.05), (150, 152, 6, 0.07), (162.6, 170, 20, 0.04)]:
        steps(x, a, b, rate, g)
    S.save('pasos.m4a', S.reverb(x, 0.8, 0.15, seed=85), -10.0)


def make_earth():
    print('Tierra…')
    x = np.zeros((N, 2))
    t0 = 20.5  # nido en madera: raspado de mandíbulas y serrín que cae
    while t0 < 45:
        n = int(rng.uniform(0.15, 0.4) * SR)
        s = S.bp(rng.standard_normal(n), 900, 4000) * (np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 18)) ** 3) * 0.12
        add(x, s, t0, 1, rng.uniform(-0.5, 0.5))
        t0 += rng.uniform(0.6, 1.6)
    t0 = 29.5
    while t0 < 35.5:
        add(x, click(rng.uniform(1500, 3500), 0.02, 0.05), t0, 1, rng.uniform(0.0, 0.7))
        t0 += rng.exponential(0.12)
    # túneles del montículo: rumor grave y granos
    rum = S.lp(rng.standard_normal((N, 2)), 120) * S.lp(np.interp(tt, [0, 45, 47, 69, 70, 180], [0, 0, 1, 1, 0, 0]), 2)[:, None] * 0.6
    x += rum
    for a, b in [(46, 70), (103, 105), (108.5, 111), (112, 116), (126, 146)]:
        t0 = a
        while t0 < b:
            add(x, click(rng.uniform(800, 2200), 0.03, 0.05), t0, 1, rng.uniform(-0.7, 0.7))
            t0 += rng.exponential(0.25)
    S.save('tierra.m4a', S.reverb(x, 1.2, 0.2, seed=86), -9.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    for at, g in [(3.0, 0.4), (6.4, 0.6), (12.6, 0.5), (13.9, 0.5), (15.4, 0.4), (98.6, 0.5), (102.8, 0.6), (103.3, 0.7), (105.2, 0.5), (110.6, 0.6), (113, 0.6), (126, 0.7), (162.4, 0.6)]:
        add(x, S.whoosh(1.0, 140, 1600, 0.4 * g), at - 0.45, 1, rng.uniform(-0.5, 0.5))
    # contacto: golpe seco quitinoso, sin efectos violentos
    add(x, click(1200, 0.08, 0.7), CONTACT)
    add(x, S.thump(60, 0.8, 0.8), CONTACT)
    # pulverización de ácido fórmico (siseo suave) en el nido y en el duelo
    for a, d in [(41.4, 3.2), (CONTACT + 0.3, 2.2)]:
        n = int(d * SR)
        add(x, S.bp(rng.standard_normal(n), 3000, 9000) * np.sin(np.pi * np.arange(n) / n) * 0.18, a)
    S.save('movimiento.m4a', S.reverb(x, 1.6, 0.25, seed=87), -6.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    for a, b, f in [(10, 17, 41), (60.8, 69.5, 44), (77.6, 81.5, 39), (96, 112, 41), (120, 146, 37)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        dr = sum(np.sin(2 * np.pi * f * m * ts + rng.random() * 6) / m for m in (1, 1.5, 2, 3.01)) * S.env_adsr(n, 0.9, 0.9)
        add(x, S.lp(dr * (1 + 0.25 * np.sin(2 * np.pi * 3 * ts)), 800) * 0.4 * np.linspace(0.6, 1.2, n), a)
    S.save('tension.m4a', S.reverb(x, 2.6, 0.3, seed=88), -6.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in SCENES[1:]:
        add(x, S.whoosh(1.0, 180, 2200, 0.45), at - 0.6)
        add(x, S.thump(48, 0.9, 0.6), at + 0.05)
    add(x, S.thump(44, 1.2, 0.9), 0.05)
    for at in [23.8, 50.5, 55.6, 87.6, 138.2, 170.4, 176.6]:
        add(x, S.whoosh(0.8, 300, 3000, 0.3), at - 0.4, 1, rng.uniform(-0.4, 0.4))
    S.save('transiciones.m4a', S.reverb(x, 2.0, 0.3, seed=89), -5.0)


if __name__ == '__main__':
    for fn in [make_music, make_ambience, make_wind, make_insects, make_steps, make_earth, make_movement, make_tension, make_transitions]:
        fn()
