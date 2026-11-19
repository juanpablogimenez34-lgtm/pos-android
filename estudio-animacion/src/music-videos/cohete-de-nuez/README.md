# Videoclip 01 — "Nuestro cohete de nuez"

Videoclip infantil que reutiliza el motor del estudio (Remotion + React + SVG + Canvas 2D, sin
Three.js). Está en una carpeta independiente: los documentales no se tocan. Solo se registra la
composición `CoheteFichas` en `src/Root.tsx`.

## Estado

| Parte | Estado |
|---|---|
| Fichas de personajes (`Characters/`) | **Hecho.** Nico, Luna, Bip y Zumi con rig propio y animación secundaria (cola, orejas, antenas, pantalla y luces) |
| Cohete de nuez (`Rocket/NutRocket.tsx`) | **Hecho.** Construcción por piezas, vibración, motor imaginario de chispas y resplandor |
| Analizador del audio (`MusicSync/analyze_song.py`) | **Hecho y probado.** Duración exacta, tempo, pulsos, compases, fronteras de sección y tramos de voz |
| Mapa temporal de la canción | **Pendiente:** falta el archivo `nuestro_cohete_de_nuez.mp3` (no está en el proyecto) |
| Escenas, cámaras, sincronización y render | **Pendiente:** dependen del mapa temporal real; no se inventan marcas de tiempo |

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

## Cuando llegue el audio

```bash
# 1) copiar la canción al proyecto
cp nuestro_cohete_de_nuez.mp3 public/music/
# 2) analizarla (opcional: letra con secciones entre corchetes, p. ej. [cuenta regresiva])
python3 src/music-videos/cohete-de-nuez/MusicSync/analyze_song.py public/music/nuestro_cohete_de_nuez.mp3 [letra.txt]
# 3) revisar las fichas
npx remotion still src/index.ts CoheteFichas out/fichas.png --frame=20 --scale=0.6
```
