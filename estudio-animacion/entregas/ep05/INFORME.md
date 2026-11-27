# Episodio 05 — "La planta que caza animales" · Informe de producción

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep05-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180,000 s** | **77,96 MB** |
| `ep05-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180,000 s | 17,33 MB |
| `hoja-de-contacto.png` | 24 fotogramas del final, de los 2 a los 179 s | | | |
| `planta-estados.png` | roseta, trampa abierta, cerrada y sellada (mismo rig) | | | |
| `mosca-arana.png` | mosca de perfil, dorsal, en vuelo, aterrizando y como restos secos; araña reaccionando | | | |

Los fotogramas se contaron con ffprobe (`-count_packets`). La sonoridad integrada (`ebur128`) es
de **−14,0 LUFS** en el borrador y en el final.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (draft, ×0,5) | Final (final, ×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 44,9 + 46,1 + 50,8 + 55,6 + 46,2 + 42,9 = **286,5 s** | 115,7 + 126,4 + 136,2 + 134,2 + 106,4 + 103,7 = **722,6 s** |
| Mezcla de audio (6 pistas, ducking) | 264,4 s (primer borrador) | reutilizada |
| Pico de RAM por tramo (node + Chrome) | 2.625 MB | **3.037 MB** |
| Síntesis de la banda sonora (`score_ep05.py`) | 34,7 s | |

El primer borrador completo se revisó fotograma a fotograma y se corrigió: las briznas desenfocadas
tapaban a la araña, las alas en reposo parecían una mancha, había manchas planas en el musgo y el
contador de estímulos mostraba un texto equivocado antes del primer toque. Después se volvió a
renderizar el borrador (cifras de la tabla) y, ya validado, el final.

## Narración y subtítulos

- Voz neuronal Piper `es_MX-claude-high` (Apache-2.0): 34 frases, **159,8 s de voz (89 %)**, sin
  solapes ni retrasos (el script `narration.py` no informó problemas).
- El guion conserva la narración base de cada escena y la amplía con datos verificables: el nombre
  y el hábitat, que la mosca percibe sabores con las patas, que suele haber tres pelos por lóbulo,
  que un solo toque no basta, el cierre en aproximadamente una décima de segundo, que la digestión
  dura días, y el suelo pobre en nutrientes.
- Los subtítulos salen de los tiempos MEDIDOS de cada frase (`narration-timing.json`), igual que en
  los episodios anteriores.

## Animación (lo que hace cada personaje)

| Personaje | Acciones | Cómo se resuelve |
|---|---|---|
| Venus atrapamoscas | OPEN_IDLE (vaivén sutil), PREY_CONTACT (el pelo se dobla y se ve la señal), SECOND_TRIGGER, SNAP_CLOSING (≈ 0,1 s, la curvatura de los lóbulos se invierte), INITIAL_CLOSED (cilios entrecruzados y sacudidas de la presa), SEALING, DIGESTION (acelerada y rotulada), REOPENING (con restos secos) | Dos lóbulos articulados en la nervadura con 3D ligero, 17 cilios por lóbulo, 3 pelos sensitivos por lóbulo, glándulas y nervaduras. Las otras siete hojas tienen estados distintos. |
| Mosca | FLYING (trayectoria irregular controlada), HOVERING, LANDING (patas extendidas antes del contacto), WALKING (trípode alterno), GROOMING (frota las patas delanteras y se limpia la cabeza), EXPLORING (cabeza y probóscide), TRIGGER_CONTACT (la pata toca la punta del pelo), ESCAPE_ATTEMPT (zumbido y salto), TRAPPED (silueta a contraluz dentro de la trampa) | Partes elipsoidales con silueta exacta. Patas de fémur, tibia y tarso resueltas con IK y pies sobre puntos de la superficie (hoja o lóbulo), así que no la atraviesan. Las alas baten como un abanico desenfocado. |
| Araña | Camina con marcha alterna; una gota cae, la hoja vibra, y se agazapa y levanta las patas delanteras | Ocho patas de tres segmentos con las rodillas altas, sobre la misma superficie de la hoja. |

Cámara: 29 planos con objetivo (araña, borde de la trampa, pelos, mosca suavizada, suelo). Hay
travelling lateral siguiendo a la mosca, cambios de elevación para mirar dentro de la trampa, una
repetición en cámara lenta ×10 claramente rotulada (81–86 s), un corte del suelo y un alejamiento
final hacia el humedal.

## Exactitud científica

- Un estímulo no cierra la trampa; un segundo estímulo en un intervalo breve sí. La gráfica de
  señales está rotulada "representación esquemática · no es una medición".
- El cierre se debe a cambios físicos de los tejidos, no a músculos, y no se presenta como un
  mordisco. El sonido es un roce vegetal breve.
- La digestión no se muestra en segundos reales: hay un corte rotulado "visualización acelerada · el
  proceso real dura días" y un salto temporal "DÍAS DESPUÉS".
- La fotosíntesis y las presas se presentan como complementarias (nitrógeno y fósforo). La sección
  del suelo y los flujos de nutrientes son esquemáticos.
- La mosca tiene dos alas (con halterios), no es una abeja, y sus ojos son grandes pero
  proporcionados.

## Limitaciones (honestas)

- El paso de la mosca de la hoja caída a la trampa ocurre fuera de cuadro (45,6–57,8 s), mientras la
  cámara muestra el interior de la trampa y los pelos.
- En el diagrama, la "nueva estimulación" de los 64–70 s se ilustra con la segunda señal; en la escena
  real, el segundo toque llega a los 78,9 s.
- El número de estímulos del contador es ilustrativo, no un umbral exacto.
- Los fondos macro son principalmente desenfoques verdes, y los pinos lejanos están estilizados.
- La segunda mosca (165–173 s) es pequeña y está desenfocada a propósito.
- La marcha en trípode solo se aprecia bien en los planos cercanos.

## Integridad

- No se modificó ningún archivo de los Ep. 01–04 ni del motor (`src/engine`). En `src/Root.tsx` solo
  se registraron `Ep05Full`, `Ep05Characters` y `Ep05Creatures`.
- El proyecto POS Android no cambió.
- No se usa Three.js.
