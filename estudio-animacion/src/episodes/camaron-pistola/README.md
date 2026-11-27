# camaron-pistola: El camarón que dispara sin balas (60 s, vertical)

Composición `EP-CamaronPistola`: 1080×1920, 30 fps, 1800 fotogramas. Ficha del personaje: `CamaronPistolaFicha`.

| Carpeta / archivo | Contenido |
|---|---|
| `character/Shrimp.tsx` | Rig SVG de *Alpheus* con pinza mayor detallada (mero, carpo, palma, dedo fijo con cavidad, dáctilo con émbolo que pivota, estela del chasquido), pinza menor, P2 con carpo segmentado y P3–P5 con apoyo fijo en la arena. También antenas y anténulas, ojos bajo capuchas orbitales, abdomen articulado, pleópodos y abanico caudal. |
| `character/Sheet.tsx` | Ficha: marcha, pinza armada, chasquido y detalle. |
| `components/common.tsx` | 8 estados (IDLE, WALKING, EXPLORING, TARGETING, CLAW_OPEN, SNAPPING, HUNTING, RETREATING) mezclados durante 0,35 s; la marcha se integra. Incluye `snapOpen` y los rótulos. |
| `environment/Reef.tsx` | Arrecife en capas (rayos, siluetas, rocas con cuevas, corales, algas, cardumen, arena con cáusticas, partículas, primer plano) y presa (`PreyFish` con aturdimiento). Efectos: chorro, burbuja, baja presión, onda de choque, destello y sedimento. |
| `scenes/S1_4.tsx`, `scenes/S5_8.tsx` | Las 8 escenas. La 8 termina exactamente en el encuadre del fotograma 0, de modo que el video forma un bucle. |
| `data/` | Narración, tiempos reales de la voz y calendario de eventos compartido con la banda sonora. |

## Audio
- Pistas en `public/audio/camaron-pistola/`, todas de 60 s: voz, música, ambiente submarino, movimiento, chasquido, apertura de la pinza, colapso de la burbuja, onda de choque y transiciones.
- Banda sonora: `python3 tools/audio/score_camaron_pistola.py`.
- Narración: `python3 tools/audio/narration.py --src src/episodes/camaron-pistola/data/narration.json --timing src/episodes/camaron-pistola/data/narration-timing.json --out-dir public/audio/camaron-pistola --voice <modelo piper es_MX>`.

## Render
`node scripts/render-episode.mjs --comp EP-CamaronPistola --quality final --scale 1 --seg 30 --crf 20 --out out/camaron-pistola-final-60s-1080x1920.mp4`
