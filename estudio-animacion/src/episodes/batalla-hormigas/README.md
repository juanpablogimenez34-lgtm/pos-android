# Batallas de la naturaleza · Hormiga negra vs. hormiga roja: ¿quién ganaría?

Episodio de Mundo Insólito: un solo video de 180 s (5.400 fotogramas), 1080×1920, 30 fps.

- **Composición:** `EP-Hormigas`. La vista previa por escena, sin audio, es `HormigasPreview` (`{"n": 0…6}`); la ficha del rig es `HormigasFicha`.
- **Entrega:** `out/hormiga-negra-vs-hormiga-roja-180s-1080x1920.mp4`; subtítulos y el informe del render en `entregas/hormigas/`.
- **Motor:** el original del pulpo, a través de la carcasa del Estudio 2.0 (`studio2/EpisodeShell`): cámara, subtítulos, mezcla de audio y retención. No hay motor nuevo; lo propio del episodio son los personajes, el mundo y las escenas.

## Especies y escala

| | Hormiga negra | Hormiga roja |
|---|---|---|
| Especie | *Camponotus pennsylvanicus* (carpintera negra) | *Solenopsis invicta* (hormiga de fuego roja) |
| Tamaño en la simulación | 10 mm | 5 mm |
| Antena | 12 segmentos, sin maza | maza de 2 segmentos |
| Cintura | 1 nudo | 2 nudos (pecíolo y pospecíolo) |
| Defensa | mordisco y secreción de ácido fórmico (sin aguijón) | mordisco para sujetarse y aguijón con veneno |

- **Escala fija:** 1 mm = 60 px de mundo (`species.ts → PX_MM`), así que la proporción 2:1 se mantiene en todas las vistas, incluida la superior.
- **Única excepción:** dentro de los nidos en corte (escenas 2 y 3) se reduce la escala del decorado entero para que las galerías quepan en pantalla. En cada escena solo aparece una especie.
- **Variación individual:** obreras mayores y menores, y reinas (`Brood.tsx`) con un mesosoma y un gáster mayores.

## Árbol

```
batalla-hormigas/
├── Documentary.tsx        # EpisodeShell + 7 escenas + mezcla (6 pistas de la carcasa + 4 extra)
├── ant/
│   ├── species.ts         # morfología de ambas especies (cabeza, ojos, mandíbulas, antenas, mesosoma, cintura, gáster, aguijón, patas)
│   ├── AntSide.tsx        # RIG LATERAL: 6 patas × (coxa, trocánter, fémur, tibia, tarso)
│   ├── AntTop.tsx         # rig visto desde arriba: mismas patas con IK en el plano y nivel de detalle
│   ├── motion.ts          # trayectorias de protagonistas y colonias (rastros, frenado, retirada)
│   └── Brood.tsx          # reinas, huevos, larvas, pupas (capullo en Camponotus, desnudas en Solenopsis)
├── world/Macro.tsx        # microcosmos lateral, nido en madera, montículo con túneles, terreno visto desde arriba
├── scenes/
│   ├── Duel.tsx           # escenas 1 y 5 (y el inicio de la 6): duelo lateral, cámara lenta, retirada
│   ├── Nests.tsx          # escenas 2 y 3: nidos, tarjetas de anatomía, comunicación
│   ├── Colony.tsx         # escenas 4, 6 y 7: comparación, colonias, pantalla dividida y cierre
│   └── ui.tsx             # marca, «SIMULACIÓN ILUSTRADA», palabras clave
├── components/            # common.tsx (rótulos), Ficha.tsx, Preview.tsx
└── data/                  # script.py (guion), narration.json, narration-timing.json, scenes.json, timeline.ts
```

## Rig y marcha

- **Seis patas articuladas:** cada una tiene coxa, trocánter, fémur, tibia y tarso. La rodilla se resuelve con IK de dos huesos, y el tarso se apoya con su propio ángulo.
- **Marcha trípode alterna:**
  - grupo A: L1, R2, L3;
  - grupo B: R1, L2, R3;
  - factor de apoyo 0,56.
- **Sin deslizamiento:** la fase sale de la distancia recorrida integrada, no del tiempo. Durante el apoyo el pie retrocede exactamente lo que avanza el cuerpo, así que no patina.
- **Terreno:** los pies se ajustan a la altura del suelo, incluida la piedra-montaña. El cuerpo toma la altura media bajo las patas y se inclina según la pendiente.
- **Otras partes animadas:**
  - antenas con exploración y orientación hacia el objetivo;
  - mandíbulas;
  - giro de la cabeza;
  - flexión del gáster;
  - aguijón con gota de veneno, solo en la roja;
  - pulverización de ácido fórmico, solo en la negra;
  - postura defensiva.
- **Orientación continua con histéresis**, como en la batalla orca–tiburón: en los cambios de sentido el cuerpo se escorza en lugar de voltearse de golpe.
- **Estados** (`motion.ts`): IDLE, WALKING, RUNNING, EXPLORING, CLIMBING, ANTENNA_SCANNING, FOOD_DETECTED, FOOD_CARRYING, COMMUNICATING, TARGET_DETECTED, APPROACHING, DEFENDING, BITING, STINGING, DODGING, RETREATING, RECRUITING, COLONY_MOVEMENT.
  - Salen de las curvas de movimiento y de los parámetros de pose (velocidad, `stance`, `mand`, `sting`, `spray`, `scan`, `antTarget`, `carry`).
  - No hay una máquina de estados aparte.
- **Colonias:** cada hormiga tiene su propio rastro, salida, velocidad, tamaño y semilla de marcha, y frena progresivamente al llegar.
  - Los rastros son casi radiales y vienen del lado de su nido, de modo que no se cruzan.
  - Las negras dan media vuelta suave antes de retirarse.
- **Nivel de detalle:** las hormigas lejanas o pequeñas en pantalla omiten pelos, facetas y segmentos de la antena. Los ciclos de marcha y los decorados se reutilizan (granos y musgo memorizados por bloque).

## Escenas

| Tramo | Escena | Contenido |
|---|---|---|
| 0–20 s | La batalla comienza | patas a ras de suelo, mandíbulas, la roja cruza la piedra, aproximación al alimento, título y «¿QUIÉN GANARÍA? ELIGE TU FAVORITA» |
| 20–45 s | El poder de la hormiga negra | nido en madera, reina con capullos, tarjeta de músculos mandibulares, «EXCAVA MADERA, NO LA COME» con serrín expulsado, obrera mayor y menor, defensa con ácido fórmico |
| 45–70 s | El arma de la hormiga roja | montículo y túneles, tarjeta del aguijón (glándula, reservorio, aguijón; «VENENO, NO ES FUEGO»), antena con maza y cintura de dos segmentos, comunicación química, cría (huevos, larvas, pupas desnudas) y reina, respuesta en grupo ante una amenaza |
| 70–95 s | Fuerza contra veneno | misma escala con regla de 0–10 mm, aguijón, señales químicas, tabla cualitativa sin estadísticas |
| 95–120 s | El enfrentamiento individual | detección, posturas defensivas, cambio de dirección, contacto breve en cámara lenta (0,45×), retirada de la roja por la piedra, «RESULTADO INDIVIDUAL: VENTAJA DE LA HORMIGA NEGRA» |
| 120–150 s | Cuando llega la colonia | rastro químico, vista superior, 42 rojas frente a 7 negras, «ESCENARIO HIPOTÉTICO · EL NÚMERO CAMBIA LA BATALLA», retirada de las negras («NO SIEMPRE OCURRE ASÍ») |
| 150–180 s | ¿Quién es el verdadero vencedor? | pantalla dividida (individual / colectivo), las colonias regresan a casa, «NO EXISTE UN VENCEDOR UNIVERSAL», próxima batalla (escorpión vs. tarántula, o avispa vs. mantis religiosa), cierre «¿DE QUÉ EQUIPO ERES? EQUIPO NEGRA VS. EQUIPO ROJA · MUNDO INSÓLITO · BATALLAS DE LA NATURALEZA» |

- No hay barras de vida, sangre ni heridas.
- El veneno nunca se dibuja como fuego.
- Las escenas 5 a 7 llevan la etiqueta «SIMULACIÓN ILUSTRADA».

## Audio

- **Narración:** español latinoamericano, voz neuronal local Piper `es_MX-claude-high`, generada con `tools/audio/narration.py`. Son 28 frases y 373 palabras, con unos 151 s de voz.
- **Banda sonora:** `tools/audio/score_hormigas.py` es síntesis propia, sin muestras de terceros. La música evoluciona así: misterio → descubrimiento → tensión → acción → final majestuoso.
- **Otras pistas:**
  - ambiente natural;
  - viento y hojas;
  - insectos (grillos y zumbidos amplificados como recurso cinematográfico, sin rugidos);
  - pasos sutiles;
  - tierra, serrín y túneles;
  - movimiento y contacto;
  - tensión;
  - transiciones.
- La mezcla final se normaliza a −14 LUFS en `render-episode.mjs`.

## Precisión científica y fuentes

Lo que el guion afirma, con las fuentes consultadas:

- **Carpintera negra:**
  - las obreras mayores son mucho más grandes que las menores;
  - no tiene aguijón; se defiende mordiendo y rociando ácido fórmico;
  - excava madera blanda o húmeda y expulsa el serrín; no se alimenta de ella como las termitas.
  - Fuentes: [Animal Diversity Web](https://animaldiversity.org/accounts/Camponotus_pennsylvanicus/), [Mississippi Entomological Museum](https://mem.org.msstate.edu/Researchtaxapages/Formicidaepages/genericpages/Camponotus_pennsylvanicus.html), [Texas A&M Urban Entomology](https://urbanentomology.tamu.edu/urban-pests/ants/carpenter/), [Penn State Extension](https://extension.psu.edu/carpenter-ants), [UMD Extension](https://extension.umd.edu/resource/carpenter-ants), [UGA Extension](https://fieldreport.caes.uga.edu/publications/B1225/biology-and-management-of-carpenter-ants/).
- **Hormiga de fuego roja:**
  - se sujeta con las mandíbulas y pica con un aguijón que inyecta veneno;
  - tiene antenas con maza de 2 segmentos y una cintura de 2 segmentos;
  - recluta mediante rastros químicos y defiende en grupo;
  - las colonias pueden reunir decenas de miles de obreras.
  - Fuentes: [UF/IFAS Featured Creatures](https://entnemdept.ufl.edu/projex/gallery/dl/Beneficial_Arthropods_Parasitoids/TEXT/HYM_Red_imported_fire_ant_Solenopsis_invicta.html), [Utah State Extension](https://extension.usu.edu/planthealth/research/imported-fire-ants.pdf), [Nevada Dept. of Agriculture](https://agri.nv.gov/uploadedFiles/agrinvgov/Content/Plant/Entomology/Imported%20Fire%20Ant%20Factsheet.pdf), [Annals of the ESA 103(4)](https://bioone.org/journals/annals-of-the-entomological-society-of-america/volume-103/issue-4/AN09161/Worker-Size-and-Nest-Defense-in-Solenopsis-invicta-Hymenoptera/10.1603/AN09161.full).

Lo que es simulación:

- El duelo uno contra uno y el escenario colectivo son **simulaciones ilustradas**, no comportamientos documentados entre estas dos especies. El video lo dice en pantalla y en la narración: «un encuentro real podría terminar de otra manera»; «no existe un vencedor universal».
- Los 10 mm y 5 mm son los tamaños elegidos para esta simulación, dentro de los rangos publicados.
- Ni la tabla comparativa ni ninguna otra parte del video usa porcentajes ni estadísticas inventadas.

## Comandos

```bash
python3 src/episodes/batalla-hormigas/data/script.py            # guion → narration.json
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/batalla-hormigas/data/narration.json \
  --timing src/episodes/batalla-hormigas/data/narration-timing.json --out-dir public/audio/hormigas
(cd tools/audio && python3 score_hormigas.py)                      # música y efectos
PROPS='{"n":4}' node scripts/contact-sheet.mjs HormigasPreview out/s5.png "96,103,108.5,114" 0.3 draft
node scripts/render-episode.mjs --comp EP-Hormigas --frames 5400 --quality final --scale 1 --seg 30 \
  --out out/hormiga-negra-vs-hormiga-roja-180s-1080x1920.mp4
node scripts/export-srt.mjs src/episodes/batalla-hormigas/data/narration-timing.json \
  entregas/hormigas/hormiga-negra-vs-hormiga-roja-180s-1080x1920.srt 32
```
