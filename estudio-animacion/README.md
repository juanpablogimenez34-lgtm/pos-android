# Estudio de animación 2.5D — Motor de documentales virales

Motor reutilizable para documentales animados verticales de curiosidades, hecho con
Remotion, React, SVG y Canvas 2D.

- **Episodio 01 completo**: "El animal con tres corazones", 180 s, 1080×1920, 30 fps,
  5.400 fotogramas. Composición `Ep01Full`.
- **Episodio 02**: "El monstruo que vive en la oscuridad" (rape abisal *Linophryne arborifera*),
  180 s, 5.400 fotogramas. Composición `Ep02Full`; documentación en `src/episodes/ep02-pez-abisal/README.md`.
- **Demo aprobada de 15 s**, conservada intacta. Composición `Ep01Demo`; la copia del vídeo
  está en `entregas/aprobado/`.

No usa Three.js ni WebGL: todo es vectorial 2.5D, con parallax multicapa y animación
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
    ├── index.ts / Root.tsx       # composiciones: Ep01Full, Ep01Demo, OctopusStates
    ├── engine/                   # MOTOR (no sabe nada de pulpos ni del océano)
    │   ├── math.ts               # ruido, PRNG determinista, colores, curvas Bézier
    │   ├── timeline.ts           # pistas Hermite/Catmull-Rom con paradas suaves
    │   ├── camera.tsx            # cámara 2.5D, ParallaxLayer, mundo↔pantalla
    │   ├── quality.tsx           # perfiles draft / final
    │   ├── Subtitles.tsx         # subtítulos 2 líneas, resaltado, zona segura
    │   ├── TitleCard.tsx         # rótulo cinematográfico
    │   ├── AudioTracks.tsx       # 6 pistas independientes (sólo archivos reales)
    │   ├── cues.ts               # subtítulos desde tiempos MEDIDOS de la locución
    │   ├── Overlays.tsx          # capítulos, rótulos científicos, transición, final
    │   ├── style.tsx             # indicador de acabado refinado (la demo no lo usa)
    │   ├── fonts.ts, useTime.ts, types.ts
    ├── environments/underwater/  # BIBLIOTECA DE ESCENARIO
    │   ├── palette.ts            # paleta + perspectiva atmosférica
    │   ├── geometry.ts           # generadores memorizados: rocas, corales, erizos
    │   ├── Rocks.tsx             # rocas, plataforma, cueva, sombra de la cueva
    │   ├── Flora.tsx             # algas, anémonas, corales, esponjas, erizos
    │   ├── Water.tsx             # columna de agua, rayos de luz, arrecifes lejanos, peces
    │   ├── CanvasFX.tsx          # partículas + bokeh, cáusticas (canvas a baja resolución)
    │   ├── Grade.tsx             # viñeta y etalonaje
    │   ├── Props.tsx             # concha, chorro del sifón, tinta, grieta, campo de rocas
    │   └── sets/CaveReefSet.tsx  # escenario "arrecife con cueva" (disposición = datos)
    ├── creatures/octopus/        # PERSONAJE
    │   ├── rig.ts                # anatomía y piel (datos de especie)
    │   ├── states.ts             # 8 estados + mezcla continua entre estados
    │   ├── pose.ts               # pose pura: brazos (onda + IK FABRIK + pasos), manto, ojos, sifón
    │   ├── Octopus.tsx           # render: volumen, ventosas, manchas, papilas, ojos
    │   ├── Ink.tsx               # nube de tinta determinista (v1, demo)
    │   ├── Anatomy.tsx           # sistema circulatorio y nervioso sobre el mismo rig
    │   ├── MacroArm.tsx          # primer plano macro de ventosas + quimiorrecepción
    │   └── StatesShowcase.tsx    # hoja de control con los 8 estados
    ├── creatures/moray/Moray.tsx # morena (Muraena helena) con ondulación propia
    ├── creatures/anglerfish/     # Ep. 02: rape abisal hembra, macho (libre/adherido), pez linterna
    ├── environments/deepsea/     # Ep. 02: océano profundo, descenso, nieve marina, máscara de luz
    └── episodes/ep01-pulpo/
        ├── narration.json        # GUION DEFINITIVO: frases + instante de entrada
        ├── narration-timing.json # tiempos medidos de la locución (generado)
        ├── script.ts             # guion de referencia de la primera entrega
        ├── demo.config.ts / Ep01Demo.tsx   # demo aprobada (15 s)
        └── full/
            ├── timeline.ts       # línea de tiempo maestra de 180 s (datos)
            ├── HeartLens.tsx     # panel del corazón sistémico (65–70 s)
            └── Ep01Full.tsx      # composición del episodio
    └── episodes/ep02-pez-abisal/ # Ep. 02 completo (narración, timeline, composición, README)
tools/audio/                      # generadores de narración y banda sonora (Python)
public/audio/ep01/                # 6 pistas reales generadas (ver tools/audio/README.md)
entregas/                         # vídeos, informes y copia de la demo aprobada
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
npm run studio                 # Remotion Studio (elige Ep01Full o Ep01Demo)
npm run sheet -- out/s.png 10,30,60,90,120,150   # hoja de contacto de fotogramas
npm run still:states           # los 8 estados del pulpo
```

## Exportación del episodio (por segmentos)

```bash
npm run ep01:draft     # borrador 540×960, perfil draft, tramos de 30 s → out/ep01-borrador-540x960.mp4
npm run ep01:final     # final 1080×1920, perfil final, tramos de 30 s → out/ep01-final-1080x1920.mp4
```

`scripts/render-episode.mjs` sigue estos pasos:

1. Renderiza el vídeo en tramos independientes, sin audio. Si un tramo ya existe lo reutiliza.
2. Renderiza una sola vez el audio: las 6 pistas mezcladas, con la música bajando
   automáticamente bajo la voz.
3. Normaliza el audio a −14 LUFS (EBU R128, dos pasadas, lineal).
4. Une todo sin recomprimir el vídeo.
5. Verifica los 5.400 fotogramas y escribe `*.report.json` con el tiempo y el pico de RAM
   de cada tramo.

La demo de 15 s se sigue exportando con `npm run render` (composición `Ep01Demo`).

## Estructura del episodio (`src/episodes/ep01-pulpo/full/timeline.ts`)

| Escena | Tiempo | Qué ocurre | Estados del pulpo |
|---|---|---|---|
| 1 · El misterio | 0–20 s | acercamiento al arrecife, ojo en la cueva, brazos que exploran, salida, giro de cámara y título | HIDING → EXPLORING → CRAWLING → RESTING |
| 2 · Sus tres corazones | 20–45 s | primer plano y vista anatómica sobre el mismo personaje: branquias, 2 corazones branquiales, corazón sistémico y flujo de sangre (incolora → azul) | RESTING |
| 3 · El precio de nadar | 45–70 s | camina, se recoge, se gira y nada con el manto por delante (chorro del sifón); panel del corazón sistémico | CRAWLING → RESTING → SWIMMING → EXPLORING |
| 4 · Camuflaje | 70–95 s | color, patrón, "nubes pasajeras" y papilas cambian de forma gradual junto a las rocas | RESTING → CAMOUFLAGING |
| 5 · El depredador | 95–120 s | la morena sale de su grieta, el pulpo se oscurece, la morena embiste, nube de tinta y huida | THREATENED → INK_ESCAPE |
| 6 · Ocho brazos | 120–150 s | macro de ventosas con quimiorrecepción, manipula una concha, brazos con tareas distintas, sistema nervioso | EXPLORING → RESTING |
| 7 · Revelación final | 150–180 s | regresa a la cueva, primer plano del ojo (la cámara sigue el ojo real), se camufla, la cámara se aleja y aparece la pregunta final | CRAWLING → RESTING → CAMOUFLAGING → HIDING |

Los cortes (45, 120, 127 y 150 s) quedan tapados por una cortina de algas (`CutWipe`).
Las escenas 1→2 y 3→4→5 son continuas, sin corte.

## Mediciones reales

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU, `--concurrency=4`.

| Render | Resolución | Fotogramas | Tiempo | Pico RAM (node + Chrome) | Tamaño |
|---|---|---|---|---|---|
| Demo aprobada (`Ep01Demo`, final) | 1080×1920 | 450 | 68,1 s | 3.684 MB | 11,05 MB |
| **Episodio 01, borrador** (`Ep01Full`, draft, 6 tramos) | 540×960 | **5.400** | 288,5 s de vídeo + 191,1 s de audio = **479,6 s** | **3.890 MB** | **27,42 MB** |
| Episodio 01, final | 1080×1920 | — | pendiente de validación | — | — |

Detalle completo en `entregas/ep01/INFORME.md` y `entregas/ep01/*.report.json`.

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

## Audio (6 pistas reales, generadas aquí)

| Pista | Volumen en la mezcla | Origen |
|---|---|---|
| Narración es-MX | 1,0 | voz neuronal Piper `es_MX-claude-high` (dataset Apache-2.0) |
| Música | 0,34, baja a ×0,4 bajo la voz | síntesis original (`tools/audio/score.py`) |
| Ambiente submarino | 0,42 | síntesis (ruido filtrado + burbujas) |
| Movimiento | 0,75 | síntesis, sincronizada con pasos, chorros, tinta y latidos |
| Suspenso | 0,7 | síntesis (95–120 s) |
| Transiciones | 0,55 | barridos en los cortes, golpes de título y final |

Los subtítulos salen de los tiempos **medidos** de cada frase sintetizada
(`narration-timing.json`). Para regenerar la voz o sustituirla por una locución humana,
consulta `tools/audio/README.md`.

## Separar el estudio del repositorio pos-android

El estudio vive en `estudio-animacion/`, dentro de la rama de trabajo de pos-android, y no
toca ningún archivo del POS. Para llevarlo a un repositorio propio sin modificar el historial
de pos-android:

```bash
estudio-animacion/scripts/export-standalone.sh /ruta/a/pos-android <rama> ../estudio-animacion-repo
cd ../estudio-animacion-repo && git remote add origin <URL-repo-nuevo> && git push -u origin main
```

El script trabaja sobre un clon temporal y usa `git subtree split`, así que conserva los
commits del estudio y no borra nada del original.

