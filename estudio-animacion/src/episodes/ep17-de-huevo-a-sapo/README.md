# DE HUEVO A SAPO — demostración de 15 s

Motor de animación de ciclos de vida aplicado a *Bufo bufo* (sapo común).
1080×1920 · 30 fps · 450 fotogramas · sin Three.js (React + SVG en Remotion).
La demo no tiene audio. La narración (Piper) y la música (`tools/audio/score.py`) se añadirán en la película completa.

## Árbol

```
estudio-animacion/
├─ remotion.config.ts            configuración común del estudio (h264, yuv420p, REMOTION_BROWSER)
├─ src/index.ts                  registerRoot
├─ src/Root.tsx                  composiciones: DeHuevoASapoDemo, SapoEtapasFicha
├─ src/lifecycle/                MOTOR REUTILIZABLE (independiente de la especie)
│  ├─ stages.ts                  StageKey, stageAt (interpolación de etapas), GrowthTrack/growthAt
│  │                             (tiempo de vídeo → desarrollo = time-lapse), lerpPoly, closedSpline
│  └─ TimeLapse.tsx              indicador «tiempo condensado» con reloj
├─ src/episodes/ep17-de-huevo-a-sapo/
│  ├─ SapoDemo.tsx               guion de 15 s: cámara, montaje y transiciones
│  ├─ species/bufoBufo.ts        ESPECIE: parámetros por etapa (cola, patas, verrugas, parótidas…)
│  ├─ character/Toad.tsx         rig único renacuajo→sapo (cola de 14 puntos, patas articuladas)
│  ├─ character/Embryo.tsx       cordones de huevos y embrión en desarrollo
│  ├─ character/StageSheet.tsx   ficha de etapas (control de continuidad)
│  ├─ environment/Pond.tsx       ESCENARIO estanque (plantas, rayos, partículas, burbujas)
│  ├─ environment/Forest.tsx     ESCENARIO orilla/bosque húmedo (helechos, gotas, mosquitos)
│  ├─ motion/jump.ts             salto: anticipación, despegue, vuelo, contacto, recuperación
│  └─ motion/swim.ts             nado: fase, amplitud y guiñada del cuerpo
└─ entregas/de-huevo-a-sapo/
   ├─ de-huevo-a-sapo-demo-15s-1080x1920.mp4
   └─ revision/                  fotogramas de control
```

Para usar otra especie: copia `species/bufoBufo.ts` con sus propias claves de etapa, y los escenarios y `motion/` que hagan falta. Después cambia la pista `GROWTH` y los planos de `SapoDemo.tsx`. `src/lifecycle` no se toca.

## Dependencias (package.json del estudio)

remotion, @remotion/cli, @remotion/bundler y @remotion/renderer 4.0.545; react y react-dom 18.3.1; typescript 5.6.3.

## Comandos (desde `estudio-animacion/`)

```bash
npm install
# Chromium ya instalado (sin descarga):
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell

# Vista previa interactiva
npx remotion studio src/index.ts            # elegir DeHuevoASapoDemo

# Fotograma suelto / ficha de etapas
npx remotion still src/index.ts DeHuevoASapoDemo out/sapo-f340.png --frame=340
npx remotion still src/index.ts SapoEtapasFicha out/sapo-etapas.png

# Exportar la demo
npx remotion render src/index.ts DeHuevoASapoDemo \
  entregas/de-huevo-a-sapo/de-huevo-a-sapo-demo-15s-1080x1920.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=4

# Verificar
npx remotion ffprobe -v error -count_frames \
  -show_entries stream=width,height,r_frame_rate,nb_read_frames -show_entries format=duration \
  entregas/de-huevo-a-sapo/de-huevo-a-sapo-demo-15s-1080x1920.mp4
```

## Narración (añadida después)

```bash
pip install piper-tts==1.3.0 numpy soundfile
python3 tools/audio/narration_ep17.py --voice /ruta/es_MX-claude-high.onnx   # → public/audio/ep17-de-huevo-a-sapo/
npx remotion ffmpeg -y -i entregas/de-huevo-a-sapo/de-huevo-a-sapo-demo-15s-1080x1920.mp4 \
  -i public/audio/ep17-de-huevo-a-sapo/mezcla.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -t 15 \
  entregas/de-huevo-a-sapo/de-huevo-a-sapo-demo-15s-narrado-1080x1920.mp4
```
El texto y los tiempos de cada frase están en `tools/audio/narration_ep17.py` (`LINES`) y en `narracion-timing.json`.

---

# Documental completo — 180 s (`DeHuevoASapo`)

*DE HUEVO A SAPO: UNA TRANSFORMACIÓN INCREÍBLE* · 1080×1920 · 30 fps · 5.400 fotogramas · siete escenas.

```
src/episodes/ep17-de-huevo-a-sapo/
├─ full/
│  ├─ Documentary.tsx            carcasa del Estudio 2.0: escenas, subtítulos, mezcla de 6 pistas
│  ├─ data/timeline.ts           escenas, pista de crecimiento GROWTH (time-lapse) y eventos EV
│  ├─ data/narration.json        guion locutado (texto, instante, palabras resaltadas)
│  ├─ data/narration-timing.json tiempos MEDIDOS de la voz (los usan subtítulos y ducking)
│  ├─ components/shared.tsx      rótulos de escena y etapa, viñetas, curvas
│  └─ scenes/Scene1…7.tsx, eggs.tsx
├─ character/Toad.tsx            + marcha (pares diagonales), lengua protráctil y mirada
├─ character/Embryo.tsx          + modo `refined` (contorno según la normal del eje)
├─ character/Ant.tsx             presa: hormiga con marcha en trípode
├─ environment/Shallows.tsx      orilla en toma partida (bajo/sobre el agua) con ondas
└─ environment/Forest.tsx        + opciones wide / season / light / fall (por defecto = demo)
```

| Escena | Tiempo | Contenido |
|---|---|---|
| 1 | 0–20 s | gancho de metamorfosis continua → sapo adulto y título → inmersión → huevos y embrión |
| 2 | 20–45 s | puesta, acercamiento, desarrollo embrionario (días), preparación para eclosionar |
| 3 | 45–70 s | eclosión, primeros impulsos, natación entre plantas, macro de la cola |
| 4 | 70–95 s | crecimiento raspando el sedimento (semanas), patas posteriores, anteriores, nueva anatomía |
| 5 | 95–120 s | cuatro patas, reabsorción de la cola (días), aguas someras, salida a la orilla |
| 6 | 120–150 s | sapo joven en la piedra, primeros pasos y saltito, exploración, caza con la lengua |
| 7 | 150–180 s | años condensados (estaciones), el adulto camina, primeros planos, pregunta final |

## Audio (todo local, sin APIs de pago)

```bash
# 1) locución (Piper es_MX) → public/audio/ep17-de-huevo-a-sapo-180/narracion.m4a + tiempos medidos
python3 tools/audio/narration.py --voice /ruta/es_MX-claude-high.onnx \
  --src src/episodes/ep17-de-huevo-a-sapo/full/data/narration.json \
  --timing src/episodes/ep17-de-huevo-a-sapo/full/data/narration-timing.json \
  --out-dir public/audio/ep17-de-huevo-a-sapo-180
# 2) banda sonora y efectos originales (música, ambiente agua/bosque, movimiento, revelación, transiciones)
python3 tools/audio/score_ep17_sapo.py
# 3) subtítulos .srt (mismos bloques que en pantalla)
node scripts/export-srt.mjs src/episodes/ep17-de-huevo-a-sapo/full/data/narration-timing.json \
  entregas/de-huevo-a-sapo/documental-180s/de-huevo-a-sapo-180s.srt 28
```

## Vista previa y render

```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion studio src/index.ts                       # elegir DeHuevoASapo
node scripts/contact-sheet.mjs DeHuevoASapo out/sapo-hoja.png 5,30,55,80,105,130,160 0.3
# borrador rápido (540×960)
node scripts/render-episode.mjs --comp DeHuevoASapo --quality draft --scale 0.5 --seg 30 --out out/de-huevo-a-sapo-borrador.mp4
# final por tramos de 30 s + audio mezclado + normalización −14 LUFS + informe .report.json
node scripts/render-episode.mjs --comp DeHuevoASapo --quality final --scale 1 --seg 30 --crf 20 \
  --out out/de-huevo-a-sapo-180s-final-1080x1920.mp4
```
