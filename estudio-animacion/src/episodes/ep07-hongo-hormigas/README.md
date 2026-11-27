# Episodio 07 — "El hongo que controla a las hormigas"

**Especies:** la hormiga carpintera *Camponotus rufipes* (obrera, Sudamérica) y su hongo hospedador
documentado, *Ophiocordyceps camponoti-rufipedis* (complejo *O. unilateralis*), descrito en la Mata
Atlántica de Brasil (Evans et al., 2011).

Reutiliza el motor de la serie: cámara 2.5D, parallax, calidad, subtítulos medidos, rótulos, audio
con ducking y render por segmentos. No modifica los Ep. 01–06 ni el motor. Solo registra `Ep07Full`
y `Ep07Characters` en `src/Root.tsx`. La base 3D ligera (`Animation/proj.ts`, `locomotion.ts`,
`render.ts`) es una copia de la del Ep. 05. Sin Three.js.

## Estructura

| Carpeta | Contenido |
|---|---|
| `Characters/` | `antSpec.ts` (FICHA de continuidad), `Ant.tsx` (rig y render, con las capas del hongo), `Showcase.tsx` |
| `Fungus/` | `MicroViews.tsx` (esquemas microscópicos, indicador de etapa, "DÍAS DESPUÉS"), `spores.ts` |
| `Colony/` | `colony.ts` (5 obreras con rutas, ritmos y pausas propias) |
| `Environments/` | `surfaces.ts` (rama, hoja baja, tallo, envés de la hoja elevada), `Forest.tsx`, `ForestLayer.tsx`, `Jungle.tsx` |
| `Animation/` | `antMotion.ts` (marcha en trípode, antenas, limpieza, marcha alterada), `heroAnt.ts` (estados de la protagonista) |
| `Camera/` | `cameras.ts` (29 planos macro, con elevación negativa bajo la hoja) |
| `Script/` | `narration.json` y `narration-timing.json` |
| `Audio/` · `Subtitles/` · `Timeline/` | mezcla, subtítulos medidos, escenas, instantes clave, etapas del hongo y cámara lenta |

## Protagonista: estados

`WALKING` (trípode alterno con pies fijos en la superficie), `ANTENNA_SCAN`, `MANDIBLE_MOVEMENT`,
`TURNING`, `GROOMING` (la pata delantera pasa por la antena), `CLIMBING` (por el tallo vertical, con
el cuerpo orientado según la superficie), `INFECTED_WALK` (rumbo vacilante, temblor leve, pausas),
`LEAF_GRIP` (mandíbulas sobre la nervadura del envés, con cámara lenta puntual) e `IMMOBILE`.

## Hongo: etapas

`SPORE` y `GERMINATION` (esquema), `INFECTION` (atraviesa la cutícula con un apresorio),
`INTERNAL_GROWTH` (células en la hemolinfa y redes entre las fibras musculares, "según algunos
estudios"), `BEHAVIORAL_MANIPULATION`, `HOST_DEATH`, `FRUITING_BODY` (filamentos blancos en las
articulaciones; tallo desde detrás de la cabeza; estructura fértil en un lado) y `SPORE_RELEASE`.
Las vistas internas usan un marco circular azul con el rótulo "esquema · no a escala" o "el mecanismo
exacto todavía no se comprende del todo". El crecimiento externo se rotula "CRECIMIENTO ACELERADO"
tras "DÍAS DESPUÉS".

## Reproducir y exportar

```bash
npm run studio                       # Ep07Full o Ep07Characters
npm run still:ep07
npm run ep07:sheet -- out/s.png 12,24,60,85,106,140,165
npm run ep07:draft                   # 540×960
npm run ep07:final                   # 1080×1920
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep07-hongo-hormigas/Script/narration.json \
  --timing src/episodes/ep07-hongo-hormigas/Script/narration-timing.json --out-dir public/audio/ep07
python3 tools/audio/score_ep07.py
```
