# Los monstruos reales de las profundidades del océano

Documental animado de **10 minutos** (1920×1080, 30 fps, 18.000 fotogramas) y **5 Shorts verticales** (1080×1920, 60–90 s).

Está hecho íntegramente mediante código con Remotion, React, TypeScript y SVG procedural. No se usa Three.js, ni imágenes de terceros, ni APIs de pago. Es un proyecto independiente: no modifica `estudio-animacion/` ni la app POS.

## Instalación
```bash
cd oceano-profundo
npm install                      # Remotion 4.0.545, React 18
pip install piper-tts==1.3.0 numpy scipy soundfile   # voz y banda sonora (Python)
# Navegador: Remotion usa REMOTION_BROWSER si está definido (p. ej. chrome-headless-shell ya instalado)
```

## Audio
```bash
# 1) Narración por escenas (intenta Edge TTS y, si no hay acceso, usa Piper local es_MX)
python3 scripts/audio/narration.py --engine edge --voice <ruta>/es_MX-claude-high.onnx
# Shorts:
python3 scripts/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx --src src/shorts/data/short1.json \
  --timing src/shorts/data/short1-timing.json --out-dir public/audio/short1
# 2) Banda sonora original (música, ambiente, efectos, transiciones)
python3 scripts/audio/score.py
python3 scripts/audio/score_shorts.py
# 3) Subtítulos SRT desde los tiempos reales de la voz
python3 scripts/export-srt.py src/data/narration-timing.json entregas/oceano-profundo-documental-10min-1080p.srt 42
```

## Render
```bash
npm run typecheck
npm run studio                                   # vista previa interactiva
node scripts/contact-sheet.mjs Documental out/hoja.png 10,95,240,400 0.3   # fotogramas sueltos
npm run sample                                   # muestra de 20 s
npm run render:preview                           # documental completo 960×540 (rápido)
npm run render:final                             # documental final 1080p → out/oceano-profundo-documental-10min-1080p.mp4
npm run render:shorts                            # los 5 Shorts 1080×1920
```

`scripts/render.mjs` hace lo siguiente:
- Empaqueta el código una sola vez.
- Renderiza por segmentos de 30 s y reutiliza los ya hechos si se interrumpe.
- Mezcla el audio y lo normaliza a −14 LUFS en dos pasadas.
- Verifica fotogramas y duración, y escribe un informe `.report.json`.

## Arquitectura
| Carpeta | Contenido |
|---|---|
| `src/config.ts` | **Configuración central**: resolución, duración, fps, perfiles de calidad (`preview` / `premium`: partículas, desenfoque, distorsión, grano), volúmenes y ducking, subtítulos. |
| `src/camera/` | Motor de cámaras 2.5D con paralaje multicapa para cualquier formato: `shot`, `track`, `follow`, `breathe` (cámara en mano leve), `jolt`, `visible` (descarte de lo que queda fuera de cámara) y enfoque. |
| `src/environment/` | Océano por profundidad (paleta del agua y luz solar en función de los metros), superficie vista desde abajo, témpanos, fondo abisal o antártico (esponjas de cristal, plumas de mar, holoturias, ofiuras). |
| `src/effects/` | Rayos volumétricos, nieve marina en 3 capas con profundidad de campo, plancton bioluminiscente que reacciona al paso de los animales, burbujas, halos, ecolocalización ilustrativa, distorsión óptica acuática, gradación de color, velos de transición. |
| `src/animals/` | Rigs procedurales, cada uno con su propio movimiento: pez pescador (con macho), pez víbora, calamar gigante, cachalote, calamar colosal (rig propio con ganchos), fauna (medusas, *Atolla*, ctenóforos, sifonóforos, peces hacha, peces linterna, camarones rojos), ROV y silueta humana. |
| `src/scenes/` | Las 9 escenas como funciones puras del tiempo; `cuts` y `xfade` hacen fundidos encadenados sin cortes bruscos. |
| `src/components/` | Subtítulos (2 líneas), rótulos de especie, indicador de profundidad y presión, etiquetas anatómicas, avisos de reconstrucción, barras de escala. |
| `src/audio/` | Mezcla con *ducking* automático de la música durante la voz. |
| `src/shorts/` | 5 Shorts verticales con encuadres propios (no recortes): pantalla dividida, animales en diagonal y vertical, tarjeta final. |
| `src/utils/` | Matemática determinista (semillas fijas), curvas, movimiento con inercia, giros con escorzo, subtítulos y SRT, tipografías. |
| `scripts/` | Render por segmentos, Shorts, hojas de contacto, SRT, narración y banda sonora (Python). |

Determinismo: no hay temporizadores. Cada fotograma depende solo del tiempo y de semillas fijas, de modo que se puede renderizar aislado, en paralelo y por segmentos.
