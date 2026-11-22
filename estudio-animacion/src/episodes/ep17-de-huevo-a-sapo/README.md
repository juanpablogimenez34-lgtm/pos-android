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
