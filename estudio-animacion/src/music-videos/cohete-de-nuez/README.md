# Videoclip 01 — "Nuestro cohete de nuez"

Videoclip infantil que reutiliza el motor del estudio (Remotion + React + SVG + Canvas 2D, sin
Three.js). Está en una carpeta independiente: los documentales no se tocan. Solo se registra la
composición `CoheteFichas` en `src/Root.tsx`.

## Estado

Terminado: fichas, cohete, mapa temporal medido sobre el MP3 real, 8 escenas sincronizadas, borrador
540×960 y final 1080×1920 con la canción original sin modificar. Ver `entregas/cohete-de-nuez/INFORME.md`.

| Carpeta | Contenido |
|---|---|
| `Characters/` | `Nico.tsx`, `Luna.tsx`, `Bip.tsx`, `Zumi.tsx`, `parts.tsx` (rig común), `Fichas.tsx` |
| `Rocket/` | `NutRocket.tsx` (construcción por piezas, vibración, motor imaginario) |
| `Environments/` | `Room.tsx`, `Space.tsx`, `Cockpit.tsx` |
| `Animation/` | `moves.ts` (caminar, saltar, bailar, flotar, saludar…), `cast.ts` (animación secundaria) |
| `MusicSync/` | `analyze_song.py`, `build_map.py`, `song-map.json`, `songMap.ts` |
| `Scenes/` | `RoomScene.tsx`, `CountdownScene.tsx`, `SpaceScenes.tsx`, `crew.tsx` |
| `Camera/` | `cam2d.ts` (cámara 2D con parallax y pulso de compás) |
| `Effects/` | `Fx.tsx` (corazones, flash, chispas, iris de estrella, viñeta) |
| `Timeline/` | `timeline.ts` (escenas sobre las secciones reales, cuenta regresiva, construcción) |

## Fichas (continuidad)

- **Nico** (ardilla inventora): pelaje marrón anaranjado y vientre crema, ojos avellana, orejas
  pequeñas y nariz triangular. Cola grande y esponjosa con balanceo y enroscado propios. Camiseta
  turquesa y pantalón corto; cinturón de herramientas y casco transparente. Puede llevar tijeras de
  punta redonda, cinta, cartón o una estrella.
- **Luna** (conejita exploradora): pelaje blanco con detalles crema. Orejas largas, cada una con su
  propio ángulo y flexión; se pliegan dentro del casco. Ojos violeta y nariz rosada. Jardinera violeta,
  camiseta amarilla, botitas y casco lila.
- **Bip** (robot): cuerpo redondeado amarillo y azul y antena luminosa. Panel con luces que laten.
  Pantalla con caras (feliz, asombro, guiño, amor, concentrado, ups), números (cuenta regresiva),
  texto o corazón. Brazos articulados con pinza y piernas cortas.
- **Zumi** (extraterrestre): verde menta, cabeza redondeada, dos antenas flexibles, ojos grandes,
  boca sonriente, **tres dedos** por mano y cuerpo suave. Nada aterrador.
- **Cohete:** nuez con cáscara arrugada y costura, aletas de cartón pintado con borde corrugado,
  punta de papel decorado, ventana con aro de cartón (con interior), cinta adhesiva, lucecitas y
  estrellas pegadas. Vuela solo en la fantasía: el motor es de chispas mágicas, no de fuego realista.

## Comandos

```bash
npm run cohete:analyze && npm run cohete:draft && npm run cohete:final
```

## Versión 2.0 (remasterización) — carpeta `v2/`

La v1 (`CoheteVideo`) sigue intacta. La v2 reutiliza el mapa de la canción, los decorados, los efectos
y el script de render, y añade:

| Carpeta / archivo | Contenido |
|---|---|
| `v2/rig.tsx` | Rig 2D: manos con dedos que agarran (el objeto se dibuja en el marco de la mano), ojos con modos, cejas independientes, bocas nuevas, luz de contorno y mechones |
| `v2/Characters/` | `Nico2`, `Luna2`, `Bip2` (pinzas, brazos telescópicos, propulsores, pantallas nuevas), `Zumi2`, `Fichas2` |
| `v2/Animation/acting.ts` | Poses clave con curvas (anticipación, sobreimpulso), IK, gestos y coreografías por personaje |
| `v2/Stages/` | `Rocket2` (textura de nuez), `Space2` (nebulosas, estrellas en capas, asteroides, planetas, Luna de queso con volumen, cometas), `Sets2` (habitación con profundidad, cabina, brazos de plano detalle, IK), `Crew2` |
| `v2/Scenes/` | `Build`, `Countdown`, `Flight`, `MoonZumi`, `Dance`, `Home`: 83 planos |
| `v2/Shots/` | Sistema de planos: cada corte cae en un pulso medido |
| `v2/CoheteVideoV2.tsx` | Composición `CoheteVideoV2` (y `CohetePruebaV2`, los 20 s de prueba) |

```bash
npm run cohete2:fichas && npm run cohete2:prueba && npm run cohete2:draft && npm run cohete2:final
```
