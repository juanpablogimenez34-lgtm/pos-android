# Episodio 03 — "El animal que sobrevivió al espacio" · Informe de producción

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep03-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180,000 s** | **45,99 MB** |
| `ep03-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180,000 s | 13,66 MB |
| `hoja-de-contacto.png` | 24 fotogramas del borrador, uno cada 7,5 s | | | |

Los fotogramas se contaron con ffprobe (`-count_packets`). La sonoridad integrada, medida con
`ebur128` sobre el MP4, es de **−14,0 LUFS**.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (draft, ×0,5) | Final (final, ×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 25,6 + 24,9 + 21,3 + 21,6 + 23,3 + 25,6 = **142,3 s** | 52,0 + 49,6 + 45,0 + 43,1 + 53,6 + 57,2 = **300,5 s** |
| Mezcla de audio (6 pistas) | 64,0 s | reutilizada del borrador |
| Pico de RAM por tramo (node + Chrome) | 2.941 MB | **3.616 MB** |

## Verificaciones

- **Sincronía de voz y subtítulos:** desfase de **21 ms de media y 30 ms como máximo** en las
  34 frases.
- **Marcha:** comprobada fotograma a fotograma en el borrador. Las ocho patas cambian de
  posición con desfases distintos y las garras quedan apoyadas en el tallo.
- **Ep. 01 y Ep. 02:** sin cambios en su código ni en el motor; el único archivo compartido
  modificado es `src/Root.tsx`, para registrar `Ep03Full`. Las sumas MD5 de sus pistas de audio
  no cambian.
- **POS Android:** sin cambios.

## Narración y audio

- **Voz:** sintetizada aquí con Piper `es_MX-claude-high`, español de México, voz neuronal
  (el MODEL_CARD indica licencia Apache-2.0). No es una locución humana. 155 s de voz en 180 s.
- **Música y efectos originales por síntesis** (`tools/audio/score_ep03.py`): curiosidad en el
  bosque, misterio en la sequía, frío y calor, ambiente espacial, pulsos celulares y final
  luminoso. Ambiente de bosque y ambiente microscópico estilizado; agua (gotas, la gota que
  cruza, chapoteo y rehidratación), crujidos de sequía, hielo, calor y barridos de transición.
  Sin muestras de terceros.
- **Ducking:** la música baja automáticamente bajo la voz.

## Exactitud científica

Datos y fuentes en `src/episodes/ep03-tardigrado/README.md`. Decisiones clave:
- **Criptobiosis:** se presenta como metabolismo casi indetectable, **no como muerte**
  ("No está muerto: puede recuperarse").
- **Alcance:** siempre "algunas especies" / "algunos tardígrados".
- **Calor:** sin cifras, rotulado "experimento ilustrativo · resistencia breve y limitada",
  seguido de "No son invencibles" y sus límites.
- **Espacio:** experimento FOTON-M3 de 2007 con tardígrados deshidratados dentro de un equipo,
  con resultados cualitativos (vacío solo frente a vacío más radiación) y sin porcentajes.
- **Células:** CAHS y Dsup como dos mecanismos estudiados, con la advertencia explícita de que
  no hay un único secreto. La aplicación a medicamentos, en condicional.
- **Cambio respecto a tu narración orientativa:** "Algunos sobrevivieron al vacío" pasa a
  "Muchos de los expuestos solo al vacío se recuperaron", que es más fiel al resultado publicado.

## Registro de problemas encontrados y corregidos

| # | Problema | Corrección |
|---|---|---|
| 1 | Las escenas 4–6 no cabían en su tiempo: hasta 3,2 s de retraso acumulado. | Acorté frases y reajusté las entradas. |
| 2 | Bosque y microscopio salían vacíos: el `svg` sin posición quedaba debajo del fondo absoluto. | Envolví el `svg` en una capa absoluta, como en los episodios anteriores. |
| 3 | La segmentación del cuerpo se leía poco. | Añadí surcos entre segmentos. |
| 4 | El tronco del bosque era una mancha marrón plana. | Añadí veta de corteza y un cojín de musgo. |
| 5 | Las hojas del lado frontal tapaban al tardígrado. | Las hojas delanteras crecen hacia abajo y las traseras hacia arriba. |
| 6 | El tonel quedaba descentrado respecto a su halo. | Lo recoloqué. |
| 7 | El halo del Sol tapaba las estrellas como un disco oscuro. | Ahora es un degradado transparente. |
| 8 | Los tardígrados de la bandeja del experimento eran puntos invisibles. | Escala ×2,6. |
| 9 | La cápsula parecía vertical, "de pie". | Orientada con el módulo de servicio detrás y con antena. |

## Limitaciones

- **Voz:** es sintética.
- **Ilustraciones:** el tardígrado es una ilustración genérica de eutardígrado (no una especie
  concreta). La cápsula y la Tierra son representaciones estilizadas, no a escala.
