# OpenMontage Documentales · EPISODIO 04 — El camarón mantis: el pequeño gigante del océano

Proyecto **EP04_MantisShrimp_Premium** · composición Remotion **`EP04-MantisShrimp-Premium`**
(Remotion no admite guiones bajos en los ID) · 180 s · 1080×1920 (9:16) · 30 fps · 5.400 fotogramas ·
español latinoamericano · YouTube Shorts, TikTok y Facebook Reels.

Carpeta **independiente** `src/episodes/ep10-camaron-mantis/`: el repositorio ya tenía
`ep04-halcon-peregrino` y `entregas/ep04/`, que **no se han tocado**. Tampoco se ha modificado ningún
episodio anterior, la app Android POS ni el escáner CameraX/ML Kit. Del Ep. 08 solo se **importan**
(sin cambiarlos) el agua, los peces y las partículas.

Entrega: `entregas/ep04-camaron-mantis/ep04-final-1080x1920.mp4`.

## Arquitectura

| Módulo | Archivo | Función |
|---|---|---|
| Composición principal | `EP04MantisShrimp.tsx` | Elige la secuencia activa según el fotograma; superpone subtítulos, rótulos de acto y la mezcla de audio |
| Controlador de escenas | `config/sequences.ts`, `sequences/world.ts` | 20 secuencias × 270 fotogramas (inicio/fin de cada una), 5 actos, eventos clave (EV). `world.ts` define la **línea de tiempo única** del animal (posición, estado, escala constante `MS = 0.8`) para que ninguna acción se corte entre secuencias |
| Cámara | `camera/CameraSystem.ts`, `reefCam()` en `world.ts` | Cámara 2D con parallax por profundidad, travelling, dolly, paneos, seguimiento, primeros planos, temblor de impacto y enfoque simulado (`focusFade`) |
| Modelo del camarón mantis | `characters/MantisShrimp.tsx` | Cabeza y tórax segmentados, 12 segmentos, 2 ojos con pedúnculo (banda media, pseudopupilas), antenas y antenulas articuladas, escama antenal, apéndices raptores de 3 piezas con mazo, 3 pares de patas marchadoras con apoyos fijos, pleópodos, urópodos y telson (abanico), brillos especulares |
| Motor de articulaciones | `rig/joints.ts` | Cadenas cinemáticas, interpolación de ángulos clave, curvas suaves |
| Movimiento procedural | `rig/MantisMotion.ts` | Sacadas oculares independientes, animación de reposo, marcha (avance ligado al ciclo de patas), carga → golpe → recuperación, acecho, manipulación |
| Presa | `characters/Snail.tsx` | Caracol de concha cónica: grietas y fragmentos progresivos, se recoge |
| Entorno | `environment/ReefStage.tsx` | Agua con degradado de profundidad, rayos, cáusticas, cardúmenes, arrecife medio (parallax), roca con grieta‑refugio, corales, algas que se mecen, arena con ondulaciones y granos, burbujas, sedimento, primer plano oscuro |
| Partículas | `particles/Particles.tsx` | Fragmentos de concha, sedimento en suspensión, nieve marina de primer plano |
| Iluminación | `lighting/Lighting.tsx` | Etalonaje submarino, luz sobre el sujeto, rayos en pantalla, viñeta, atenuado para gráficos, fundidos |
| Cavitación y efectos | `science/Science.tsx` (`Cavitation`), `effects/Effects.tsx` | Burbujas que crecen y colapsan con anillos de presión y ondas en el agua (sin explosiones ni fuego), destello contenido, onda de presión, corriente de transición, marco de cámara lenta |
| Componentes científicos | `science/Science.tsx` | Ojo con 3 regiones y banda media, interpretación artística rotulada, resorte en silla de montar + cierre, tarjeta de velocidad, mazo en rotación 3D simulada, corte por capas del mazo, laboratorio estilizado |
| Subtítulos | `subtitles/subtitles.ts` | Bloques de máx. 2 líneas sincronizados con los tiempos medidos; palabras clave resaltadas |
| Narración | `narration/narration.json`, `narration/narration-timing.json` | Guion (366 palabras) y tiempos **medidos** de la locución |
| Música y efectos | `audio/SoundDesign.ts`, `tools/audio/score_ep10_mantis.py` | Mezcla de 6 pistas con ducking; banda sonora y efectos **sintetizados por código** |
| Exportación | `config/export.ts`, `scripts/render-episode.mjs` | Render por tramos, mezcla, normalización a −14 LUFS, informe JSON |
| Ficha de control | `characters/MantisSheet.tsx` (`EP04-MantisShrimp-Ficha`) | Revisión de anatomía y estados del modelo |

### Secuencias (fotograma inicial – final)

| # | Tiempo | Fotogramas | Secuencia | Animación / cámara |
|---|---|---|---|---|
| 01 | 0–9 s | 0–269 | Descenso al arrecife | Dolly vertical desde la superficie; rayos, peces, partículas; título |
| 02 | 9–18 s | 270–539 | Ojos en la grieta | Primer plano; se asoma; ojos independientes; amago del apéndice |
| 03 | 18–27 s | 540–809 | El protagonista emerge | Sale caminando (patas coordinadas); travelling de seguimiento |
| 04 | 27–36 s | 810–1079 | Un cuerpo extraordinario | Plano lateral; 6 etiquetas anatómicas; barra 10–18 cm |
| 05 | 36–45 s | 1080–1349 | Ojos independientes | Primerísimo plano; sacadas independientes con indicadores |
| 06 | 45–54 s | 1350–1619 | Cómo funcionan sus ojos | Gráfico: 3 regiones, banda media, fotorreceptores, polarización |
| 07 | 54–63 s | 1620–1889 | El mundo a través de su mirada | Interpretación artística rotulada; giro del cuerpo |
| 08 | 63–72 s | 1890–2159 | Encuentro con la presa | Avanza, retrocede con cautela, avanza y acecha |
| 09 | 72–81 s | 2160–2429 | Preparación del golpe | Carga del apéndice (anticipación); gráfico resorte + cierre |
| 10 | 81–90 s | 2430–2699 | El impacto | Golpe a velocidad real, reacción y recuperación; repetición a cámara lenta; velocidad |
| 11 | 90–99 s | 2700–2969 | Burbujas de cavitación | Macro a cámara lenta; burbujas que colapsan; anillos de presión |
| 12 | 99–108 s | 2970–3239 | La presa | Golpes repetidos; la concha se agrieta; sedimento; manipulación |
| 13 | 108–117 s | 3240–3509 | El arma natural | Transición por acercamiento al mazo; rotación 3D simulada |
| 14 | 117–126 s | 3510–3779 | Estructura interna | Capas: impacto mineral, fibras helicoidales, región estriada; grieta desviada |
| 15 | 126–135 s | 3780–4049 | Inspiración científica | Laboratorio estilizado; ensayo de impacto; "investigación en desarrollo" |
| 16 | 135–144 s | 4050–4319 | Regreso al arrecife | Corriente que barre el cuadro; restos de la concha; sale a patrullar |
| 17 | 144–153 s | 4320–4589 | La vida de un cazador | Patrulla, gira, disuade a un pez intruso (apéndices y abanico), regresa |
| 18 | 153–162 s | 4590–4859 | El refugio | Gira y entra de espaldas, parcialmente; la cámara se queda fuera |
| 19 | 162–171 s | 4860–5129 | Un pequeño gigante | La cámara se aleja; el animal se ve diminuto; grandes siluetas |
| 20 | 171–180 s | 5130–5399 | Cierre | Ascenso hacia la luz; título final; fundido a negro |

## Guion definitivo (tiempos medidos de la locución)

366 palabras · 146,1 s de voz · sin solapes · sin pausas artificiales ni aceleración.

| Sec. | Inicio – fin (s) | Texto |
|---|---|---|
| 01 | 0.60 – 6.78 | En lo profundo de los arrecifes tropicales se esconde una criatura tan extraordinaria que parece de otro mundo. |
| 02 | 9.40 – 11.65 | Algo nos observa desde una grieta. |
| 02 | 12.20 – 16.90 | Sus ojos son sorprendentes, pero su gran secreto está en sus extremidades. |
| 03 | 18.40 – 26.43 | Este es el camarón mantis pavo real, un pequeño depredador con una visión extraordinaria y un arma natural poderosa. |
| 04 | 27.40 – 34.98 | No es un camarón verdadero: es un estomatópodo, un crustáceo que suele medir entre diez y dieciocho centímetros. |
| 05 | 36.40 – 44.46 | Cada ojo, sobre un pedúnculo móvil, se mueve por separado: uno vigila un rincón mientras el otro explora. |
| 06 | 45.40 – 54.60 | Cada ojo tiene tres regiones y muchos tipos de fotorreceptores. Además, detecta la luz polarizada, que nosotros no percibimos. |
| 07 | 54.85 – 61.71 | Eso no significa que distinga mejor los colores. Su visión está adaptada a reconocer señales y movimientos. |
| 08 | 63.40 – 70.49 | Ante una presa de caparazón duro, como un caracol, se detiene. Prepara uno de los ataques más rápidos que existen. |
| 09 | 72.40 – 80.10 | Su apéndice actúa como un resorte: una pieza en forma de silla almacena energía y un cierre la retiene. |
| 10 | 81.40 – 88.63 | Al liberarse, el golpe dura milésimas de segundo. A cámara lenta vemos que el mazo supera los veinte metros por segundo. |
| 11 | 90.40 – 97.45 | Es tan rápido que forma burbujas de cavitación; al colapsar, generan una segunda onda de presión sobre la presa. |
| 12 | 99.40 – 106.68 | Tras varios golpes, la concha se agrieta. Caracoles, cangrejos y almejas forman parte de su dieta. |
| 13 | 108.40 – 114.51 | Lo asombroso no es solo la fuerza del golpe, sino que su mazo soporta miles de impactos sin romperse. |
| 14 | 117.40 – 124.79 | Por dentro tiene una capa mineral muy dura y, debajo, fibras ordenadas en espiral que frenan las grietas. |
| 15 | 126.40 – 134.86 | Investigadores de materiales estudian esta estructura para diseñar compuestos más resistentes a los impactos. Son trabajos aún en desarrollo. |
| 16 | 135.40 – 141.25 | Pero esta ingeniería no nació en un laboratorio: es fruto de cientos de millones de años de evolución. |
| 17 | 144.40 – 152.06 | En su territorio busca alimento, vigila a los intrusos y defiende su espacio, siempre con antenas y ojos alerta. |
| 18 | 153.40 – 160.16 | Su madriguera es su refugio: una galería entre arena y coral desde la que observa, descansa y se protege. |
| 19 | 162.40 – 170.24 | En un océano de gigantes, este pequeño animal demuestra que las adaptaciones más asombrosas caben en criaturas diminutas. |
| 20 | 171.20 – 173.99 | Aún quedan innumerables secretos por descubrir. |
| 20 | 174.40 – 178.37 | ¿Qué criatura extraordinaria conoceremos en nuestra próxima aventura? |

Rigor científico: es un estomatópodo (no un camarón verdadero); ojos con tres regiones, banda media,
muchos tipos de fotorreceptores y detección de luz polarizada, **sin** afirmar que distinga más
colores que los humanos (se dice lo contrario); resorte en silla de montar + cierre; mazo > 20 m/s,
golpe en milisegundos; burbujas de cavitación cuyo colapso genera una segunda onda de presión;
región de impacto mineralizada + fibras helicoidales; materiales bioinspirados presentados como
**investigación en desarrollo**, no como productos comerciales.

## Instalación

```bash
cd estudio-animacion
npm install                      # Remotion 4 + React (sin APIs de pago)
pip install numpy pillow         # solo para regenerar el audio o las hojas de contacto
```

## Audio (opcional: ya está generado en `public/audio/ep04-camaron-mantis/`)

```bash
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/ep10-camaron-mantis/narration/narration.json \
  --timing src/episodes/ep10-camaron-mantis/narration/narration-timing.json \
  --out-dir public/audio/ep04-camaron-mantis
python3 tools/audio/score_ep10_mantis.py
```

## Vista previa y render

```bash
npx remotion studio                                          # elegir EP04-MantisShrimp-Premium
npx remotion still src/index.ts EP04-MantisShrimp-Premium out/f.png --frame=2490
node scripts/contact-sheet.mjs EP04-MantisShrimp-Premium out/hoja.png 5,40,83,92,130,175 0.3
# MP4 final (por tramos de 30 s, mezcla 6 pistas, −14 LUFS, informe .json):
node scripts/render-episode.mjs --comp EP04-MantisShrimp-Premium --quality final --scale 1 \
  --seg 30 --crf 20 --out out/ep04-mantis-final.mp4
mkdir -p entregas/ep04-camaron-mantis
cp out/ep04-mantis-final.mp4 entregas/ep04-camaron-mantis/ep04-final-1080x1920.mp4
```

Alternativa directa (un solo proceso): `npx remotion render src/index.ts EP04-MantisShrimp-Premium
out/ep04.mp4 --codec=h264 --crf=20`.

### Verificar la duración y el formato

```bash
npx remotion ffprobe -v error -count_frames -show_entries stream=codec_type,width,height,r_frame_rate,nb_read_frames \
  -show_entries format=duration -of compact entregas/ep04-camaron-mantis/ep04-final-1080x1920.mp4
# esperado: video 1080x1920, 30/1, 5400 fotogramas; duración 180,0 s; pista de audio aac
```

## Android / Termux

```bash
pkg install x11-repo && pkg install nodejs-lts ffmpeg chromium python
cd estudio-animacion && npm install
export REMOTION_BROWSER=$(command -v chromium-browser || command -v chromium)
node scripts/render-episode.mjs --comp EP04-MantisShrimp-Premium --quality final --scale 1 \
  --seg 15 --concurrency 1 --crf 22 --out out/ep04-mantis-final.mp4
```

Optimizaciones ya aplicadas: sin filtros de desenfoque SVG (el enfoque se simula con capas y
opacidad), degradados en lugar de máscaras costosas, número de partículas acotado, todo determinista
(los tramos pueden repetirse o reanudarse: `render-episode.mjs` reutiliza los tramos ya renderizados).

| Problema en Termux | Solución |
|---|---|
| `Failed to launch the browser` | Instalar `chromium` (repositorio x11: `pkg install x11-repo`) y exportar `REMOTION_BROWSER` |
| El proceso muere (OOM / Android lo cierra) | `--concurrency 1`, `--seg 10`; cerrar otras apps; `termux-wake-lock` |
| Muy lento | Borrador primero: `--quality draft --scale 0.5`; o renderizar en PC y copiar el MP4 |
| `ENOSPC` | Borrar la carpeta de tramos `out/.ep04-mantis-final/` y la caché `node_modules/.cache` |
| Sin audio en el MP4 | Comprobar `public/audio/ep04-camaron-mantis/*.m4a`; regenerar con los scripts de audio |
| Remotion no trae binario de ffmpeg para la arquitectura | `pkg install ffmpeg`; Remotion 4 usa su ffmpeg integrado, pero el del sistema sirve para comprobar el MP4 |

## Control de calidad

Ver la sección «QC» al final (resultados de comprobaciones **ejecutadas** sobre el MP4 entregado).

## QC (comprobaciones ejecutadas sobre `entregas/ep04-camaron-mantis/ep04-final-1080x1920.mp4`)

| # | Comprobación | Método | Resultado |
|---|---|---|---|
| 1 | Duración | `remotion ffprobe` (format=duration) | 180,000 s ✔ |
| 2 | Resolución / relación | ffprobe | 1080×1920, 9:16 ✔ |
| 3 | Fotogramas / fps | ffprobe `-count_frames` | 5400 fotogramas, 30/1 ✔ |
| 4 | Códecs | ffprobe | H.264 + AAC 48 kHz estéreo ✔ |
| 5 | Tamaño | ffprobe | 59,9 MB |
| 6 | Sonoridad | loudnorm (render-episode) | entrada −16,6 LUFS → normalizado a −14 LUFS, pico real −1,9 dBTP ✔ |
| 7 | Audio presente en todo el video | RMS por ventanas de 0,1 s | 0 ventanas en silencio; pico 0,85 ✔ |
| 8 | Sincronía de la voz | correlación de envolventes mezcla/locución | r = 0,65, desfase ≤ 0,1 s ✔ |
| 9 | Fotogramas negros | luminancia media 1 fps | solo en el fundido inicial (0–1 s) y el final ✔ |
| 10 | Movimiento continuo | diferencia entre fotogramas 1 fps a 90×160 | sin tramos congelados; movimiento muy suave en 121, 124 y 134 s (gráficos científicos: fibras que giran, panel flotante, rebote del péndulo) |
| 11 | Narración sin solapes | `narration.py` (problems: []) | 21 frases, 0 solapes ✔ |
| 12 | Subtítulos | revisión visual de las hojas de contacto | máx. 2 líneas, zona segura (y ≈ 75 %), palabras clave resaltadas ✔ |
| 13 | Anatomía y escala constante | ficha `EP04-MantisShrimp-Ficha` + hojas; `MS = 0.8` fijo en todo el episodio | ✔ |
| 14 | Acciones no cortadas | línea de tiempo única (`world.ts`); los cambios de plano ocurren tras completar cada acción | ✔ |

Tiempo de render en el contenedor (4 núcleos): 1.404 s en total, pico de RAM 4.194 MB.
Tira de control: `entregas/ep04-camaron-mantis/ep04-tira-control.png`.
