# LA ANGUILA ELÉCTRICA: EL ANIMAL QUE GENERA 860 VOLTIOS

Documental de 180 s · 1080×1920 · 30 fps · 5.400 fotogramas · composición `EP-AnguilaElectrica`.
Remotion + React + SVG (sin Three.js). Episodio independiente: no modifica episodios anteriores ni el POS Android.
Reutiliza del estudio: la carcasa del Estudio 2.0 (escenas, subtítulos, mezcla), la cámara y el motor de trayectoria del mixino (`ep18-mixino/motion/path.ts`, solo importado).

```
src/episodes/ep19-anguila-electrica/
├─ Documentary.tsx          12 escenas + subtítulos + 8 pistas (6 de la carcasa + pulsos + ataque)
├─ data/timeline.ts         escenas, medidas (EEL) y eventos EV (compartidos con el sonido)
├─ data/narration*.json     guion locutado y tiempos MEDIDOS de la voz
├─ character/states.ts      máquina de estados (12 estados) con mezcla suave; distancia y fase de aleta integradas
├─ character/ElectricEel.tsx anguila: 28 puntos de control → curva densa; silueta, volumen, aleta anal con ondas propias, órganos eléctricos
├─ character/Prey.tsx       presa con estados (nadar, ocultarse, aturdida, capturada)
├─ character/Sheet.tsx      ficha de control (AnguilaFicha)
├─ environment/River.tsx    río amazónico turbio en 5 planos + superficie vista desde abajo
├─ effects/Electric.tsx     visualizaciones estilizadas: campo de electrolocalización, frentes de descarga, rótulo
├─ components/common.tsx    rótulos, marca, panel de electrocitos, ayudas de anguila
└─ scenes/S01…S12.tsx       escenas (S05 contiene la 5 y la 6; la pista de caza 5–7 es una sola)
```

## Audio

```bash
python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx \
  --src src/episodes/ep19-anguila-electrica/data/narration.json \
  --timing src/episodes/ep19-anguila-electrica/data/narration-timing.json --out-dir public/audio/ep19-anguila-electrica
python3 tools/audio/score_ep19_anguila.py
node scripts/export-srt.mjs src/episodes/ep19-anguila-electrica/data/narration-timing.json entregas/ep-anguila-electrica/anguila-electrica-180s.srt 28
```

## Render

```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/render-episode.mjs --comp EP-AnguilaElectrica --quality draft --scale 0.5 --seg 30 --out out/anguila-borrador-540x960.mp4
# final (solo tras aprobar el borrador)
node scripts/render-episode.mjs --comp EP-AnguilaElectrica --quality final --scale 1 --seg 30 --crf 20 --out out/anguila-180s-final-1080x1920.mp4
```
