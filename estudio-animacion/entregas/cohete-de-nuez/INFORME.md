# Videoclip 01 — "Nuestro cohete de nuez" · Informe de renderizado

## Entregables

| Archivo | Resolución | Fotogramas | Duración vídeo / audio | Tamaño |
|---|---|---|---|---|
| `cohete-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC 256 kb/s | **4.278 / 4.278** | **142,600 s / 142,576 s** | **57,03 MB** |
| `cohete-borrador-540x960.mp4` | 540×960, 30 fps | 4.278 / 4.278 | 142,600 s / 142,576 s | 16,32 MB |
| `fichas-personajes-y-cohete.png` | Nico, Luna, Bip, Zumi y el cohete en sus etapas de construcción | | | |
| `hoja-de-contacto.png` | 24 fotogramas del final | | | |
| `analisis-cancion.png` | espectrograma y curvas de energía de la canción (base del mapa temporal) | | | |

## El audio original

- **Origen:** `public/music/nuestro_cohete_de_nuez.mp3`, el archivo que enviaste: 142,576 s, MP3 de
  192 kb/s a 44,1 kHz.
- **Sin cambios:** no se aplica ningún filtro ni normalización y no se toca el tempo. Tampoco hay
  narración ni efectos añadidos. Solo se codifica a AAC directamente dentro del MP4, porque el MP4
  necesita AAC.
- **Comprobación sobre el MP4 final:**
  - Desfase con el original: **0 ms** (envolventes a 5 ms).
  - Correlación con el original: **0,9996**.
  - Nivel: 0,987 del original (diferencia propia de la codificación).
  - Duración del audio: 142,576 s, completa.
- **Por qué 4.278 fotogramas:** 4.278 = ⌈142,576 × 30⌉. El último fotograma contiene el final de la
  canción, así que no se corta nada. El vídeo dura 24 ms más que el audio; es menos de un fotograma.

## Mapa temporal (medido en el audio, no inventado)

| Sección | Inicio → fin (s) | Escena |
|---|---|---|
| Introducción instrumental | 0,000 → 5,689 | 01 habitación: Nico entra saltando, Luna pone materiales, Bip enciende su pantalla |
| Primera estrofa | 5,689 → 30,999 | 02 construcción: recortar, pegar cinta, aletas, ventana, punta, colador → casco, estrellas, luces |
| Cuenta regresiva | 30,999 → 34,737 | 03 entran al cohete; números 5…1 en los pulsos 32,392 / 32,856 / 33,344 / 33,808 / 34,273 |
| Primer estribillo | 34,737 → 65,202 | despegue en el "cero" (34,737) · 04 nubes, Tierra, viaje espacial |
| Pausa | 65,202 → 66,154 | transición |
| Segunda estrofa | 66,154 → 76,463 | 05 Luna de queso, foto imaginaria, beso a la Tierra |
| Segunda estrofa (final) + nota sostenida | 76,463 → 85,380 | 06 Zumi saluda, invita y vuelan juntos |
| Segundo estribillo | 85,380 → 115,357 | 07 montaje: órbita, baile, voltereta, saludo a cámara, nube brillante |
| Interludio | 115,357 → 119,583 | regreso entre nubes |
| Última estrofa | 119,583 → 134,095 | 08 aterrizaje, se quitan los cascos, recogen, Bip apaga las luces |
| Final instrumental | 134,095 → 142,576 | ventana de noche, Zumi como estrella, plano general |

- **Tempo y pulsos:** 129,2 BPM, 304 pulsos detectados por flujo espectral con programación dinámica.
  El compás dura 1,881 s.
- **Fronteras:** se leyeron en el espectrograma y en la curva de energía (`analisis-cancion.png`).
  `build_map.py` las ajusta al mayor cambio de energía cercano y al pulso más próximo.
- **Música en la animación:** pulso del baile (`MUSIC_BEAT` y `CHARACTER_DANCE`), impulso de cámara en
  cada compás (`CAMERA_PULSE`), luces del cohete y de la cabina (`LIGHT_PULSE`) y transiciones en las
  fronteras (`SCENE_TRANSITION`).
- **Boca al cantar** (`CHARACTER_SING`): se mueve con la envolvente de la voz del canal central. Es
  aproximada: **no hay análisis de fonemas**.

## Lo que se ajustó estimando (sin letra)

No recibí la letra, y en este entorno no se puede descargar un modelo de transcripción. Por eso hay
tres decisiones tomadas por estructura y no por palabras:

1. **La cuenta regresiva** ocupa los dos compases anteriores al estribillo, con un número en cada uno
   de los cinco últimos pulsos. Es donde la canción prepara el estribillo, pero no verifiqué que la
   voz diga cada número en ese pulso exacto.
2. **El "casco especial"** (el colador que se vuelve casco) está a los 25,4 s, dentro de la estrofa 1.
3. **La Luna y Zumi** se reparten en la estrofa 2 por mitades: el corte cae en un compás a los 76,46 s.

Si me envías la letra con las secciones marcadas, o los segundos exactos, ajusto esas tres marcas.
`Timeline/timeline.ts` lo permite cambiando unas pocas líneas.

## Render (valores medidos)

Equipo: contenedor Linux con 4 núcleos, 15 GB de RAM y sin GPU; concurrencia 4; tramos de 30 s.

| | Borrador (×0,5) | Final (×1, CRF 20) |
|---|---|---|
| Tramos de vídeo | 28,2 + 33,3 + 29,6 + 31,2 + 22,2 = **144,5 s** | 51,6 + 73,8 + 69,1 + 80,4 + 53,0 = **327,9 s** |
| Pico de RAM por tramo | 2.663 MB | **3.544 MB** |

**Validación:** antes del final revisé el borrador fotograma a fotograma. Los números de la cuenta
regresiva caen en sus pulsos, el despegue coincide con el primer tiempo del estribillo y la
continuidad entre escenas es correcta. En las primeras pruebas corregí tres cosas: el texto de la
pantalla de Bip salía en espejo, la tripulación quedaba escondida tras el panel de la cabina y había
un desfase de 20 ms en el audio, causado por un AAC intermedio.

## Comandos

```bash
npm run cohete:analyze    # analiza el MP3 y genera MusicSync/song-map.json
npm run cohete:fichas     # fichas de los personajes y el cohete
npm run cohete:sheet -- out/s.png 5,20,33,40,70,80,90,125,140
npm run cohete:draft      # borrador 540×960 con la canción original
npm run cohete:final      # MP4 final 1080×1920
npm run studio            # composición CoheteVideo (vista previa con audio)
```

## Integridad

No se modificó ningún documental, ni el motor, ni `scripts/render-episode.mjs`. El videoclip tiene su
propio script, `scripts/render-musicvideo.mjs`. En `src/Root.tsx` solo se registraron `CoheteVideo` y
`CoheteFichas`. POS Android no cambió y no se usa Three.js.
