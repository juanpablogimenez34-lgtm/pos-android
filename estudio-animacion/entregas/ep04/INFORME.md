# Episodio 04 — "El ave que supera los 300 km/h" · Informe de producción

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep04-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180,000 s** | **49,35 MB** |
| `ep04-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180,000 s | 13,76 MB |
| `hoja-de-contacto.png` | 24 fotogramas del borrador, uno cada 7,5 s | | | |
| `estados-de-vuelo.png` | los 10 estados de vuelo del mismo rig, en distintas vistas, más la paloma | | | |

Los fotogramas se contaron con ffprobe (`-count_packets`). La sonoridad integrada (`ebur128`)
es de **−14,0 LUFS**.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (draft, ×0,5) | Final (final, ×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 29,1 + 29,5 + 29,5 + 28,3 + 30,4 + 32,5 = **179,3 s** | 62,1 + 67,5 + 62,3 + 60,0 + 59,8 + 67,7 = **379,4 s** |
| Mezcla de audio (6 pistas) | 108,7 s | reutilizada del borrador |
| Pico de RAM por tramo (node + Chrome) | 2.379 MB | **3.010 MB** |

## Verificaciones

- **Sincronía de voz y subtítulos:** desfase de **22 ms de media y 30 ms como máximo** en las
  33 frases.
- **Batido:** comprobado fotograma a fotograma (abajo, arriba, a media carrera y abajo en
  0,25 s). La picada es continua desde la preparación hasta la salida.
- **Episodios 01–03 y motor:** sin cambios en su código; solo se registraron `Ep04Full` y
  `FalconStates` en `src/Root.tsx`. Las sumas MD5 de su audio no cambian.
- **POS Android:** sin cambios.

## Animación y cámara

- **Halcón:** rig 3D ligero proyectado a SVG, con 10 estados de vuelo y transiciones suaves.
  - **Movimientos:** batido con carrera descendente más rápida, flexión de hombro, codo y
    muñeca, ajustes de primarias, cola con apertura e inclinación, orientación de la cabeza,
    parpadeo con membrana nictitante, y patas posadas, recogidas o adelantadas.
  - **Picada:** alas parcialmente recogidas (cuerpo en gota), dirigida y controlada.
  - **Giro en térmica:** una vuelta completa de 360°, que enseña el ave desde todos los ángulos.
- **Paloma:** el mismo rig con proporciones y colores de *Columba livia*. Bate las alas y hace
  un quiebro de esquive.
- **Cámara:**
  - **Planos:** travelling aéreo, seguimiento lateral, seguimiento de la cabeza en primeros
    planos (ojo y plumaje), encuadre conjunto halcón + paloma y plano subjetivo hacia la presa.
  - **Efectos:** cámara lenta ilustrativa, parallax acelerado y desenfoque estilizado del fondo
    en los primeros planos.
- **Escenarios:** amanecer, día y atardecer; cordilleras en 3 capas; valle con río; acantilado
  con repisa; nubes volumétricas en mosaico infinito (solo se dibujan las visibles) y
  corrientes de aire discretas.

## Narración y audio

- **Voz:** sintetizada aquí con Piper `es_MX-claude-high`, español de México, voz neuronal
  (el MODEL_CARD indica licencia Apache-2.0). No es una locución humana. 152 s de voz en 180 s.
- **Música y efectos originales por síntesis** (`tools/audio/score_ep04.py`), con volúmenes
  contenidos: viento de montaña con ráfagas, aleteos solo en los tramos de batido, viento
  creciente en la picada, tono grave en la cámara lenta, pulso de persecución, paso de la paloma
  y final cálido. Sin muestras de terceros.
- **Ducking:** la música baja automáticamente bajo la voz.

## Exactitud científica

Detalle en `src/episodes/ep04-halcon-peregrino/README.md`:
- **Velocidad:** más de 300 km/h solo en picada de caza; más de 380 km/h registrados con
  halcones entrenados.
- **Sin mediciones del ave animada:** las líneas de velocidad se rotulan como estilizadas.
- **Vuelo horizontal:** "mucho más lento".
- **Caza:** intento fallido y sin violencia gráfica, coherente con "no siempre termina con
  éxito".
- **Texto final:** con la aclaración "en picada, ningún animal conocido lo supera".

## Registro de problemas encontrados y corregidos

| # | Problema | Corrección |
|---|---|---|
| 1 | Las frases b2, e3 y f2 no cabían: hasta 1,8 s de retraso. | Acorté el texto y reajusté las entradas. |
| 2 | De perfil, la capucha negra no aparecía: el anillo del casquete se proyectaba como una línea sin área. | La capucha se calcula como envolvente convexa del casquete. Además, cabeza de perfil ilustrada para las vistas laterales. |
| 3 | El ala plegada se veía como un palo. | Silueta específica del ala plegada sobre el costado visible. |
| 4 | La cola de perfil era una línea. | Le di grosor vertical. |
| 5 | En el primer plano del ojo (17 s) el halcón quedaba fuera de cuadro: los pesos de cámara (interpolación Hermite) se pasaban de 1. | Los pesos se limitan a [0, 1]. Verificado numéricamente: la cámara coincide con la cabeza. |
| 6 | Las nubes de primer plano tapaban los primeros planos con zoom alto. | Se ocultan a partir de ×1,8. |
| 7 | El primer plano de la cabeza coincidía con el giro en térmica y el ave salía de espaldas. | El giro es de una sola vuelta y termina antes del primer plano. |
| 8 | El halcón se superponía a la paloma demasiado pronto. | Trayectoria corregida: se acerca por detrás y por encima hasta el intento. |
| 9 | El rótulo del ala salía cortado y las líneas de flujo atravesaban el ave. | Rótulo recolocado y líneas de flujo que rodean el perfil. |

## Limitaciones

- **Voz:** es sintética.
- **Ilustraciones:** el halcón y la paloma son estilizados, no un modelo anatómico de precisión.
  El flujo de aire es esquemático (así se indica en pantalla).
