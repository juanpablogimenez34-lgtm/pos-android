# EL PEZ QUE DISPARA AGUA COMO UN FRANCOTIRADOR (Toxotes jaculatrix)

Documental de 180 s · 1080×1920 · 30 fps · 5.400 fotogramas (12 × 15 s) · composición `EP-PezArquero`.
Remotion + React + SVG (sin Three.js). Episodio independiente: no modifica episodios anteriores, componentes
compartidos ni el POS Android (solo importa la carcasa del Estudio 2.0 y las etiquetas de `ep18-mixino`).

```
src/episodes/ep21-pez-arquero/
├─ character/ArcherFish.tsx   pez arquero: cuerpo comprimido plateado-amarillento, bandas en cuña, ojo alto que
│                             sigue al objetivo, boca oblicua, aletas articuladas, cola en escorzo, anticipación
├─ character/Insects.tsx      insectos (mosca, escarabajo, grillo: posado/golpeado/cayendo/en el agua/volando),
│                             hoja-posadero con viento y oscilación amortiguada al impacto, ondas de superficie
├─ effects/WaterJet.tsx       MOTOR DEL CHORRO: paquetes balísticos que llegan a la vez (el agua se concentra en
│                             la punta), columna continua, gotas satélite, abanico de impacto o caída si falla
├─ components/hunt.ts         MOTOR DE CAZA: fases A–G (detección → captura) en tiempo de acción con `remap`
│                             para la cámara lenta; el insecto nunca cae antes del impacto
├─ components/HuntView.tsx    reparte una caza entre las capas aire / agua / superficie
├─ components/common.tsx      12 estados del pez, marca, rótulos y refracción (ley de Snell) para la escena 4
├─ environment/Mangrove.tsx   manglar en toma partida: selva desenfocada, mangles con raíces zancudas (desplazadas
│                             bajo el agua), ramas con hojas, agua verde, sedimento, cardumen, cáusticas, línea de agua animada
├─ scenes/S01_04 … S09_12     doce escenas (la caza 6–8 es una sola acción con cámara lenta)
└─ Documentary.tsx            composición, subtítulos y 10 pistas
```

## Audio
```bash
python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx \
  --src src/episodes/ep21-pez-arquero/data/narration.json \
  --timing src/episodes/ep21-pez-arquero/data/narration-timing.json --out-dir public/audio/ep21-pez-arquero
python3 tools/audio/score_ep21_pez_arquero.py
node scripts/export-srt.mjs src/episodes/ep21-pez-arquero/data/narration-timing.json entregas/ep-pez-arquero/ep-pez-arquero-180s.srt 28
```

## Render
```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/render-episode.mjs --comp EP-PezArquero --quality draft --scale 0.5 --seg 30 --out out/pez-arquero-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-PezArquero --quality final --scale 1 --seg 30 --crf 20 --out out/ep-pez-arquero-final-1080x1920.mp4
```
