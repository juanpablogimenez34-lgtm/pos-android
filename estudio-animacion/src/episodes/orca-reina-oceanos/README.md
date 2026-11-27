# La orca: la reina de los océanos

Episodio de Mundo Insólito sobre la orca (*Orcinus orca*). Dura 180 s, en 1080×1920, a 30 fps y con 5.400 fotogramas.

Está hecho sobre el motor 2.5D original de `estudio-animacion`, el del documental del pulpo, con la carcasa del Estudio 2.0. No usa Three.js ni WebGL: es SVG y React, con animación determinista por fotograma.

## Archivos

```
orca-reina-oceanos/
├── Documentary.tsx           # composición EP-Orca: 7 escenas, fundidos, subtítulos y 10 pistas de audio
├── data/
│   ├── narration.json        # guion: 29 frases con su instante de entrada
│   ├── narration-timing.json # tiempos MEDIDOS de la locución (subtítulos y ducking)
│   └── timeline.ts           # fronteras de las escenas
├── character/
│   ├── Orca.tsx              # personaje: columna de 36 puntos, patrón unido a la piel (coordenadas u, v),
│   │                         # ojo real, espiráculo, mandíbula con dientes, dorsal según edad y sexo,
│   │                         # pectorales independientes, caudal horizontal; variantes macho, hembra y cría
│   └── motion.ts             # natación por trayectorias, fase de la cola integrada y salto en 10 fases
├── environment/
│   ├── Sea.tsx               # océano por capas: cielo, costa o icebergs, rayos, rocas, bosques de algas,
│   │                         # cardúmenes, superficie con olas y ola extra (caza en equipo), témpanos,
│   │                         # salpicaduras, soplo y burbujas
│   └── Critters.tsx          # tiburón blanco (propulsión lateral) y foca de Weddell
├── scenes/
│   ├── S1_2.tsx              # 1 La reina del océano · 2 El nacimiento
│   ├── S3_4.tsx              # 3 Una inteligencia extraordinaria · 4 Una máquina de natación
│   └── S5_7.tsx              # 5 La caza en equipo · 6 El encuentro con el tiburón blanco · 7 La familia del océano
└── components/               # rótulos y tarjetas · Ficha.tsx (control) · Preview.tsx (vista previa por escena)
```

Otros componentes que se reutilizan sin modificarlos:

- `ClickWaves` y `ClickFlash` del episodio del cachalote, para la visualización de clics y ecos.
- La cámara 2.5D y la carcasa `EpisodeShell` del Estudio 2.0, con los subtítulos `Subtitles2`.

## Audio

- **Narración:** voz neuronal Piper `es_MX-claude-high` (`tools/audio/narration.py`).
- **Banda sonora:** `tools/audio/score_orca.py` sintetiza 9 pistas originales en `public/audio/orca/`:
  - música;
  - ambiente submarino;
  - movimiento del agua;
  - olas y salpicaduras;
  - vocalizaciones;
  - ecolocalización;
  - burbujas y soplos;
  - tensión;
  - transiciones.
- **Vocalizaciones:** son sintéticas e ilustrativas, no grabaciones reales de orcas.

## Comandos

```bash
cd estudio-animacion
npm install
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/orca-reina-oceanos/data/narration.json \
  --timing src/episodes/orca-reina-oceanos/data/narration-timing.json --out-dir public/audio/orca
python3 tools/audio/score_orca.py
npx remotion studio src/index.ts                       # EP-Orca, OrcaPreview, OrcaFicha
node scripts/render-episode.mjs --comp EP-Orca --quality draft --scale 0.5 --out out/orca-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Orca --quality final --scale 1 --out out/orca-reina-oceanos-180s-1080x1920.mp4
node scripts/export-srt.mjs src/episodes/orca-reina-oceanos/data/narration-timing.json entregas/orca/orca-reina-oceanos.srt 32
```

## Base científica (sin cifras inventadas)

**Clasificación y respiración**
- La orca es el miembro más grande de la familia de los delfines (Delphinidae).
- Respira aire por un único espiráculo y no tiene branquias.
- La cola es horizontal y se mueve de arriba abajo.

**Crías**
- Nacen bajo el agua y suben a respirar.
- Maman durante muchos meses y nadan en posición de escolta junto a la madre.
- Las zonas claras de las crías tienen un tono anaranjado.

**Aleta dorsal**
- La del macho adulto es alta y triangular; la de la hembra es falcada.
- Fuente: Ford, Ellis y Balcomb, *Killer Whales* (2000).

**Ecolocalización y comunicación**
- Emiten clics que se enfocan en el melón y reciben los ecos por la mandíbula inferior.
- Se comunican con llamadas pulsadas y silbidos.
- Los grupos residentes tienen dialectos que se transmiten culturalmente.
- Fuente: Ford (1991).

**Caza con olas (wave-washing)**
- Lo practican las orcas antárticas de tipo B frente a focas sobre témpanos.
- Fuentes: Visser *et al.* (2008); Pitman y Durban (2012).

**Caza de tiburones blancos**
- Hay casos documentados de orcas que cazan tiburones blancos y consumen sobre todo el hígado, por ejemplo en Sudáfrica y las Farallón.
- Es propio de algunas poblaciones, no de todas.
- Fuentes: Pyle *et al.* (1999); Engelbrecht *et al.* (2019).

Las imágenes son una reconstrucción ilustrada y estilizada. Las ondas sonoras están marcadas como visualización científica.
