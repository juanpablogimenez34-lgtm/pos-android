#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 05 (venus atrapamoscas), por síntesis.

Reutiliza las herramientas de score.py sin modificar episodios anteriores.
Pistas en public/audio/ep05/:
  musica.m4a        suspenso moderado: misterio, curiosidad, acecho, cierre, digestión, raíces, final
  ambiente.m4a      humedal: brisa suave, hojas, insectos lejanos y aves de la sabana
  movimiento.m4a    zumbido de la mosca (vuelo, huida, presa retenida, segunda mosca), gota, roce del cierre
  tension.m4a       pulso del acecho (58–79 s), silencio en el cierre, latido grave mientras está atrapada
  transiciones.m4a  barridos, destellos científicos, repetición, salto de días, golpes de título y final
El cierre de la trampa es un roce vegetal breve, NO un mordisco de monstruo.
Tiempos coherentes con src/episodes/ep05-planta-carnivora/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep05')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261205)
S.rng = rng

FLY_IN, HOVER, TOUCHDOWN = 20.0, 29.0, 31.6
TOUCH1, TOUCH2, SNAP = 60.6, 78.9, 79.25
REPLAY = (81.0, 86.0)
STRUGGLES = [88.4, 91.0, 93.9, 97.4]
SEAL, DAYS, REOPEN = 103.0, 110.4, 116.4
SECOND_FLY = (165.0, 173.5)
DROP = 10.05
TITLE_HIT, FINAL_HIT = 15.8, 174.8


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 12.0, [45, 52, 57, 60, 64], 900),     # Am(add9) — misterio
        (11.0, 21.0, [41, 48, 53, 57, 64], 1000),   # Fmaj7
        (20.0, 33.0, [43, 50, 55, 59, 62], 1300),   # G — curiosidad
        (32.0, 46.0, [40, 47, 52, 55, 59], 1200),   # Em7
        (45.0, 58.0, [38, 45, 50, 53, 57], 900),    # Dm(add9) — mecanismo
        (57.0, 70.0, [41, 48, 53, 56], 700),        # Fm — acecho
        (69.0, 79.3, [40, 47, 52, 56], 650),        # E (dominante) — suspense
        (80.2, 96.0, [33, 40, 45, 48], 600),        # Am grave — atrapada
        (95.0, 110.0, [38, 45, 50, 53, 57], 800),   # Dm — digestión
        (109.0, 121.0, [41, 48, 53, 57, 60], 900),  # F — días después
        (120.0, 136.0, [36, 43, 48, 52, 55], 1300), # C — raíces y suelo
        (135.0, 151.0, [43, 50, 55, 59, 62], 1400), # G — dos estrategias
        (150.0, 164.0, [45, 52, 57, 60, 64], 1300), # Am(add9)
        (163.0, 180.0, [41, 48, 53, 57, 60, 67], 1500),  # Fmaj9 — final abierto
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 2.0, 2.8)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.4)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # motivo pulsado suave (tipo marimba) para la naturaleza y la curiosidad
    motif = [69, 72, 76, 74, 72, 69, 67, 69]
    for start, end, root_shift in [(1.0, 19.0, 0), (21.0, 44.0, -2), (121.0, 148.0, 3), (151.0, 172.0, 0)]:
        tb, k = start, 0
        while tb < end:
            m = motif[k % len(motif)] + root_shift
            n = int(1.2 * SR)
            tt = np.arange(n) / SR
            f = S.midi(m)
            tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 18)) * np.exp(-tt * 4.5) * 0.06
            st = S.pan(tone, 0.35 * np.sin(k))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += 0.75 if k % 4 != 3 else 1.5
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 3.8, 0.45)
    tt = S.t_axis()
    # silencio dramático justo en el cierre; música más baja en la repetición
    master = np.interp(tt, [0, 4, 78.6, 79.2, 80.4, 81.0, 86.0, 87.0, 172, 179.8], [0.0, 0.85, 0.85, 0.15, 0.15, 0.45, 0.45, 0.85, 1.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    breeze = S.lp(S.hp(rng.standard_normal((N, 2)), 150), 900)
    gust = 0.35 + 0.25 * np.clip(np.sin(2 * np.pi * 0.05 * tt) + 0.6 * np.sin(2 * np.pi * 0.13 * tt + 1), 0, None)
    x = breeze * gust[:, None] * 0.45
    # coro tenue de insectos lejanos (pulsos agudos)
    chirp_env = (np.sin(2 * np.pi * 14 * tt) > 0.6).astype(float) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * tt))
    insects = S.bp(rng.standard_normal(N), 4200, 6200) * chirp_env * 0.05
    x[:, 0] += insects
    x[:, 1] += np.roll(insects, int(0.013 * SR))
    # aves lejanas de la sabana (escasas)
    for tb in list(np.arange(0.5, 20.0, 3.1)) + list(np.arange(121.0, 150.0, 4.6)) + list(np.arange(151.0, 179.0, 3.8)):
        n = int(0.35 * SR)
        t2 = np.arange(n) / SR
        f = 2800 + 900 * np.sin(2 * np.pi * 9 * t2) + rng.uniform(-300, 300)
        c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t2 * 9) * 0.03
        st = S.pan(c, rng.uniform(-0.8, 0.8))
        o = tb + rng.uniform(0, 1.0)
        S.place(x[:, 0], st[:, 0], o)
        S.place(x[:, 1], st[:, 1], o)
    x = S.reverb(x, 2.6, 0.3, seed=51)
    S.save('ambiente.m4a', x, -8.0)


def buzz(dur, f0=195.0, gain=0.3, muffle=None, wobble=1.0):
    """Zumbido de mosca: diente de sierra a ~200 Hz con armónicos y vibrato irregular."""
    n = int(dur * SR)
    t2 = np.arange(n) / SR
    drift = np.cumsum(rng.standard_normal(n)) / np.sqrt(SR) * 18 * wobble
    f = f0 + 12 * np.sin(2 * np.pi * 3.1 * t2) * wobble + drift
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1.0) - 1
    sig = S.bp(saw, 150, 3200) + 0.3 * S.bp(rng.standard_normal(n), 1500, 5000)
    if muffle:
        sig = S.lp(sig, muffle)
    return sig * gain


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0):
        st = S.pan(sig, p)
        S.place(x[:, 0], st[:, 0], t0)
        S.place(x[:, 1], st[:, 1], t0)

    # vuelo de entrada: se acerca (sube el volumen) y cruza de derecha a izquierda
    a, b = FLY_IN, TOUCHDOWN + 0.2
    n = int((b - a) * SR)
    t2 = np.arange(n) / SR
    z = buzz(b - a, 198, 1.0)
    env = np.interp(t2 + a, [a, a + 4.5, HOVER, 30.4, TOUCHDOWN, b], [0.03, 0.32, 0.38, 0.34, 0.2, 0.0])
    pan = np.interp(t2 + a, [a, 25, 29, b], [0.6, 0.0, -0.4, -0.4])
    S.place(x[:, 0], z * env * np.sqrt((1 - pan) / 2), a)
    S.place(x[:, 1], z * env * np.sqrt((1 + pan) / 2), a)
    # gota que cae sobre la hoja (la araña reacciona)
    n = int(0.25 * SR)
    t3 = np.arange(n) / SR
    plink = np.sin(2 * np.pi * (1400 - 600 * t3 / 0.25) * t3) * np.exp(-t3 * 30) * 0.12
    add(plink, DROP, -0.2)
    # roce del cierre: breve "fwip" vegetal (sin mordisco)
    for t0, g in [(SNAP, 0.28), (REPLAY[0] + (SNAP - 79.0) / 0.1, 0.18)]:
        n = int(0.5 * SR)
        t4 = np.arange(n) / SR
        sw = S.bp(rng.standard_normal(n), 600, 4200) * np.exp(-t4 * 9) * g
        add(sw, t0, 0.0)
    # intento de huida: zumbido agudo e irregular
    add(buzz(1.7, 225, 0.32, wobble=2.0) * S.env_adsr(int(1.7 * SR), 0.03, 0.4), SNAP + 0.02, -0.1)
    # repetición en cámara lenta: zumbido grave y estirado
    a, b = REPLAY
    add(buzz(b - a - 0.3, 70, 0.2, wobble=0.4) * S.env_adsr(int((b - a - 0.3) * SR), 1.5, 1.0), a + 0.15, 0.0)
    # presa retenida: ráfagas apagadas (dentro de la trampa)
    for ts in STRUGGLES:
        add(buzz(0.8, 210, 0.22, muffle=900, wobble=1.6) * S.env_adsr(int(0.8 * SR), 0.05, 0.3), ts, 0.05)
    # segunda mosca que pasa a lo lejos
    a, b = SECOND_FLY
    n = int((b - a) * SR)
    t5 = np.arange(n) / SR
    z = buzz(b - a, 205, 1.0)
    env = np.sin(np.pi * t5 / (b - a)) ** 2 * 0.12
    pan = np.interp(t5, [0, b - a], [0.8, -0.8])
    S.place(x[:, 0], z * env * np.sqrt((1 - pan) / 2), a)
    S.place(x[:, 1], z * env * np.sqrt((1 + pan) / 2), a)
    # reapertura lenta: crujido suave
    n = int(2.5 * SR)
    t6 = np.arange(n) / SR
    add(S.bp(rng.standard_normal(n), 300, 1800) * np.sin(np.pi * t6 / 2.5) * 0.06, REOPEN + 0.3)
    x = S.reverb(x, 1.6, 0.22, seed=53)
    S.save('movimiento.m4a', x, -3.0)


def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    # pulso del acecho que se acelera hacia el segundo estímulo
    t0, gap = 57.8, 0.9
    while t0 < TOUCH2 + 0.25:
        g = 0.18 + 0.4 * (t0 - 57.8) / (TOUCH2 - 57.8)
        S.place(x[:, 0], S.thump(52, 0.5, g), t0)
        S.place(x[:, 1], S.thump(52, 0.5, g), t0)
        t0 += gap
        gap = max(0.38, gap * 0.985)
    # tic agudo en cada estímulo de los pelos sensitivos (destello eléctrico)
    for ts in [TOUCH1, TOUCH2] + STRUGGLES:
        n = int(0.4 * SR)
        t2 = np.arange(n) / SR
        tick = np.sin(2 * np.pi * 1760 * t2) * np.exp(-t2 * 22) * 0.12
        S.place(x[:, 0], tick, ts + 0.05)
        S.place(x[:, 1], tick, ts + 0.07)
    # latido grave mientras está atrapada (86–102)
    t0 = 86.4
    while t0 < 102.0:
        S.place(x[:, 0], S.thump(44, 0.6, 0.35), t0)
        S.place(x[:, 1], S.thump(44, 0.6, 0.35), t0)
        S.place(x[:, 0], S.thump(44, 0.5, 0.2), t0 + 0.32)
        S.place(x[:, 1], S.thump(44, 0.5, 0.2), t0 + 0.32)
        t0 += 1.6
    x = S.reverb(x, 2.4, 0.3, seed=55)
    S.save('tension.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in [20.0, 45.4, 120.6, 150.0]:
        w = S.whoosh(1.0, 220, 1500, 0.3)
        S.place(x[:, 0], w, c - 0.5)
        S.place(x[:, 1], w, c - 0.5)
    # destellos "científicos" (campanillas suaves) al entrar en las visualizaciones
    for ts in [64.0, 103.2, 128.4, 137.4]:
        for j, m in enumerate([84, 88, 91]):
            n = int(1.6 * SR)
            t2 = np.arange(n) / SR
            bell = np.sin(2 * np.pi * S.midi(m) * t2) * np.exp(-t2 * 3) * 0.05
            S.place(x[:, 0], bell, ts + j * 0.09)
            S.place(x[:, 1], bell, ts + j * 0.09 + 0.01)
    # repetición: efecto de rebobinado (barrido inverso) y regreso
    w = S.whoosh(0.8, 2400, 300, 0.35)
    S.place(x[:, 0], w, REPLAY[0] - 0.4)
    S.place(x[:, 1], w, REPLAY[0] - 0.4)
    w = S.whoosh(0.7, 300, 2000, 0.3)
    S.place(x[:, 0], w, REPLAY[1] - 0.35)
    S.place(x[:, 1], w, REPLAY[1] - 0.35)
    # días después: cuatro notas, una por ciclo de día y noche
    for j in range(4):
        n = int(1.4 * SR)
        t2 = np.arange(n) / SR
        bell = np.sin(2 * np.pi * S.midi(76 - j * 3) * t2) * np.exp(-t2 * 2.5) * 0.07
        S.place(x[:, 0], bell, DAYS + j * 1.5)
        S.place(x[:, 1], bell, DAYS + j * 1.5 + 0.01)
    for ti, g in [(TITLE_HIT, 0.75), (FINAL_HIT, 0.7)]:
        hit = S.thump(46, 2.0, g)
        n = int(3 * SR)
        st = np.arange(n) / SR
        sh = S.bp(rng.standard_normal(n), 3000, 9000) * np.exp(-st * 1.4) * 0.08
        S.place(x[:, 0], hit, ti)
        S.place(x[:, 1], hit, ti)
        S.place(x[:, 0], sh, ti)
        S.place(x[:, 1], sh, ti + 0.02)
    x = S.reverb(x, 3.2, 0.4, seed=57)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
