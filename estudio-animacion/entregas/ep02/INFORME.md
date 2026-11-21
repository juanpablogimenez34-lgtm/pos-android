# Episodio 02 — "El monstruo que vive en la oscuridad" · Informe de producción

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep02-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180,000 s** | **41,13 MB** |
| `ep02-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180,000 s | 11,45 MB |
| `hoja-de-contacto.png` | 24 fotogramas del borrador, uno cada 7,5 s | | | |

Los fotogramas se contaron con ffprobe (`-count_packets`). La sonoridad integrada, medida con
`ebur128` sobre el MP4, es de **−14,0 LUFS** en los dos vídeos.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (draft, ×0,5) | Final (final, ×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 27,2 + 29,5 + 29,3 + 29,6 + 29,3 + 29,7 = **174,6 s** | 75,9 + 85,0 + 84,4 + 79,5 + 76,7 + 85,4 = **486,9 s** |
| Mezcla de audio (6 pistas) | 90,5 s, pico 2.226 MB | reutilizada del borrador (el audio no depende de la resolución) |
| Pico de RAM por tramo (node + Chrome) | 2.873 MB | **3.762 MB** |

Como referencia en la misma máquina, el borrador del Ep. 01 tardó 288,5 s de vídeo con un pico
de 3.890 MB. El Ep. 02 es más rápido de renderizar porque la escena es más oscura y sencilla:
sin cáusticas, sin plataforma rocosa y con menos elementos. No lo atribuyo a ninguna
optimización nueva del motor.

## Verificaciones

- **Sincronía de voz y subtítulos:** desfase de **23 ms de media y 40 ms como máximo** en las
  35 frases (inicio real de la voz frente al subtítulo).
- **Ep. 01 y demo intactos:** fotogramas 480, 1290 y 5340 de `Ep01Full` y el 300 de `Ep01Demo`
  comparados con el commit anterior. Diferencia máxima = 0.
- **Audio del Ep. 01 intacto:** las sumas MD5 de sus 6 pistas no cambian.
- **POS Android:** sin cambios. Todo está dentro de `estudio-animacion/`.

## Animación (todo en función del fotograma)

- **Hembra:** pose pura con balanceo y tirones del illicium, intensidad de la esca, mandíbula
  con membrana gular que se estira, colmillos que siguen a la mandíbula, aletas pectoral,
  dorsal y anal con ondulación propia, cola que oscila, giro lento (59–65 s), abdomen distendido
  tras tragar y barbilla ramificada que se mueve con la mandíbula.
- **Presa:** pez linterna con fotóforos y aleteo, que se acelera al acercarse. En el ataque
  (109,0 s) la mandíbula se abre en 0,08 s, la presa es succionada, la mandíbula se cierra y la
  cámara se sacude.
- **Macho:** nada guiado por el olfato, se aferra al vientre (138,6 s) y su unión se fusiona de
  forma progresiva. Se ilustran los vasos compartidos con flujo animado.
- **Escenario:** descenso con luz solar que se apaga y medidor de profundidad, nieve marina que
  se ilumina cerca de la esca, medusas y destellos lejanos, banco de peces con fotóforos.
  Los animales solo son visibles donde llega la luz biológica.

## Narración y audio

- **Voz:** sintetizada aquí con Piper `es_MX-claude-high`, español de México, voz neuronal (el
  MODEL_CARD indica licencia Apache-2.0). No es una locución humana. 151 s de voz en 180 s.
- **Música, ambiente, movimiento, suspenso y transiciones:** síntesis original
  (`tools/audio/score_ep02.py`), sin muestras de terceros. Los golpes coinciden con el ataque, la
  mordida del macho, el título y el cierre.
- **Ducking:** la música baja automáticamente bajo la voz.

## Exactitud científica

La especie y sus fuentes están en `src/episodes/ep02-pez-abisal/README.md`.

Decisiones para no inventar ni exagerar:
- **Tamaño:** la narración aclara que la hembra mide unos pocos centímetros (hasta unos 8 cm).
  "Monstruo" queda solo como gancho del título.
- **Parasitismo sexual:** se dice explícitamente que ocurre solo en algunas especies.
- **Cambios respecto a la narración orientativa:**
  - "uno de los ambientes más extraordinarios" pasa a ser "más extensos y menos explorados",
    que son datos verificables.
  - Se añadió el giro del tamaño real.
- **Proporciones:** la del macho frente a la hembra es aproximada y así se indica en pantalla.

## Registro de problemas encontrados y corregidos

| # | Problema | Corrección |
|---|---|---|
| 1 | Con una voz más pausada, la escena 1 no cabía: hasta 3,9 s de retraso acumulado. | Acorté frases y reajusté los instantes de entrada. |
| 2 | Toda la imagen salía negra antes de 120 s: el fundido inverso cubría todo lo anterior. | Nuevo componente `Dip`, que solo actúa dentro de su ventana. |
| 3 | Las medusas lejanas aparecían por delante del pez, porque estaban en la capa de luz. | La oscuridad pasó a ser una máscara de la capa de animales. La vida lejana va detrás y el pez la tapa. |
| 4 | El macho era casi invisible mientras nadaba. | La cámara lo sigue, tiene más luz de contorno y hay un poco más de luz ambiente entre 129 y 137 s. |
| 5 | Algunos rótulos (barbilla, circulación) pisaban los subtítulos. | Los recoloqué. |
| 6 | Los peces que nadan hacia la izquierda se veían boca arriba. | Se reflejan según su rumbo. |
| 7 | En el descenso, el destello lejano apenas se veía. | Lo agrandé. |
| 8 | La etiqueta de profundidad se solapaba con las marcas de la escala. | La desplacé. |
| 9 | Mi primera medición de sincronía daba 0,3 s en 3 frases. | Era un falso positivo: detectaba el final de la frase anterior. Con una ventana correcta, el máximo es de 0,04 s. |

## Limitaciones

- **Voz:** es sintética, sin la expresividad de un locutor profesional.
- **Pez linterna:** es genérico (familia Myctophidae), no una especie concreta.
