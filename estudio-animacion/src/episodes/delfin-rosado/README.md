# delfin-rosado — El delfín rosado que nada entre los árboles (60 s, vertical)

Composición `EP-DelfinRosado`: 1080×1920, 30 fps, 1800 fotogramas. Ficha del personaje: `DelfinRosadoFicha`.

| Archivo | Contenido |
|---|---|
| `character/PinkDolphin.tsx` | Rig de *Inia geoffrensis* con vistas lateral, tres cuartos (`yaw`), superior y frontal. Incluye hocico con cerdas, melón, ojos pequeños, espiráculo, cuello flexible (giro y cabeceo), pectorales grandes, cresta dorsal baja, cola horizontal con batido vertical, boca articulada y piel gris → rosada (`pink`) con moteado, cicatrices, cáusticas y brillo de piel mojada. |
| `components/common.tsx` | 11 estados de movimiento (natación lenta y rápida, ascenso, descenso, giro de cabeza y de cuerpo, exploración, captura, salida a la superficie, respiración, navegación entre raíces) con mezcla suave; la fase del batido se integra. |
| `environment/Amazon.tsx` | Río y bosque inundado: selva en capas sobre el agua, troncos con raíces tabulares y aéreas, ramas sumergidas, rayos dorados, sedimento, lodo con hojarasca, turbidez (`murk`) y peces de agua dulce (carácidos y cíclidos) con cardumen que huye. |
| `scenes/S1_4.tsx`, `scenes/S5_8.tsx` | Las 8 escenas. La 8 termina en el encuadre y la pose del fotograma 0, de modo que el video forma un bucle. |

## Audio
- Pistas en `public/audio/delfin-rosado/`, todas de 60 s: voz, música, ambiente de selva, aves, corrientes, burbujas, movimiento, respiración, clics y transiciones.
- Banda sonora: `python3 tools/audio/score_delfin_rosado.py`.
- Narración: `python3 tools/audio/narration.py --voice <modelo piper es_MX> --src src/episodes/delfin-rosado/data/narration.json --timing src/episodes/delfin-rosado/data/narration-timing.json --out-dir public/audio/delfin-rosado`.

## Render
`node scripts/render-episode.mjs --comp EP-DelfinRosado --quality final --scale 1 --seg 30 --frames 1800 --crf 20 --out out/delfin-rosado-final-60s-1080x1920.mp4`
