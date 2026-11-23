# EL MIXINO: EL ANIMAL QUE CONVIERTE EL AGUA EN MOCO

Documental completo de 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · composición `EP-Mixino`.
Remotion + React + SVG (sin Three.js). Episodio independiente: no modifica ningún episodio anterior
ni el proyecto POS Android.

```
src/episodes/ep18-mixino/
├─ Documentary.tsx          carcasa del Estudio 2.0 (escenas, subtítulos, mezcla) + pista 7 de mucosidad
├─ data/timeline.ts         12 escenas × 15 s, medidas del personaje (HAG) y eventos EV (compartidos con el sonido)
├─ data/narration.json      guion locutado · data/narration-timing.json tiempos MEDIDOS de la voz
├─ motion/path.ts           motor de movimiento: trayectoria + "sigue al líder" + onda lateral; nudo trébol con z
├─ character/Hagfish.tsx    mixino por segmentos y capas (volumen, poros, barbillas, boca sin mandíbulas, aleta caudal, cruces del nudo)
├─ character/Slime.tsx      mucosidad: masas de gel que se hidratan, filamentos, velo y partículas (determinista)
├─ character/Predator.tsx   pez depredador articulado (boca, opérculo, aletas, mucosidad en branquias, modo cadáver)
├─ character/Sheet.tsx      ficha de control (composición MixinoFicha)
├─ environment/Deep.tsx     fondo marino profundo con parallax, nieve marina, rocas y restos orgánicos
├─ components/common.tsx    rótulos, etiquetas científicas, títulos, viñeta
└─ scenes/S01…S12.tsx       las doce escenas (S07 contiene las escenas 7 y 8 del nudo)
```

## Audio (local y gratuito)

```bash
# voz: motor existente del estudio (Piper, es_MX-claude-high)
python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx \
  --src src/episodes/ep18-mixino/data/narration.json \
  --timing src/episodes/ep18-mixino/data/narration-timing.json --out-dir public/audio/ep18-mixino
# música, ambiente, movimiento, mucosidad, suspenso y transiciones (síntesis original)
python3 tools/audio/score_ep18_mixino.py
# subtítulos .srt (mismos bloques que en pantalla)
node scripts/export-srt.mjs src/episodes/ep18-mixino/data/narration-timing.json entregas/ep-mixino/mixino-180s.srt 28
```

## Vista previa y render

```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion studio src/index.ts                                   # EP-Mixino / MixinoFicha
node scripts/contact-sheet.mjs EP-Mixino out/mixino-hoja.png 3,20,35,50,72,96,110,126,143,170 0.3
node scripts/render-episode.mjs --comp EP-Mixino --quality draft --scale 0.5 --seg 30 --out out/mixino-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Mixino --quality final --scale 1 --seg 30 --crf 20 --out out/mixino-180s-final-1080x1920.mp4
```
