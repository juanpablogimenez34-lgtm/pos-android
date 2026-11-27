#!/usr/bin/env python3
"""Banda sonora ORIGINAL de «El camarón que dispara sin balas» (síntesis propia, sin muestras de terceros).
Reutiliza score.py sin modificarlo (sus funciones se llaman con longitudes explícitas de 60 s).
Pistas en public/audio/camaron-pistola/ (60,0 s cada una):
  musica.m4a              música cinematográfica (pulso dinámico, cámara lenta etérea, clímax, final en bucle)
  ambiente-submarino.m4a  rumor submarino, corrientes, burbujas
  movimiento-camaron.m4a  patas sobre la arena, roces de antenas y cuerpo
  chasquido.m4a           cierre de la pinza (chasquido seco) y su versión estirada en cámara ultralenta
  apertura-pinza.m4a      la pinza se arma (clics de la articulación)
  colapso-burbuja.m4a     colapso de las burbujas (implosión breve)
  onda-choque.m4a         onda de choque (golpe grave + barrido)
  transiciones.m4a        barridos entre escenas y subidas
Tiempos coherentes con src/episodes/camaron-pistola/data/timeline.ts.
"""
import os

import numpy as np

import score as S

S.OUT = os.path.join(S.ROOT, 'public/audio/camaron-pistola')
os.makedirs(S.OUT, exist_ok=True)
SR = S.SR
DUR = 60.0
N = int(SR * DUR)
rng = np.random.default_rng(20261124)
S.rng = rng
tt = np.arange(N) / SR

# --- eventos (de timeline.ts y de las escenas) ---
SNAPS = [(1.0, 1.15), (18.2, 0.7), (41.4, 0.7)]  # (chasquido, factor de cámara lenta del efecto)
COLLAPSE_REAL = [a + 0.41 * s for a, s in SNAPS]  # colapso visible de cada chasquido
SLOW_CLOSE = (20.6, 22.0)
JET = 22.0
BUBBLE = (23.0, 25.2)
COLLAPSE4 = 26.6
MICRO = 35.55
OPENS = [14.6, 40.6, 57.2]
WALKS = [(5.0, 8.6, 85), (10.4, 11.4, 40), (44.3, 49.4, 70), (51.5, 53.8, 40)]
CUTS = [5.0, 12.0, 19.6, 30.0, 39.6, 50.0, 56.0]


def stereo(x, p=0.0):
    return S.pan(x, p)


def add(track, sig, t0, gain=1.0, p=0.0):
    st = stereo(sig, p) if sig.ndim == 1 else sig
    S.place(track[:, 0], st[:, 0], t0, gain)
    S.place(track[:, 1], st[:, 1], t0, gain)


def noise(n):
    return rng.standard_normal(n)


def env_exp(n, k):
    return np.exp(-np.arange(n) / SR * k)


# ---------------------------------------------------------------- MÚSICA
def make_music():
    print('Música…')
    x = np.zeros((N, 2))
    # acordes (inicio, fin, notas MIDI, brillo, ganancia)
    chords = [
        (0.0, 5.2, [38, 45, 50, 53], 900, 0.8),      # Dm — gancho
        (5.0, 12.2, [38, 45, 50, 57, 60], 1400, 0.7),  # Dm7 — presentación
        (12.0, 20.0, [34, 41, 46, 50, 53], 1200, 0.75),  # Bb — tensión
        (19.8, 30.2, [38, 45, 52, 57, 62], 2200, 0.55),  # Dsus — cámara lenta, etéreo
        (30.0, 35.6, [37, 44, 49, 56, 61], 2600, 0.5),  # C#m(sus) — microscópico (inestable)
        (35.9, 40.2, [38, 45, 50, 57, 62], 1800, 0.5),
        (40.0, 50.2, [38, 45, 50, 53, 57], 1400, 0.7),  # Dm — caza
        (50.0, 56.2, [34, 41, 50, 53, 58, 62], 2000, 0.85),  # Bb(add9) — plano heroico
        (56.0, 60.0, [38, 45, 50, 53], 900, 0.8),    # vuelve al gancho (bucle)
    ]
    for a, b, notes, bright, g in chords:
        n = int((b - a) * SR)
        sig = sum(S.pad_voice(S.midi(m), n, bright) for m in notes) / len(notes)
        sig *= S.env_adsr(n, 0.4, 0.5) * g
        add(x, sig, a, 1.0, 0.0)
    # pulso rítmico (bajo staccato a 120 ppm en semicorcheas) en las secciones de acción
    def pulse(a, b, root, gain, rate=8.0):
        k = 0
        t0 = a
        while t0 < b:
            n = int(0.11 * SR)
            ts = np.arange(n) / SR
            f = S.midi(root + (12 if k % 8 == 6 else 0))
            s = (np.sign(np.sin(2 * np.pi * f * ts)) * 0.5 + np.sin(2 * np.pi * f * ts)) * np.exp(-ts * 30)
            s = S.lp(s, 900)
            acc = 1.0 if k % 4 == 0 else 0.6
            add(x, s, t0, gain * acc, -0.1 if k % 2 else 0.1)
            k += 1
            t0 += 1 / rate
    pulse(5.0, 12.0, 38, 0.35)
    pulse(12.0, 18.1, 34, 0.38, 8.0)
    pulse(40.0, 41.3, 38, 0.3)
    pulse(42.2, 50.0, 38, 0.33)
    pulse(50.0, 56.0, 34, 0.28, 4.0)
    pulse(56.0, 59.9, 38, 0.3, 8.0)
    # percusión: bombo grave y tom en tiempos fuertes
    def drum(t0, f=55, g=0.6, dur=0.5):
        add(x, S.thump(f, dur, g), t0)
    for a, b in [(5.0, 12.0), (12.0, 18.0), (42.2, 50.0), (56.0, 59.8)]:
        k = 0
        t0 = a
        while t0 < b:
            drum(t0, 52 if k % 2 == 0 else 70, 0.55 if k % 2 == 0 else 0.35)
            k += 1
            t0 += 0.5
    # brillo agudo (campanitas) en la cámara lenta y el microscópico
    for a, b, notes in [(20.0, 30.0, [74, 76, 81, 86]), (30.0, 35.4, [85, 88, 92]), (50.0, 56.0, [74, 77, 81, 86])]:
        t0 = a
        k = 0
        while t0 < b:
            m = notes[k % len(notes)]
            n = int(1.6 * SR)
            ts = np.arange(n) / SR
            s = np.sin(2 * np.pi * S.midi(m) * ts) * np.exp(-ts * 2.5) * 0.12
            add(x, s, t0, 1.0, rng.uniform(-0.6, 0.6))
            k += 1
            t0 += 0.5 if a != 30.0 else 0.32
    # subida antes del colapso microscópico y silencio tenso justo antes del destello
    n = int(4.0 * SR)
    ts = np.arange(n) / SR
    riser = S.bp(noise(n), 400, 4000) * (ts / 4.0) ** 2 * 0.25
    add(x, riser, MICRO - 4.0)
    # golpes de orquesta en los chasquidos (impacto musical)
    for at in [COLLAPSE_REAL[0], COLLAPSE4, MICRO, COLLAPSE_REAL[2]]:
        hit = sum(S.pad_voice(S.midi(m), int(1.8 * SR), 2500) for m in [26, 38, 45, 50]) / 4
        hit *= np.exp(-np.arange(len(hit)) / SR * 2.2)
        add(x, hit, at, 0.9)
    # «hueco» para que el chasquido respire
    gate = np.ones(N)
    for at in [s for s, _ in SNAPS] + [COLLAPSE4 - 0.4, MICRO - 0.35]:
        a, b = int((at - 0.05) * SR), int((at + 0.35) * SR)
        gate[a:b] *= 0.35
    gate = S.lp(gate, 30)
    x *= gate[:, None]
    x = S.reverb(x, 2.6, 0.28, seed=7)
    S.save('musica.m4a', x, -4.0)


# ---------------------------------------------------------------- AMBIENTE
def make_ambience():
    print('Ambiente…')
    w = noise(N * 2).reshape(N, 2)
    brown = np.cumsum(w, axis=0)
    brown = S.lp(S.hp(brown, 20), 360, 3)
    brown /= np.abs(brown).max()
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * tt)[:, None]
    x = brown * swell * 0.8 + S.lp(S.hp(noise(N * 2).reshape(N, 2), 1500), 4500) * 0.025
    # crepitar del arrecife (muchos camarones pistola a lo lejos: chasquidos lejanos y suaves)
    t0 = 0.2
    while t0 < DUR - 0.2:
        n = int(0.006 * SR)
        c = S.hp(noise(n), 2500) * env_exp(n, 900) * rng.uniform(0.02, 0.07)
        add(x, c, t0, 1.0, rng.uniform(-0.9, 0.9))
        t0 += rng.exponential(0.09)
    t0 = 0.4
    while t0 < DUR - 1:
        b = S.bubble(rng.uniform(380, 1300), rng.uniform(0.03, 0.09)) * rng.uniform(0.04, 0.12)
        add(x, b, t0, 1.0, rng.uniform(-0.8, 0.8))
        t0 += rng.exponential(0.8)
    # en la visualización científica el ambiente se apaga (más íntimo)
    g = np.ones(N)
    g[int(20.2 * SR):int(39.8 * SR)] = 0.35
    g = S.lp(g, 2)
    x *= g[:, None]
    x = S.reverb(x, 2.2, 0.3, seed=5)
    S.save('ambiente-submarino.m4a', x, -7.0)


# ---------------------------------------------------------------- MOVIMIENTO
def tick(gain, bright=3500):
    n = int(0.025 * SR)
    return S.bp(noise(n), bright * 0.5, bright * 1.6) * env_exp(n, 220) * gain


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))
    D = 70.0  # zancada del rig (u)
    for a, b, speed in WALKS:
        # 6 patas marchadoras con desfase: 2 apoyos por zancada × 3 pares
        step = D / speed / 6
        t0 = a
        k = 0
        while t0 < b:
            add(x, tick(rng.uniform(0.25, 0.5), rng.uniform(2600, 4200)), t0, 1.0, -0.3 + (k % 2) * 0.6)
            n = int(0.12 * SR)
            add(x, S.bp(noise(n), 300, 1200) * np.hanning(n) * 0.05, t0)  # arena
            t0 += step * rng.uniform(0.85, 1.15)
            k += 1
    # roces de antenas y del cuerpo
    for at in [0.4, 6.0, 12.8, 13.6, 19.3, 40.1, 44.3, 50.5, 52.0, 54.0, 56.5]:
        add(x, S.whoosh(0.5, 2500, 5000, 0.08), at, 1.0, rng.uniform(-0.5, 0.5))
    # aleteo de pleópodos (agitación) en la tensión
    for a, b in [(12.7, 18.2), (40.0, 41.4), (56.5, 60.0)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        flut = S.bp(noise(n), 800, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * ts)) * 0.04 * np.hanning(n)
        add(x, flut, a)
    S.save('movimiento-camaron.m4a', x, -6.0)


# ---------------------------------------------------------------- CHASQUIDO
def snap_sound(g=1.0):
    n = int(0.25 * SR)
    ts = np.arange(n) / SR
    crack = S.hp(noise(n), 1800) * np.exp(-ts * 160) * 1.0
    click = np.zeros(n)
    click[:int(0.0015 * SR)] = 1.0
    click = S.hp(click, 800) * 2.0
    body = np.sin(2 * np.pi * 180 * ts * (1 - 0.5 * ts)) * np.exp(-ts * 40) * 0.5
    s = crack + click + body
    s = np.tanh(s * 1.4) / np.tanh(1.4)  # saturación suave, nunca recorte
    return s * g


def make_snap():
    print('Chasquido…')
    x = np.zeros((N, 2))
    for at, _ in SNAPS:
        add(x, snap_sound(1.0), at)
    # cámara ultralenta: el dáctilo cierra (gemido grave estirado) y golpe espeso al cerrar
    a, b = SLOW_CLOSE
    n = int((b - a) * SR)
    ts = np.arange(n) / SR
    f = 55 + 40 * (ts / (b - a)) ** 2
    groan = np.sin(2 * np.pi * np.cumsum(f) / SR) * (ts / (b - a)) ** 1.5 * 0.4
    groan += S.bp(noise(n), 200, 900) * (ts / (b - a)) ** 3 * 0.25
    add(x, groan, a)
    slow = S.lp(snap_sound(1.0), 2500)
    slow = np.interp(np.arange(len(slow) * 4) / 4, np.arange(len(slow)), slow)  # 4 veces más lento
    add(x, slow * 0.9, b)
    # chorro de agua (siseo que avanza)
    n = int((COLLAPSE4 - JET) * SR)
    ts = np.arange(n) / SR
    hiss = S.bp(noise(n), 1500, 6000) * np.minimum(1, ts / 0.3) * np.exp(-ts * 0.5) * 0.18
    add(x, hiss, JET, 1.0, 0.3)
    S.save('chasquido.m4a', x, -3.0)


# ---------------------------------------------------------------- APERTURA DE LA PINZA
def make_open():
    print('Apertura…')
    x = np.zeros((N, 2))
    for at in OPENS:
        for k in range(5):
            add(x, tick(0.35 - k * 0.04, 1800 + k * 250), at + k * 0.09, 1.0, 0.25)
        n = int(0.5 * SR)
        add(x, S.bp(noise(n), 400, 1400) * np.hanning(n) * 0.08, at)
    S.save('apertura-pinza.m4a', x, -6.0)


# ---------------------------------------------------------------- COLAPSO DE LA BURBUJA
def implosion(pre=0.25, g=1.0, low=1.0):
    n = int((pre + 0.35) * SR)
    ts = np.arange(n) / SR
    np_ = int(pre * SR)
    s = np.zeros(n)
    # succión ascendente
    f = 300 + 2600 * (ts[:np_] / pre) ** 3
    s[:np_] = np.sin(2 * np.pi * np.cumsum(f) / SR) * (ts[:np_] / pre) ** 2 * 0.3
    # implosión: chasquido grave + burbujeo
    m = n - np_
    tm = np.arange(m) / SR
    s[np_:] += (S.hp(noise(m), 600) * np.exp(-tm * 70) + np.sin(2 * np.pi * 70 * low * tm) * np.exp(-tm * 12) * 0.8)
    return s * g


def make_collapse():
    print('Colapso…')
    x = np.zeros((N, 2))
    for at in COLLAPSE_REAL:
        add(x, implosion(0.12, 0.7), at - 0.12)
    # cámara ultralenta: la burbuja crece (zumbido grave que se abre) y luego colapsa
    a, b = BUBBLE
    n = int((COLLAPSE4 - a) * SR)
    ts = np.arange(n) / SR
    grow = np.sin(2 * np.pi * (60 + 30 * np.sin(np.pi * ts / (COLLAPSE4 - a))) * ts) * np.sin(np.pi * np.minimum(1, ts / (b - a)) / 2) * 0.35
    grow += S.bp(noise(n), 200, 700) * 0.08 * np.minimum(1, ts / 0.5)
    add(x, grow, a)
    add(x, implosion(0.6, 1.0, 0.7), COLLAPSE4 - 0.6)
    # microscópico: tono que se tensa durante el encogimiento y «pop» seco
    n = int((MICRO - 30.0) * SR)
    ts = np.arange(n) / SR
    u = ts / (MICRO - 30.0)
    f = 120 + 1800 * u ** 4
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.1 + 0.3 * u ** 3)
    add(x, tone, 30.0)
    add(x, implosion(0.05, 1.0, 1.3), MICRO - 0.05)
    # destello: brillo agudo brevísimo
    n = int(0.15 * SR)
    ts = np.arange(n) / SR
    add(x, np.sin(2 * np.pi * 5200 * ts) * np.exp(-ts * 40) * 0.25, MICRO)
    S.save('colapso-burbuja.m4a', x, -3.0)


# ---------------------------------------------------------------- ONDA DE CHOQUE
def boom(g=1.0, dur=1.6, f=42):
    n = int(dur * SR)
    ts = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * ts * (1 - 0.35 * ts / dur)) * np.exp(-ts * 3.5)
    s += S.lp(noise(n), 300) * np.exp(-ts * 6) * 0.6
    return s * g


def make_shock():
    print('Onda de choque…')
    x = np.zeros((N, 2))
    gains = [0.8, 0.45, 0.65]
    for at, g in zip(COLLAPSE_REAL, gains):
        add(x, boom(g), at)
        add(x, S.whoosh(0.8, 300, 2000, 0.25 * g), at + 0.02, 1.0, 0.4)
    add(x, boom(1.0, 3.0, 36), COLLAPSE4)
    add(x, S.whoosh(2.2, 200, 1600, 0.3), COLLAPSE4 + 0.05)
    add(x, boom(0.8, 2.2, 40), MICRO)
    add(x, S.whoosh(1.8, 300, 2400, 0.25), MICRO + 0.05)
    x = S.reverb(x, 2.0, 0.25, seed=9)
    S.save('onda-choque.m4a', x, -3.0)


# ---------------------------------------------------------------- TRANSICIONES
def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for at in CUTS:
        add(x, S.whoosh(0.6, 500, 2600, 0.3), at - 0.3, 1.0, rng.uniform(-0.4, 0.4))
    # burbujas de las cortinas (entrada/salida de la visualización)
    for at in [19.6, 39.6]:
        for k in range(14):
            add(x, S.bubble(rng.uniform(400, 1500), 0.06) * 0.15, at + k * 0.05, 1.0, rng.uniform(-0.8, 0.8))
    # subida del alejamiento del gancho y del acercamiento final
    for a, b in [(3.0, 5.0), (57.4, 60.0)]:
        n = int((b - a) * SR)
        ts = np.arange(n) / SR
        add(x, S.bp(noise(n), 600, 5000) * (ts / (b - a)) ** 2 * 0.2, a)
    S.save('transiciones.m4a', x, -6.0)


if __name__ == '__main__':
    make_music()
    make_ambience()
    make_movement()
    make_snap()
    make_open()
    make_collapse()
    make_shock()
    make_transitions()
