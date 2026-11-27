# El camaleón: el maestro de la transformación

Episodio de Mundo Insólito sobre el camaleón pantera (*Furcifer pardalis*): 180 s, 1080×1920, 30 fps y 5.400 fotogramas.

Se construyó sobre el motor 2.5D original de `estudio-animacion`, el del documental del pulpo, con la carcasa del Estudio 2.0. No usa Three.js ni WebGL: es SVG y React, con animación determinista por fotograma.

## Archivos

```
camaleon-maestro-transformacion/
├── Documentary.tsx            # composición EP-Camaleon: 7 escenas, fundidos, subtítulos y 10 pistas de audio
├── data/
│   ├── narration.json         # guion: 29 frases con su instante de entrada
│   ├── narration-timing.json  # tiempos MEDIDOS sobre la locución (subtítulos y ducking)
│   └── timeline.ts            # fronteras de las 7 escenas
├── character/
│   ├── Chameleon.tsx          # personaje: tronco, cresta, casco, mandíbula, lengua, torretas oculares, patas, cola
│   ├── motion.ts              # marcha con apoyos fijos, vaivén, mirada independiente y ataque en 8 fases
│   └── skin.ts                # transformación cromática por regiones con paletas naturales de la especie
├── environment/
│   ├── Forest.tsx             # bosque de Madagascar: dosel, rayos de luz, troncos, lianas, Ravenala, helechos, hojas, rama
│   └── Critters.tsx           # mosca, grillo, mariposa y ave (cúa azul estilizada)
├── scenes/
│   ├── S1_2.tsx               # 1 El misterio · 2 El nacimiento
│   ├── S3_4.tsx               # 3 Los ojos independientes · 4 La lengua relámpago
│   ├── S5_7.tsx               # 5 El secreto de sus colores · 6 El arte de sobrevivir · 7 El maestro de la transformación
│   └── Science.tsx            # esquemas: campo visual, lengua balística, capas de la piel e iridóforos
└── components/
    ├── common.tsx             # escenario por capas (parallax), rótulos
    ├── Ficha.tsx              # ficha de control interna (paletas, marcha, lengua)
    └── Preview.tsx            # vista previa por escena (control de calidad)
```

Audio: `tools/audio/score_camaleon.py` sintetiza 9 pistas originales en `public/audio/camaleon/`: música, ambiente de selva, hojas y viento, insectos, aves, movimiento, lengua, tensión y transiciones. La voz sale de `tools/audio/narration.py`, con la voz neuronal Piper `es_MX-claude-high`.

## Comandos

```bash
cd estudio-animacion
npm install                                    # dependencias (ya instaladas en este entorno)

# Locución (Piper) y tiempos medidos
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/camaleon-maestro-transformacion/data/narration.json \
  --timing src/episodes/camaleon-maestro-transformacion/data/narration-timing.json \
  --out-dir public/audio/camaleon
# Banda sonora
python3 tools/audio/score_camaleon.py

# Previsualización interactiva
npx remotion studio src/index.ts               # composiciones EP-Camaleon, CamaleonPreview, CamaleonFicha

# Borrador (540×960) y final (1080×1920) por tramos, con audio normalizado a −14 LUFS
node scripts/render-episode.mjs --comp EP-Camaleon --quality draft --scale 0.5 --out out/camaleon-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Camaleon --quality final --scale 1 --out out/camaleon-maestro-transformacion-180s-1080x1920.mp4

# Subtítulos .srt
node scripts/export-srt.mjs src/episodes/camaleon-maestro-transformacion/data/narration-timing.json entregas/camaleon/camaleon.srt 32
```

## Base científica (sin cifras inventadas)

- *Furcifer pardalis* es endémico de Madagascar. Las hembras entierran la puesta en un túnel que excavan en el suelo, la incubación dura meses y las crías no reciben cuidado parental.
  - Fuente: Ferguson, Murphy *et al.*; Glaw y Vences (2007), *A Field Guide to the Amphibians and Reptiles of Madagascar*.
- Los ojos están en torretas cónicas cubiertas de escamas, con una pequeña abertura para la pupila, y se mueven de forma ampliamente independiente. Al atacar convergen sobre la presa, y el enfoque (acomodación) les sirve para estimar la distancia.
  - Fuentes: Ott y Schaeffel (1995); Harkness (1977).
- La lengua es balística. El músculo acelerador se contrae alrededor del proceso entogloso del hioides y las fundas de colágeno almacenan energía elástica que se libera de golpe, como una catapulta. Puede superar la longitud del cuerpo.
  - Fuentes: de Groot y van Leeuwen (2004); Anderson y Deban (2010).
- La punta de la lengua tiene un moco muy viscoso.
  - Fuente: Brau *et al.* (2016).
- El cambio de color del camaleón pantera es estructural: en los iridóforos, una red de nanocristales de guanina cambia su separación. Relajado refleja azul, que junto al pigmento amarillo se ve verde; excitado refleja tonos largos (amarillo, naranja, rojo). Hay una capa profunda de iridóforos. Sirve para la comunicación, responde a la temperatura y refleja el estado fisiológico.
  - Fuente: Teyssier *et al.* (2015), *Nature Communications* 6:6368.
- Los dedos están fusionados en dos grupos opuestos (pinza zigodáctila) y la cola es prensil. Ante un depredador, el camaleón se desplaza al lado opuesto de la rama. El vaivén al caminar podría imitar hojas movidas por el viento; es una hipótesis, y la narración la presenta como tal.

Lo que se muestra en pantalla es una reconstrucción ilustrada y estilizada, no imágenes reales.
