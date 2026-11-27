# Videoclip 02 — "El baile del lobito"

Carpeta independiente: no modifica los documentales, el videoclip 01 ni POS Android. Solo usa el motor
común (`src/engine`). En `src/Root.tsx` se registran `LobitoFichas` y `LobitoPrueba`.

## Estado: fases 1–3 hechas; falta validar la prueba (fase 4)

| Carpeta | Contenido |
|---|---|
| `Rigging/` | `core.tsx` (IK de dos segmentos, cápsulas, pelaje), `face.tsx` (ojos con párpados, modos y cejas; bocas con mandíbula) |
| `Characters/` | `Lobi.tsx` (perfil 3/4, frente, espalda y acostado), `Bunny.tsx` (Mila y Toto), `Fichas.tsx` |
| `Animations/` | `lobiStates.ts` (IDLE, WALK, RUN, JUMP, SPIN, PLAY_BOW, DANCE de 8 tiempos, LAUGH, LOOK_UP, TIRED, YAWN, LIE_DOWN, SLEEP), `bunnyStates.ts` |
| `Forest/` | `Forest.tsx` (cielo, colinas, árboles, sendero, claro, flores, rosal, hongos, tronco, refugio, pájaros, mariposas, hojas, rayos de sol, luciérnagas) |
| `DayNight/` | `dayNight.ts`: mañana → tarde → atardecer → noche, gradual |
| `Camera/` | `cam.ts`: cámara 2D con parallax |
| `MusicSync/` | `analyze_song.py`, `song-map.json` (duración, 117,5 BPM, pulsos), `songMap.ts` |
| `Scenes/` | `Test20.tsx`: prueba de 20 s |
| `Choreography/`, `Timeline/` | vacías por ahora: se llenarán tras la validación |

```bash
npx remotion still src/index.ts LobitoFichas out/lobito-fichas.png --frame=20 --scale=0.6
npx remotion render src/index.ts LobitoPrueba out/lobito-prueba-20s.mp4 --scale=0.5 --crf=22
```
