#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "LA ANGUILA ELÉCTRICA: EL ANIMAL QUE GENERA 860 VOLTIOS" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Reutiliza score.py sin modificarlo. Pistas en public/audio/ep19-anguila-electrica/:
  musica.m4a        música de río amazónico: misterio, asombro científico, caza, cierre
  ambiente-rio.m4a  rumor del río, corriente, burbujas, gotas e insectos lejanos en superficie
  agua.m4a          movimiento del agua: nado, impulsos, la toma de aire, el pez grande
  pulsos.m4a        pulsos eléctricos ESTILIZADOS (recurso narrativo): señales débiles y descargas
  tension.m4a       tensión de acecho y de la amenaza
  ataque.m4a        golpe de la descarga, contracción de la presa, succión
  transiciones.m4a  barridos entre escenas, entrada de diagramas, título y final
Tiempos coherentes con src/episodes/ep19-anguila-electrica/data/timeline.ts (EV).
Uso:  python3 tools/audio/score_ep19_anguila.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep19-anguila-electrica')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261124)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
HOOK_SHOCK = 1.8
HOOK_TEXT = 3.0
HOOK_CAPTURE = 9.0
ELECTROCYTES = 38.4
GAUGE = (46.0, 51.5)
LOCATE = [(0.9, 1.8), (63.0, 71.5), (78.5, 90.0)]
PING = (82.0, 96.0)
ATTACK = 96.5
CAPTURE = 99.6
RETREAT = 110.2
SURFACE = 129.2
THREAT = (135.5, 142.5)
DEFENSE = 142.5
POWER = 150.5
END_TEXT = 176.4
FADE = 179.4
SWIM_FAST = [(21.5, 24.5), (7.8, 9.6), (98.0, 100.5)]


def window(tt, ranges, ramp=0.6):
    w = np.zeros_like(tt)
    for a, b in ranges:
        w = np.maximum(w, np.clip((tt - a) / ramp, 0, 1) * np.clip((b - tt) / ramp, 0, 1))
    return w


def add(x, sig, t0, p=0.0):
    st = S.pan(sig, p)
    S.place(x[:, 0], st[:, 0], t0)
    S.place(x[:, 1], st[:, 1], t0)


def bell(f, dur, gain, decay=3.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt)) * np.exp(-tt * decay) * gain


def zap(dur, f0, gain):
    """Pulso eléctrico estilizado: tono que barre hacia abajo con zumbido de banda."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 - 0.6 * tt / dur)
    buzz = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.3
    return S.bp(buzz, 300, 5000) * np.exp(-tt * 6 / dur) * gain


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [28, 35, 40, 43, 47], 700),       # Em — gancho
        (15.0, 30.5, [33, 40, 45, 48, 52], 1100),     # Am — revelación
        (30.0, 45.5, [36, 43, 48, 52, 55, 59], 1400),  # Cmaj7 — batería viviente
        (45.0, 60.5, [31, 38, 43, 47, 50, 55], 1600),  # G — 860 V
        (60.0, 75.5, [28, 35, 40, 43, 46], 650),      # Em(b6) — sexto sentido
        (75.0, 90.5, [29, 36, 41, 44, 47], 600),      # Fm(maj7) — presa escondida
        (90.0, 105.5, [28, 35, 40, 43, 46], 700),     # Em(b6) — el ataque
        (105.0, 120.5, [33, 40, 45, 48, 55], 1200),   # Am(add9) — movimiento
        (120.0, 135.5, [36, 43, 48, 52, 57], 1500),   # C6 — respirar aire
        (135.0, 150.5, [29, 36, 41, 45, 48], 800),    # F — defensa
        (150.0, 165.5, [31, 38, 43, 47, 50, 57], 1400),  # G(add9) — el secreto
        (165.0, 180.0, [28, 35, 40, 43, 47, 54], 1000),  # Em(add9) — final
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.8, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.85 if j == 0 else 0.3)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # marimba de selva (patrón suave) en las escenas de asombro
    for a, b, base, dt in [(15.5, 29.5, 64, 0.5), (30.5, 44.5, 67, 0.4), (105.5, 119.5, 64, 0.45), (120.5, 134.5, 67, 0.5), (150.5, 164.5, 67, 0.45)]:
        tb, k = a, 0
        steps = [0, 7, 3, 10, 7, 12, 3, 7]
        while tb < b:
            tone = bell(S.midi(base + steps[k % 8]), 0.9, 0.035, 6)
            st = S.pan(tone, 0.5 * np.sin(k * 0.9))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.48)
    tt = S.t_axis()
    master = np.interp(tt, [0, 1.0, 2.0, 15, 60, 75, 96, 98, 105, 165, 176, 177, 179.3, 180], [0.5, 0.9, 0.75, 0.95, 0.95, 0.8, 0.7, 0.5, 0.95, 1.0, 0.9, 1.15, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente del río…')
    tt = S.t_axis()
    river = S.lp(rng.standard_normal((N, 2)), 260) * 1.6
    current = S.bp(rng.standard_normal((N, 2)), 150, 900) * (0.4 + 0.25 * np.sin(2 * np.pi * tt / 6.5))[:, None]
    x = river * 0.55 + current * 0.35
    surf = window(tt, [(124.0, 134.0)], 1.5)
    air = S.bp(rng.standard_normal((N, 2)), 1500, 6000) * 0.08 * surf[:, None]  # aire e insectos sobre la superficie
    x += air
    t0 = 0.8
    while t0 < 179.5:
        n = int(0.12 * SR)
        t2 = np.arange(n) / SR
        b = np.sin(2 * np.pi * rng.uniform(350, 1000) * (1 + 2.0 * t2) * t2) * np.exp(-t2 * 30) * 0.03
        add(x, b, t0, rng.uniform(-0.8, 0.8))
        if surf[min(N - 1, int(t0 * SR))] > 0.5 and rng.random() < 0.5:  # cigarras lejanas
            m = int(0.6 * SR)
            t3 = np.arange(m) / SR
            add(x, np.sin(2 * np.pi * 4200 * t3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * t3))) * np.sin(np.pi * t3 / 0.6) * 0.01, t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(0.9, 2.6)
    x = S.reverb(x, 3.0, 0.38, seed=191)
    fade = np.interp(tt, [0, 0.8, FADE, 180], [0.3, 1, 1, 0])
    S.save('ambiente-rio.m4a', x * fade[:, None], -7.0)


def make_water():
    print('Agua…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    swim = S.lp(rng.standard_normal((N, 2)), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.2 * tt))[:, None] ** 2
    x += swim * 0.12
    fast = window(tt, SWIM_FAST, 0.4)
    x += S.bp(rng.standard_normal((N, 2)), 200, 1600) * 0.18 * fast[:, None]
    # retroceso: ondas de la aleta invertidas (textura distinta)
    rev = window(tt, [(RETREAT, 113.4)], 0.4)
    x += S.bp(rng.standard_normal((N, 2)), 600, 2400) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tt))[:, None] * 0.08 * rev[:, None]
    # toma de aire: rotura de la superficie, trago y burbujas
    n = int(0.8 * SR)
    t2 = np.arange(n) / SR
    add(x, S.bp(rng.standard_normal(n), 400, 5000) * np.exp(-t2 * 5) * 0.4, SURFACE - 0.1)
    add(x, np.sin(2 * np.pi * 140 * t2 * (1 - 0.5 * t2)) * np.exp(-t2 * 9) * 0.35, SURFACE + 0.2)
    for k in range(14):
        add(x, S.bubble(rng.uniform(400, 1200), 0.07) * 0.12, 130.4 + k * 0.17, rng.uniform(-0.5, 0.5))
    # el pez grande que se acerca y huye
    for c, d in [(THREAT[0], 6.5), (DEFENSE + 0.4, 4.0)]:
        m = int(d * SR)
        t3 = np.arange(m) / SR
        add(x, S.lp(rng.standard_normal(m), 350) * np.sin(np.pi * t3 / d) ** 2 * 0.3, c, 0.4)
    x = S.reverb(x, 1.8, 0.28, seed=193)
    S.save('agua.m4a', x, -3.0)


def make_pulses():
    print('Pulsos eléctricos (estilizados)…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    # señales débiles de electrolocalización: zumbido tenue con micro-pulsos regulares
    loc = window(tt, LOCATE, 0.5)
    x += (np.sin(2 * np.pi * 330 * tt) * 0.012 * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * tt))))[:, None] * loc[:, None]
    c = PING[0]
    while c < PING[1]:  # "pings" hacia la presa escondida
        add(x, bell(1760, 0.4, 0.05, 9), c)
        c += 1.2
    # ráfagas de alto voltaje
    for c, d in [(HOOK_SHOCK, 0.8), (GAUGE[1], 1.0), (ATTACK, 0.75), (DEFENSE, 1.0)]:
        k = 0
        while k * (1 / 16) < d:
            add(x, zap(0.09, rng.uniform(900, 1500), 0.22), c + k / 16, rng.uniform(-0.4, 0.4))
            k += 1
    # activación de electrocitos (escenas 3, 4 y 11): tic-tac ascendente coordinado
    for a, b in [(ELECTROCYTES, 45.0), (POWER, 165.0)]:
        c = a
        while c < b:
            for j in range(8):
                add(x, bell(800 + j * 120, 0.12, 0.03, 30), c + j * 0.1)
            c += 2.2
    # medidor subiendo
    n = int((GAUGE[1] - GAUGE[0]) * SR)
    t2 = np.arange(n) / SR
    f = 200 + 1200 * (t2 / t2[-1]) ** 1.4
    add(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.05 * (t2 / t2[-1]), GAUGE[0])
    x = S.reverb(x, 1.6, 0.25, seed=195)
    S.save('pulsos.m4a', x, -3.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for start, hit in [(0.0, HOOK_SHOCK), (85.0, ATTACK), (THREAT[0], DEFENSE)]:
        w = np.clip((tt - start) / 1.2, 0, 1) * (tt < hit)
        x += (np.sin(2 * np.pi * 44 * tt) * 0.06 + S.bp(rng.standard_normal(N), 120, 500) * 0.03)[:, None] * w[:, None]
        tb, gap = start + 0.3, 0.9
        while tb < hit - 0.08:
            add(x, S.thump(52, 0.5, 0.18), tb)
            tb += gap
            gap = max(0.25, gap * 0.85)
    # señales de revelación (texto 860 V, medidor al máximo, final)
    for c, base in [(HOOK_TEXT, 76), (GAUGE[1], 79), (END_TEXT, 74)]:
        for j, m in enumerate([0, 7, 12, 16]):
            add(x, bell(S.midi(base + m), 2.0, 0.045, 2.4), c + j * 0.08, -0.3 + j * 0.2)
    x = S.reverb(x, 3.0, 0.4, seed=197)
    S.save('tension.m4a', x, -3.0)


def make_attack():
    print('Ataque…')
    x = np.zeros((N, 2))
    for c, g in [(HOOK_SHOCK, 0.8), (ATTACK, 1.0), (DEFENSE, 0.8)]:
        add(x, S.thump(46, 1.4, 0.6 * g), c)
        n = int(0.5 * SR)
        t2 = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t2 * 8) * 0.12 * g, c + 0.02)
    # contracción de la presa (aleteo rígido, vibración)
    for a, b in [(HOOK_SHOCK + 0.1, 4.5), (ATTACK + 0.1, 99.2)]:
        c = a
        while c < b:
            add(x, S.swish(0.06, 800, 3000, 0.08), c, rng.uniform(-0.3, 0.3))
            c += 0.07
    # succión al capturar
    for c in [HOOK_CAPTURE, CAPTURE]:
        n = int(0.4 * SR)
        t2 = np.arange(n) / SR
        add(x, S.lp(rng.standard_normal(n), 900) * np.sin(np.pi * t2 / 0.4) * 0.35 + np.sin(2 * np.pi * 110 * t2) * np.exp(-t2 * 10) * 0.3, c - 0.3)
    x = S.reverb(x, 1.4, 0.25, seed=199)
    S.save('ataque.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 160, 1100, 0.15), c - 0.55)
    for c in [32.5, 38.0, 45.4, 150.6]:  # entrada de diagramas
        add(x, S.whoosh(0.7, 900, 3000, 0.08), c - 0.3)
    add(x, S.thump(40, 1.6, 0.4), 0.05)
    add(x, S.thump(44, 2.0, 0.4), HOOK_TEXT)
    add(x, S.thump(42, 2.6, 0.45), END_TEXT)
    x = S.reverb(x, 3.0, 0.4, seed=201)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_water()
    make_pulses()
    make_tension()
    make_attack()
    make_transitions()
