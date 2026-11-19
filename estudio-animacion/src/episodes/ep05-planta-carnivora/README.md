# Episodio 05 — "La planta que caza animales" (venus atrapamoscas)

Reutiliza el motor de los episodios anteriores: cámara 2.5D con parallax, perfiles de calidad,
subtítulos medidos sobre la voz, rótulos, audio con ducking y render por segmentos. No modifica
ningún archivo de los Ep. 01–04 ni del motor; solo registra `Ep05Full`, `Ep05Characters` y
`Ep05Creatures` en `src/Root.tsx`. Sin Three.js: el 3D ligero está en `anatomy/proj.ts`.

## Estructura

| Parte | Archivo |
|---|---|
| Guion (frases + instante de entrada) | `narration.json` |
| Tiempos medidos de la voz | `narration-timing.json` (generado) |
| Proyección 3D ligera, IK, siluetas de elipsoides | `anatomy/proj.ts` |
| Anatomía de la planta (lóbulos, cilios, pelos, pecíolo) | `anatomy/flytrap.ts` |
| Locomoción sobre superficies (marcha alterna, pies fijos) | `anatomy/locomotion.ts` |
| Personaje: venus atrapamoscas | `characters/VenusFlytrap.tsx` |
| Personaje: mosca doméstica | `characters/Fly.tsx` |
| Personaje: araña ambiental | `characters/Spider.tsx` |
| Hojas de control (estados y vistas) | `characters/Showcase.tsx` |
| Estados de las trampas | `animation/trapStates.ts` |
| Estados de la mosca | `animation/flyStates.ts` |
| Araña (marcha y reacción a la vibración) | `animation/spiderStates.ts` |
| Escenarios | `scenes/Wetland.tsx`, `scenes/Ground.tsx`, `scenes/leaf.ts`, `scenes/Soil.tsx`, `scenes/plantLayout.ts` |
| Visualizaciones científicas | `scenes/Science.tsx` |
| Cámaras (planos con objetivo, zoom y vista) | `cameras.ts` |
| Timeline (5.400 fotogramas, instantes clave, repetición) | `timeline.ts` |
| Sonido | `sound.ts` y `../../../tools/audio/score_ep05.py` |
| Subtítulos | `subtitles.ts` |
| Composición | `Ep05Full.tsx` |

## Personajes

**Venus atrapamoscas (*Dionaea muscipula*).** Roseta basal de 8 hojas. Cada hoja tiene un pecíolo
aplanado (alado) y una trampa de dos lóbulos articulados en la nervadura central. Los lóbulos giran
alrededor de la bisagra y su curvatura cambia de signo al cerrarse (convexa → cóncava vista desde
dentro). La cara interna es rojiza (la intensidad varía entre trampas) con glándulas, y la externa es
verde con nervaduras. El borde tiene 17 cilios ("dientes") por lóbulo, alternados para que se
entrecrucen. Hay 3 pelos sensitivos por lóbulo que se doblan al tocarlos. Cada trampa tiene su propio
estado y un vaivén ambiental muy sutil.

Estados de la trampa protagonista: `OPEN_IDLE, PREY_CONTACT, SECOND_TRIGGER, SNAP_CLOSING,
INITIAL_CLOSED, SEALING, DIGESTION, REOPENING`. Otras trampas muestran estados distintos: una
cerrada desde antes, una reabriéndose y hojas jóvenes.

**Mosca doméstica (*Musca domestica*).** Cabeza con dos ojos compuestos pardo-rojizos y antenas
cortas con arista, tórax gris con cuatro bandas oscuras, escutelo y abdomen segmentado. Tiene **dos**
alas con la nervadura típica (la vena M se curva hacia la punta), halterios, cerdas y seis patas con
fémur, tibia y tarso. Las patas se resuelven con IK y sus pies se apoyan en puntos de la superficie
real (hoja o lóbulo). En la marcha en trípode, el pie apoyado queda fijo mientras el cuerpo avanza.
El batido de alas se representa como un abanico desenfocado con un "ala fantasma" en una fase
pseudoaleatoria, no como un ciclo lento.

Estados: `FLYING, HOVERING, LANDING, WALKING, GROOMING, EXPLORING, TRIGGER_CONTACT,
ESCAPE_ATTEMPT, TRAPPED` (y restos secos tras la digestión).

**Araña ambiental.** Cefalotórax y abdomen con dibujo, ocho patas de tres segmentos con las rodillas
altas y marcha alterna (tetrápodo). Camina sobre la hoja; una gota cae, la hoja vibra, y la araña se
detiene, se agazapa y levanta las patas delanteras antes de seguir (8–13 s). No participa en la
captura.

## Ciencia representada (y matices)

- **Activación:** un solo estímulo de un pelo sensitivo no cierra la trampa. Hace falta un segundo
  estímulo en un intervalo breve. Las señales eléctricas se muestran como frentes que recorren el
  lóbulo y como una gráfica esquemática rotulada "no es una medición".
- **Cierre:** en aproximadamente una décima de segundo, por cambios físicos en los tejidos (sin
  músculos). Se repite en cámara lenta ×10 con un rótulo explícito.
- **Retención:** primero los cilios forman una "jaula". Los nuevos estímulos de la presa retenida
  conducen al sellado y a la digestión. El contador de estímulos es ilustrativo.
- **Digestión:** dura días. Se muestra como visualización acelerada (corte de la trampa sellada con
  secreción y absorción) y con un salto temporal "DÍAS DESPUÉS". Al reabrirse quedan restos secos.
- **Nutrición:** suelos ácidos, arenosos y húmedos, pobres en nutrientes. La planta hace fotosíntesis
  y complementa su nutrición con nitrógeno y fósforo de las presas. La sección del suelo y los flujos
  son esquemáticos.
- **Hábitat:** humedales de las Carolinas (Estados Unidos), ilustrado como una sabana húmeda de pinos.
- **Sonido:** el cierre es un roce vegetal breve, no un mordisco.

## Reproducir y exportar

```bash
npm run studio                       # elegir Ep05Full, Ep05Characters o Ep05Creatures
npm run ep05:sheet -- out/s.png 10,30,60,80,105,130,170
npm run still:ep05                   # hojas de control de la planta, la mosca y la araña
npm run ep05:draft                   # 540×960
npm run ep05:final                   # 1080×1920
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep05-planta-carnivora/narration.json \
  --timing src/episodes/ep05-planta-carnivora/narration-timing.json --out-dir public/audio/ep05
python3 tools/audio/score_ep05.py
```
