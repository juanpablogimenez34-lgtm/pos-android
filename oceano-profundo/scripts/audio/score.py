#!/usr/bin/env python3
"""Banda sonora ORIGINAL del documental (síntesis propia con numpy/scipy, sin muestras ni música de terceros:
apta para publicar y monetizar). Genera en public/audio/documental/ (600,0 s cada pista):
  musica.m4a        música cinematográfica ambiental por escenas (pads, drones graves, pulsos en las cacerías,
                    crescendos en las revelaciones). La reducción bajo la voz (ducking) se aplica en el video.
  ambiente.m4a      rumor submarino por profundidad, corrientes, burbujas cerca de la superficie, oleaje.
  efectos.m4a       ecolocalización ilustrativa (clics y zumbido), ataques, chorros, soplo del cachalote,
                    golpes de cola, presión, ROV (motor, focos, brazo, sonar).
  transiciones.m4a  barridos de agua en los cambios de escena y de plano.
Uso: python3 scripts/audio/score.py [--dur 600] [--out public/audio/documental] [--events evento.json]
Tiempos coherentes con src/data/timeline.ts y las escenas.
"""
import argparse
import os
import subprocess
import tempfile

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 44100
rng = np.random.default_rng(20261124)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)


def bp(x, a, b, o=2):
    return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def pan(x, p):
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(tr, sig, t0, g=1.0):
    s = int(t0 * SR)
    if s >= len(tr) or s < 0:
        return
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    e = min(len(tr), s + len(sig))
    tr[s:e] += sig[: e - s] * g


def reverb(x, sec=3.0, mix=0.3, seed=3):
    r = np.random.default_rng(seed)
    n = int(sec * SR)
    tt = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * np.exp(-tt * 6.5 / sec)[:, None]
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - mix) + wet * mix


def save(out, name, x, peak_db=-3.0):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    f = int(0.05 * SR)
    x[:f] *= np.linspace(0, 1, f)[:, None]
    x[-f:] *= np.linspace(1, 0, f)[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'a.raw')
        pcm.tofile(raw)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', raw, '-c:a', 'aac', '-b:a', '160k', os.path.join(out, name)], check=True)
    print('  ✔', name)


def pad(freq, n, bright=1200):
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.09, 0.0, 0.11):
        f = freq * 2 ** (det / 12)
        s += 2 * ((f * tt + rng.random()) % 1.0) - 1
    s += 0.7 * np.sin(2 * np.pi * freq * 0.5 * tt)
    lfo = 1 + 0.25 * np.sin(2 * np.pi * 0.06 * tt + rng.random() * 6)
    return lp(s * lfo, bright) / 3.0


def whoosh(dur, f0, f1, g):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 10
    for k in range(steps):
        a, b = k * n // steps, (k + 1) * n // steps
        f = f0 + (f1 - f0) * k / (steps - 1)
        out[a:b] = bp(noise, max(30, f * 0.6), min(SR / 2 - 100, f * 1.4))[a:b]
    return out * np.sin(np.pi * tt / dur) ** 1.5 * g


def thump(f, dur, g):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt * (1 - 0.3 * tt / dur)) * np.exp(-tt * 9) * g


def bubble(f0, dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (1 + 2.2 * tt / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9 / dur)


# ------------------------------------------------------------------ MÚSICA
# (inicio, fin, notas MIDI, brillo, ganancia): cada escena tiene su color armónico
CHORDS = [
    (0, 12.4, [33, 40, 45, 48], 700, 0.9),       # Am(sus) grave — misterio de la silueta
    (12.2, 23.4, [33, 40, 45, 52, 57], 1100, 0.8),
    (23.2, 31, [36, 43, 48, 52, 55, 60], 1800, 0.75),  # C — apertura luminosa, título
    (30, 41, [36, 43, 48, 55, 60], 1600, 0.6),   # descenso: zona iluminada
    (40.5, 51.5, [34, 41, 46, 50, 53], 1100, 0.6),  # crepuscular
    (51, 61.5, [31, 38, 43, 46, 50], 800, 0.6),  # medianoche
    (61, 80, [29, 36, 41, 44, 48], 600, 0.65),   # abisal
    (80, 104, [33, 40, 45, 48], 650, 0.6),       # pescador: misterio
    (104, 125, [32, 39, 44, 47, 51], 900, 0.6),
    (124, 155, [36, 43, 47, 52, 55], 1100, 0.55),  # reproducción: extrañeza tierna
    (155, 182, [31, 38, 43, 46], 750, 0.6),      # víbora
    (181.5, 225, [34, 41, 45, 50, 53], 1000, 0.55),
    (225, 270.5, [38, 45, 50, 53, 57], 1300, 0.65),  # calamar gigante: grandeza
    (270, 291.5, [41, 48, 53, 57, 60, 64], 1700, 0.6),  # el ojo: asombro
    (291, 320, [38, 45, 50, 55, 57], 1300, 0.6),
    (320, 352.5, [33, 40, 45, 48, 52], 1100, 0.65),  # cachalote: poder
    (352, 377.5, [31, 38, 43, 46, 50], 800, 0.6),   # ecolocalización
    (377, 415, [29, 36, 41, 44, 48], 900, 0.75),    # reconstrucción: tensión
    (415, 441.5, [35, 42, 47, 50, 54], 1500, 0.6),  # Antártida: frío cristalino
    (441, 471.5, [33, 40, 45, 50, 52], 1200, 0.6),
    (471, 500, [31, 38, 43, 47, 50], 900, 0.6),
    (500, 529.5, [33, 40, 47, 52], 900, 0.55),      # mundo desconocido
    (529, 556, [36, 43, 47, 52, 55, 59], 1900, 0.55),  # bioluminiscencia: maravilla
    (555.5, 570.5, [34, 41, 46, 50, 53], 1200, 0.55),
    (570, 586, [36, 43, 48, 52, 55, 60], 1800, 0.7),  # final: emoción
    (585.5, 600, [41, 48, 53, 57, 60, 65], 2400, 0.75),  # ascenso a la luz
]
PULSES = [(103.5, 107.5, 33, 3.0), (167.5, 177, 31, 3.0), (243, 249.5, 38, 2.0), (377.5, 400, 29, 2.0), (386, 395, 29, 4.0)]
SWELLS = [12.4, 23.6, 90.5, 106.6, 157, 169.6, 228, 270.5, 326.6, 386.2, 425.6, 529.6, 586]
SHIMMER = [(97.6, 104, [81, 84, 88]), (270.5, 291.5, [76, 79, 84, 88]), (529.6, 556, [79, 83, 86, 91]), (585, 600, [77, 81, 84, 89])]


def make_music(D, out):
    print('Música…')
    N = int(D * SR)
    x = np.zeros((N, 2))
    for a, b, notes, bright, g in CHORDS:
        n = int((min(b, D) - a) * SR)
        if n <= 0:
            continue
        sig = sum(pad(midi(m), n, bright) for m in notes) / len(notes)
        sig *= env(n, 1.5, 1.5) * g
        place(x, pan(sig, 0.0), a)
        # drone grave de sub-bajo
        tt = np.arange(n) / SR
        place(x, pan(np.sin(2 * np.pi * midi(notes[0] - 12) * tt) * env(n, 2, 2) * 0.35 * g, 0), a)
    for a, b, root, rate in PULSES:
        t0 = a
        k = 0
        while t0 < b:
            n = int(0.18 * SR)
            ts = np.arange(n) / SR
            f = midi(root + (7 if k % 4 == 3 else 0))
            s = lp(np.sin(2 * np.pi * f * ts) + 0.4 * np.sign(np.sin(2 * np.pi * f * ts)), 600) * np.exp(-ts * 16)
            place(x, pan(s, 0.15 if k % 2 else -0.15), t0, 0.5)
            place(x, thump(55, 0.4, 0.4), t0)
            t0 += 1 / rate
            k += 1
    for at in SWELLS:
        n = int(4.0 * SR)
        ts = np.arange(n) / SR
        sw = bp(rng.standard_normal(n), 200, 3000) * (ts / 4) ** 2 * 0.25
        place(x, pan(sw, 0), at - 4.0)
        hit = sum(pad(midi(m), int(3 * SR), 2000) for m in (33, 45, 52)) / 3 * np.exp(-np.arange(int(3 * SR)) / SR * 1.2)
        place(x, pan(hit, 0), at, 0.8)
    for a, b, notes in SHIMMER:
        t0 = a
        k = 0
        while t0 < b:
            n = int(2.0 * SR)
            ts = np.arange(n) / SR
            s = np.sin(2 * np.pi * midi(notes[k % len(notes)]) * ts) * np.exp(-ts * 1.8) * 0.12
            place(x, pan(s, rng.uniform(-0.7, 0.7)), t0)
            t0 += 0.6
            k += 1
    x = reverb(x, 3.5, 0.32, seed=7)
    save(out, 'musica.m4a', x, -4.0)


# ------------------------------------------------------------------ AMBIENTE
def depth_profile(t):
    """Profundidad aproximada (m) por instante, para el carácter del ambiente."""
    keys = [(0, 450), (23, 20), (31, 90), (41, 200), (51.5, 1000), (61, 4100), (80, 1500), (155, 1100), (225, 700), (325, 12), (342, 15), (352, 1000), (415, 20), (425, 1600), (500, 3800), (585, 600), (600, 25)]
    for i in range(1, len(keys)):
        if t <= keys[i][0]:
            u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])
            return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * u
    return keys[-1][1]


def make_ambience(D, out):
    print('Ambiente…')
    N = int(D * SR)
    tt = np.arange(N) / SR
    w = rng.standard_normal((N, 2))
    brown = lp(hp(np.cumsum(w, axis=0), 15), 320, 3)
    brown /= np.abs(brown).max()
    dep = np.array([depth_profile(t) for t in np.arange(0, D, 0.5)])
    dep = np.interp(tt, np.arange(0, D, 0.5), dep)
    shallow = np.clip(1 - dep / 250, 0, 1)
    x = brown * (0.6 + 0.25 * np.sin(2 * np.pi * 0.05 * tt))[:, None]
    # agua clara cerca de la superficie: oleaje y siseo
    surf = lp(hp(rng.standard_normal((N, 2)), 400), 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.12 * tt))[:, None]
    x += surf * (shallow * 0.12)[:, None]
    # graves profundos en el abismo
    x += pan(np.sin(2 * np.pi * 38 * tt) * 0.08 * np.clip(dep / 3000, 0, 1), 0)
    t0 = 0.3
    while t0 < D - 1:
        sh = float(np.clip(1 - depth_profile(t0) / 300, 0.15, 1))
        b = bubble(rng.uniform(380, 1300), rng.uniform(0.03, 0.09)) * rng.uniform(0.04, 0.12) * sh
        place(x, pan(b, rng.uniform(-0.8, 0.8)), t0)
        t0 += rng.exponential(0.9 / sh)
    x = reverb(x, 2.5, 0.3, seed=5)
    save(out, 'ambiente.m4a', x, -7.0)


# ------------------------------------------------------------------ EFECTOS
def click(g=1.0):
    n = int(0.012 * SR)
    ts = np.arange(n) / SR
    return hp(rng.standard_normal(n), 1200) * np.exp(-ts * 500) * g + np.sin(2 * np.pi * 3000 * ts) * np.exp(-ts * 700) * 0.6 * g


def click_times(a, buzz, b):
    out = []
    x = a
    while x < buzz:
        out.append(x)
        x += 0.7
    dt = 0.3
    while x < b:
        out.append(x)
        x += dt
        dt = max(0.045, dt * 0.85)
    return out


def make_sfx(D, out):
    print('Efectos…')
    N = int(D * SR)
    x = np.zeros((N, 2))
    C = click_times(353, 363.2, 368.1)
    for c in C:
        place(x, pan(click(0.8), 0.2), c)
    for c in [v + 30 for v in C if v + 30 < 395]:
        place(x, pan(click(0.6), -0.2), c)
    for c in [18.0, 18.6, 19.1, 19.5, 19.85, 20.1, 20.3, 20.45, 20.6]:
        place(x, pan(click(0.5), 0), c)
    # ataques: succión + golpe sordo
    for at, g in [(106.6, 0.9), (169.6, 0.9), (246.5, 0.6)]:
        place(x, pan(whoosh(0.35, 300, 1600, 0.6 * g), 0), at - 0.1)
        place(x, thump(70, 0.5, 0.7 * g), at + 0.05)
    # chorros del calamar (pulsos)
    for a, b in [(225, 243), (253.6, 259.8), (313, 320), (389.5, 402)]:
        t0 = a + ((-a * 0.55) % 1) / 0.55
        while t0 < b:
            place(x, pan(whoosh(0.6, 200, 900, 0.35), -0.3), t0)
            t0 += 1 / 0.55
    # cachalote: soplo, golpes de cola en la inmersión
    place(x, pan(lp(hp(rng.standard_normal(int(2.6 * SR)), 300), 4000) * env(int(2.6 * SR), 0.1, 1.8) * 0.6, 0), 326.6)
    for k in range(7):
        place(x, pan(whoosh(1.2, 80, 300, 0.6), 0), 342.5 + k * 1.45)
    # presión (crujido grave)
    n = int(8 * SR)
    ts = np.arange(n) / SR
    place(x, pan(lp(rng.standard_normal(n), 120) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * ts)) * env(n, 1.5, 2) * 0.8, 0), 61.8)
    # ROV: motor, focos, brazo, sonar
    n = int(67 * SR)
    ts = np.arange(n) / SR
    hum = (np.sin(2 * np.pi * 110 * ts) * 0.3 + lp(rng.standard_normal(n), 400) * 0.4) * env(n, 3, 5) * 0.25
    place(x, pan(hum, -0.2), 503)
    for at in (503.0, 529.4, 539.2):
        place(x, pan(click(1.0) * 0.6, 0), at)
        place(x, thump(180, 0.15, 0.3), at)
    n = int(1.2 * SR)
    ts = np.arange(n) / SR
    servo = np.sin(2 * np.pi * (300 + 200 * np.sin(np.pi * ts / 1.2)) * ts) * env(n, 0.1, 0.2) * 0.15
    for at in (518.8, 520.6, 522.6, 526.8):
        place(x, pan(servo, 0.3), at)
    for k in range(5):
        n = int(1.4 * SR)
        ts = np.arange(n) / SR
        place(x, pan(np.sin(2 * np.pi * 1450 * ts) * np.exp(-ts * 3) * 0.3, 0.1), 539.6 + k * 1.4)
    x = reverb(x, 2.2, 0.25, seed=9)
    save(out, 'efectos.m4a', x, -3.0)


# ------------------------------------------------------------------ TRANSICIONES
CUTS = [12.4, 15.4, 18.0, 23.2, 30, 80, 90.2, 97.6, 103.8, 108.2, 124.2, 139.4, 155, 161, 168.2, 176.8, 182, 195.2, 201.6, 210.6, 225, 236.2, 243.2, 253.6, 259.8, 270, 280.6, 291.6, 313, 320, 325, 333.2, 341.8, 352.2, 368.4, 377.4, 415, 425.2, 441.2, 447.8, 454.4, 462.2, 471.4, 481.8, 500, 570, 573, 576, 579, 582, 585]
SCENE_CUTS = [30, 80, 155, 225, 320, 415, 500, 570]


def make_transitions(D, out):
    print('Transiciones…')
    N = int(D * SR)
    x = np.zeros((N, 2))
    for at in CUTS:
        big = at in SCENE_CUTS
        place(x, pan(whoosh(1.4 if big else 0.7, 250, 2200 if big else 1500, 0.35 if big else 0.16), rng.uniform(-0.4, 0.4)), at - (0.9 if big else 0.4))
        if big:
            for k in range(10):
                place(x, pan(bubble(rng.uniform(400, 1400), 0.06) * 0.12, rng.uniform(-0.8, 0.8)), at - 0.5 + k * 0.06)
    save(out, 'transiciones.m4a', x, -6.0)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--dur', type=float, default=600.0)
    ap.add_argument('--out', default=os.path.join(ROOT, 'public/audio/documental'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    make_music(a.dur, a.out)
    make_ambience(a.dur, a.out)
    make_sfx(a.dur, a.out)
    make_transitions(a.dur, a.out)
