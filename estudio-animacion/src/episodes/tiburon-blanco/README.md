# El tiburón blanco: el gran depredador

Episodio de Mundo Insólito para Reels. Dura 180 s, en 1080×1920 vertical, a 30 fps y con 5.400 fotogramas.

Está hecho sobre el motor 2.5D original de `estudio-animacion`, el del documental del pulpo, con la carcasa vertical del Estudio 2.0. No usa Three.js: es SVG y React, con animación determinista por fotograma.

## Archivos

```
tiburon-blanco/
├── Documentary.tsx            # composición EP-TiburonBlanco: 7 escenas, subtítulos y 10 pistas de audio
├── data/                      # script.py, narration.json, narration-timing.json, timeline.ts
├── character/
│   ├── WhiteShark.tsx         # protagonista nuevo:
│   │                          #   columna de 30 puntos; cola con propulsión lateral (escorzo de la caudal);
│   │                          #   contrasombreado irregular, 5 hendiduras branquiales, quilla y cicatrices;
│   │                          #   mandíbula inferior que baja y superior que avanza, con dientes aserrados;
│   │                          #   capas de ampollas de Lorenzini, línea lateral y calor;
│   │                          #   incluye el lobo marino del Cabo
│   └── motion.ts              # natación por trayectorias y salto en cámara lenta (emboscada)
├── components/                # common.tsx (rótulos) · Cards.tsx (tarjetas científicas) · Ficha · Preview
└── scenes/                    # S1_4.tsx · S5_7.tsx
```

Reutiliza sin modificarlos:

- **Del episodio de la orca:** el océano por capas, las salpicaduras, las burbujas, las orcas y las trayectorias.
- **De la carcasa del Estudio 2.0:** los subtítulos y la mezcla con ducking.

## Comandos

```bash
cd estudio-animacion
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx --src src/episodes/tiburon-blanco/data/narration.json \
  --timing src/episodes/tiburon-blanco/data/narration-timing.json --out-dir public/audio/tiburon
python3 tools/audio/score_tiburon.py
npx remotion studio src/index.ts      # EP-TiburonBlanco, TiburonPreview, TiburonFicha
node scripts/render-episode.mjs --comp EP-TiburonBlanco --quality draft --scale 0.5 --out out/tiburon-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-TiburonBlanco --quality final --scale 1 --out out/tiburon-blanco-180s-1080x1920.mp4
node scripts/export-srt.mjs src/episodes/tiburon-blanco/data/narration-timing.json entregas/tiburon/tiburon-blanco.srt 32
```

## Base científica

**Tamaño y anatomía**
- Supera los 6 m y las hembras son más grandes.
- Contrasombreado: lomo gris y vientre blanco.
- Dientes triangulares aserrados en varias filas, que se reemplazan durante toda la vida.
- Al morder, la mandíbula superior se proyecta hacia delante.

**Sentidos**
- Ampollas de Lorenzini (electrorrecepción), línea lateral y olfato.
- Tapetum lucidum en los ojos.

**Endotermia regional**
- Una red de vasos sanguíneos (rete mirabile) funciona como intercambiador de calor a contracorriente y conserva el calor de los músculos.

**Migraciones**
- La hembra «Nicole» viajó de Sudáfrica a Australia y regresó entre 2003 y 2004 (Bonfil *et al.*, 2005, *Science*).
- En el Pacífico Norte hay una zona de mar abierto apodada «White Shark Café» (Jorgensen *et al.*, 2010).

**Orcas**
- En Sudáfrica y California se ha documentado que algunas orcas depredan tiburones blancos, consumiendo sobre todo el hígado.
- Los tiburones abandonan la zona durante meses (Jorgensen *et al.*, 2019, *Scientific Reports*; Engelbrecht *et al.*, 2019).

**Ciclo de vida y conservación**
- Madurez de las hembras hacia los 33 años (Natanson y Skomal, 2015).
- Vida de unos 70 años (Hamady *et al.*, 2014).
- Estado global en la Lista Roja de la UICN: vulnerable (2019).
- Los mordiscos no provocados son raros (International Shark Attack File).

**Criterios de representación**
- Las imágenes son una reconstrucción ilustrada.
- La caza se muestra sin heridas ni sangre, y la presa escapa.
- Las señales eléctricas y las vibraciones están marcadas como visualización.
- Los sonidos de orca son sintéticos.
