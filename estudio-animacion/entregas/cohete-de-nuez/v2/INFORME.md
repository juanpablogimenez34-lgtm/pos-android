# "Nuestro cohete de nuez" · Remasterización 2.0 · Informe

El vídeo aprobado (v1) **no se ha reemplazado**: sigue en `entregas/cohete-de-nuez/`, y la composición `CoheteVideo` no cambió. Todo lo nuevo está en `src/music-videos/cohete-de-nuez/v2/` y en esta carpeta.

## Entregables

| Archivo | Contenido | Datos medidos |
|---|---|---|
| `cohete-v2-final-1080x1920.mp4` | Versión final | 1080×1920, 30 fps, H.264 + AAC 256 kb/s · **4.278 / 4.278 fotogramas** · 142,600 s · 64,02 MB |
| `cohete-v2-borrador-540x960.mp4` | Borrador completo | 540×960 · 4.278 fotogramas · 142,600 s · 18,74 MB |
| `cohete-v2-prueba-20s.mp4` | Prueba de 20 s (de 5,7 a 25,7 s): construcción, actuación y primeros planos | 540×960 · 600 fotogramas · 20,0 s · 3,9 MB |
| `fichas-2.0.png` | Los cuatro personajes con el rig nuevo: expresiones y manos con objetos | |
| `hoja-de-contacto.png` | 24 fotogramas del vídeo final | |
| `tira-borrador-1fps.png` | Un fotograma por segundo del borrador, para revisar la continuidad | |

## La canción (sin cambios)

- Se usa el MP3 original (`public/music/nuestro_cohete_de_nuez.mp3`) sin cortes, sin cambios de tempo y sin narración. Solo se codifica a AAC dentro del MP4, sin filtros.
- Comprobación sobre el MP4 final:
  - Desfase: **0 ms** (medido con envolventes de 5 ms).
  - Correlación con el original: **0,9996**.
  - Nivel: 0,99 del original.
  - Audio completo: 142,58 s.
- Los 83 planos empiezan en un pulso medido de `song-map.json`. La única excepción es el primero, que empieza en 0 s. Ningún corte se ajustó a ojo.
- Las tres marcas estimadas de la v1 se mantienen:
  - La cuenta regresiva ocupa los 5 últimos pulsos antes del estribillo.
  - El colador se convierte en casco a los 25,4 s.
  - La escena de la Luna da paso a la de Zumi a los 76,46 s.

## Qué mejoró

1. **Rig 2D reutilizable** (`v2/rig.tsx`, `v2/Characters/`):
   - **Manos que agarran:** tienen pulgar y dedos que se cierran (`grip`); Zumi tiene tres dedos.
   - **Objetos sujetos de verdad:** el objeto se dibuja dentro del marco de la mano, así que sigue su posición y su ángulo y no hay herramientas flotando. Los objetos disponibles son tijeras, cinta, tira de cinta, cartón, aleta (con color), ventana, llave, cámara, colador, estrella, caja, papel, punta de papel y la nave en miniatura.
   - **Paso al cohete:** cada pieza pasa de la mano al cohete en un instante de contacto concreto (`EV` en `Build.tsx`).
   - **Bip:** pinzas que se abren y se cierran, brazos telescópicos, propulsores, una pantalla que se enciende y pantallas nuevas (risa, sueño, estrellas, visor de cámara, foto y radar).
   - **Cinemática inversa** de dos segmentos (`reachLimb`): las manos llegan exactamente a la ranura de la aleta, a la ventana, a la palanca o al interruptor.
2. **Expresiones:**
   - Ojos con cinco modos: normal, feliz, muy abiertos, cerrados y entornados.
   - Cejas independientes, doble brillo, anillo en el iris y párpado con línea.
   - Bocas nuevas: risa, preocupación, «iii» y lengua.
   - Al cantar, la boca sigue la envolvente de la voz real.
3. **Acabado:**
   - Luz de contorno con el color de cada escena y sombra suave bajo la cabeza.
   - Mechones de pelaje, pliegues y costuras en la ropa, pestañas y bigotes en Luna.
   - La nuez tiene poros y vetas, y las aletas muestran el ondulado del cartón.
4. **Actuación** (`v2/Animation/acting.ts`):
   - Poses clave con curvas de anticipación y sobreimpulso, y saltos que se preparan agachándose y se aplastan al caer.
   - Coreografías en los estribillos, siempre con anticipación y suavizado, más un paso común para los planos generales:
     - **Nico:** balanceo lateral, brazos alternos y cola.
     - **Luna:** saltitos, un giro cada 8 pulsos y orejas.
     - **Bip:** pasos robóticos secos, brazos en ángulo recto y luces al ritmo.
     - **Zumi:** saltos, un giro cada 4 pulsos y antenas.
5. **Decorados:**
   - **Habitación:** haces de luz, polvo en el aire, objetos en primer plano que dan profundidad, el montón de materiales y un carrito con ruedas.
   - **Cabina:** asientos de cartón, pegatinas, una estrella colgante y luz de color.
   - **Espacio:**
     - Nebulosas en capas y estrellas en tres profundidades, con destellos en cruz.
     - Asteroides lejanos y cercanos.
     - Planetas con bandas, sombra, atmósfera y un anillo que pasa por delante y por detrás.
     - Una Luna de queso con volumen y agujeros en escorzo.
     - Cometas animados.
     - Un planeta de caramelo para el baile del segundo estribillo.
6. **Composición para móvil:** los encuadres se recalcularon para pantalla vertical. Los personajes son grandes y las caras quedan en la zona central segura. Las emociones van en primeros planos y hay planos detalle de manos.
7. **Montaje:** 83 planos, sin repetir ninguno para rellenar tiempo. Cada plano dura entre 0,46 s (los números de la cuenta) y 4,18 s.

   | Tipo de plano | Cantidad |
   |---|---|
   | Primer plano | 20 |
   | Plano medio | 15 |
   | Exterior | 11 |
   | Plano general | 9 |
   | Cabina | 7 |
   | Reacción | 6 |
   | Planeta | 6 |
   | Acción | 5 |
   | Detalle | 4 |

## Tabla de tiempos (83 planos)

| # | Plano | Inicio → fin (s) | Sección | Tipo | Qué pasa |
|---|---|---|---|---|---|
| 1 | I1 | 0.000 → 2.879 | intro | general | habitación de mañana; Nico entra saltando |
| 2 | I2 | 2.879 → 4.272 | intro | medio | Luna llega con la caja de materiales y la deja |
| 3 | I3 | 4.272 → 5.689 | intro | primer plano | primer plano: Bip enciende su pantalla y saluda |
| 4 | B1 | 5.689 → 7.546 | verse1 | medio | Nico observa los materiales y tiene una idea |
| 5 | B2 | 7.546 → 9.427 | verse1 | medio | Luna se agacha y levanta un cartón |
| 6 | B3 | 9.427 → 11.308 | verse1 | detalle | detalle: las manos de Luna sujetan la aleta y Nico pega la cinta |
| 7 | B4 | 11.308 → 13.189 | verse1 | medio | Bip camina como robot llevando la llave y la aleta amarilla |
| 8 | B5 | 13.189 → 15.070 | verse1 | medio | Nico lleva la aleta azul, toma impulso y la encaja |
| 9 | B6 | 15.070 → 16.927 | verse1 | medio | Bip encaja la aleta amarilla y la ajusta con la llave |
| 10 | B7a | 16.927 → 18.344 | verse1 | detalle | detalle: las manos de Nico recortan el papel rosa, un corte en cada pulso |
| 11 | B7b | 18.344 → 19.737 | verse1 | medio | Nico enrolla el papel como punta; Luna espera con la ventana |
| 12 | B8 | 19.737 → 21.618 | verse1b | medio | Luna, subida a la caja, coloca la ventana redonda |
| 13 | B9 | 21.618 → 23.499 | verse1b | medio | Bip vuela con sus propulsores y coloca la punta de papel |
| 14 | B10 | 23.499 → 25.356 | verse1b | medio | Nico encuentra el colador, lo levanta y se lo pone de casco |
| 15 | B11 | 25.356 → 26.308 | verse1b | reacción | el colador se convierte en casco espacial; Luna y Bip se ríen |
| 16 | B12 | 26.308 → 28.189 | verse1b | general | los tres empujan el cohete hasta la alfombra |
| 17 | B13 | 28.189 → 30.999 | verse1b | general | plano general: Luna pega una estrella, se encienden las luces, admiran el cohete y miran a cámara |
| 18 | K1 | 30.999 → 31.927 | countdown | cabina | cabina: la tripulación cae en sus asientos con un rebote |
| 19 | K2 | 31.927 → 32.392 | countdown | primer plano | primer plano: Luna se ajusta el casco (las orejas se pliegan dentro) |
| 20 | K3 | 32.392 → 32.856 | countdown | primer plano | "5" — la pantalla de Bip muestra el número |
| 21 | K4 | 32.856 → 33.344 | countdown | primer plano | "4" — primer plano de Nico, decidido |
| 22 | K5 | 33.344 → 33.808 | countdown | detalle | "3" — detalle: la mano de Nico agarra la palanca y Luna pulsa un botón |
| 23 | K6 | 33.808 → 34.273 | countdown | exterior | "2" — el cohete vibra en la habitación; las luces parpadean |
| 24 | K7 | 34.273 → 34.737 | countdown | reacción | "1" — los tres se inclinan hacia delante, emocionados |
| 25 | L1 | 34.737 → 35.689 | chorus1 | exterior | ¡cero! anticipación (se aplasta), vibración, luz, nubes de fantasía y empieza a subir |
| 26 | L1b | 35.689 → 36.618 | chorus1 | acción | el cohete sube entre nubes de fantasía, acelerando poco a poco |
| 27 | L2 | 36.618 → 38.499 | chorus1 | cabina | cabina: la aceleración los aplasta contra el asiento, entre risas; por la ventana pasan nubes |
| 28 | L3 | 38.499 → 40.380 | chorus1 | exterior | el cohete atraviesa la capa de nubes: el cielo se vuelve espacio |
| 29 | L4 | 40.380 → 42.237 | chorus1 | planeta | la Tierra queda abajo; el cohete se aleja hacia el espacio |
| 30 | F1 | 42.237 → 44.118 | chorus1 | primer plano | primer plano de Nico cantando en la cabina |
| 31 | F2 | 44.118 → 45.999 | chorus1 | exterior | el cohete pasa junto a un planeta con anillo; cruzan cometas |
| 32 | F3 | 45.999 → 47.880 | chorus1 | cabina | cabina: en gravedad cero se elevan de los asientos y bailan |
| 33 | F4 | 47.880 → 49.737 | chorus1 | planeta | nebulosa, planeta detallado con su luna y asteroides lejanos; el cohete cruza pequeño |
| 34 | F5 | 49.737 → 51.618 | chorus1 | primer plano | Luna baila flotando: saltitos, giro y orejas |
| 35 | F6 | 51.618 → 53.499 | chorus1 | acción | acción: esquivan un campo de asteroides con un giro completo |
| 36 | F7 | 53.499 → 55.380 | chorus1 | reacción | reacción por la ventana: asombro y luego celebración |
| 37 | F8 | 55.380 → 57.237 | chorus1 | primer plano | Bip baila como robot: pasos secos, brazos alternos y luces al ritmo |
| 38 | F9 | 57.237 → 59.118 | chorus1 | cabina | cabina general: los tres bailan flotando y la cámara gira suavemente |
| 39 | F10 | 59.118 → 60.999 | chorus1 | exterior | el cohete persigue un cometa y deja una estela de chispas |
| 40 | F11 | 60.999 → 62.880 | chorus1 | primer plano | Nico y Luna, flotando juntos, cantan a cámara |
| 41 | F12 | 62.880 → 65.202 | chorus1 | planeta | aparece la Luna de queso en el horizonte; el cohete pone rumbo hacia ella |
| 42 | M1 | 65.202 → 67.082 | break | exterior | acercamiento: la Luna de queso crece y el cohete se dirige hacia ella |
| 43 | M2 | 67.082 → 68.963 | verse2 | planeta | plano general de la Luna de queso, con volumen; el cohete pasa pequeño por delante |
| 44 | M3 | 68.963 → 70.844 | verse2 | primer plano | primer plano: Luna, flotando junto a la ventana, mira la Luna con los ojos brillantes |
| 45 | M4 | 70.844 → 72.725 | verse2 | cabina | Nico señala los cráteres de queso por la ventana |
| 46 | M5 | 72.725 → 74.582 | verse2 | primer plano | Bip hace una foto: destello y la foto aparece en su pantalla |
| 47 | M6 | 74.582 → 76.463 | verse2 | reacción | reacción feliz: celebran y mandan corazones a la Luna |
| 48 | Z1 | 76.463 → 77.880 | zumi | exterior | una nave redonda con luces se acerca desde lejos |
| 49 | Z2 | 77.880 → 78.809 | zumi | primer plano | Nico descubre la nave y la señala |
| 50 | Z3 | 78.809 → 79.737 | zumi | reacción | Luna, sorprendida: orejas arriba y boca en "o" |
| 51 | Z4 | 79.737 → 80.689 | zumi | primer plano | Bip activa su pantalla: radar y luego "¡HOLA!" |
| 52 | Z5 | 80.689 → 82.083 | hold | primer plano | primer plano de Zumi en su cúpula: tímido, y después sonríe |
| 53 | Z6 | 82.083 → 83.499 | hold | primer plano | Zumi saluda con su mano de tres dedos |
| 54 | Z7 | 83.499 → 84.428 | hold | cabina | los tres responden al saludo desde la cabina |
| 55 | Z8 | 84.428 → 85.380 | hold | exterior | las dos naves viajan juntas, una al lado de la otra |
| 56 | D1 | 85.380 → 87.237 | chorus2 | exterior | las dos naves vuelan juntas junto a un planeta con anillo |
| 57 | D2 | 87.237 → 89.118 | chorus2 | acción | aterrizan en un pequeño planeta de caramelo con una nube de polvo |
| 58 | D3 | 89.118 → 90.999 | chorus2 | general | los cuatro empiezan a bailar en el planeta (paso común) |
| 59 | D4 | 90.999 → 92.880 | chorus2 | primer plano | coreografía de Nico: balanceo lateral, brazos y cola al ritmo |
| 60 | D5 | 92.880 → 94.737 | chorus2 | primer plano | coreografía de Luna: saltitos, giro y orejas |
| 61 | D6 | 94.737 → 96.618 | chorus2 | primer plano | coreografía de Bip: pasos robóticos, brazos alternos y luces |
| 62 | D7 | 96.618 → 98.499 | chorus2 | primer plano | coreografía de Zumi: saltos, giros y antenas |
| 63 | D8 | 98.499 → 100.380 | chorus2 | general | los cuatro al unísono |
| 64 | D9 | 100.380 → 102.237 | chorus2 | planeta | plano lejano: el planeta de caramelo con los bailarines diminutos, la nebulosa y un cometa |
| 65 | D10 | 102.237 → 104.118 | chorus2 | reacción | Nico y Zumi chocan las manos en el pulso |
| 66 | D11 | 104.118 → 105.999 | chorus2 | medio | Luna y Bip giran juntos tomados de la mano |
| 67 | D12 | 105.999 → 107.880 | chorus2 | general | todos bailan; la cámara gira alrededor del grupo |
| 68 | D13 | 107.880 → 109.738 | chorus2 | exterior | las dos naves despegan del planeta de caramelo |
| 69 | D14 | 109.738 → 111.618 | chorus2 | cabina | cabina: siguen bailando y Zumi los saluda desde la ventana |
| 70 | D15 | 111.618 → 113.499 | chorus2 | acción | las dos naves dan una vuelta alrededor de un cometa |
| 71 | D16 | 113.499 → 115.357 | chorus2 | exterior | Zumi se despide y su nave se aleja dejando una estrella |
| 72 | R1 | 115.357 → 117.725 | interlude | planeta | rumbo a casa: la Tierra crece en el centro |
| 73 | R2 | 117.725 → 119.583 | interlude | acción | bajan suavemente entre nubes rosadas del atardecer |
| 74 | H1 | 119.583 → 121.464 | verse3 | general | el cohete aterriza suavemente sobre su carrito en la alfombra |
| 75 | H2 | 121.464 → 123.344 | verse3 | medio | salen de un salto y se quitan los cascos; las orejas de Luna saltan hacia arriba |
| 76 | H3 | 123.344 → 125.225 | verse3 | medio | Nico y Luna chocan las manos y se ríen; Bip aplaude |
| 77 | H4 | 125.225 → 127.083 | verse3 | general | recogen: Luna lleva la caja, Nico las tijeras y la cinta, Bip los cartones |
| 78 | H5 | 127.083 → 128.964 | verse3 | medio | anochece por la ventana; Nico bosteza y se estira |
| 79 | H6 | 128.964 → 130.844 | verse3 | primer plano | Bip pulsa el interruptor: se apaga la luz y su pantalla muestra cara de sueño |
| 80 | H7 | 130.844 → 134.095 | verse3 | medio | Nico y Luna, sentados en la alfombra junto al cohete, miran la ventana |
| 81 | O1 | 134.095 → 138.275 | outro | detalle | en la ventana de noche aparece Zumi como una estrella sonriente |
| 82 | O2 | 138.275 → 140.132 | outro | primer plano | primer plano: Nico y Luna se duermen apoyados el uno en la otra |
| 83 | O3 | 140.132 → 142.576 | outro | general | plano final: la habitación de noche con el cohete; la cámara se aleja |

## Render (medido)

Contenedor Linux con 4 núcleos y sin GPU, concurrencia 4 y tramos de 30 s.

| | Borrador (×0,5) | Final (×1, CRF 20) |
|---|---|---|
| Tiempo por tramo | 29,1 + 33,4 + 31,7 + 32,5 + 22,5 = 149,2 s | 61,8 + 71,4 + 67,0 + 72,2 + 50,9 = **323,3 s** |
| Pico de RAM | 2.464 MB | 3.193 MB |

## Validación y correcciones

- **Prueba de 20 s.** La revisé fotograma a fotograma y corregí:
  - Los encuadres, que se recalcularon para formato vertical porque los personajes salían pequeños.
  - La convención de ángulos de los brazos: al saludar, la mano tapaba la cara.
  - Un plano estático, que dividí en dos: el detalle de las tijeras y la aparición de la punta.
- **Borrador completo.** Lo revisé segundo a segundo con la tira de un fotograma por segundo y corregí:
  - Los primeros planos de Zumi.
  - El despegue desde el planeta de caramelo, porque las naves salían de cuadro.
  - Los planos generales, que cortaban a Bip.
  - El final de la introducción.

## Limitaciones

- La boca sigue la envolvente de la voz, pero no hay análisis de fonemas.
- Los brazos son cortos, como corresponde al estilo infantil: al celebrar, las manos llegan a la altura de la cara, no por encima de la cabeza.
- En los planos detalle, los brazos entran desde fuera de cuadro y son más largos de lo normal. Es una licencia de encuadre.
- Entre el baile en el planeta y el despegue, los personajes suben a las naves fuera de cuadro.

## Integridad

- No se modificaron la v1, los documentales, el motor ni `scripts/render-musicvideo.mjs`, que se reutiliza tal cual.
- El cohete 2.0 es una copia mejorada (`v2/Stages/Rocket2.tsx`); `Rocket/NutRocket.tsx` no cambió.
- En `src/Root.tsx` solo se añadieron `CoheteVideoV2`, `CohetePruebaV2` y `CoheteFichasV2`.
- No se tocó el proyecto POS Android y no se usa Three.js.

## Comandos

    npm run cohete2:fichas   # fichas 2.0
    npm run cohete2:prueba   # prueba de 20 s
    npm run cohete2:draft    # borrador 540×960 con la canción original
    npm run cohete2:final    # final 1080×1920
