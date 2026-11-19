# Episodio 04 — "El ave que supera los 300 km/h" (halcón peregrino)

Reutiliza el motor de los episodios anteriores: cámara 2.5D, parallax, calidad, subtítulos,
rótulos, audio con ducking y render por segmentos. No modifica ningún archivo de los
Ep. 01–03 ni del motor; solo registra `Ep04Full` (y la hoja de control `FalconStates`) en
`src/Root.tsx`.

## Estructura

| Parte | Archivo |
|---|---|
| Guion | `narration.json` (frases + instante de entrada) |
| Tiempos medidos de la voz | `narration-timing.json` (generado) |
| Personaje | `../../creatures/falcon/Bird.tsx` (rig 3D ligero proyectado a SVG, compartido con la paloma) |
| Animaciones / estados de vuelo | `../../creatures/falcon/flight.ts` (10 estados, fase de batido integrada) |
| Timeline (5.400 fotogramas) | `timeline.ts` |
| Cámaras | `cameras.ts` (plano fijo, seguimiento, seguimiento de la cabeza, encuadre halcón + paloma) |
| Escenarios | `scenes/Landscape.tsx` + `../../environments/sky/Sky.tsx` |
| Efectos | `effects.tsx` (líneas de velocidad, nubes rápidas y estelas de la picada, paneles del ala y del flujo, anillo de enfoque) |
| Sonido | `sound.ts` y `../../../tools/audio/score_ep04.py` |
| Subtítulos | `subtitles.ts` |
| Composición | `Ep04Full.tsx` |

## El halcón (rig 3D ligero)

- **Volúmenes:** el cuerpo, el cuello y la cabeza son elipsoides y esferas con **silueta
  exacta**, proyectados sin Three.js.
- **Alas:** son planos articulados (húmero, antebrazo y mano) con 10 primarias, 9 secundarias y
  coberteras. La cara superior es gris pizarra y la inferior, clara y barreada.
- **Cola:** en abanico, con apertura e inclinación variables.
- **Patas:** posadas, recogidas o adelantadas en el ataque.
- **Cabeza de perfil:** ilustración específica con corona plana y ceño marcado sobre el ojo,
  capucha y bigote negros, mejilla blanca, anillo ocular y cera amarillos, pico ganchudo con
  diente tomial y membrana nictitante. En vistas no laterales
  se usan las marcas 3D.
- **Vistas:** el mismo personaje se ve de perfil, desde arriba, desde atrás, en giro y en
  picada.

Estados de vuelo: `PERCHED, TAKEOFF, SOARING, FLAPPING, GLIDING, STOOP_PREPARATION,
HIGH_SPEED_DIVE, PURSUIT, BRAKING, LANDING`. Son conjuntos de parámetros que se mezclan
suavemente. La carrera descendente del ala ocupa el 40 % del ciclo, y en la picada las alas
se recogen parcialmente. `npm run still:falcon` genera la hoja con los 10 estados.

## Datos científicos (y matices)

- **Velocidad:** en picada de caza supera los 300 km/h; con halcones entrenados se han
  registrado más de 380 km/h. **No** se atribuye ninguna velocidad al ave animada. Las líneas de
  velocidad se rotulan como estilizadas, y se aclara que en vuelo horizontal es mucho más lento.
- **Distribución y presas:** todos los continentes salvo la Antártida; caza sobre todo aves en
  vuelo.
- **Dimorfismo:** las hembras son bastante más grandes que los machos.
- **Ojos:** la membrana nictitante los protege durante la picada.
- **Picada:** es un vuelo dirigido (cuerpo en forma de gota), no una caída descontrolada.
- **Caza:** no siempre tiene éxito. La escena muestra un **intento fallido** (la paloma esquiva),
  sin violencia gráfica.
- **Conservación:** el DDT lo hizo desaparecer de muchas regiones en el siglo XX y se recuperó
  tras su prohibición y la conservación.
- **Texto final:** "¿QUÉ ANIMAL SUPERA ESTA VELOCIDAD?", con la aclaración "EN PICADA, NINGÚN
  ANIMAL CONOCIDO LO SUPERA", para no sugerir lo contrario.

## Reproducir y exportar

```bash
npm run studio                     # elegir Ep04Full o FalconStates
npm run ep04:sheet -- out/s.png 20,60,100,140,170
npm run ep04:draft                 # 540×960
npm run ep04:final                 # 1080×1920
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep04-halcon-peregrino/narration.json \
  --timing src/episodes/ep04-halcon-peregrino/narration-timing.json --out-dir public/audio/ep04
python3 tools/audio/score_ep04.py
```
