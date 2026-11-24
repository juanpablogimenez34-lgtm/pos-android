# EP24 · El tiburón que puede vivir más de 400 años

180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas × 15 s.

Composiciones:
- `EP-TiburonGroenlandia`: el documental.
- `TiburonGroenlandiaFicha`: ficha de crecimiento y vistas.

## Estructura

### `character/GreenlandShark.tsx`: rig del tiburón

- **Piezas.** Cabeza, mandíbula ventral, 5 branquias que pulsan, ojo pequeño, espiráculo, pectorales, 2 dorsales pequeñas, pélvica, sin aleta anal, pedúnculo y caudal heterocerca.
- **Natación lateral.** La onda crece hacia la cola.
  - En vista lateral se lee por el escorzo, el paralaje 3/4 y la anchura aparente de la caudal.
  - Vista superior (`view: 'top'`).
- **Crecimiento.** `age` va de 0 (recién nacido) a 1 (muy longevo).
- **Copépodo ocular** opcional.

### `components/common.tsx`: estados y piezas compartidas

- **Los 13 estados.** NEWBORN_SWIM, JUVENILE_EXPLORATION, SLOW_SWIM, DEEP_DESCENT, SEABED_EXPLORATION, FOOD_DETECTION, PREY_APPROACH, FEEDING, TURNING, UNDER_ICE_SWIM, SCIENTIFIC_REVEAL, AGE_TRANSITION y FINAL_RETREAT.
- **Fase integrada.** Sin saltos al cambiar de estado.
- **Mezcla suave.** Dura 1 s.

### `environment/`: escenarios

- **`World.tsx`.** Témpanos, icebergs, cara inferior del hielo, fondo marino (rocas, sedimento, anémonas, esponjas, ofiuras), peces de aguas frías y restos.
- **`Ships.tsx`.** Barco de madera del s. XVII, velero del XVIII, vapor de paletas del XIX, pesquero del XX y buque científico. Todos animados: oleaje, velas, humo y estela.
- **`Lab.tsx`.** Laboratorio ilustrado, diagrama del cristalino, gráfico de 392 ± 120 y barra de madurez (~150 años).

### Reutilizado sin modificar

- `SurfaceWorld`, `DeepOcean` y `OceanFront` (EP23).
- `OceanBack` (EP22).
- Rótulos del EP18 y el EP23.

## Audio

Hay 12 pistas en `public/audio/ep24-tiburon-groenlandia/`; las de efectos y música se generan con `tools/audio/score_ep24_tiburon.py`:

1. Narración.
2. Música misteriosa.
3. Ambiente submarino.
4. Movimiento del agua.
5. Olas.
6. Barcos de madera.
7. Viento y velas.
8. Motores (vapor y modernos).
9. Laboratorio.
10. Impactos.
11. Transiciones temporales.
12. Música del cierre.

## Comandos
```
python3 tools/audio/score_ep24_tiburon.py
node scripts/render-episode.mjs --comp EP-TiburonGroenlandia --quality draft --scale 0.5 --seg 30 --out out/ep-tiburon-groenlandia-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-TiburonGroenlandia --quality final --scale 1 --seg 30 --crf 20 --out out/ep-tiburon-groenlandia-final-1080x1920.mp4
```
