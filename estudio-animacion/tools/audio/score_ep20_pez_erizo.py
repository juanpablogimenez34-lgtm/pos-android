#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL PEZ QUE SE CONVIERTE EN UN GLOBO DE ESPINAS" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Reutiliza score.py sin modificarlo. Pistas en public/audio/ep20-pez-erizo/ (con la voz, 9):
  musica.m4a          música ambiental cinematográfica de arrecife (hasta el cierre)
  ambiente.m4a        ambiente submarino: rumor, corriente suave, burbujas, chasquidos de arrecife
  agua.m4a            movimiento del agua: nado, depredador, expulsión del agua al desinflarse
  aletas.m4a          aleteo de pectorales (roce suave y rítmico mientras nada)
  suspenso.m4a        tensión ante el depredador y señales de revelación
  transformacion.m4a  inflado: bocanadas de agua graves (bombeo), estiramiento de la piel y espinas que
                      se levantan; desinflado: agua que sale y espinas que se pliegan (sin efectos de globo)
  transiciones.m4a    barridos entre escenas, entrada de diagramas
  cierre.m4a          cierre musical (165–180 s)
Tiempos coherentes con src/episodes/ep20-pez-erizo/data/timeline.ts (EV).
Uso:  python3 tools/audio/score_ep20_pez_erizo.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep20-pez-erizo')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261125)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
INFLATES = [(0.8, 4.0, 1.0), (35.0, 40.0, 0.35), (50.0, 57.0, 0.8), (64.0, 72.5, 0.9), (83.0, 86.4, 1.0), (94.0, 100.0, 0.85)]
DEFLATES = [(41.5, 44.6, 0.35), (115.0, 128.0, 1.0)]
PRED = [(0.0, 11.0), (75.0, 90.5), (105.0, 113.0)]
SWIM = [(15.0, 30.0), (88.0, 94.0), (129.0, 150.0), (160.0, 180.0)]
HOOK_TEXT = 3.0
DIAGRAMS = [42.0, 45.4, 100.2, 155.6]
SNAIL = 147.5
END_TEXT = 176.2
FADE = 179.4


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


def make_music():
    print('Música…')
    L = np.zeros(N)
    R = np.zeros(N)
    chords = [
        (0.0, 15.5, [33, 40, 45, 48, 52], 900),      # Am — gancho
        (15.0, 30.5, [36, 43, 48, 52, 55, 59], 1500),  # Cmaj7 — conoce al pez
        (30.0, 45.5, [41, 48, 53, 57, 60], 1300),    # F — el primer secreto
        (45.0, 60.5, [38, 45, 50, 53, 57], 1200),    # Dm — dentro del cuerpo
        (60.0, 75.5, [43, 50, 55, 59, 62], 1400),    # G — la armadura
        (75.0, 90.5, [33, 40, 45, 48, 51], 700),     # Am(b6) — el depredador
        (90.0, 105.5, [36, 43, 48, 52, 57], 1500),   # C6 — el cambio de tamaño
        (105.0, 120.5, [41, 48, 53, 57, 64], 1200),  # Fmaj7 — energía
        (120.0, 135.5, [43, 50, 55, 59, 62, 66], 1500),  # Gmaj7 — regresar
        (135.0, 150.5, [36, 43, 48, 52, 55], 1500),  # C — su vida
        (150.0, 166.0, [41, 48, 53, 57, 60, 67], 1400),  # F(add9) — más que una bola
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.8, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.85 if j == 0 else 0.3)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for a, b, base, dt in [(15.5, 29.5, 72, 0.45), (90.5, 104.5, 74, 0.4), (120.5, 149.5, 72, 0.5), (150.5, 164.5, 76, 0.45)]:
        tb, k = a, 0
        steps = [0, 4, 7, 11, 12, 11, 7, 4]
        while tb < b:
            tone = bell(S.midi(base + steps[k % 8]), 1.2, 0.03, 4.5)
            st = S.pan(tone, 0.5 * np.sin(k * 0.8))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.48)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 15, 75, 86, 90, 160, 166, 168, 180], [0.85, 0.95, 0.95, 0.8, 0.7, 0.95, 1.0, 0.5, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_closing():
    print('Cierre musical…')
    L = np.zeros(N)
    R = np.zeros(N)
    for a, b, notes, bright in [(165.0, 172.5, [36, 43, 48, 52, 55, 60], 1600), (172.0, 180.0, [41, 48, 53, 57, 60, 64], 1800)]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.8 if j == 0 else 0.3)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    melody = [(165.6, 76), (166.4, 79), (167.2, 81), (168.4, 79), (169.6, 84), (171.2, 83), (172.4, 81), (173.6, 79), (175.0, 77), (176.2, 76), (177.4, 72)]
    for c, m in melody:
        tone = bell(S.midi(m), 2.2, 0.06, 2.2)
        S.place(L, tone, c)
        S.place(R, tone, c + 0.01)
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.5)
    tt = S.t_axis()
    fade = np.interp(tt, [0, 165, 166, 178.8, 180], [0, 0, 1, 1, 0])
    S.save('cierre.m4a', x * fade[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    deep = S.lp(rng.standard_normal((N, 2)), 240) * 1.6
    current = S.bp(rng.standard_normal((N, 2)), 150, 900) * (0.4 + 0.25 * np.sin(2 * np.pi * tt / 7.5))[:, None]
    x = deep * 0.5 + current * 0.35
    t0 = 0.5
    while t0 < 179.5:
        add(x, S.bubble(rng.uniform(400, 1300), rng.uniform(0.03, 0.08)) * rng.uniform(0.03, 0.1), t0, rng.uniform(-0.8, 0.8))
        if rng.random() < 0.5:  # chasquidos del arrecife (crustáceos lejanos)
            m = int(0.01 * SR)
            add(x, rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 600) * 0.05, t0 + rng.uniform(0, 0.4), rng.uniform(-0.9, 0.9))
        t0 += rng.exponential(0.6)
    x = S.reverb(x, 3.0, 0.4, seed=211)
    fade = np.interp(tt, [0, 0.4, FADE, 180], [0.4, 1, 1, 0])
    S.save('ambiente.m4a', x * fade[:, None], -7.0)


def make_water():
    print('Agua…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    swim = window(tt, SWIM, 0.8)
    x += S.lp(rng.standard_normal((N, 2)), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.1 * tt))[:, None] ** 2 * 0.1 * swim[:, None]
    for a, b in PRED:  # el depredador desplaza mucha agua
        d = b - a
        n = int(d * SR)
        t2 = np.arange(n) / SR
        add(x, S.lp(rng.standard_normal(n), 300) * np.sin(np.pi * t2 / d) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 1.3 * t2)) * 0.35, a, 0.3)
    add(x, S.whoosh(1.0, 120, 800, 0.35), 1.6)  # embestida del gancho
    # expulsión del agua al desinflarse (salida continua por la boca)
    for a, b, g in DEFLATES:
        d = b - a
        n = int(d * SR)
        t2 = np.arange(n) / SR
        add(x, S.bp(rng.standard_normal(n), 300, 2200) * np.sin(np.pi * t2 / d) * 0.18 * g, a, 0.2)
        for k in range(int(10 * g * d / 4)):
            add(x, S.bubble(rng.uniform(300, 900), 0.08) * 0.1, a + rng.uniform(0, d), rng.uniform(-0.4, 0.6))
    x = S.reverb(x, 1.8, 0.28, seed=213)
    S.save('agua.m4a', x, -3.0)


def make_fins():
    print('Aletas…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    swim = window(tt, SWIM, 0.8)
    c = 0.2
    while c < 179.5:
        g = swim[min(N - 1, int(c * SR))]
        if g > 0.05:
            add(x, S.swish(0.18, 600, 2500, 0.08 * g), c, rng.uniform(-0.3, 0.3))
        c += 1 / 2.2
    x = S.reverb(x, 1.2, 0.2, seed=215)
    S.save('aletas.m4a', x, -6.0)


def make_suspense():
    print('Suspenso…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for start, hit in [(0.0, 2.6), (77.0, 86.4)]:
        w = np.clip((tt - start) / 1.0, 0, 1) * (tt < hit)
        x += (np.sin(2 * np.pi * 46 * tt) * 0.06 + S.bp(rng.standard_normal(N), 150, 500) * 0.03)[:, None] * w[:, None]
        tb, gap = start + 0.2, 0.8
        while tb < hit - 0.08:
            add(x, S.thump(52, 0.5, 0.18), tb)
            tb += gap
            gap = max(0.25, gap * 0.85)
    for c, base in [(HOOK_TEXT, 76), (4.0, 81), (72.5, 79), (86.4, 79), (100.2, 76), (END_TEXT, 72)]:
        for j, m in enumerate([0, 7, 12]):
            add(x, bell(S.midi(base + m), 2.0, 0.045, 2.4), c + j * 0.08, -0.3 + j * 0.3)
    x = S.reverb(x, 3.0, 0.4, seed=217)
    S.save('suspenso.m4a', x, -3.0)


def make_transformation():
    print('Transformación…')
    x = np.zeros((N, 2))
    for a, b, g in INFLATES:
        d = b - a
        # bocanadas: tragos graves de agua al ritmo del bombeo (≈2 por segundo), cada vez más llenos
        c = a
        k = 0
        while c < b - 0.1:
            u = (c - a) / d
            n = int(0.22 * SR)
            t2 = np.arange(n) / SR
            f0 = 120 - 50 * u
            gulp = np.sin(2 * np.pi * f0 * t2 * (1 + 0.6 * t2)) * np.exp(-t2 * 14) + S.lp(rng.standard_normal(n), 500) * np.exp(-t2 * 20) * 0.5
            add(x, gulp * 0.3 * g, c, 0.1)
            c += 0.48 if d > 4 else 0.38
            k += 1
        # estiramiento de la piel: rumor grave que crece con el volumen
        n = int(d * SR)
        t2 = np.arange(n) / SR
        swell = S.lp(rng.standard_normal(n), 220) * (t2 / d) ** 1.5 * 0.35 * g
        add(x, swell, a)
        # espinas que se levantan: roce seco creciente (pequeños "tics" de textura)
        m = int(25 * g * d / 3)
        for j in range(m):
            tj = a + d * (0.25 + 0.75 * (j / max(1, m - 1)) ** 0.8)
            q = int(0.03 * SR)
            add(x, S.bp(rng.standard_normal(q), 2500, 7000) * np.exp(-np.arange(q) / SR * 120) * 0.05 * g, tj, rng.uniform(-0.6, 0.6))
    for a, b, g in DEFLATES:
        d = b - a
        m = int(18 * g * d / 6)
        for j in range(m):  # espinas que se pliegan (roces descendentes, más espaciados)
            tj = a + d * (0.4 + 0.6 * j / max(1, m - 1))
            q = int(0.05 * SR)
            add(x, S.bp(rng.standard_normal(q), 1500, 5000) * np.exp(-np.arange(q) / SR * 60) * 0.04 * g, tj, rng.uniform(-0.6, 0.6))
    # caracol: el pico tritura (chasquidos duros)
    for k in range(5):
        q = int(0.06 * SR)
        add(x, S.bp(rng.standard_normal(q), 1500, 6000) * np.exp(-np.arange(q) / SR * 70) * 0.25, SNAIL + k * 0.35)
    x = S.reverb(x, 1.6, 0.25, seed=219)
    S.save('transformacion.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 160, 1100, 0.14), c - 0.55)
    for c in DIAGRAMS:
        add(x, S.whoosh(0.7, 900, 3000, 0.08), c - 0.3)
    add(x, S.thump(42, 1.6, 0.4), 0.05)  # impacto inicial
    add(x, S.thump(44, 2.0, 0.35), HOOK_TEXT)
    x = S.reverb(x, 3.0, 0.4, seed=221)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_closing()
    make_ambience()
    make_water()
    make_fins()
    make_suspense()
    make_transformation()
    make_transitions()
