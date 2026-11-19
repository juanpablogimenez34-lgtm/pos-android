# Episodio 07 — "El hongo que controla a las hormigas" · Informe técnico

## Especies elegidas

- **Hospedador:** la hormiga carpintera *Camponotus rufipes* (obrera sin alas, Sudamérica), de cuerpo
  negro brillante y patas pardo-rojizas.
- **Hongo:** *Ophiocordyceps camponoti-rufipedis* (complejo *O. unilateralis*), descrito sobre esta
  hormiga en la Mata Atlántica de Brasil (Evans et al., 2011).

## Entregables

| Archivo | Resolución | Fotogramas | Duración | Tamaño |
|---|---|---|---|---|
| `ep07-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC | **5.400 / 5.400** | **180 s** | **45,35 MB** |
| `ep07-borrador-540x960.mp4` | 540×960, 30 fps | 5.400 / 5.400 | 180 s | 13,25 MB |
| `fichas-personajes.png` | ficha de continuidad: vistas, mandíbulas, antena, filamentos, tallo y estructura fértil | | | |
| `hoja-de-contacto.png` | 24 fotogramas del final, de los 2 a los 176 s | | | |

Los fotogramas se contaron con ffprobe. La sonoridad integrada es de **−14,0 LUFS** en el borrador y
en el final.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (×0,5) | Final (×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 43,0 + 46,3 + 44,1 + 42,2 + 43,9 + 44,3 = **263,8 s** | 102,0 + 109,9 + 111,6 + 102,2 + 104,9 + 103,8 = **634,4 s** |
| Mezcla de audio (6 pistas, ducking) | 274,6 s (primer borrador) | reutilizada |
| Pico de RAM por tramo | 2.521 MB | **2.915 MB** |

Proceso: primero se hizo un borrador completo y se revisaron tiras de fotogramas. En las pausas del
ascenso la hormiga se giraba de lado, porque el rumbo por defecto era incorrecto en el tallo y en el
envés; se corrigió. Después se volvió a renderizar el borrador (cifras de la tabla) y, ya validado,
el final.

## Narración y subtítulos

- Voz Piper `es_MX-claude-high`: 31 frases, **155,7 s de voz (87 %)**, sin solapes ni retrasos.
- La narración base se amplió con matices verificables:
  - La especie hospedadora y dónde se describió su hongo.
  - La espora se adhiere a la cutícula, germina y la atraviesa.
  - "En algunos estudios" se observaron redes de células del hongo entre las fibras musculares.
  - El mecanismo todavía no se comprende por completo.
  - La fijación ocurre a menudo en el envés y sobre la nervadura.
  - Los filamentos que salen por las articulaciones pueden ayudar a sujetar el cuerpo.
  - El tallo sale de detrás de la cabeza y la estructura fértil se forma en uno de sus lados.
  - Las esporas suelen caer al suelo que recorren otras hormigas.
- No se atribuyen intenciones ni conciencia al hongo.

## Personajes y animación

- **Protagonista:** `WALKING` (trípode alterno, pies fijos en la superficie real), `ANTENNA_SCAN`,
  `MANDIBLE_MOVEMENT`, `TURNING`, `GROOMING`, `CLIMBING` por un tallo vertical (el cuerpo se orienta
  según la superficie), `INFECTED_WALK` (rumbo vacilante, temblor leve, pausas), `LEAF_GRIP` en el
  envés con **cámara lenta puntual ×0,35** rotulada, e `IMMOBILE`. Las patas siempre se apoyan en
  puntos de la superficie: la rama, la hoja baja, el tallo o el envés de la hoja.
- **Colonia:** 5 obreras con la misma anatomía y tamaños algo distintos (polimorfismo). Cada una tiene
  ruta, sentido, velocidad, pausas, lado de la corteza y ritmo de antenas propios. Aparecen en 4
  planos grupales.
- **Hongo:** las 8 etapas, de `SPORE` a `SPORE_RELEASE`, con un indicador en pantalla.
  - Las esporas no son proyectiles: derivan y caen.
  - Las vistas internas son esquemas en un marco circular azul, claramente distinto de los planos
    naturales.
  - El crecimiento externo es progresivo, se rotula "CRECIMIENTO ACELERADO" y va tras "DÍAS DESPUÉS".

## Límites (honestos)

- Las proporciones están estilizadas: el tallo del hongo mide unas 2 veces el cuerpo, y en la
  naturaleza varía.
- El paso de la rama al tallo y del tallo al envés de la hoja se resuelve con cortes de cámara.
- Los fondos de la selva están ilustrados de forma sencilla, sin especies vegetales concretas.
- La cámara lenta se aplica solo a la animación de la hormiga en la mordida; el audio sigue en tiempo
  real.

## Integridad

No se modificó ningún archivo de los Ep. 01–06 ni del motor. En `src/Root.tsx` solo se registraron
`Ep07Full` y `Ep07Characters`. POS Android no cambió y no se usa Three.js.
