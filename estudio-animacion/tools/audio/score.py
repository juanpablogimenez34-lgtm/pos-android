#!/usr/bin/env python3
"""Banda sonora ORIGINAL del Ep. 01, generada por síntesis (numpy + scipy).

No usa muestras ni grabaciones de terceros: todo sale de osciladores, ruido
filtrado y una reverberación sintética, con semilla fija (resultado reproducible).

Pistas (public/audio/ep01/):
  musica.m4a        música ambiental cinematográfica (re menor, 7 secciones)
  ambiente.m4a      ambiente submarino: rumor grave + burbujas
  movimiento.m4a    pasos/roces, chorros del sifón, tinta, latidos, morena
  tension.m4a       suspenso del ataque (95–120 s)
  transiciones.m4a  barridos en los cortes, golpes de título y final

Los tiempos de los eventos se comparten con el video (cortes, latidos, chorros).
Uso:  python3 tools/audio/score.py
"""
import os
import subprocess
import tempfile

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public/audio/ep01')
SR = 44100
DUR = 180.0
N = int(SR * DUR)
rng = np.random.default_rng(20261118)

# --- eventos compartidos con el video (src/episodes/ep01-pulpo/full/timeline.ts) ---
CUTS = [45.0, 120.0, 127.0, 150.0]
HEART_HZ = 0.75  # latidos visibles (45 lpm, ritmo ilustrativo)
HEART_WINDOWS = [(31.6, 45.0), (65.0, 70.0)]
HEART_STOP = (66.3, 68.3)  # en el panel: "nadando → se detiene"
WALK = [(10.0, 18.2), (45.0, 51.8), (150.0, 157.5)]
EXPLORE = [(5.0, 10.0), (127.5, 142.0)]
SWIM = (58.0, 65.5, 1.6)  # inicio, fin, Hz de los chorros
ESCAPE = (109.3, 116.0, 2.2)
INK = [109.2, 109.5, 109.9]
TITLE_HIT = 15.4
FINAL_HIT = 174.8
EYE_STING = 3.4


def t_axis(n=N):
    return np.arange(n) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    na = min(na, n)
    e[:na] = np.linspace(0, sustain, na) ** 1.6
    if nr > 0 and nr < n:
        e[-nr:] *= np.linspace(1, 0, nr) ** 1.4
    return e


def place(track, sig, t0, gain=1.0):
    s = int(t0 * SR)
    if s >= len(track):
        return
    e = min(len(track), s + len(sig))
    track[s:e] += sig[: e - s] * gain


def reverb(x, seconds=3.2, mix=0.35, seed=3):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)], axis=1) * np.exp(-tt * 6.5 / seconds)[:, None]
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - mix) + wet * mix


def pan(x, p):
    """p en [-1, 1]."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def save(name, x, peak_db=-3.0):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    fade = int(0.05 * SR)
    x[:fade] *= np.linspace(0, 1, fade)[:, None]
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'a.raw')
        pcm.tofile(raw)
        out = os.path.join(OUT, name)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', raw,
                        '-c:a', 'aac', '-b:a', '160k', out], check=True)
    print('  ✔', name, f'{os.path.getsize(out) / 1e6:.2f} MB')


# ---------------------------------------------------------------- MÚSICA
def pad_voice(freq, n, bright=1400):
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for det in (-0.11, 0.0, 0.13):
        f = freq * 2 ** (det / 12)
        ph = rng.random()
        saw = 2 * ((f * tt + ph) % 1.0) - 1
        sig += saw
    sig += 0.6 * np.sin(2 * np.pi * freq * 0.5 * tt)
    lfo = 1 + 0.25 * np.sin(2 * np.pi * 0.07 * tt + rng.random() * 6)
    return lp(sig * lfo, bright) / 3.0


CHORDS = [
    # (inicio, fin, notas MIDI, brillo)
    (0.0, 10.0, [50, 57, 62, 64, 69], 900),       # Dm(add9)
    (9.0, 20.5, [46, 53, 58, 62, 69], 1200),      # Bbmaj7
    (20.0, 32.5, [41, 53, 57, 60, 65], 1000),     # F
    (32.0, 45.5, [43, 50, 55, 58, 62], 1100),     # Gm
    (45.0, 58.5, [50, 57, 60, 65, 69], 1300),     # Dm7
    (58.0, 70.5, [45, 52, 57, 61, 64], 1700),     # A (impulso)
    (70.0, 83.0, [50, 57, 62, 65, 72], 1100),     # Dm
    (82.5, 95.5, [48, 55, 60, 64, 71], 1300),     # Cmaj7 (brillo del camuflaje)
    (95.0, 120.5, [38, 45, 50], 500),             # pedal grave (deja sitio a la tensión)
    (120.0, 133.0, [41, 53, 57, 60, 67], 1300),   # F(add9)
    (132.5, 142.5, [48, 55, 60, 64, 67], 1300),   # C
    (142.0, 150.5, [46, 53, 58, 62, 65], 1500),   # Bb
    (150.0, 160.5, [43, 50, 55, 58, 62], 1000),   # Gm
    (160.0, 168.5, [46, 53, 58, 62, 69], 1100),   # Bbmaj7
    (168.0, 174.8, [45, 52, 57, 61, 64], 1300),   # A (suspenso)
    (174.6, 180.0, [50, 57, 62, 66, 69], 1600),   # D mayor: revelación final
]

ARPS = [(58.0, 65.5, 4.0), (120.5, 142.0, 3.0), (76.0, 92.0, 2.0)]  # inicio, fin, notas por segundo


def make_music():
    print('Música…')
    left = np.zeros(N)
    right = np.zeros(N)
    for i, (a, b, notes, bright) in enumerate(CHORDS):
        n = int((b - a + 2.5) * SR)
        e = env_adsr(n, 2.2, 3.0)
        for j, m in enumerate(notes):
            v = pad_voice(midi(m), n, bright) * e * (0.9 if j == 0 else 0.55)
            p = -0.6 + 1.2 * j / max(1, len(notes) - 1)
            st = pan(v, p * 0.7)
            s = int(a * SR)
            e2 = min(N, s + n)
            left[s:e2] += st[: e2 - s, 0]
            right[s:e2] += st[: e2 - s, 1]
        # bajo sub
        n2 = int((b - a + 1.5) * SR)
        sub = np.sin(2 * np.pi * midi(notes[0] - 12) * np.arange(n2) / SR) * env_adsr(n2, 1.5, 2.0) * 0.5
        place(left, sub, a)
        place(right, sub, a)
    # arpegios suaves (pulsos de movimiento / asombro)
    for a, b, rate in ARPS:
        t0 = a
        k = 0
        while t0 < b:
            chord = next(c for c in reversed(CHORDS) if c[0] <= t0)
            m = chord[2][1 + (k % (len(chord[2]) - 1))] + 12
            n = int(1.4 * SR)
            tt = np.arange(n) / SR
            tone = (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(4 * np.pi * midi(m) * tt)) * np.exp(-tt * 3.2)
            g = 0.16 * min(1, (t0 - a) / 2, (b - t0) / 2)
            st = pan(tone * g, np.sin(k * 1.3) * 0.6)
            place(left, st[:, 0], t0)
            place(right, st[:, 1], t0)
            t0 += 1.0 / rate
            k += 1
    # campanas en los momentos de revelación
    for tb, m in [(15.4, 81), (42.0, 86), (90.6, 84), (174.8, 86), (175.6, 81)]:
        n = int(4 * SR)
        tt = np.arange(n) / SR
        bell = sum(np.sin(2 * np.pi * midi(m) * r * tt) * w for r, w in [(1, 1), (2.76, 0.4), (5.4, 0.2)]) * np.exp(-tt * 1.3)
        place(left, bell * 0.18, tb)
        place(right, bell * 0.18, tb + 0.012)
    x = np.stack([left, right], axis=1)
    x = reverb(x, 4.0, 0.45)
    # dinámica general: entra suave, baja en el ataque, crece al final
    tt = t_axis()
    master = np.interp(tt, [0, 4, 95, 97, 118, 121, 170, 176, 180], [0.0, 0.9, 0.9, 0.35, 0.35, 0.95, 1.0, 1.25, 1.0])
    save('musica.m4a', x * master[:, None], -4.0)


# ---------------------------------------------------------------- AMBIENTE
def bubble(f0, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 + 2.2 * tt / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 9 / dur)


def make_ambience():
    print('Ambiente…')
    white = rng.standard_normal((N, 2))
    brown = np.cumsum(white, axis=0)
    brown = hp(brown, 20)
    brown = lp(brown, 380, 3)
    brown /= np.abs(brown).max()
    tt = t_axis()
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * 0.05 * tt)[:, None]
    x = brown * swell * 0.8
    hiss = lp(hp(rng.standard_normal((N, 2)), 1500), 4000) * 0.03
    x += hiss
    # burbujas dispersas (≈1,3/s) y algunos trenes
    t0 = 0.3
    while t0 < DUR - 1:
        f0 = rng.uniform(380, 1300)
        b = bubble(f0, rng.uniform(0.03, 0.09)) * rng.uniform(0.04, 0.14)
        st = pan(b, rng.uniform(-0.8, 0.8))
        place(x[:, 0], st[:, 0], t0)
        place(x[:, 1], st[:, 1], t0)
        if rng.random() < 0.08:
            for k in range(rng.integers(4, 9)):
                bb = bubble(rng.uniform(500, 1500), 0.05) * 0.08
                place(x[:, 0], bb, t0 + k * 0.07)
                place(x[:, 1], bb, t0 + k * 0.07 + 0.01)
        t0 += rng.exponential(0.75)
    x = reverb(x, 2.5, 0.3, seed=5)
    save('ambiente.m4a', x, -6.0)


# ---------------------------------------------------------------- MOVIMIENTO
def swish(dur, lo, hi, gain):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = bp(rng.standard_normal(n), lo, hi) * np.sin(np.pi * tt / dur) ** 2
    return s * gain


def whoosh(dur, f0, f1, gain):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 12
    for k in range(steps):
        a, b = k * n // steps, (k + 1) * n // steps
        f = f0 + (f1 - f0) * k / (steps - 1)
        out[a:b] = bp(noise, f * 0.6, f * 1.4)[a:b]
    return out * np.sin(np.pi * tt / dur) ** 1.5 * gain


def thump(f, dur, gain):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt * (1 - 0.3 * tt / dur)) * np.exp(-tt * 14) * gain


def heart_beats():
    for a, b in HEART_WINDOWS:
        k = int(np.ceil(a * HEART_HZ))
        while k / HEART_HZ < b:
            tb = k / HEART_HZ
            if not (HEART_STOP[0] <= tb < HEART_STOP[1] and a == 65.0):
                yield tb
            k += 1


def make_movement():
    print('Movimiento…')
    x = np.zeros((N, 2))

    def add(sig, t0, p=0.0, g=1.0):
        st = pan(sig * g, p)
        place(x[:, 0], st[:, 0], t0)
        place(x[:, 1], st[:, 1], t0)

    for a, b in WALK:
        t0 = a
        while t0 < b:
            add(swish(rng.uniform(0.12, 0.2), 180, 900, 0.22), t0, rng.uniform(-0.5, 0.5))
            t0 += rng.uniform(0.22, 0.36)
    for a, b in EXPLORE:
        t0 = a
        while t0 < b:
            add(swish(rng.uniform(0.3, 0.6), 250, 1400, 0.16), t0, rng.uniform(-0.6, 0.6))
            t0 += rng.uniform(0.5, 1.1)
    for a, b, hz in (SWIM, ESCAPE):
        t0 = a
        while t0 < b:
            add(whoosh(0.45, 220, 900, 0.5), t0, rng.uniform(-0.3, 0.3))
            for k in range(5):
                add(bubble(rng.uniform(400, 1100), 0.06), t0 + 0.05 + k * 0.05, rng.uniform(-0.6, 0.6), 0.12)
            t0 += 1.0 / hz
    for ti in INK:
        add(thump(55, 0.8, 0.9), ti)
        add(lp(rng.standard_normal(int(0.9 * SR)), 500) * np.exp(-np.arange(int(0.9 * SR)) / SR * 4) * 0.5, ti)
    # latidos: "lub" (branquiales) y "dub" (sistémico) sincronizados con la animación
    for tb in heart_beats():
        add(thump(62, 0.35, 0.55), tb)
        add(thump(50, 0.35, 0.45), tb + 0.35 / HEART_HZ)  # sistólico desfasado 35 % del ciclo
    # morena: deslizamiento grave al salir y embestida
    add(lp(rng.standard_normal(int(4.5 * SR)), 300) * env_adsr(int(4.5 * SR), 1.5, 2.0) * 0.35, 95.5, -0.4)
    add(whoosh(1.2, 150, 700, 0.6), 107.6, -0.3)
    add(lp(rng.standard_normal(int(3.0 * SR)), 300) * env_adsr(int(3.0 * SR), 0.8, 1.8) * 0.3, 115.0, -0.4)
    # destellos del camuflaje (granos agudos muy suaves)
    t0 = 77.0
    while t0 < 90.0:
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        g = np.sin(2 * np.pi * rng.uniform(2200, 4200) * tt) * np.exp(-tt * 18) * 0.05
        add(g, t0, rng.uniform(-0.8, 0.8))
        t0 += rng.uniform(0.08, 0.25)
    x = reverb(x, 1.8, 0.25, seed=7)
    save('movimiento.m4a', x, -3.0)


# ---------------------------------------------------------------- TENSIÓN
def make_tension():
    print('Tensión…')
    x = np.zeros((N, 2))
    a, b = 95.0, 120.0
    n = int((b - a) * SR)
    tt = np.arange(n) / SR
    drone = np.zeros(n)
    for m, det in [(33, 0), (34, 0.07), (45, -0.05)]:
        f = midi(m) * 2 ** (det / 12)
        drone += 2 * ((f * tt) % 1.0) - 1
    drone = lp(drone, 350) / 3
    curve = np.interp(tt + a, [95, 99, 108.5, 109.3, 113, 120], [0, 0.6, 1.0, 1.0, 0.6, 0])
    trem_curve = np.interp(tt + a, [95, 101, 108.8, 109.3, 112, 120], [0, 0, 1.0, 0.2, 0.15, 0])
    cluster = sum(2 * ((midi(m) * tt) % 1.0) - 1 for m in (69, 70, 75))
    cluster = bp(cluster, 600, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt)) * trem_curve * 0.25
    sig = drone * curve + cluster
    x[int(a * SR): int(a * SR) + n] += np.stack([sig, sig * 0.97], axis=1)
    # golpes graves que se aceleran hasta el ataque
    t0 = 101.0
    gap = 1.2
    while t0 < 109.0:
        place(x[:, 0], thump(48, 0.6, 0.8), t0)
        place(x[:, 1], thump(48, 0.6, 0.8), t0)
        t0 += gap
        gap = max(0.35, gap * 0.86)
    hit = thump(40, 1.6, 1.0) + lp(rng.standard_normal(int(1.6 * SR)), 900) * np.exp(-np.arange(int(1.6 * SR)) / SR * 3) * 0.5
    place(x[:, 0], hit, 109.2)
    place(x[:, 1], hit, 109.2)
    # breve inquietud cuando aparece el ojo
    n2 = int(3 * SR)
    t2 = np.arange(n2) / SR
    eye = lp(2 * ((midi(38) * t2) % 1) - 1, 250) * env_adsr(n2, 1.0, 1.5) * 0.4
    place(x[:, 0], eye, 3.0)
    place(x[:, 1], eye, 3.0)
    x = reverb(x, 3.0, 0.35, seed=9)
    save('tension.m4a', x, -3.0)


# ---------------------------------------------------------------- TRANSICIONES
def make_transitions():
    print('Transiciones…')
    x = np.zeros((N, 2))
    for c in CUTS:
        w = whoosh(1.0, 300, 2400, 0.7)
        st = pan(w, 0)
        place(x[:, 0], st[:, 0], c - 0.6)
        place(x[:, 1], st[:, 1], c - 0.6)
    for ti, g in [(TITLE_HIT, 1.0), (FINAL_HIT, 0.9)]:
        hit = thump(45, 2.0, 1.0)
        shimmer_n = int(3 * SR)
        st = np.arange(shimmer_n) / SR
        sh = bp(rng.standard_normal(shimmer_n), 3000, 9000) * np.exp(-st * 1.4) * 0.15
        place(x[:, 0], (hit * g), ti)
        place(x[:, 1], (hit * g), ti)
        place(x[:, 0], sh, ti)
        place(x[:, 1], sh, ti + 0.015)
    sting = thump(70, 1.0, 0.5)
    place(x[:, 0], sting, EYE_STING)
    place(x[:, 1], sting, EYE_STING)
    x = reverb(x, 3.5, 0.4, seed=11)
    save('transiciones.m4a', x, -3.0)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    make_music()
    make_ambience()
    make_movement()
    make_tension()
    make_transitions()
