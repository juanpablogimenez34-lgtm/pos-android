# Episodio 08 — La medusa que puede volver a ser joven (*Turritopsis dohrnii*)

Composición independiente (`Ep08Full`, 180 s, y `Ep08Demo`, 15 s). No modifica ningún episodio
anterior ni el motor: solo añade dos composiciones en `src/Root.tsx`.

## Estado
Terminado: 9 escenas (180 s), narración, banda sonora, borrador 540×960 y final 1080×1920.
Ver `entregas/ep08/INFORME.md`.

| Carpeta | Contenido |
|---|---|
| `Characters/` | `ImmortalJellyfish.tsx`, `JellyfishBell.tsx`, `JellyfishTentacles.tsx`, `LifeCycleTransformation.tsx` |
| `Environments/` | `UnderwaterEnvironment.tsx` (agua, rayos, cáusticas, arrecife, peces), `OceanParticles.tsx` |
| `Lighting/` | `CinematicLighting.tsx` |
| `Animation/` | `jellyMotion.ts` (nado por chorro, contracción, corriente, peligro) |
| `Camera/` | `cam.ts` (cámara 2D con parallax) |
| `Scenes/` | `Opening.tsx` (escenas 1–2), `Middle.tsx` (3–5), `Late.tsx` (6–9) |
| `Script/` | `narration.json` (guion ampliado), `narration-timing.json` (tiempos medidos) |
| `Audio/`, `Subtitles/`, `Timeline/` | mezcla, subtítulos con ducking, escenas |

## Audio
- Locución: Piper `es_MX-claude-high` (Apache-2.0), `tools/audio/narration.py`.
- Música, ambiente, movimiento, descubrimiento y transiciones: síntesis propia con `tools/audio/score_ep08.py`.

```bash
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx --src src/episodes/ep08-medusa-inmortal/Script/narration.json --timing src/episodes/ep08-medusa-inmortal/Script/narration-timing.json --out-dir public/audio/ep08
python3 tools/audio/score_ep08.py
npx remotion render src/index.ts Ep08Demo out/ep08-demo-15s-1080x1920.mp4 --crf=20
```
