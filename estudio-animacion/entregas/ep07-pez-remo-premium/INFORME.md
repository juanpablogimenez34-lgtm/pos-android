# Informe — Pez remo gigante, personaje premium 2.5D (demostración de 15 s)

**Archivo:** `pez-remo-premium-demo-15s-1080x1920.mp4` (sin audio: es una prueba de personaje).

## Comprobaciones ejecutadas
| Comprobación | Resultado |
|---|---|
| FFprobe | H.264 · 1080×1920 · 30/1 fps · **450 fotogramas** · **15,000 s** · 10,3 MB |
| Fotogramas de revisión | 2, 5, 8, 11 y 14 s extraídos del MP4 (`revision/`) y revisados visualmente |
| Parpadeos / saltos | análisis de los 450 fotogramas: diferencia máxima entre fotogramas consecutivos 1,99 (mediana 0,38), sin saltos de luminancia > 2,5 |
| Render | 2 min 15 s en este entorno (4 hilos) |

## Lo observado en los fotogramas
- **2 s:** silueta oscura con contraluz azul en el dorso, legible pero misteriosa.
- **5 s:** la luz ha revelado la cabeza: cresta roja, ojo con reflejos, escamas y manchas plateadas.
- **8 s:** plano lateral; la onda de la aleta dorsal es claramente visible; presas diminutas ante la boca.
- **11 s:** inicio del giro: la cabeza se orienta hacia arriba y hacia cámara, el cuerpo sigue la curva.
- **14 s:** la cabeza ya nada hacia la izquierda por encima de su propio cuerpo y el animal se desvanece.
- Sin cortes ni huecos en el cuerpo (es un único contorno sobre una spline continua). Cabeza y cuerpo
  coordinados (la cabeza se orienta con el marco 3D del primer punto del rig). La cabeza no sale del
  encuadre en ningún fotograma revisado.

## Limitaciones conocidas
- En el giro (13–14,5 s) el cuerpo pasa por detrás de sí mismo: al ser una cinta, se ve un estrechamiento
  donde la piel queda de canto. Es geométricamente correcto, pero algunas capas (aleta del tramo lejano)
  no se ocultan con precisión de profundidad.
- Las presas de la alimentación son pequeñas y se ven mejor a 1080 p que en miniatura.
- La vista frontal de la cabeza solo aparece si el animal mira casi directamente a cámara; en esta
  coreografía apenas se activa.

## Recomendaciones
1. Ordenar por profundidad los tramos del cuerpo en giros cerrados (dividir en 2–3 capas por z).
2. Añadir sombreado por flanco (más oscuro en el lado que se aleja de la luz) durante los giros.
3. Un plano corto de alimentación más cercano para que las presas se lean en pantalla de móvil.
4. Si se desea, un desplazamiento vertical de la cabeza durante la alimentación (cabeceo de 2–3°).
