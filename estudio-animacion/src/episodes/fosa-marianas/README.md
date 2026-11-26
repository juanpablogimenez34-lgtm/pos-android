# La fosa de las Marianas: ¿qué vive a 11.000 metros bajo el mar?

Documental especial de Mundo Insólito. Dura 600 s, en 1920×1080 horizontal (16:9), a 30 fps y con 18.000 fotogramas.

Está hecho sobre el motor 2.5D original del documental del pulpo (`engine/camera`: `CameraProvider`, `ParallaxLayer`, parallax real por capas), que es independiente del tamaño del cuadro. No usa Three.js ni WebGL: es SVG y React, con Canvas 2D para la nieve marina y animación determinista por fotograma. El episodio es independiente y reutiliza componentes de otros episodios solo por importación, sin modificarlos.

## Árbol de carpetas

```
fosa-marianas/
├── Documentary.tsx            # composición EP-Fosa: 10 secuencias, HUD, subtítulos, 13 pistas de audio
├── data/
│   ├── script.py              # generador del guion (63 frases, 1.236 palabras)
│   ├── narration.json         # guion con instantes de entrada
│   ├── narration-timing.json  # tiempos MEDIDOS de la locución (subtítulos y ducking)
│   ├── depth.ts               # SISTEMA DE DESCENSO: profundidad(t), zonas, presión y temperatura aprox.
│   └── timeline.ts            # 10 secuencias de 60 s
├── components/
│   ├── HShell.tsx             # carcasa horizontal: capas, oscuridad, nieve marina, fundidos sin negro
│   ├── DiagramsA.tsx          # Everest, mapa, absorción de la luz, bioluminiscencia, tamaños, nieve marina
│   ├── DiagramsB.tsx          # presión, subducción, xenofióforos, microorganismos, pez caracol,
│   │                          # expediciones, columna oceánica completa
│   ├── Ficha.tsx              # ficha de personajes (control)
│   └── Preview.tsx            # vista previa sin audio
├── hud/HUD.tsx                # contador de profundidad (cinta de 100 m, columna con zonas), presión y
│                              # temperatura, fichas de especie, capítulos y etiquetas
├── environment/Ocean.tsx      # agua por profundidad, rayos de sol, superficie con olas, vida lejana,
│                              # paredes de la fosa con parallax, lecho, nubes de sedimento, focos
├── characters/
│   ├── FishRig.tsx            # SISTEMA DE PECES: flexión corporal, aletas con desfase y curvatura,
│   │                          # mirada, mandíbula, fotóforos
│   ├── Fishes.tsx             # tiburón, atún, pez linterna, pez de cabeza transparente, pez dragón,
│   │                          # pez caracol, presa pequeña
│   ├── Dolphin.tsx            # delfín tornillo (propulsión vertical)
│   ├── Creatures.tsx          # banco de peces, medusa corona, pez pelícano, pulpo dumbo,
│   │                          # pepino de mar, anfípodo hadal
│   └── Submersible.tsx        # sumergible científico (diseño original)
└── scenes/                    # common.tsx · S1_2 · S3_4 · S5_7 · S8_10 · index.ts
```

Componentes reutilizados sin modificarlos:

- **Rape abisal:** `creatures/anglerfish` (*Linophryne arborifera*).
- **Calamar gigante:** episodio 22. Es la técnica de brazos del motor del pulpo.
- **Cachalote y ondas de ecolocalización:** episodio 23.
- **Nieve marina y oscuridad con luz:** `environments/deepsea`.
- **Subtítulos y mezcla de audio:** `studio2/Subtitles2` y `engine/AudioTracks`.

## Sistemas

- **Aletas:** cada aleta tiene sus propios puntos de control, un desfase temporal, ondulación o giro en la base, extensión y plegado.
- **Flexión corporal:** el cuerpo es una columna de 28 a 30 puntos.
- **Propulsión:** la cola de los peces bate de lado (vista de perfil, con escorzo de la caudal); los cetáceos baten la cola de arriba abajo.
- **Tentáculos:**
  - el calamar gigante tiene 8 brazos y 2 tentáculos;
  - la medusa tiene 20 tentáculos y uno largo;
  - el pulpo dumbo tiene 8 brazos con cirros y una membrana entre ellos.
- **Bioluminiscencia:** es una capa luminosa dibujada por encima de la oscuridad e incluye:
  - fotóforos;
  - el señuelo del rape;
  - la barbilla del pez dragón;
  - la "rueda" de destellos de la medusa corona;
  - el órgano caudal del pez pelícano.
- **Banco de peces:** cada pez sigue su propia órbita con ruido y huye del depredador.
- **Cámara:** cámara 2.5D del motor con planos generales, primeros planos, seguimientos y alejamiento final.
- **Iluminación:**
  - el color del agua y los rayos de sol cambian con la profundidad (no hay rayos por debajo de unos 1.000 m);
  - la oscuridad tiene un "agujero" de luz donde apuntan los focos del sumergible.
- **Descenso:** curva monótona de 0 a 10.935 m. El contador solo aumenta.
- **Nieve marina:** partículas en Canvas cuya densidad depende de la profundidad y que se desplazan con el descenso.
- **Estados:** RESTING, SWIMMING, EXPLORING, DIVING, HUNTING, FEEDING, ESCAPING, CRAWLING, BIOLUMINESCENCE, FLOATING, DESCENDING, SCANNING, BOTTOM_LANDING y ASCENDING. Se expresan con los parámetros de pose (velocidad, apertura de la mandíbula, brillo, empuje, escaneo, aterrizaje) y se interpolan suavemente.

## Audio

- **Narración:** voz neuronal Piper `es_MX-claude-high` (`tools/audio/narration.py`). Son 493 s de voz en 600 s.
- **Banda sonora:** `tools/audio/score_fosa.py` sintetiza 12 pistas en `public/audio/fosa/`:
  - música (cambia con la profundidad);
  - ambiente submarino;
  - océano y olas;
  - burbujas y salpicaduras;
  - cetáceos;
  - ecolocalización;
  - sumergible;
  - propulsores;
  - instrumentos;
  - movimiento del agua;
  - tensión;
  - transiciones.
- **Sonidos de animales:** los cetáceos y los clics son sintéticos e ilustrativos, no grabaciones reales.

## Comandos

```bash
cd estudio-animacion
npm install
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/fosa-marianas/data/narration.json \
  --timing src/episodes/fosa-marianas/data/narration-timing.json --out-dir public/audio/fosa
python3 tools/audio/score_fosa.py
npx remotion studio src/index.ts        # EP-Fosa, FosaPreview, FosaFicha
node scripts/render-episode.mjs --comp EP-Fosa --quality draft --scale 0.5 --seg 30 --out out/fosa-borrador-960x540.mp4
node scripts/render-episode.mjs --comp EP-Fosa --quality final --scale 1 --seg 30 --out out/fosa-marianas-viaje-al-abismo-600s-1920x1080.mp4
node scripts/export-srt.mjs src/episodes/fosa-marianas/data/narration-timing.json entregas/fosa/fosa-marianas-viaje-al-abismo.srt 52
```

## Base científica y fuentes

**El abismo Challenger**
- 10.935 ± 6 m (Greenaway *et al.*, 2021, NOAA).
- Otras mediciones: 10.924 ± 15 m (2019), 10.925 ± 4 m (2020) y 10.984 m (cartografía multihaz de 2010).
- Posición aproximada: 11° 22′ N, 142° 35′ E.
- La fosa mide unos 2.550 km de largo y unos 69 km de ancho de media (NOAA).

**Presión y temperatura**
- Presión: se aproxima como 1 atm más por cada 10 m.
- Temperatura: perfil típico aproximado del Pacífico occidental. Cerca del fondo hadal ronda los 2,4–2,5 °C por compresión adiabática.

**Especies y rangos de profundidad**

| Especie | Rango y datos | Fuentes |
|---|---|---|
| Pez de cabeza transparente (*Macropinna microstoma*) | 600–800 m (616–770 m). Pacífico Norte: se muestra como ejemplo, no documentado en la fosa | MBARI Deep-Sea Guide, FishBase |
| Medusa corona (*Atolla wyvillei*) | Rango publicado amplio, hasta unos 5.000 m. Bioluminiscente | MBARI, SeaLifeBase |
| Rape abisal (*Linophryne arborifera*) | 200–1.000 m | FishBase |
| Pez dragón negro del Pacífico (*Idiacanthus antrostomus*) | Registros hasta unos 2.161 m; migra hacia la superficie de noche | FishBase, Zenodo/Plazi |
| Calamar gigante (*Architeuthis dux*) | Fotografiado vivo por primera vez a unos 900 m en 2004, cerca de las islas Ogasawara. Ojos de hasta unos 27 cm | Kubodera y Mori, 2005; Nilsson *et al.*, 2012 |
| Cachalote | Habitualmente 400–1.200 m; registros de unos 2.000 m (2.035 m) | Watwood *et al.*, 2006, y compilaciones |
| Pez pelícano (*Eurypharynx pelecanoides*) | 500–3.000 m. Dato de 7.625 m discutido | MBARI, Australian Museum |
| Pulpo dumbo (*Grimpoteuthis*) | Observado a 6.957 m en la fosa de Java | Jamieson y Vecchione, 2020 |
| Pepino de mar (*Psychropotes longicauda*) | Típico 2.000–5.000 m | Museums Victoria, SeaLifeBase |
| Xenofióforos | Foraminíferos unicelulares gigantes, también registrados en la fosa de las Marianas | — |
| Anfípodo *Hirondellea gigas* | Capturado a 10.897 m en el abismo Challenger. Celulasa que digiere restos vegetales | Kobayashi *et al.*, 2012, *PLoS ONE* |
| Pez caracol de las Marianas (*Pseudoliparis swirei*) | Capturado a 6.898–7.966 m (Gerringer *et al.*, 2017, *Zootaxa*); filmado a unos 8.178 m | Gerringer *et al.*, 2017 |

- **Récord de profundidad de un pez:** otro pez caracol (*Pseudoliparis* sp.), filmado a unos 8.336 m en la fosa de Izu-Ogasawara en 2022 (Jamieson *et al.*, Universidad de Australia Occidental).
- **Adaptaciones a la presión:** óxido de trimetilamina como estabilizador de proteínas (Yancey *et al.*, 2014).
- **Microorganismos:**
  - piezófilos con membranas ricas en ácidos grasos insaturados;
  - actividad microbiana elevada en los sedimentos del abismo Challenger (Glud *et al.*, 2013, *Nature Geoscience*).

**Expediciones humanas**
- Batiscafo Trieste: Jacques Piccard y Don Walsh, 23 de enero de 1960.
- Deepsea Challenger: James Cameron, 26 de marzo de 2012.
- Desde 2019, varias inmersiones tripuladas con sumergibles modernos.

**Criterios de representación**
- El descenso es una representación narrativa acelerada.
- El calamar gigante, el cachalote, el rape, el pez dragón, el pez pelícano y el pez de cabeza transparente se identifican como reconstrucciones o ejemplos de zonas equivalentes, con su rango documentado en pantalla.
- No se muestran peces en el fondo del abismo Challenger.
