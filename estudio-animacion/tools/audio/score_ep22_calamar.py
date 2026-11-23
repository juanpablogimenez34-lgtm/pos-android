#!/usr/bin/env python3
"""Banda sonora ORIGINAL de "EL CALAMAR GIGANTE: EL MONSTRUO REAL DE LAS PROFUNDIDADES" (180 s).
Síntesis propia (osciladores, ruido filtrado, reverberación sintética; semilla fija), sin muestras de
terceros. Reutiliza score.py sin modificarlo. Pistas en public/audio/ep22-calamar-gigante/ (con la voz, 10):
  narracion.m4a             narración (Piper es_MX, generada con tools/audio/narration.py)
  musica-ambiental.m4a      música ambiental de las profundidades (pads graves, campanas lejanas)
  ambiente-submarino.m4a    rumor del océano profundo, presión, partículas, crujidos lejanos
  movimiento-calamar.m4a    natación lenta, pulsos del manto, aletas, brazos que se enroscan
  tentaculos.m4a            anticipación, latigazo de extensión, contacto, retracción y entrega a los brazos
  sifon.m4a                 propulsión a chorro: golpe de agua y siseo (sin burbujas grandes)
  suspenso-caza.m4a         tensión antes de cada ataque y en la detección de la presa
  encuentro-cachalote.m4a   presencia grave del cachalote y sus clics de ecolocalización (escenas 9–10)
  transiciones.m4a          barridos entre escenas, rótulos y destellos de la cámara científica
  musica-final.m4a          tema de cierre (escena 12) y golpe del gancho inicial
Tiempos coherentes con src/episodes/ep22-calamar-gigante/data/timeline.ts (EV).
Uso:  python3 tools/audio/score_ep22_calamar.py
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/ep22-calamar-gigante')
SR, N = S.SR, S.N
rng = np.random.default_rng(20261123)
S.rng = rng

SCENES = [15.0 * i for i in range(1, 12)]
HOOK_STRIKE = 1.3
HOOK_TEXT = 3.0
HUNT = 86.0
BAIT = 161.5
JETS = [106.0, 107.4, 108.8, 111.0, 112.2, 113.4, 116.0, 117.0]
WHALE_IN = 125.0
THREAT = 130.0
STROBES = [153.0, 154.5, 156.0, 157.5, 159.0, 160.5, 162.0, 163.5]
END_TEXT = 176.2
FADE = 179.4
# (inicio, fin) de los tramos de natación / exploración
SWIM = [(3.0, 15.0), (15.0, 30.0), (40.0, 45.0), (60.0, 80.0), (118.0, 125.0), (154.0, 160.0), (165.0, 178.0)]
ARMS = [(60.5, 69.0), (86.7, 100.0), (130.0, 146.0), (161.8, 165.0)]
CALLOUTS = [3.0, 15.6, 30.5, 45.6, 60.4, 64.4, 70.8, 96.0, 101.6, 105.8, 111.6]


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


def noise(n, lo, hi):
    return S.bp(rng.standard_normal(n), lo, hi)


def make_music():
    print('Música ambiental…')
    L = np.zeros(N)
    R = np.zeros(N)
    # acordes graves y abiertos (re menor / modal); la caza y el cachalote más oscuros
    chords = [
        (0.0, 15.5, [26, 38, 45, 50, 53], 700), (15.0, 30.5, [29, 41, 48, 53, 57], 900), (30.0, 45.5, [24, 36, 43, 48, 51], 600),
        (45.0, 60.5, [26, 38, 45, 50, 57], 1000), (60.0, 75.5, [31, 43, 50, 55, 58], 900), (75.0, 90.5, [26, 38, 44, 50, 53], 600),
        (90.0, 105.5, [27, 39, 46, 51, 54], 600), (105.0, 120.5, [29, 41, 48, 53, 60], 1100), (120.0, 135.5, [22, 34, 41, 46, 49], 450),
        (135.0, 150.5, [24, 36, 42, 48, 51], 450), (150.0, 165.5, [26, 38, 45, 50, 57], 900),
    ]
    for a, b, notes, bright in chords:
        n = int((b - a + 3.0) * SR)
        e = S.env_adsr(n, 2.2, 3.4)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, bright) * e * (0.9 if j == 0 else 0.26)
            st = S.pan(v, (-0.6 + 1.2 * j / max(1, len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    # campanas lejanas y espaciadas (asombro) en las escenas descriptivas
    for a, b, base, dt in [(15.5, 29.5, 62, 1.6), (45.5, 59.5, 65, 1.4), (60.5, 74.5, 62, 1.5), (150.5, 160.0, 62, 1.8)]:
        tb, k = a, 0
        steps = [0, 7, 3, 10, 12, 5]
        while tb < b:
            tone = bell(S.midi(base + steps[k % 6]), 2.4, 0.03, 1.6)
            st = S.pan(tone, 0.6 * np.sin(k * 1.3))
            S.place(L, st[:, 0], tb)
            S.place(R, st[:, 1], tb)
            tb += dt
            k += 1
    x = S.reverb(np.stack([L, R], axis=1), 5.0, 0.5)
    tt = S.t_axis()
    master = np.interp(tt, [0, 0.3, 80, 85.5, 92, 105, 120, 150, 163, 166.5, 180], [0.8, 0.9, 0.9, 0.55, 0.55, 1.0, 0.8, 0.8, 0.9, 0.0, 0.0])
    S.save('musica-ambiental.m4a', x * master[:, None], -4.0)


def make_ambience():
    print('Ambiente submarino…')
    tt = S.t_axis()
    rumble = S.lp(rng.standard_normal((N, 2)), 120) * 1.2
    hiss = S.bp(rng.standard_normal((N, 2)), 300, 1200) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * tt / 9.0))[:, None]
    x = rumble + hiss
    t0 = 0.8
    while t0 < 179:  # crujidos y tintineos lejanos de partículas
        if rng.random() < 0.5:
            n = int(0.5 * SR)
            t2 = np.arange(n) / SR
            add(x, noise(n, 80, 400) * np.exp(-t2 * 5) * 0.12, t0, rng.uniform(-0.9, 0.9))
        else:
            add(x, bell(rng.uniform(1500, 3200), 0.4, 0.006, 9), t0, rng.uniform(-0.9, 0.9))
        t0 += rng.uniform(1.0, 3.0)
    x = S.reverb(x, 3.5, 0.45, seed=331)
    # la superficie (escena 3, primeros segundos) suena más clara; luego todo se vuelve grave
    bright = np.interp(tt, [30, 31, 34, 36], [0, 1, 1, 0])
    x += S.bp(rng.standard_normal((N, 2)), 800, 4000) * (0.04 * bright)[:, None]
    fade = np.interp(tt, [0, 0.4, FADE, 180], [0.4, 1, 1, 0])
    S.save('ambiente-submarino.m4a', x * fade[:, None], -7.0)


def make_movement():
    print('Movimiento del calamar…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    sw = window(tt, SWIM, 1.0)
    # pulsos del manto: aspiración suave y empuje
    pulse = (0.5 - 0.5 * np.cos(2 * np.pi * 0.45 * tt)) ** 2
    x += S.lp(rng.standard_normal((N, 2)), 380) * (pulse * sw * 0.22)[:, None]
    # aletas: ondulación muy suave
    x += S.bp(rng.standard_normal((N, 2)), 150, 700) * ((0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * tt)) * sw * 0.06)[:, None]
    # escena 8: contracciones fuertes del manto (antes de cada chorro)
    for tj in JETS:
        n = int(0.5 * SR)
        t2 = np.arange(n) / SR
        add(x, S.lp(rng.standard_normal(n), 300) * np.sin(np.pi * t2 / 0.5) * 0.3, tj - 0.4, -0.2)
    # brazos que se enroscan (roces viscosos)
    aw = window(tt, ARMS, 0.8)
    t0 = 0.0
    while t0 < 180:
        if aw[min(N - 1, int(t0 * SR))] > 0.05:
            d = rng.uniform(0.3, 0.7)
            n = int(d * SR)
            t2 = np.arange(n) / SR
            add(x, noise(n, 300, 1600) * np.sin(np.pi * t2 / d) ** 2 * 0.09 * aw[int(t0 * SR)], t0, rng.uniform(-0.6, 0.6))
        t0 += rng.uniform(0.25, 0.6)
    x = S.reverb(x, 1.8, 0.3, seed=333)
    S.save('movimiento-calamar.m4a', x, -4.0)


def tentacle_strike(x, t0, hold, retract, release=True):
    # anticipación (tensado)
    n = int(0.45 * SR)
    t2 = np.arange(n) / SR
    add(x, S.lp(rng.standard_normal(n), 250) * (t2 / 0.45) ** 2 * 0.2, t0 - 0.45)
    # latigazo de extensión: barrido rápido de grave a medio
    add(x, S.whoosh(0.34, 180, 1800, 0.32), t0)
    # contacto: golpe húmedo + agarre
    tc = t0 + 0.32
    m = int(0.3 * SR)
    t3 = np.arange(m) / SR
    add(x, S.lp(rng.standard_normal(m), 900) * np.exp(-t3 * 18) * 0.5 + np.sin(2 * np.pi * 95 * t3) * np.exp(-t3 * 14) * 0.35, tc, 0.2)
    for k in range(6):  # ventosas que se adhieren
        add(x, S.bubble(rng.uniform(250, 600), 0.035) * 0.08, tc + 0.05 + k * 0.05, rng.uniform(-0.4, 0.4))
    # retracción hacia los brazos
    if retract > 0:
        d = retract
        q = int(d * SR)
        t4 = np.arange(q) / SR
        add(x, noise(q, 120, 900) * np.sin(np.pi * t4 / d) * 0.18, tc + hold, -0.1)
        if release:  # entrega a los brazos
            add(x, S.lp(rng.standard_normal(int(0.4 * SR)), 500) * np.exp(-np.arange(int(0.4 * SR)) / SR * 8) * 0.2, tc + hold + d)


def make_tentacles():
    print('Tentáculos…')
    x = np.zeros((N, 2))
    tentacle_strike(x, HOOK_STRIKE, 0.35, 1.6)
    tentacle_strike(x, HUNT, 0.4, 2.2)
    tentacle_strike(x, BAIT, 6.0, 0.0, release=False)
    # las mazas sujetan el cebo y se enroscan (escena 11)
    tt = S.t_axis()
    w = window(tt, [(BAIT + 0.4, 165.0)], 0.4)
    x += noise(N, 200, 1200)[:, None] * (w * 0.05 * (0.5 + 0.5 * np.sin(2 * np.pi * 2.2 * tt)))[:, None]
    # escena 5: los tentáculos se resaltan con un barrido suave
    add(x, S.whoosh(1.2, 150, 700, 0.12), 64.4)
    x = S.reverb(x, 1.6, 0.28, seed=335)
    S.save('tentaculos.m4a', x, -3.0)


def make_siphon():
    print('Sifón…')
    x = np.zeros((N, 2))
    for tj in JETS:
        n = int(0.9 * SR)
        t2 = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (70 - 25 * t2) * t2) * np.exp(-t2 * 9) * 0.45
        rush = noise(n, 200, 2400) * np.exp(-t2 * 4.5) * 0.35
        add(x, thump + rush, tj, 0.25)
    # escena 8: el manto bombea antes del primer chorro
    for k in range(4):
        add(x, S.lp(rng.standard_normal(int(0.6 * SR)), 260) * np.sin(np.pi * np.arange(int(0.6 * SR)) / SR / 0.6) * 0.12, 105.2 + k * 0.7, 0.1)
    # retirada en las escenas 10 y 12 (chorros lentos y lejanos)
    for tj in [146.2, 147.6, 175.2, 176.5]:
        n = int(0.9 * SR)
        t2 = np.arange(n) / SR
        add(x, noise(n, 150, 1200) * np.exp(-t2 * 4) * 0.18, tj, -0.3)
    x = S.reverb(x, 1.8, 0.3, seed=337)
    S.save('sifon.m4a', x, -3.0)


def make_suspense():
    print('Suspenso de caza…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    for t0, pre in [(HOOK_STRIKE, 1.2), (HUNT, 6.0), (BAIT, 2.5)]:
        a = t0 - pre
        w = np.clip((tt - a) / max(0.6, pre * 0.4), 0, 1) * (tt < t0 + 0.3)
        drone = np.sin(2 * np.pi * 49 * tt) * 0.05 + np.sin(2 * np.pi * 73.4 * tt) * 0.02 + S.bp(rng.standard_normal(N), 150, 600) * 0.025
        x += drone[:, None] * w[:, None]
        add(x, S.thump(46, 0.5, 0.14), t0 - 0.45)
    # detección de la presa (escena 6): pulso cardiaco lento
    for k in range(6):
        add(x, S.thump(55, 0.25, 0.1), 80.2 + k * 0.95)
    for c, base in [(HOOK_TEXT, 62)]:
        for j, m in enumerate([0, 7, 12]):
            add(x, bell(S.midi(base + m), 2.4, 0.05, 2.0), c + j * 0.07, -0.3 + j * 0.3)
    x = S.reverb(x, 3.2, 0.42, seed=339)
    S.save('suspenso-caza.m4a', x, -3.0)


def make_whale():
    print('Encuentro con el cachalote…')
    x = np.zeros((N, 2))
    tt = S.t_axis()
    w = np.interp(tt, [WHALE_IN - 2, WHALE_IN + 2, 144, 150, 151], [0, 1, 1, 0.3, 0])
    body = S.lp(rng.standard_normal((N, 2)), 70) * 2.0 + np.sin(2 * np.pi * 31 * tt)[:, None] * 0.06
    x += body * w[:, None]
    # clics de ecolocalización (trenes regulares que se aceleran al acercarse)
    t0 = WHALE_IN - 1
    while t0 < 149:
        rate = 0.55 if t0 < 136 else 0.38 if t0 < 143 else 0.22
        n = int(0.012 * SR)
        click = S.bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / SR * 600) * 0.4
        pos = np.interp(t0, [124, 138, 150], [-0.8, 0.2, 0.7])
        add(x, click * np.interp(t0, [124, 127, 145, 149], [0.3, 0.8, 1.0, 0.4]), t0, pos)
        t0 += rate * rng.uniform(0.9, 1.1)
    # golpe de tensión cuando el calamar reacciona (escena 9) y cuando se cruzan (escena 10)
    add(x, S.thump(38, 2.0, 0.3), THREAT)
    add(x, S.thump(36, 2.6, 0.32), 143.0)
    x = S.reverb(x, 4.0, 0.45, seed=341)
    S.save('encuentro-cachalote.m4a', x, -3.0)


def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in SCENES:
        add(x, S.whoosh(1.0, 120, 900, 0.13), c - 0.55)
    for c in CALLOUTS:
        add(x, S.whoosh(0.6, 900, 2600, 0.06), c - 0.2)
    for c in STROBES:  # destello de la cámara científica: chasquido y zumbido de carga
        n = int(0.05 * SR)
        add(x, S.bp(rng.standard_normal(n), 2000, 9000) * np.exp(-np.arange(n) / SR * 120) * 0.3, c, 0.3)
        m = int(0.9 * SR)
        t2 = np.arange(m) / SR
        add(x, np.sin(2 * np.pi * (1800 + 2200 * t2) * t2) * 0.012 * np.exp(-t2 * 2), c + 0.08, 0.3)
    x = S.reverb(x, 2.4, 0.35, seed=343)
    S.save('transiciones.m4a', x, -3.0)


def make_final_music():
    print('Música final…')
    L = np.zeros(N)
    R = np.zeros(N)
    # golpe del gancho «¡ESTE MONSTRUO ES REAL!»
    for m in [26, 38, 45]:
        v = S.pad_voice(S.midi(m), int(4.0 * SR), 900) * S.env_adsr(int(4.0 * SR), 0.05, 3.0) * 0.4
        S.place(L, v, HOOK_TEXT)
        S.place(R, v, HOOK_TEXT)
    # tema de cierre: pads que crecen y una melodía de campanas
    for a, b, notes in [(164.5, 172.5, [26, 38, 45, 50, 53, 57]), (172.0, 180.0, [22, 34, 41, 46, 50, 53])]:
        n = int((b - a + 2.0) * SR)
        e = S.env_adsr(n, 2.0, 3.0)
        for j, m in enumerate(notes):
            v = S.pad_voice(S.midi(m), n, 1300) * e * (0.9 if j == 0 else 0.3)
            st = S.pan(v, (-0.6 + 1.2 * j / (len(notes) - 1)) * 0.7)
            S.place(L, st[:, 0], a)
            S.place(R, st[:, 1], a)
    for c, m in [(166.0, 69), (167.5, 72), (169.0, 74), (171.0, 77), (173.0, 76), (174.5, 74), (176.2, 69), (176.8, 72), (177.4, 74), (178.0, 81)]:
        st = S.pan(bell(S.midi(m), 2.6, 0.07, 1.6), 0.3 * np.sin(c))
        S.place(L, st[:, 0], c)
        S.place(R, st[:, 1], c)
    x = S.reverb(np.stack([L, R], axis=1), 4.6, 0.48, seed=345)
    tt = S.t_axis()
    x += np.zeros_like(x)
    add(x, S.thump(40, 2.2, 0.3), END_TEXT)
    fade = np.interp(tt, [0, FADE - 0.2, 180], [1, 1, 0])
    S.save('musica-final.m4a', x * fade[:, None], -3.0)


if __name__ == '__main__':
    os.makedirs(S.OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tentacles()
    make_siphon()
    make_suspense()
    make_whale()
    make_transitions()
    make_final_music()
