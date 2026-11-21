# Estudio Premium 2.0

Capa reutilizable sobre el motor existente (`src/engine`). **No sustituye nada**: los episodios
anteriores siguen usando su código y renderizan igual. Sin Three.js; solo React + SVG/CSS + Remotion.

| Módulo | Para qué sirve |
|---|---|
| `timeline.ts` | Plan de episodio como datos: estructura de retención de 9 segmentos (`STRUCTURE_180`), beats visuales, gancho de 5 s en tres tiempos y `validateEpisode()` |
| `camera.ts` | Cámara 2D con parallax del estudio + curvas con nombre (`cine`, `out`…), `shot()` entre encuadres, seguimiento con retraso, respiración de cámara |
| `DepthStage.tsx` | Capas por profundidad con parallax y bruma atmosférica automática (profundidad de campo simulada sin filtros) |
| `Atmosphere.tsx` | Bokeh de primer plano y partículas en suspensión |
| `Transitions.tsx` | Transiciones motivadas por el escenario: cortina de burbujas, lengua de espuma, cruce de superficie |
| `HookKit.tsx` | Palabra de impacto corta y "golpe" de cámara para el gancho |
| `Subtitles2.tsx` | Subtítulos premium: 2 líneas, palabra a palabra, resaltados, zona segura, se apartan del animal |
| `srt.ts` / `scripts/export-srt.mjs` | Archivo .srt con los mismos bloques que se ven en pantalla |
| `EpisodeShell.tsx` | Carcasa de episodio: calidad, estilo, escenas por tiempo, subtítulos y mezcla con prioridad de la voz |

Herramientas:

```bash
node scripts/check-retention.mjs src/episodes/<ep>/config/beats.json 15   # cambio visual cada ≤ 15 s, gancho, cobertura
node scripts/export-srt.mjs <narration-timing.json> <salida.srt> 28 [límite_s]
node scripts/render-episode.mjs --comp <ID> --frames 450 --seg 15 --out out/prueba-15s.mp4   # prueba de 15 s
node scripts/render-episode.mjs --comp <ID> --quality draft --scale 0.5 --frames 450 --out out/prueba-540.mp4
```

Receta para un documental nuevo (animales, océanos, espacio, misterios): guion en
`narration/narration.json` → `tools/audio/narration.py` (tiempos medidos) → banda sonora con un
`tools/audio/score_*.py` → `config/beats.json` + `config/plan.ts` → escenas que devuelven
`{svg, overlay}` → `EpisodeShell` → prueba de 15 s → aprobación → render completo.
