# EP23 · El cachalote: el gigante que caza en la oscuridad

180 s · 1080×1920 · 30 fps · 5.400 fotogramas · 12 escenas × 15 s.

Composiciones:
- `EP-Cachalote`: el documental.
- `CachaloteFicha`: ficha del personaje.

## Estructura

### `character/SpermWhale.tsx`: rig del cachalote

- **Columna de 40 puntos con onda dorsoventral.** La cola bate en vertical, no lateralmente.
- **Cabeza en bloque.** Ocupa ≈ 1/3 del cuerpo.
- **Mandíbula articulada.** Dientes visibles solo al abrir.
- **Ojo pequeño.**
- **Espiráculo a la izquierda, delante.**
- **Aleta pectoral en forma de pala.**
- **Joroba baja con nudillos.**
- **Pedúnculo y aleta caudal horizontal de dos lóbulos.** Proyección en perspectiva `fv`.
- **Piel.** Arrugas y cicatrices discretas.
- **Soplo oblicuo animado.**
- **Corte anatómico.** Cerebro, espermaceti y «junk».
- **Variante de cría** (`calf`).

### `components/common.tsx`: estados y piezas compartidas

- **Los 14 estados.** SURFACE_REST, SURFACE_BREATHING, DIVE_PREPARATION, TAIL_LIFT, DEEP_DESCENT, SLOW_SWIM, ECHOLOCATION, PREY_DETECTION, HUNTING, SQUID_ENCOUNTER, ASCENT, SOCIAL_SWIMMING, CALF_PROTECTION y FINAL_RETREAT.
- **Mezcla suave entre estados.** Dura 1 s.
- **Fase del batido integrada.** Sin saltos al cambiar de frecuencia.
- **Rótulos compartidos.**

### `environment/Ocean.tsx`: escenarios

- **`SurfaceWorld`.** Cielo, sol, nubes, horizonte, olas, espuma, destellos, rayos y cáusticas. Lo sumergido se tiñe de azul.
- **`DeepOcean`.** Usa `OceanBack` del EP22, importado sin modificarlo. Añade bruma violeta y plancton bioluminiscente.
- **`ClickWaves`.** Visualización educativa de clics y ecos.

### Resto de carpetas

- **Calamar gigante.** Se reutiliza `GiantSquid` del EP22, solo importado.
- **`data/`.** Calendario, eventos y narración.
- **`scenes/`.** S01_04, S05_08 y S09_12.
- **`Documentary.tsx`.** Montaje del documental.

## Audio

Las pistas están en `public/audio/ep23-cachalote/` y se generan con `tools/audio/score_ep23_cachalote.py`. Son las 10 pistas pedidas más una de transiciones:

1. Narración.
2. Música ambiental.
3. Ambiente oceánico.
4. Respiración.
5. Clics de ecolocalización: recreación original, no son grabaciones.
6. Movimiento del agua.
7. Tensión del descenso.
8. Encuentro con el calamar.
9. Comunicación social (codas).
10. Música del cierre.
11. Transiciones.

## Comandos
```
python3 tools/audio/score_ep23_cachalote.py
node scripts/render-episode.mjs --comp EP-Cachalote --quality draft --scale 0.5 --seg 30 --out out/ep-cachalote-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-Cachalote --quality final --scale 1 --seg 30 --crf 20 --out out/ep-cachalote-final-1080x1920.mp4
```
