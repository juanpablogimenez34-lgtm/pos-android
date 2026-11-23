#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL MIXINO: EL ANIMAL QUE CONVIERTE EL AGUA EN MOCO" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Reutiliza score.py sin modificarlo. Siete pistas en public/audio/ep18-mixino/ (con la voz):
  musica.m4a        música de misterio abisal (re menor), asombro científico y cierre
  ambiente.m4a      rumor del fondo marino, corrientes, crujidos lejanos, burbujas
  movimiento.m4a    deslizamiento sobre el sedimento, natación del pez, mordiscos, sacudidas, raspado
  mucosidad.m4a     expansión gelatinosa: burbujeo viscoso, estiramientos y chasquidos húmedos
  suspenso.m4a      pulsos y zumbidos de tensión antes de cada ataque; señales de revelación
  transiciones.m4a  barridos entre escenas, entrada/salida del microscopio, golpe de título y final
Tiempos coherentes con src/episodes/ep18-mixino/data/timeline.ts (EV).
Uso:  python3 tools/audio/score_ep18_mixino.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep18-mixino')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261123)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
LUNGES = [2.6, 71.4, 168.6]
SLIMES = [2.9, 3.5, 38.6, 71.7, 72.4, 117.4, 168.9, 169.5]
SLIME_SIZE = [1.0, 1.2, 0.35, 1.0, 1.2, 0.5, 1.0, 1.25]
TITLE = 10.0
MICRO = (45.0, 60.0)
UNRAVEL = 48.0
BURSTS = 52.5
PRED_TURN = 66.0
SHAKE = 81.0
ESCAPE = 83.0
KNOT = (93.0, 98.0)
SLIDE = (105.5, 116.5)
FEED = (120.0, 135.0)
NODES = [136.6, 139.4, 142.2, 145.0]
END_TEXT = 177.6
FADE = 179.4
CRAWL = [(15.0, 30.0), (30.0, 45.0), (60.0, 71.4), (83.0, 90.0), (150.0, 165.0), (165.0, 179.0)]
FISH = [(0.0, 9.5), (60.0, 89.5), (165.0, 176.0)]


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
        (0.0, 15.5, [26, 33, 38, 41, 45], 700),      # Dm grave — gancho
        (15.0, 30.5, [29, 36, 41, 45, 48], 900),     # F — la criatura
        (30.0, 45.5, [31, 38, 43, 46, 50], 1000),    # Gm — glándulas
        (45.0, 60.5, [33, 40, 45, 48, 52, 57], 1500),  # Am(add9) — microscopio, asombro
        (60.0, 75.5, [26, 33, 38, 41, 44], 600),     # Dm(b6) — el depredador
        (75.0, 90.5, [34, 41, 46, 50, 53], 800),     # Bb — la defensa
        (90.0, 105.5, [29, 36, 41, 45, 52], 1200),   # Fmaj7 — el nudo
        (105.0, 120.5, [31, 38, 43, 47, 50], 1200),  # G — el nudo se desliza
        (120.0, 135.5, [26, 33, 38, 41, 45], 900),   # Dm — el limpiador
        (135.0, 150.5, [34, 41, 46, 50, 57], 1300),  # Bbmaj7 — linaje antiguo
        (150.0, 165.5, [29, 36, 41, 45, 48, 55], 1300),  # F(add9) — supervivencia
        (165.0, 177.7, [26, 33, 38, 41, 44], 700),   # Dm(b6) — regresa el depredador
        (177.5, 180.0, [26, 33, 38, 42, 45, 50], 1500),  # D mayor — pregunta final
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 2.5) * SR)
        e = S.env_adsr(n, 1.8, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.85 if j == 0 else 0.3)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # celesta de asombro (microscopio, nudo, linaje) y motivo de misterio grave
    for a, b, base, dt in [(45.5, 59.5, 76, 0.35), (93.0, 104.5, 74, 0.5), (136.0, 149.5, 72, 0.6), (150.5, 164.5, 74, 0.7)]:
        tb, k = a, 0
        steps = [0, 3, 7, 10, 12, 10, 7, 3]
        while tb < b:
            tone = bell(S.midi(base + steps[k % 8]), 1.6, 0.028)
            st = S.pan(tone, 0.5 * np.sin(k * 0.7))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.52)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.2, 2.5, 3.0, 15, 60, 70, 72, 90, 165, 168.5, 169, 177.5, 179.3, 180], [0.8, 0.9, 0.9, 0.6, 0.95, 0.95, 0.75, 0.6, 1.0, 1.0, 0.7, 0.6, 1.15, 0.0, 0.0])
    S.save('musica.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente…')
    tt = S.t_axis()
    deep = S.lp(rng.standard_normal((N, 2)), 160) * 2.0
    current = S.bp(rng.standard_normal((N, 2)), 90, 520) * (0.35 + 0.25 * np.sin(2 * np.pi * tt / 8.0))[:, None]
    x = deep * 0.6 + current * 0.35
    micro = window(tt, [MICRO], 0.5)
    x *= (1 - 0.6 * micro)[:, None]  # en el microscopio el ambiente se aleja
    hiss = S.bp(rng.standard_normal((N, 2)), 2000, 6000) * 0.02 * micro[:, None]
    x += hiss
    t0 = 1.0
    while t0 < 179.5:
        n = int(0.12 * SR)
        t2 = np.arange(n) / SR
        b = np.sin(2 * np.pi * rng.uniform(300, 900) * (1 + 2.0 * t2) * t2) * np.exp(-t2 * 30) * 0.03
        add(x, b, t0, rng.uniform(-0.8, 0.8))
        if rng.random() < 0.12:  # crujido lejano de roca
            m = int(0.6 * SR)
            t3 = np.arange(m) / SR
            add(x, S.bp(rng.standard_normal(m), 80, 400) * np.exp(-t3 * 5) * 0.12, t0 + 0.4, rng.uniform(-0.6, 0.6))
        t0 += rng.uniform(1.0, 3.2)
    x = S.reverb(x, 3.4, 0.42, seed=181)
    fade = np.interp(tt, [0, 0.3, FADE, 180], [0, 1, 1, 0])
    S.save('ambiente.m4a', x * fade[:, None], -7.0)


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    # deslizamiento del cuerpo sobre el sedimento (roce suave modulado por la ondulación)
    crawl = window(tt, CRAWL, 0.8)
    slide = S.bp(rng.standard_normal((N, 2)), 500, 3000) * (0.4 + 0.6 * np.sin(2 * np.pi * 1.2 * tt) ** 2)[:, None]
    x += slide * 0.05 * crawl[:, None]
    # natación del pez: desplazamientos de agua
    fish = window(tt, FISH, 1.0)
    sw = S.lp(rng.standard_normal((N, 2)), 400) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.4 * tt))[:, None] ** 2
    x += sw * 0.25 * fish[:, None]
    for c in LUNGES:  # embestida y mordisco
        add(x, S.whoosh(0.7, 150, 900, 0.35), c - 0.6)
        add(x, S.thump(70, 0.4, 0.5), c)
    for a, b in [(3.2, 7.2), (SHAKE, SHAKE + 4), (169.2, 173.5)]:  # sacudidas del pez
        c = a
        while c < b:
            add(x, S.swish(0.18, 200, 1500, 0.22), c, rng.uniform(-0.5, 0.5))
            c += rng.uniform(0.14, 0.24)
    # retorcimiento del mixino mordido y huida
    c = 71.5
    while c < ESCAPE:
        add(x, S.swish(0.3, 300, 2000, 0.12), c, rng.uniform(-0.4, 0.4))
        c += 0.38
    add(x, S.whoosh(1.2, 200, 1500, 0.3), ESCAPE)
    # nudo: roce de piel contra piel
    for a, b in [KNOT, SLIDE]:
        c = a
        while c < b:
            m = int(0.5 * SR)
            t3 = np.arange(m) / SR
            add(x, S.bp(rng.standard_normal(m), 400, 2500) * np.sin(np.pi * t3 / 0.5) ** 2 * 0.1, c, rng.uniform(-0.3, 0.3))
            c += rng.uniform(0.45, 0.8)
    # raspado de las placas dentales al alimentarse
    c = FEED[0] + 0.5
    while c < FEED[1] - 0.3:
        m = int(0.12 * SR)
        t3 = np.arange(m) / SR
        add(x, S.bp(rng.standard_normal(m), 1200, 5000) * np.exp(-t3 * 25) * 0.12, c, rng.uniform(-0.5, 0.5))
        c += rng.uniform(0.18, 0.45)
    x = S.reverb(x, 1.8, 0.28, seed=183)
    S.save('movimiento.m4a', x, -3.0)


def make_slime():
    print('Mucosidad…')
    x = np.zeros((N, 2))
    for c, sz in zip(SLIMES, SLIME_SIZE):
        # 1) chasquido húmedo de salida
        m = int(0.25 * SR)
        t2 = np.arange(m) / SR
        add(x, (S.lp(rng.standard_normal(m), 900) * 0.6 + np.sin(2 * np.pi * 180 * t2 * (1 + 2 * t2))) * np.exp(-t2 * 18) * 0.35 * sz, c)
        # 2) expansión: burbujeo viscoso (gotas graves con vibrato) durante ~2,5 s
        k = 0
        while k < int(40 * sz):
            t0 = c + 0.05 + rng.exponential(0.6) * sz
            d = rng.uniform(0.08, 0.22)
            n = int(d * SR)
            t3 = np.arange(n) / SR
            f = rng.uniform(90, 320) * (1 + 0.8 * t3 / d)
            blob = np.sin(2 * np.pi * np.cumsum(f) / SR + 0.6 * np.sin(2 * np.pi * 18 * t3)) * np.sin(np.pi * t3 / d) ** 1.5
            add(x, S.lp(blob, 1400) * 0.07 * sz, t0, rng.uniform(-0.8, 0.8))
            k += 1
        # 3) estiramiento de los filamentos (barrido filtrado lento)
        n = int(2.4 * SR)
        t4 = np.arange(n) / SR
        noise = rng.standard_normal(n)
        stretch = np.zeros(n)
        for j in range(10):
            a, b = j * n // 10, (j + 1) * n // 10
            f0 = 300 + 900 * j / 9
            stretch[a:b] = S.bp(noise, f0 * 0.7, f0 * 1.3)[a:b]
        add(x, stretch * np.sin(np.pi * t4 / 2.4) ** 2 * 0.06 * sz, c + 0.3)
    # vista microscópica: madejas que se desenrollan (tintineo suave) y vesículas que estallan
    for j in range(11):
        add(x, bell(S.midi(84 + (j % 5) * 2), 1.2, 0.02, 4), UNRAVEL + j * 0.22)
    for j in range(22):
        t0 = BURSTS + rng.uniform(0, 2.5)
        m = int(0.1 * SR)
        t2 = np.arange(m) / SR
        add(x, np.sin(2 * np.pi * rng.uniform(400, 900) * t2 * (1 - 3 * t2)) * np.exp(-t2 * 40) * 0.08, t0, rng.uniform(-0.7, 0.7))
    # grumos que caen al deshacer el nudo y mucosidad en las branquias
    for c in np.arange(75.5, 81.0, 0.9):
        m = int(0.3 * SR)
        t2 = np.arange(m) / SR
        add(x, S.lp(rng.standard_normal(m), 600) * np.exp(-t2 * 10) * 0.18, c)  # "tos" viscosa del pez
    x = S.reverb(x, 2.0, 0.3, seed=185)
    S.save('mucosidad.m4a', x, -3.0)


def make_suspense():
    print('Suspenso…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    # zumbido grave y pulso acelerado antes de cada ataque
    for start, hit in [(0.0, LUNGES[0]), (PRED_TURN - 2, LUNGES[1]), (165.0, LUNGES[2])]:
        w = np.clip((tt - start) / 1.5, 0, 1) * (tt < hit)
        x += (np.sin(2 * np.pi * 46 * tt) * 0.06 + S.bp(rng.standard_normal(N), 150, 500) * 0.03)[:, None] * w[:, None]
        tb, gap = start + 0.4, 0.9
        while tb < hit - 0.08:
            add(x, S.thump(50, 0.5, 0.2), tb)
            tb += gap
            gap = max(0.22, gap * 0.8)
    # señales de revelación (título, glándula, red mucosa, nudo, nodos de la línea temporal, final)
    for c, base in [(TITLE, 74), (38.2, 81), (55.0, 79), (KNOT[1], 76), (SLIDE[1], 78)] + [(n, 79) for n in NODES] + [(END_TEXT, 74)]:
        for j, m in enumerate([0, 7, 12]):
            add(x, bell(S.midi(base + m), 2.0, 0.04, 2.4), c + j * 0.08, -0.3 + j * 0.3)
    x = S.reverb(x, 3.2, 0.42, seed=187)
    S.save('suspenso.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 160, 1100, 0.16), c - 0.55)
    # entrada y salida del microscopio
    add(x, S.whoosh(1.4, 1600, 200, 0.25), MICRO[0] - 0.7)
    add(x, S.whoosh(1.2, 200, 1600, 0.22), MICRO[1] - 0.6)
    add(x, S.thump(40, 1.8, 0.45), 0.0)
    add(x, S.thump(44, 2.0, 0.35), TITLE)
    add(x, S.thump(42, 2.6, 0.5), END_TEXT)
    x = S.reverb(x, 3.0, 0.4, seed=189)
    S.save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_slime()
    make_suspense()
    make_transitions()
