# Ep. 08 — La medusa que puede volver a ser joven · Informe de renderizado

## Entregables

| Archivo | Datos medidos |
|---|---|
| `ep08-final-1080x1920.mp4` | 1080×1920, 30 fps, H.264 + AAC · 5.400 / 5.400 fotogramas · 180,0 s · 73,5 MB |
| `ep08-borrador-540x960.mp4` | 540×960 · 5.400 fotogramas · 180,0 s · 19,2 MB |
| `ep08-demo-15s-1080x1920.mp4` | demo inicial de 15 s |
| `hoja-de-contacto.png`, `borrador-tira-1fps.png` | revisión de continuidad (1 fotograma por segundo) |

## Escenas

| Tramo (s) | Escena |
|---|---|
| 0–8 | Impacto: la medusa sube desde la oscuridad, título «¿PUEDE REJUVENECER?», adelanto de la transformación |
| 8–25 | Presentación: arrecife con peces, corales, rayos de sol; nombre científico con escala (≈5 mm); macro del estómago rojo |
| 25–45 | El secreto: nado y captura de plancton; rueda del ciclo vital (larva → pólipo → medusa) y flecha de reversión |
| 45–71 | Transformación: desencadenantes; reabsorbe tentáculos, la campana se repliega, masa de tejido, células que se reorganizan; diagrama de transdiferenciación |
| 71–96 | Nuevo comienzo: la masa se adhiere, estolón, pólipos que se alimentan, yemas, medusas jóvenes liberadas; ciclo circular |
| 96–120 | ¿Inmortal?: aguas profundas, depredadores que pasan, reacción de alarma (sin violencia) |
| 120–145 | La ciencia: laboratorio, científica al microscopio, vista del microscopio, células, comparación de genomas |
| 145–165 | Revelación: «ninguna cura demostrada contra el envejecimiento humano»; las fases del ciclo orbitan alrededor de la medusa |
| 165–180 | Cierre: la cámara se aleja, la medusa brilla en la oscuridad; «MUNDO INSÓLITO · Descubre lo que parece imposible.» y la pregunta final |

## Audio
- Locución Piper `es_MX-claude-high`: 29 frases, 157 s de voz (87 %), sin solapes.
- Banda sonora original sintetizada (`tools/audio/score_ep08.py`): música, ambiente, pulsos de la campana, descubrimiento y transiciones. Ducking bajo la voz.
- Mezcla normalizada a −14 LUFS (entrada medida: −16,0 LUFS, pico real −1,6 dBTP).

## Render (medido; 4 núcleos, sin GPU, concurrencia 4, tramos de 30 s)

| | Borrador ×0,5 | Final ×1 (CRF 20) |
|---|---|---|
| Vídeo | 6 tramos | 135,1 + 140,1 + 105,3 + 120,3 + 85,7 + 126,2 = 712,7 s |
| Audio (6 pistas, ducking, normalización) | | 139,9 s |
| Total | 409,3 s | 852,6 s (≈14 min) |
| Pico de RAM | 2.761 MB | 3.629 MB |

## Integridad
`git diff` sobre `src/episodes/ep01-pulpo` … `ep07`, `src/engine` y `scripts`: sin cambios.
El episodio 01 (pulpo) sigue como en su último commit. En `src/Root.tsx` solo se añadieron `Ep08Full` y `Ep08Demo`.
