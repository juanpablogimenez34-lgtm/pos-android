# EL PEZ QUE SE CONVIERTE EN UN GLOBO DE ESPINAS (Diodon holocanthus)

Documental de 180 s · 1080×1920 · 30 fps · 5.400 fotogramas (12 escenas × 450) · composición `EP-PezErizo`.
Remotion + React + SVG (sin Three.js). Episodio independiente: no modifica episodios anteriores ni el POS Android.
Reutiliza la carcasa del Estudio 2.0 (subtítulos, mezcla, cámara), las etiquetas del mixino y el pez
depredador de `ep18-mixino` (solo importados).

```
src/episodes/ep20-pez-erizo/
├─ character/inflation.ts      MOTOR DE INFLADO/DESINFLADO: malla polar (θ, s) que lleva cada punto del
│                              cuerpo normal a su posición inflada; vientre primero, cabeza casi fija
├─ character/PorcupineFish.tsx el pez: silueta, degradado y volumen, textura y manchas en la malla, espinas
│                              con anclaje fijo (giran de plegadas a radiales y se alargan, con sombra),
│                              ojos de proporción constante, pico que bombea, aletas pectoral/dorsal/anal/caudal,
│                              corte anatómico (esófago → estómago muy expansible) y flujo de agua
├─ character/Sheet.tsx         ficha de inflado 0 · 0,25 · 0,5 · 0,75 · 1 (PezErizoFicha)
├─ environment/Reef.tsx        arrecife en 5 planos: corales ramificados, cerebro, abanicos, algas, rocas,
│                              cardúmenes, rayos, cáusticas y partículas
├─ components/common.tsx       10 estados del pez (NORMAL_SWIM … RELAXED_SWIM) con mezcla suave, curva de inflado
├─ data/timeline.ts            12 escenas y eventos (inflados y desinflados distintos en cada escena)
├─ data/narration*.json        guion locutado y tiempos medidos
├─ scenes/S01_03 … S10_12.tsx  las doce escenas
└─ Documentary.tsx             composición, subtítulos (suben en los primeros planos) y 9 pistas
```

## Audio
```bash
python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx \
  --src src/episodes/ep20-pez-erizo/data/narration.json \
  --timing src/episodes/ep20-pez-erizo/data/narration-timing.json --out-dir public/audio/ep20-pez-erizo
python3 tools/audio/score_ep20_pez_erizo.py
node scripts/export-srt.mjs src/episodes/ep20-pez-erizo/data/narration-timing.json entregas/ep-pez-globo/ep-pez-globo-180s.srt 28
```

## Render
```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/render-episode.mjs --comp EP-PezErizo --quality draft --scale 0.5 --seg 30 --out out/pez-globo-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-PezErizo --quality final --scale 1 --seg 30 --crf 20 --out out/ep-pez-globo-final-1080x1920.mp4
```
