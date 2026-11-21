# Episodio 06 — "El animal que reconstruye su cuerpo" · Informe técnico y de rendimiento

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep06-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180 s** | **46,75 MB** |
| `ep06-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180 s | 13,30 MB |
| `fichas-personajes.png` | ajolote rosado (lateral y dorsal), silvestre, Daphnia, nado y etapas 0–6 | | | |
| `hoja-de-contacto.png` | 24 fotogramas del final, de los 2 a los 177 s | | | |

Los fotogramas se contaron con ffprobe (`-count_packets`). La sonoridad integrada (`ebur128`) es
de **−14,0 LUFS** en el borrador y en el final.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (×0,5) | Final (×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 35,8 + 36,4 + 37,0 + 38,9 + 39,3 + 35,3 = **222,7 s** | 83,2 + 91,4 + 98,5 + 98,9 + 105,9 + 79,1 = **557,0 s** |
| Mezcla de audio (6 pistas, ducking) | 238,1 s (primer borrador) | reutilizada |
| Pico de RAM por tramo | 2.509 MB | **3.131 MB** |

Proceso: primero se renderizó un borrador completo y se revisó con tiras de fotogramas. Se
corrigieron tres cosas: el paisaje aéreo se veía con la cámara bajo el agua, faltaba la superficie
vista desde abajo y raíces y plantas tapaban la pata en los planos de la regeneración. Después se
volvió a renderizar el borrador (cifras de la tabla) y, ya validado, el final.

## Narración y subtítulos

- Voz neuronal Piper `es_MX-claude-high`: 33 frases, **157,7 s de voz (88 %)**, sin solapes ni
  retrasos.
- La narración base de cada escena se amplió con hechos verificables y sin repetir información:
  - Xochimilco y la variedad leucística frente a la coloración silvestre.
  - La neotenia y la respiración por branquias, piel y pulmones.
  - La alimentación por succión.
  - El epitelio de la herida, que se forma en cuestión de horas.
  - Las células del blastema conservan en su mayoría la memoria de su tejido de origen.
  - Los nervios son necesarios para que avance la regeneración.
  - La pata nueva tiene esqueleto, músculos y nervios, y normalmente no deja cicatriz.
  - La especie está en peligro crítico de extinción por la urbanización, la contaminación y los
    peces introducidos.
- Los subtítulos salen de los tiempos medidos de cada frase.

## Personajes y animación

- **Ficha reutilizable** (`Characters/axolotlSpec.ts`). Los dos ajolotes comparten proporciones:
  3 pares de branquias, 4 dedos delante y 5 detrás, cola comprimida con aleta continua. La extremidad
  que se regenera es la **anterior izquierda (LF)**; el rig la identifica por su lado anatómico, así
  que no cambia de lado aunque la cámara gire.
- **Rosado:** IDLE, GILL_MOVEMENT, WALKING, SWIMMING, TURNING, FEEDING, STARTLED, RESTING,
  REGENERATION y RECOVERY.
- **Silvestre:** camina, gira la cabeza, nada lejos y reaparece al final desplegando las branquias.
  Tiene otro ritmo y otras rutas que el rosado.
- **Daphnia (7):** avanzan a impulsos con las antenas, derivan con la corriente y huyen tras la
  captura. Una es succionada.
- **Determinismo:** todo depende del fotograma (hash, ruido y claves fijas, nada aleatorio).

## Regeneración

Sistema procedural continuo (r = 0 → 6) aplicado a la misma geometría del antebrazo LF. Muñón no
gráfico → casquete de epitelio → yema del blastema → alargamiento → paleta y antebrazo → dedos en
orden 2, 1, 3, 4 → pata completa algo más pequeña que crece hasta los 180 s. Ninguna etapa aparece de
golpe.

La pata real va acompañada de una **lupa de tejido** conectada a ella y una barra de etapas. Se
rotula "REGENERACIÓN ACELERADA — SEMANAS O MESES". De 120 a 145 s, un panel celular muestra nervios,
células y señales, todo rotulado como ilustración.

## Exactitud y límites

- No hay depredador ni mutilación. La lesión se presenta tras un destello de la vista científica y se
  rotula "representación no gráfica".
- No se promete ningún tratamiento médico: el guion dice que todavía no podemos reproducir esta
  capacidad en humanos.
- La variedad rosada se rotula como ilustrativa; en la naturaleza predomina la coloración oscura.
- Limitaciones:
  - Los fondos bajo el agua son sobrios y de tonos pardos (agua turbia, sin aspecto de arrecife).
  - Los ahuejotes y la trajinera están estilizados.
  - En vista lateral las branquias tapan en parte las patas delanteras, como en el animal real.
  - El contador de etapas y los colores de las células son esquemáticos.

## Integridad

No se modificó ningún archivo de los Ep. 01–05 ni del motor. En `src/Root.tsx` solo se registraron
`Ep06Full` y `Ep06Characters`. POS Android no cambió y no se usa Three.js.
