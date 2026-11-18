# Estudio de animación 2.5D — Motor de documentales virales

Motor reutilizable (Remotion + React + SVG + Canvas 2D) para documentales animados
verticales de curiosidades. Primer entregable: **demostración de 15 s del Episodio 01,
"El animal con tres corazones"** (Octopus vulgaris).

Sin Three.js ni WebGL: todo es vectorial 2.5D con parallax multicapa y animación
determinista por fotograma.

## Árbol de carpetas

```
estudio-animacion/
├── package.json
├── remotion.config.ts            # formato, códec, navegador, concurrencia
├── tsconfig.json
├── props/                        # props de render (draft / final)
├── public/
│   ├── fonts/                    # Montserrat 600/800/900 (OFL) — local, sin red
│   └── audio/README.md           # cómo importar narración, música y efectos reales
├── scripts/
│   ├── render-measured.mjs       # render + tiempo, pico de RAM y tamaño reales
│   └── render-segments.mjs       # render por tramos + unión sin recomprimir
└── src/
    ├── index.ts / Root.tsx       # composiciones: Ep01Demo, OctopusStates
    ├── engine/                   # MOTOR (no sabe nada de pulpos ni del océano)
    │   ├── math.ts               # ruido, PRNG determinista, colores, curvas Bézier
    │   ├── timeline.ts           # pistas Hermite/Catmull-Rom con paradas suaves
    │   ├── camera.tsx            # cámara 2.5D, ParallaxLayer, mundo↔pantalla
    │   ├── quality.tsx           # perfiles draft / final
    │   ├── Subtitles.tsx         # subtítulos 2 líneas, resaltado, zona segura
    │   ├── TitleCard.tsx         # rótulo cinematográfico
    │   ├── AudioTracks.tsx       # 6 pistas independientes (sólo archivos reales)
    │   ├── cues.ts               # subtítulos provisionales desde el guion
    │   ├── fonts.ts, useTime.ts, types.ts
    ├── environments/underwater/  # BIBLIOTECA DE ESCENARIO
    │   ├── palette.ts            # paleta + perspectiva atmosférica
    │   ├── geometry.ts           # generadores memorizados: rocas, corales, erizos
    │   ├── Rocks.tsx             # rocas, plataforma, cueva, sombra de la cueva
    │   ├── Flora.tsx             # algas, anémonas, corales, esponjas, erizos
    │   ├── Water.tsx             # columna de agua, rayos de luz, arrecifes lejanos, peces
    │   ├── CanvasFX.tsx          # partículas + bokeh, cáusticas (canvas a baja resolución)
    │   ├── Grade.tsx             # viñeta y etalonaje
    │   └── sets/CaveReefSet.tsx  # escenario "arrecife con cueva" (disposición = datos)
    ├── creatures/octopus/        # PERSONAJE
    │   ├── rig.ts                # anatomía y piel (datos de especie)
    │   ├── states.ts             # 8 estados + mezcla continua entre estados
    │   ├── pose.ts               # pose pura: brazos (onda + IK FABRIK + pasos), manto, ojos, sifón
    │   ├── Octopus.tsx           # render: volumen, ventosas, manchas, papilas, ojos
    │   ├── Ink.tsx               # nube de tinta determinista
    │   └── StatesShowcase.tsx    # hoja de control con los 8 estados
    └── episodes/ep01-pulpo/
        ├── script.ts             # guion completo de 180 s (7 escenas), con fuentes
        ├── demo.config.ts        # cámara, trayectoria, estados, subtítulos de la demo
        └── Ep01Demo.tsx          # composición de 15 s
```

## Instalación

```bash
cd estudio-animacion
npm install
```

Remotion descarga su propio Chrome headless la primera vez. Si ya tienes uno (o no hay
acceso a esa descarga), apunta a él:

```bash
export REMOTION_BROWSER=/ruta/a/chrome-headless-shell
```

## Previsualización

```bash
npm run studio          # Remotion Studio en el navegador (línea de tiempo, props)
npm run still           # fotograma 200 → out/frame.png
npm run still:states    # los 8 estados del pulpo → out/states.png
```

## Exportación MP4

```bash
npm run render              # final 1080×1920, H.264, CRF 20 → out/ep01-demo.mp4
npm run render:draft        # borrador rápido a media resolución
npm run render:measured     # final + informe de tiempo / RAM / tamaño (.metrics.json)
npm run render:segments     # por tramos de 5 s y unión sin recomprimir
```

## Mediciones reales

Equipo: contenedor Linux, 4 núcleos, 15 GB RAM, sin GPU, `--concurrency=4`.

| Render | Resolución | Tiempo | Pico RAM (node + Chrome) | Tamaño |
|---|---|---|---|---|
| Final (`quality: final`) | 1080×1920, 450 f | **68,1 s** | **3.684 MB** | **11,05 MB** |
| Borrador (`quality: draft`, `--scale=0.5`) | 540×960, 450 f | 25,0 s | 2.823 MB | 5,47 MB |
| Por segmentos (3 × 5 s) | 1080×1920 | completado, 450 f, 15,000 s | — | — |

No hay mediciones de la demo 3D anterior en este repositorio, así que **no puedo
afirmar cuánto más rápido es**. Para compararlo, ejecuta `render:measured` en la misma
máquina en que se renderizó la versión 3D.

## Cómo está optimizado

- **Determinismo total**: cada fotograma es una función pura de `t` (sin `Math.random`,
  sin simulación acumulada). Por eso se puede renderizar en paralelo y por tramos.
- **Geometría estática memorizada** (`useMemo`/`React.memo`): rocas, corales, plataforma
  y cueva se generan una vez; por fotograma sólo cambia un `transform`.
- **Sin filtros costosos en SVG**: la profundidad se consigue con perspectiva atmosférica
  (colores mezclados con el agua), no con desenfoques. El único `blur` es el primer
  plano en calidad final, y se desactiva en el borrador.
- **Canvas sólo donde rinde más**: partículas (límite por perfil de calidad) y cáusticas
  calculadas a 1/5 de la resolución (~83k píxeles en lugar de 2M) y escaladas por el navegador.
- **Perfiles de calidad** (`engine/quality.tsx`): partículas, ventosas, segmentos de brazo,
  manchas, cáusticas y desenfoque cambian en un solo sitio.
- **Escenario reutilizado** por capas: el mismo `CaveReefStage` sirve a las 7 escenas.

## El pulpo

- 8 brazos independientes. Cada uno es una cadena de 18 segmentos (12 en borrador). La
  curvatura es una onda viajera con fase, frecuencia y ruido propios, más un enrollado de la punta.
- **Caminar**: cada brazo tiene su ciclo de paso desfasado. Durante el apoyo la punta queda
  **fija en el mundo** sobre el perfil real de la roca; en la fase aérea se levanta en arco.
  El tramo proximal se resuelve con IK FABRIK y el distal conserva su curvatura. Además,
  los brazos colisionan con el sustrato y se apoyan sobre él.
- Ventosas en dos filas escalonadas, recolocadas en cada fotograma sobre la normal
  de la curva, así que acompañan la deformación.
- Manto con contracciones de ventilación, flexión, moteado recortado, pliegues, papilas
  en el contorno y luz de contorno turquesa. Ojos con pupila horizontal, mirada hacia un
  objetivo o hacia la cámara, parpadeos, párpado y papilas supraoculares. El sifón late con la respiración.
- Estados `RESTING, CRAWLING, EXPLORING, SWIMMING, CAMOUFLAGING, THREATENED, INK_ESCAPE, HIDING`:
  son conjuntos de parámetros continuos, así que cualquier transición es suave.
  `npm run still:states` los muestra todos.

## Reutilizar el motor en otro episodio

1. Copia `src/episodes/ep01-pulpo/` como `ep02-…/`.
2. Cambia `script.ts` (guion), `demo.config.ts` (cámara, trayectoria, estados, subtítulos).
3. Reutiliza un escenario (`CaveReefStage`) o crea uno en `environments/<bioma>/sets/`.
4. Para otro animal, crea `creatures/<animal>/` con el mismo patrón
   `rig` (datos) → `pose` (función pura) → render.
5. Registra la composición en `Root.tsx`.

## Audio

No se generó ningún audio. Las seis pistas (narración, música, ambiente, movimiento,
tensión y transiciones) están cableadas y se activan al pasar archivos reales:
consulta `public/audio/README.md`.

## Pendiente (próximas entregas)

- Escenas 2–7 (esquema circulatorio animado, natación con chorro, camuflaje, morena
  con tinta, exploración de la concha, final). Los estados y la tinta ya existen en el rig.
- Sustituir los subtítulos por tiempos medidos sobre la locución real.
