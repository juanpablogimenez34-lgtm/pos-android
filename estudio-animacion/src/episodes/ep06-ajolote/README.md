# Episodio 06 — "El animal que reconstruye su cuerpo" (ajolote mexicano)

Reutiliza el motor de la serie: cámara 2.5D con parallax, calidad, subtítulos medidos, rótulos,
audio con ducking y render por segmentos. No modifica los Ep. 01–05 ni el motor. Solo registra
`Ep06Full` y `Ep06Characters` en `src/Root.tsx`. La base 3D ligera se **copió** del Ep. 05 a
`Animation/` (proyección, lista de dibujo, locomoción) para no tocar ese episodio. Sin Three.js.

## Estructura

| Carpeta | Contenido |
|---|---|
| `Characters/` | `axolotlSpec.ts` (FICHA de personaje: proporciones, colores, reglas de continuidad), `Axolotl.tsx` (rig y render), `Daphnia.tsx`, `Showcase.tsx` (fichas visuales) |
| `Animation/` | `axolotlMotion.ts` (columna, ondulación, marcha, nado), `axolotlStates.ts` (estados de los dos ajolotes), `daphniaStates.ts`, `proj.ts`, `locomotion.ts`, `render.ts` |
| `Environments/` | `Water.tsx` (canal sobre el agua, fondo submarino, partículas), `Bottom.tsx` (sedimento, rocas, plantas, raíces) |
| `Regeneration/` | `RegenViews.tsx` (lupa de tejido, etapas, panel celular, transición científica) |
| `Camera/` | `cameras.ts` (23 planos con objetivo, zoom y vista) |
| `Script/` | `narration.json` y `narration-timing.json` (tiempos medidos) |
| `Audio/` | `sound.ts` (mezcla) · síntesis en `tools/audio/score_ep06.py` |
| `Subtitles/` | `subtitles.ts` |
| `Timeline/` | `timeline.ts` (escenas, instantes clave, progreso de la regeneración r 0–6) |

## Ficha del protagonista (continuidad)

- Ajolote rosado leucístico, de 1000 u (≈ 20 cm). Cabeza ancha y aplanada, ojos pequeños y oscuros,
  boca amplia.
- **3 pares** de branquias externas con filamentos plumosos.
- **4 dedos** en cada mano anterior y **5** en cada pie posterior.
- Cola comprimida con aleta continua, surcos costales y piel húmeda con brillo dorsal.
- **Se regenera la extremidad anterior IZQUIERDA (`LF`).** Se identifica por su lado anatómico en el
  rig (no por el lado de la pantalla), así que no cambia aunque la cámara gire.
- El ajolote silvestre usa la misma base, con color marrón oscuro moteado, otro ritmo de branquias y
  sus propias rutas y reacciones.

## Estados

`IDLE, GILL_MOVEMENT, WALKING` (pares diagonales con la onda del tronco y los pies fijos en el
fondo), `SWIMMING` (onda viajera hacia la cola, patas pegadas), `TURNING` (la cabeza inicia la curva),
`FEEDING` (la boca se abre rápido, la garganta se expande y la Daphnia es succionada), `STARTLED`
(sacudida en C y branquias abiertas cuando cae una ramita), `RESTING`, `REGENERATION` y `RECOVERY`
(la pata nueva da pasos más cortos al principio).

## Regeneración (sistema procedural, r continuo 0 → 6)

| Etapa | En la pata real (rig) | En la lupa del tejido |
|---|---|---|
| STAGE_0 | muñón a mitad del antebrazo (no gráfico) | cartílago, músculo y nervios cortados en sección |
| STAGE_1 | casquete translúcido | células de la piel que migran y cubren la herida |
| STAGE_2 | yema cónica (blastema) | células coloreadas según su tejido de origen |
| STAGE_3 | la yema se alarga | proliferación (células que se dividen) |
| STAGE_4 | antebrazo y paleta de la mano | condensaciones de cartílago (antebrazo, carpo) |
| STAGE_5 | los dedos crecen en orden 2, 1, 3, 4 | condensaciones de los dedos |
| STAGE_6 | pata completa, algo más pequeña, que crece hasta su tamaño | — |

La transición a la lesión ocurre bajo un destello de la vista científica: no hay depredador ni
mutilación. Se rotula "REGENERACIÓN ACELERADA — SEMANAS O MESES".

## Reproducir y exportar

```bash
npm run studio                       # Ep06Full o Ep06Characters
npm run still:ep06                   # fichas de los personajes
npm run ep06:sheet -- out/s.png 12,30,50,80,110,140,170
npm run ep06:draft                   # 540×960
npm run ep06:final                   # 1080×1920
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep06-ajolote/Script/narration.json \
  --timing src/episodes/ep06-ajolote/Script/narration-timing.json --out-dir public/audio/ep06
python3 tools/audio/score_ep06.py
```
