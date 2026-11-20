# Mundo Insólito · EP04 — El leopardo: el fantasma de la selva

Composición `EP04Leopardo` (180 s, 1080×1920, 30 fps). Carpeta `ep09-leopardo` porque el proyecto ya
tenía un `ep04-halcon-peregrino`, que no se ha modificado. Entrega: `entregas/ep04-leopardo.mp4`.

| Carpeta | Contenido |
|---|---|
| `characters/` | `Leopard.tsx` (rig lateral: tronco flexible, 4 patas con IK y corvejón, cabeza, orejas, cola encadenada, rosetas; también cachorros con `cub`), `LeopardFace.tsx` (primer plano frontal, pupilas, brillo ocular), `Prey.tsx` (impala, silueta de presa, hiena), `LeopardSheet.tsx` (ficha de control) |
| `animation/` | `LeopardRig.ts`, `LeopardMotion.ts` (idle, walk, stalk, run, jump, climb, look, rest, interact, cola), `CameraSystem.ts`, `ParticleSystem.tsx` |
| `environments/` | `Jungle.tsx` (día/noche), `Savannah.tsx`, `Tree.tsx`, `Landscapes.tsx` (montaña, árido, paisaje fragmentado) |
| `scenes/` | `LeopardScene01.tsx` … `LeopardScene12.tsx`, `common.tsx` |
| `script/` | `narration.json` y `narration-timing.json` (tiempos medidos) |
| `audio/`, `subtitles/`, `config/` | mezcla, subtítulos, escenas |

```bash
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx --src src/episodes/ep09-leopardo/script/narration.json --timing src/episodes/ep09-leopardo/script/narration-timing.json --out-dir public/audio/ep04-leopardo
python3 tools/audio/score_ep09_leopardo.py
node scripts/render-episode.mjs --comp EP04Leopardo --quality final --scale 1 --seg 30 --crf 20 --out out/ep04-leopardo-1080x1920.mp4
```
