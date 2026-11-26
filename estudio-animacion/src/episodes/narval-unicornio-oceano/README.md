# El narval: el unicornio del océano

Episodio de Mundo Insólito sobre el narval (*Monodon monoceros*). Dura 180 s, en 1080×1920, a 30 fps y con 5.400 fotogramas.

Está hecho sobre el motor 2.5D original de `estudio-animacion`, el del documental del pulpo, con la carcasa del Estudio 2.0. No usa Three.js ni WebGL: es SVG y React, con animación determinista por fotograma. El episodio es independiente y no modifica los anteriores: reutiliza sus componentes por importación.

## Archivos

```
narval-unicornio-oceano/
├── Documentary.tsx           # composición EP-Narval: 7 escenas, fundidos, subtítulos y 12 pistas de audio
├── data/
│   ├── narration.json        # guion: 29 frases con su instante de entrada
│   ├── narration-timing.json # tiempos MEDIDOS de la locución (subtítulos y ducking)
│   └── timeline.ts           # fronteras de las escenas
├── character/
│   ├── Narwhal.tsx           # vista lateral: columna de 36 puntos con onda VERTICAL, manchas unidas a la piel
│   │                         # (coordenadas u, v) que se deforman con el cuerpo, sin aleta dorsal (cresta baja),
│   │                         # mandíbula articulada, ojo con mirada, espiráculo que se abre, pectorales
│   │                         # independientes, caudal horizontal; cría, juvenil, hembra y macho; colmillo
│   │                         # (canino superior izquierdo) rígido, cónico, con estrías helicoidales, marfil,
│   │                         # brillo y escorzo al girar la cabeza
│   └── motion.ts             # natación por trayectorias, estados y CAZA CON EL COLMILLO en 10 fases
├── environment/
│   ├── Aerial.tsx            # vista aérea tipo dron: mar turquesa, cáusticas, témpanos, ondas, bacalaos
│   │                         # y el narval visto desde arriba (colmillo a la izquierda del hocico)
│   ├── Critters.tsx          # bacalao ártico (se aturde y gira, sin heridas), fletán negro, calamar
│   └── Ice.tsx               # plataforma de hielo con borde emergido y luz que la atraviesa; lecho marino
├── scenes/
│   ├── strike.tsx            # geometría de la caza en vista aérea y en vista lateral (cámara lenta)
│   ├── S1_2.tsx              # 1 El unicornio del océano · 2 El nacimiento
│   ├── S3_4.tsx              # 3 El colmillo · 4 La caza con el colmillo
│   └── S5_7.tsx              # 5 Bajo el hielo · 6 La vida entre el hielo · 7 La familia del Ártico
└── components/               # rótulos y tarjetas · Ficha.tsx (control) · Preview.tsx (vista previa por escena)
```

Componentes reutilizados sin modificarlos:

- Del episodio de la orca: el océano por capas (`Sea`, témpanos, icebergs, soplos, burbujas), la orca de la escena 6 y las trayectorias (`pathAt`, `phaseOf`).
- Del episodio del cachalote: `ClickWaves` y `ClickFlash`, para la visualización de clics y ecos.
- La cámara 2.5D y la carcasa `EpisodeShell` del Estudio 2.0, con los subtítulos `Subtitles2`.

## La caza con el colmillo (10 fases)

1. Detección.
2. Aproximación.
3. Seguimiento.
4. Ajuste de postura.
5. Movimiento lateral de la cabeza.
6. Contacto del colmillo.
7. Reacción del pez (aturdido: deja de nadar y gira).
8. Reorientación.
9. Acercamiento a la boca.
10. Captura por succión.

Las fases 5 a 10 van en cámara lenta. El colmillo golpea de lado y nunca atraviesa al pez: no se usa como lanza. No hay sangre ni heridas. La captura se muestra siempre: el pez no aparece sin más dentro de la boca. Se ve dos veces desde arriba (escenas 1 y 4) y una vez bajo el agua (escena 4).

## Audio

- **Narración:** voz neuronal Piper `es_MX-claude-high` (`tools/audio/narration.py`).
- **Banda sonora:** `tools/audio/score_narval.py` sintetiza 11 pistas originales en `public/audio/narval/`:
  - música;
  - ambiente submarino;
  - océano y olas;
  - salpicaduras;
  - hielo;
  - movimiento del agua;
  - vocalizaciones;
  - ecolocalización;
  - burbujas y soplos;
  - tensión;
  - transiciones.
- **Vocalizaciones y clics:** son sintéticos e ilustrativos, no grabaciones reales de narvales.

## Comandos

```bash
cd estudio-animacion
npm install
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/narval-unicornio-oceano/data/narration.json \
  --timing src/episodes/narval-unicornio-oceano/data/narration-timing.json --out-dir public/audio/narval
python3 tools/audio/score_narval.py
npx remotion studio src/index.ts                       # EP-Narval, NarvalPreview, NarvalFicha
node scripts/render-episode.mjs --comp EP-Narval --quality draft --scale 0.5 --out out/narval-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Narval --quality final --scale 1 --out out/narval-unicornio-oceano-180s-1080x1920.mp4
node scripts/export-srt.mjs src/episodes/narval-unicornio-oceano/data/narration-timing.json entregas/narval/narval-unicornio-oceano.srt 32
PROPS='{"n":3}' node scripts/contact-sheet.mjs NarvalPreview out/hoja.png 71,80,88,94 0.25 draft
```

## Base científica (sin cifras inventadas)

**El colmillo**
- Es un diente: el canino superior izquierdo, que atraviesa el labio y crece hacia delante en espiral levógira.
- El derecho suele quedar dentro del hueso.
- La mayoría de los machos tienen colmillo y la mayoría de las hembras no; hay excepciones.
- Puede superar los 2 m.
- Fuente: Nweeia *et al.* (2012), *Anatomical Record*.

**Estructura y función sensorial**
- Tiene una capa externa de cemento y una dentina con millones de túbulos que comunican la superficie con la pulpa inervada.
- Se ha propuesto que detecta cambios en el agua, como la salinidad. Es una hipótesis en estudio, no un hecho establecido.
- Fuente: Nweeia *et al.* (2014), *Anatomical Record*.

**Uso social**
- Los machos se frotan o cruzan los colmillos en superficie (*tusking*).
- Fuente: Silverman y Dunbar (1980), *Nature*.

**Golpes a peces**
- En 2017, imágenes de dron de WWF-Canadá y Fisheries and Oceans Canada en Nunavut mostraron narvales golpeando bacalaos árticos con el colmillo, lo que parece aturdirlos antes de comerlos.
- No es un comportamiento generalizado: el documental lo presenta como reconstrucción animada.

**Buceo y dieta**
- Son grandes buceadores y se alimentan de fletán negro, bacalaos y calamares.
- Fuentes: Laidre *et al.* (2003); Laidre y Heide-Jørgensen (2005).
- Usan la ecolocalización. Fuentes: Miller *et al.* (1995); Koblitz *et al.* (2016).
- Respiran aire por un espiráculo, no tienen branquias y usan grietas y aberturas del hielo.

**Orcas y hielo marino**
- En presencia de orcas, los narvales se acercan a la costa o al hielo. Fuente: Breed *et al.* (2017), *PNAS*.
- Son de los mamíferos árticos más sensibles a los cambios del hielo marino. Fuente: Laidre *et al.* (2008), *Ecological Applications*.

**Coloración**
- Las crías nacen gris azulado, se oscurecen y con la edad se vuelven moteadas.
- No tienen aleta dorsal, solo una cresta baja.

Las imágenes son una reconstrucción ilustrada y estilizada:

- La vista aérea imita un dron, pero no es una grabación real.
- Las ondas sonoras están marcadas como visualización científica.
- El documental no indica profundidades concretas.
