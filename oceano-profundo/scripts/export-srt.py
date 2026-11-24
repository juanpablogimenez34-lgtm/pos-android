#!/usr/bin/env python3
"""Exporta subtítulos SRT desde los tiempos REALES de la voz, con las mismas reglas que los subtítulos del video
(src/utils/cues.ts): bloques de ≤ 2 líneas de ≤ N caracteres, tiempo repartido por caracteres, sin palabras sueltas.
Uso: python3 scripts/export-srt.py <timing.json> <salida.srt> <max_caracteres>
"""
import json
import sys


def wrap(text, mx):
    lines, cur = [], ''
    for w in text.split():
        if len((cur + ' ' + w).strip()) > mx and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    if cur:
        lines.append(cur)
    return lines


def cues(timing, mx, ml=2):
    out = []
    for l in timing:
        lines = wrap(l['text'], mx)
        blocks = [lines[i:i + ml] for i in range(0, len(lines), ml)]
        if len(blocks) > 1 and len(' '.join(blocks[-1]).split()) < 2:
            prev, last = blocks[-2], blocks[-1]
            merged = wrap(' '.join(prev) + ' ' + ' '.join(last), mx + 6)
            if len(merged) <= ml:
                blocks[-2:] = [merged]
            elif len(prev) > 1:
                blocks[-2:] = [prev[:-1], wrap(prev[-1] + ' ' + ' '.join(last), mx)]
        total = sum(len(' '.join(b)) for b in blocks)
        t = l['start']
        for i, b in enumerate(blocks):
            d = (l['end'] - l['start']) * len(' '.join(b)) / total
            out.append([t, l['end'] + 0.25 if i == len(blocks) - 1 else t + d, b])
            t += d
    return out


def ts(s):
    ms = int(round(s * 1000))
    return f'{ms // 3600000:02d}:{ms % 3600000 // 60000:02d}:{ms % 60000 // 1000:02d},{ms % 1000:03d}'


if __name__ == '__main__':
    src, dst, mx = sys.argv[1], sys.argv[2], int(sys.argv[3])
    c = cues(json.load(open(src, encoding='utf-8'))['timing'], mx)
    with open(dst, 'w', encoding='utf-8') as f:
        for i, (a, b, lines) in enumerate(c):
            b = min(b, c[i + 1][0]) if i + 1 < len(c) else b
            f.write(f'{i + 1}\n{ts(a)} --> {ts(b)}\n' + '\n'.join(lines) + '\n\n')
    words_in = sum(len(l['text'].split()) for l in json.load(open(src, encoding='utf-8'))['timing'])
    words_out = sum(len(' '.join(x[2]).split()) for x in c)
    print(f'✔ {len(c)} subtítulos → {dst} (palabras {words_out}/{words_in})')
    assert words_in == words_out, 'se perdieron palabras'
