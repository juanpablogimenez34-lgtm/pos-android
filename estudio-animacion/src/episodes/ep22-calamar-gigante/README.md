# EP22 · El calamar gigante: el monstruo real de las profundidades

180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas × 15 s. Composición: `EP-CalamarGigante` (ficha del personaje: `CalamarFicha`).

## Estructura
- `character/GiantSquid.tsx`: rig 2D en SVG.
  - Manto con contracciones, aletas, cabeza, ojo con mirada y reflejos (sin parpadeo humano) y sifón con chorro.
  - 8 brazos independientes con ventosas, cada uno con su fase.
  - 2 tentáculos con maza que pueden extenderse hacia cualquier punto local.
- `character/Others.tsx`: cachalote (silueta 2D, aleta caudal vertical), pez de profundidad, corona frontal con pico y cámara científica con cebo y destello.
- `environment/OpenOcean.tsx`: océano abierto por profundidad.
  - Rayos solo cerca de la superficie, nieve marina en tres capas, siluetas lejanas, foco de luz y niebla.
  - Sin corales tropicales y sin bioluminiscencia del calamar.
- `components/common.tsx`: piezas compartidas.
  - Los 14 estados (DEEP_IDLE … CINEMATIC_REVEAL), mezclados suavemente en 0,8 s.
  - `strike()`: anticipación → extensión → contacto → captura → retracción → entrega a los brazos.
  - Transformaciones local↔mundo y rótulos.
- `data/timeline.ts`: escenas y eventos, compartidos con `tools/audio/score_ep22_calamar.py`.
- `data/narration.json` → `narration-timing.json`: narración (Piper es_MX).
- `scenes/S01_04.tsx`, `S05_08.tsx`, `S09_12.tsx`, `Documentary.tsx`.

## Audio (10 pistas)
Todas en `public/audio/ep22-calamar-gigante/`:

1. narración
2. música ambiental
3. ambiente submarino
4. movimiento del calamar
5. tentáculos
6. sifón
7. suspenso de caza
8. encuentro con el cachalote
9. transiciones
10. música final

La música baja bajo la voz (*ducking* de la carcasa).

## Comandos
```
python3 tools/audio/score_ep22_calamar.py
node scripts/render-episode.mjs --comp EP-CalamarGigante --quality draft --scale 0.5 --seg 30 --out out/ep-calamar-gigante-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-CalamarGigante --quality final --scale 1 --seg 30 --crf 20 --out out/ep-calamar-gigante-final-1080x1920.mp4
```
