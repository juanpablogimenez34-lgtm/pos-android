# Episodio 01 — "El animal con tres corazones" · Informe de producción (borrador)

## Estado

| Fase | Estado |
|---|---|
| A · Demo aprobada conservada y timeline de 5.400 fotogramas | ✔ La copia está en `entregas/aprobado/`. La demo se re-renderiza **idéntica píxel a píxel** (fotogramas 0, 140, 300 y 449 comparados con el commit aprobado `361501c`; diferencia máxima = 0). |
| B · Siete escenas implementadas y verificadas | ✔ Revisadas con hojas de contacto, escena por escena, y corregidas (ver el registro). |
| C · Borrador completo a 540×960 | ✔ `ep01-borrador-540x960.mp4` |
| D · Narración, música y subtítulos | ✔ Integrados en el borrador. |
| E · Corrección visual y de sincronía | ✔ Ver el registro de problemas. |
| F · Render final 1080×1920 | ⏸ **Pendiente de tu validación del borrador**, tal como pediste. Comando: `npm run ep01:final`. |

## Borrador entregado (valores medidos)

| Dato | Valor |
|---|---|
| Archivo | `ep01-borrador-540x960.mp4` |
| Resolución / fps | 540 × 960 · 30 fps (H.264 + AAC) |
| Fotogramas de vídeo | **5.400 / 5.400** (contados con ffprobe `-count_packets`) |
| Duración | **180,000 s** (vídeo y contenedor) |
| Tamaño | **27,42 MB** |
| Sonoridad | **−14,0 LUFS** integrados (medido con `ebur128` sobre el MP4) |
| Render de vídeo (6 tramos de 30 s, concurrencia 4) | 57,4 + 47,4 + 45,3 + 48,2 + 42,6 + 47,6 = **288,5 s** |
| Render de la mezcla de audio | 191,1 s |
| Tiempo total de cómputo | **479,6 s** (≈ 8 min) |
| Pico de memoria (node + Chrome, por tramo) | **3.890 MB** (el resto de tramos, 3.002–3.159 MB). No crece con la duración porque cada tramo usa un navegador nuevo. |
| Pico de memoria del render de audio | no se registró |

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU.

**Referencia (no comparable directamente):** la demo de 15 s a 1080×1920 en calidad final
tardó 68,1 s, con un pico de 3.684 MB. El borrador está a media resolución y en perfil
`draft`, así que no conviene extrapolar esos tiempos al render final. Lo mediré cuando lo
lances.

## Narración y subtítulos

- **Voz:** sintetizada aquí con Piper `es_MX-claude-high`, español de México, voz neuronal de
  un único hablante (el MODEL_CARD indica licencia Apache-2.0). No es una locución humana:
  si se graba una, el sistema la acepta sin tocar código (`tools/audio/README.md`).
- **Guion:** 36 frases, 145 s de voz sobre 180 s (81 %). Las pausas están colocadas en los
  cambios de escena y en los momentos de suspenso.
- **Sincronía medida:** desfase entre el inicio real de cada frase en el audio y su subtítulo
  de **21 ms de media y 30 ms como máximo**.
- **Subtítulos:** máximo 2 líneas, en la zona segura (75 % de la altura), con palabras clave
  resaltadas.

## Datos científicos usados (revisados)

- **Tres corazones:** dos branquiales, uno en la base de cada branquia, y uno sistémico
  (Wells, 1978).
- **Sangre azul:** por la hemocianina, una proteína con cobre disuelta en la hemolinfa. La
  sangre desoxigenada se muestra casi incolora y la oxigenada azul.
- **Natación:** durante la propulsión a chorro el corazón sistémico puede detenerse
  (Wells, 1979). El panel de 65–70 s lo ilustra con un ritmo de latido **ilustrativo**
  (45 lpm), no medido.
- **Camuflaje:** cromatóforos controlados por músculos y nervios; las papilas cambian la textura.
- **Tinta:** contiene melanina y dificulta la detección. La morena mediterránea
  (*Muraena helena*) depreda al pulpo común.
- **Sistema nervioso:** unos 500 millones de neuronas, cerca de 2/3 en los brazos. El cerebro
  rodea el esófago y los lóbulos ópticos son grandes (Young, 1971).
- **Ventosas:** tienen quimiorreceptores ("saborean al tocar").
- **Vida:** el pulpo común suele vivir 1–2 años.

## Registro de problemas encontrados y corregidos

| # | Problema | Corrección |
|---|---|---|
| 1 | Hugging Face está bloqueado por la red del entorno, así que no se podía descargar la voz. | Descargué la misma voz Piper desde las releases de GitHub de sherpa-onnx. |
| 2 | sherpa-onnx 2.0.1 no traía el conversor de texto a fonemas (espeak) y falló al sintetizar. | Cambié a `piper-tts 1.3.0`, que sí lo incluye. |
| 3 | La escena 2 tenía demasiado texto para 25 s y las frases se solapaban. | Acorté frases y ajusté los instantes de entrada. |
| 4 | Piper varía ligeramente la duración en cada síntesis, así que los tiempos fijos no servían. | El generador mide cada frase, la retrasa si hace falta (máximo 1 s, si no falla) y escribe los tiempos reales junto con el audio. |
| 5 | Al ampliar el perfil del suelo para las escenas 4–5 cambiaba la textura de la roca: la demo aprobada difería en 0,7–1,2 % de los píxeles. | Separé el perfil físico del perfil de dibujo. La demo vuelve a ser idéntica (diferencia 0). |
| 6 | Los rótulos científicos se salían por el borde izquierdo. | Los rótulos se mantienen siempre dentro de la pantalla. |
| 7 | La morena quedaba oculta tras el pulpo en postura de amenaza. | Se dibuja delante, más larga y ancha, con más contraste y con luz de contorno. |
| 8 | La concha de la escena 6 apenas se veía. | Escala ×1,5. |
| 9 | El "primer plano del ojo" (zoom ×4,2) mostraba toda la cabeza. | Zoom ×8, y la cámara sigue la posición REAL del ojo calculada por el rig. |
| 10 | Las cáusticas formaban una neblina blanca en los zooms extremos. | Se desvanecen a partir de ×2,5. |
| 11 | Un alga de primer plano tapaba al pulpo durante el camuflaje. | La moví a x = 3700, fuera del encuadre de la demo. |
| 12 | El esquema anatómico quedaba pequeño. | Zoom ×3 sobre el manto. |
| 13 | La placa "Sangre azul" se superponía a los rótulos. | Esos rótulos se retiran antes de que aparezca la placa. |
| 14 | En natación, los brazos se orientaban según el rumbo y no detrás del manto. | Los brazos siguen la dirección del manto + 180°, así que nada con el manto por delante. |
| 15 | Tras un corte de plano, la marcha buscaba apoyos del plano anterior, con riesgo de brazos estirados. | La pose recibe los instantes de corte y no busca apoyos al otro lado. Verificado en 45, 127 y 150 s. |
| 16 | El contenedor del MP4 duraba 180,053 s por el relleno del AAC. | El audio se recorta a 180,000 s al unir. |
| 17 | El ffmpeg de Remotion no incluye el filtro `tile` ni el formato `.m4a`. | Hojas de contacto con Pillow; audio intermedio en `.aac`. |
| 18 | Al reutilizar tramos se perdían sus mediciones del informe. | Cada tramo guarda su medición en un `.json` junto al vídeo. |

## Pendiente / limitaciones honestas

- **Render final 1080×1920:** pendiente de tu validación.
- **Tamaño estimado del final:** a CRF 20 rondaría 100–130 MB, extrapolando la demo
  (11,05 MB en 15 s). GitHub no admite archivos de más de 100 MB, así que para versionarlo
  conviene CRF 22–23 o entregarlo fuera del repositorio.
- **Voz:** es sintética. Es correcta y está sincronizada, pero una locución humana daría más
  expresividad.
- **Música y efectos:** son síntesis procedural original. No sustituyen una banda sonora
  compuesta por una persona, pero no tienen problemas de licencia.
