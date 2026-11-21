# Mundo Insólito Documentales — El tiburón duende: la criatura que dispara su mandíbula

Composición Remotion **`TiburonDuende`** · 180 s · 1080×1920 (9:16) · 30 fps · 5.400 fotogramas ·
H.264 + AAC. Episodio independiente en `src/episodes/ep13-tiburon-duende/`, construido sobre el
**Estudio 2.0** (`src/studio2`). No se ha modificado ni borrado ningún episodio anterior ni el
proyecto Android POS (los únicos cambios fuera de la carpeta son el registro en `src/Root.tsx`, el
script de audio `tools/audio/score_ep13_goblin.py` y los audios en `public/audio/ep-tiburon-duende/`).

## Arquitectura

| Módulo | Archivo |
|---|---|
| Composición principal | `TiburonDuende.tsx` (usa `EpisodeShell` del Estudio 2.0) |
| Configuración del episodio | `config/episode.ts` (12 escenas, fotogramas de inicio/fin, eventos), `config/beats.json` (beats de retención), `config/export.ts` |
| Guion y tiempos | `narration/narration.json`, `narration/narration-timing.json` (medidos) |
| Escenarios | `environment/DeepSea.tsx` (color por profundidad, rayos, talud, rocas, fondo, nieve marina en dos capas, bioluminiscencia, siluetas) |
| Tiburón | `character/GoblinShark.tsx` (hocico, cráneo, mandíbula superior e inferior, dientes, cuerpo, cola, pectorales, dorsales, pélvicas, anal, ojo, branquias, brillos y luz de borde, giro 2.5D) · ficha `character/SharkSheet.tsx` (`TiburonDuendeFicha`) |
| Animación mandibular y natación | `animation/JawMotion.ts` (anticipación → extensión → captura → recuperación; natación; repetición a cámara lenta) |
| Peces y presas | `character/DeepPrey.tsx` (pez, cefalópodo y crustáceo genéricos; silueta humana) |
| Partículas | en `environment/DeepSea.tsx` (nieve marina) y `effects/Effects.tsx` (agua desplazada por el ataque) |
| Iluminación | haz de luz azul y destello en `effects/Effects.tsx`; etalonaje, viñeta y luz de sujeto reutilizados del estudio |
| Cámara | Estudio 2.0 (`shot`, `breathe`, parallax por capas) |
| Subtítulos | `subtitles/subtitles.ts` → `Subtitles2` del Estudio 2.0 (palabra a palabra, máx. 2 líneas) |
| Audio | `audio/SoundDesign.ts` + `tools/audio/score_ep13_goblin.py` |
| Transiciones | `effects/Transitions.ts` (Estudio 2.0) |
| Ciencia | `science/Science.tsx` (escala de profundidad, campo eléctrico educativo, tamaño, linaje) |
| Créditos | `credits/Credits.tsx` (logotipo y lema) |

## Comandos exactos

```bash
cd estudio-animacion
npm install
export REMOTION_BROWSER=<ruta a chrome-headless-shell o chromium>   # opcional
# 1) narración (voz gratuita local Piper es_MX) y banda sonora original
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/ep13-tiburon-duende/narration/narration.json \
  --timing src/episodes/ep13-tiburon-duende/narration/narration-timing.json \
  --out-dir public/audio/ep-tiburon-duende
python3 tools/audio/score_ep13_goblin.py
# 2) comprobaciones
node scripts/check-retention.mjs src/episodes/ep13-tiburon-duende/config/beats.json
node scripts/export-srt.mjs src/episodes/ep13-tiburon-duende/narration/narration-timing.json entregas/ep-tiburon-duende/ep-tiburon-duende-subtitulos.srt 28
# 3) previsualización ligera (540×960) y MP4 final (por tramos de 30 s)
node scripts/render-episode.mjs --comp TiburonDuende --quality draft --scale 0.5 --seg 30 --crf 26 --out out/ep-tiburon-duende-preview-540x960.mp4
node scripts/render-episode.mjs --comp TiburonDuende --quality final --scale 1 --seg 30 --crf 20 --out out/ep-tiburon-duende-final-1080x1920.mp4
# poca memoria: --seg 15 --concurrency 1
```

Para usar otra voz: sustituir `public/audio/ep-tiburon-duende/narracion.m4a` y actualizar
`narration-timing.json` con los tiempos reales (subtítulos y ducking se recalculan solos).

Afirmaciones científicas y referencias: `REFERENCIAS.md`.
