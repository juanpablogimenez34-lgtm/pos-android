# EP12 · El ornitorrinco: el animal que parece imposible

180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas × 15 s.

Composiciones:
- `EP-Ornitorrinco`: el documental.
- `OrnitorrincoFicha`: vistas y etapas.

## Personaje (`character/Platypus.tsx`)

Rig con articulaciones independientes:
- cabeza;
- pico (mandíbulas que se mueven al buscar);
- ojos con párpados;
- tronco con balanceo;
- cuatro patas con codo/rodilla, pie de 5 dedos con garras y membrana que se despliega o se recoge;
- cola peluda;
- espolón trasero en machos.

**Vistas:**
- lateral, con caminata de apoyos fijos sin patinar y natación con remadas alternas;
- superior;
- frontal.

**Etapas:**
- `Egg`: huevo coriáceo que eclosiona.
- Recién nacido: rosado, sin pelo, ojos cerrados.
- Juvenil.
- Adulto.

La transición entre etapas es gradual mediante `baby` (1…0).

## Estados (`components/common.tsx`)

Son 19 estados:
- EGG_HATCHING, NEWBORN_RESTING, NURSING, JUVENILE_CRAWLING, JUVENILE_EXPLORING;
- ADULT_RESTING, WALKING, ENTERING_WATER;
- SURFACE_SWIMMING, DIVING, UNDERWATER_SWIMMING, ELECTRORECEPTION, FORAGING, FEEDING, SURFACING;
- GROOMING, BURROW_DIGGING, DEFENSIVE_POSTURE, FINAL_RETREAT.

Tienen mezcla suave de parámetros, fase de natación y distancia de marcha integradas.

## Escenarios (`environment/World.tsx`)

- **`ForestScene`:** eucaliptos, helechos, troncos, rayos y niebla.
- **`RiverWorld`:** sistema de agua con superficie ondulada, reflejos, rayos filtrados, partículas, anillos de ondas, burbujas, sedimentos, fondo de piedras, plantas y larvas, orilla y atardecer.
- **`BurrowCutaway`:** corte ilustrativo del terreno con el túnel y el nido.
- **`SciPanel`:** fondo de las visualizaciones.

## Audio

Hay 12 pistas en `public/audio/ep12-ornitorrinco/`, generadas con `tools/audio/score_ep12_ornitorrinco.py`.

## Comandos
```
node scripts/render-episode.mjs --comp EP-Ornitorrinco --quality draft --scale 0.5 --seg 30 --out out/ep12-ornitorrinco-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Ornitorrinco --quality final --scale 1 --seg 30 --crf 20 --out out/ep12-ornitorrinco-final-1080x1920.mp4
```
