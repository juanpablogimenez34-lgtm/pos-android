# Mundo Insólito Documentales — EP07 · El pez remo gigante: el dragón de las profundidades

Composición Remotion **`EP07PezRemo`** · 180 s · 1080×1920 (9:16) · 30 fps · 5.400 fotogramas ·
H.264 + AAC. Carpeta independiente `src/episodes/ep14-pez-remo/` (el repositorio ya tenía un
`ep07-hongo-hormigas` y `entregas/ep07/`, que no se han tocado). Entregas en `entregas/ep07-pez-remo/`.

La carpeta sugerida `mundo-insolito-pez-remo-ep07/` se adaptó al estudio existente: los episodios
viven en `src/episodes/` y comparten el motor, el Estudio 2.0 y el sistema de render.

## Estructura

```
src/episodes/ep14-pez-remo/
  Documentary.tsx            composición principal (EpisodeShell del Estudio 2.0)
  components/
    Oarfish.tsx              modelo articulado y procedural del pez remo
    OarfishFin.tsx           aleta dorsal de ~140 radios con ondas que viajan cabeza → cola
    OarfishSheet.tsx         ficha de control (composición PezRemoFicha)
    OceanEnvironment.tsx     océano por capas (reutiliza el del episodio del tiburón duende) + paleta
    OceanParticles.tsx       kril y enjambre con alimentación determinista
    VolumetricLight.tsx      haz de luz volumétrico simulado
    CinematicCamera.ts       cámara 2.5D (Estudio 2.0)
    DocumentarySubtitles.ts  subtítulos premium + tiempos de voz para el ducking
    SceneTransition.ts       transiciones motivadas
    Legends.tsx              velero nocturno, costa estilizada, mito frente a evidencia
    Exploration.tsx          ROV con focos, comparación de escala
  scenes/Scene01.tsx … Scene12.tsx, common.tsx
  data/narration.json, narration-timing.json (medidos), timeline.ts, scientificFacts.ts, beats.json
  utils/animation.ts, camera.ts, interpolation.ts
  audio/SoundDesign.ts
tools/audio/score_ep14_oarfish.py   banda sonora y efectos originales
public/audio/ep07-pez-remo/         narración, música, ambiente, movimiento, descubrimiento, transiciones
```

## Reproducir y renderizar

```bash
cd estudio-animacion && npm install
export REMOTION_BROWSER=<chrome-headless-shell o chromium>      # opcional
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/ep14-pez-remo/data/narration.json \
  --timing src/episodes/ep14-pez-remo/data/narration-timing.json --out-dir public/audio/ep07-pez-remo
python3 tools/audio/score_ep14_oarfish.py
node scripts/check-retention.mjs src/episodes/ep14-pez-remo/data/beats.json
node scripts/export-srt.mjs src/episodes/ep14-pez-remo/data/narration-timing.json entregas/ep07-pez-remo/ep07-pez-remo-subtitulos.srt 28
npx remotion studio                      # vista previa interactiva (EP07PezRemo, PezRemoFicha)
node scripts/render-episode.mjs --comp EP07PezRemo --quality final --scale 1 --seg 30 --crf 20 --out out/ep07-pez-remo-final.mp4
# versión ligera: --quality draft --scale 0.5 · poca memoria: --seg 15 --concurrency 1
```

`render-episode.mjs` renderiza por tramos sin audio, los une con FFmpeg (copia de flujo, sin
recompresión), mezcla las 6 pistas con ducking de la voz, normaliza a −14 LUFS y verifica con FFprobe.
