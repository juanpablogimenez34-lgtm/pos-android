# EP25 · 20 animales venenosos que parecen de otro planeta

180 s · 1080×1920 · 30 fps · 5.400 fotogramas. Hay 22 secuencias:
- gancho de 10 s;
- 20 animales × 8 s;
- cierre de 10 s.

Composiciones:
- `EP-AnimalesVenenosos`: el documental.
- `VenenososFicha`: los 20 personajes.

## Motores por familia (`character/`)

### `Snake.tsx`: motor de serpientes
- Columna de 64 puntos en una proyección 3/4.
- Ondulación lateral, porción anterior alzada y enroscado en espiral.
- Capucha, mandíbula con el interior de la boca, colmillos, lengua bífida, cuernos nasales y cascabel.
- Dibujos: bandas, chevrones, rombos, geométrico (Gabón) y moteado.

### `Arthropods.tsx`: escorpión, araña y ciempiés
- **Escorpión.** 8 patas en marcha de tetrápodo alterna, 2 pinzas independientes, cola segmentada y telson.
- **Araña.** 8 patas, pedipalpos, quelíceros, postura defensiva y vista ventral.
- **Ciempiés.** Segmentos que siguen una trayectoria, un par de patas por segmento con onda metacrónica, antenas y forcípulas.

### `Marine.tsx`: animales marinos
Avispa de mar, pez león, pez piedra, raya y caracol cono.

### `Land.tsx`: cuadrúpedos
Monstruo de Gila y ornitorrinco macho, con espolón.

### `BlueRinged.tsx`: pulpo de anillos azules
- Usa el **motor de pulpo aprobado** (`src/creatures/octopus`) sin modificarlo.
- Se añaden un rig y una piel propios, y una capa de anillos.

### `species.ts`
Contiene un diseño distinto para cada especie.

## Hábitats y transiciones (`environment/Habitats.tsx`)
- 10 hábitats terrestres con capas de parallax.
- Mar: arrecife rocoso, coral, arena y agua abierta.
- Refugio con tela de araña.
- Transiciones con hojas y con polvo; las de burbujas se reutilizan de studio2.

## Escenas (`scenes/`)
- `A01_10.tsx` y `A11_20.tsx`: cada animal es una función del tiempo local (0–8 s).
- `IntroOutro.tsx`: montajes que reutilizan esas funciones.

## Audio
Son 13 pistas en `public/audio/ep25-animales-venenosos/`, generadas con `tools/audio/score_ep25_venenosos.py`.

## Comandos
```
node scripts/render-episode.mjs --comp EP-AnimalesVenenosos --quality draft --scale 0.5 --seg 30 --out out/ep20-animales-venenosos-borrador-540x960.mp4
node scripts/render-episode.mjs --comp EP-AnimalesVenenosos --quality final --scale 1 --seg 30 --crf 20 --out out/ep20-animales-venenosos-final-1080x1920.mp4
```
