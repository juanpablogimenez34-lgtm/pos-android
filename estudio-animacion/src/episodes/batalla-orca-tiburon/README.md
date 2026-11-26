# Batallas de la naturaleza · Temporada 01 · Batalla 01: Orca vs. tiburón blanco

Miniserie de Mundo Insólito para TikTok, YouTube Shorts y Facebook Reels: 4 episodios conectados de 35 s.

- **Total:** 140 s, 4.200 fotogramas.
- **Formato:** 1080×1920, 30 fps.

Está hecha sobre el motor 2.5D original del pulpo, con la carcasa del Estudio 2.0. Usa SVG y React con animación determinista por fotograma, sin Three.js.

Solo se añade un módulo compatible de episodios conectados (`engine/timeline.ts` y `Battle01.tsx`).

## Árbol

```
batalla-orca-tiburon/
├── Battle01.tsx               # composiciones: Battle01Complete (140 s) y Battle01Episode (35 s, fotograma global)
├── engine/
│   ├── timeline.ts            # línea temporal principal de 4.200 fotogramas y los 4 episodios (0–1049, …, 3150–4199)
│   ├── choreo.ts              # SISTEMA DE COREOGRAFÍA (ver abajo)
│   └── check.ts               # verificación numérica de separación entre los cuerpos
├── scenes/Battle.tsx          # escenario, cámara por tramos, luz, estelas, contacto, ecolocalización,
│                              # reconstrucción, tarjetas y rótulos de cada variante
├── components/common.tsx      # rótulos compartidos
└── data/                      # script.py (guion), narration-*.json, narration-timing-*.json, timeline.ts
```

Componentes reutilizados sin modificarlos:

- **Orca:** `orca-reina-oceanos/character/Orca.tsx`, la orca del episodio de la orca:
  - columna con onda vertical;
  - pectorales independientes;
  - mandíbula con dientes cónicos;
  - espiráculo, mancha ocular y mancha gris tras la dorsal.
- **Tiburón blanco:** `tiburon-blanco/character/WhiteShark.tsx`:
  - columna de 30 puntos;
  - cola con propulsión lateral;
  - 5 hendiduras branquiales;
  - mandíbula superior que avanza al morder.
- **Escenario:** el océano por capas del episodio de la orca (rocas, algas, arena, bancos de peces que reaccionan a los depredadores, superficie con olas, rayos y partículas), con burbujas, salpicaduras y soplo.
- **Ecolocalización:** `ClickWaves` y `ClickFlash` del episodio del cachalote.

## Coreografía y continuidad

- **Línea global:** las posiciones, orientaciones, fases de cola y aletas, cámara, luz y partículas dependen solo del tiempo global. Cada episodio es la misma línea desplazada (`<Sequence from={-(n-1)·1050}>`), así que la parte siguiente empieza exactamente donde terminó la anterior.
- **Trayectorias:** Catmull-Rom en el dominio τ («tiempo de acción»). Hay dos cámaras lentas remapeadas:
  - repetición de la maniobra evasiva (52–57 s);
  - contacto (109,5–111,5 s).
- **Escalas fijas:** orca de 7 m (escala 0,7) y tiburón de 5 m (escala 0,5), es decir, 1 m = 100 px.
- **Orientación continua con histéresis:**
  - en los giros reales el cuerpo se escorza en lugar de voltearse de golpe;
  - al flotar casi quieto conserva su lado.
- **Separación verificada con `engine/check.ts`:**
  - fuera del contacto, la holgura mínima entre los cuerpos es de −12 px, es decir, se rozan sin atravesarse;
  - el único solapamiento es el contacto controlado de la parte 4 (110,6–111,8 s).
- **Estados:** RESTING, SWIMMING, EXPLORING, TARGET_DETECTED, TRACKING, APPROACHING, CIRCLING, ACCELERATING, ATTACKING, DODGING, DEFENDING, CONTACT, RECOVERING, RETREATING y SURFACING (`stateOf`).

## Variantes

**Episodios (Battle01Episode01–04)**
- Indicador «PARTE n/4».
- Ganchos iniciales.
- Retos al espectador con los animales en movimiento.
- Narración con las llamadas a la siguiente parte.

**Completo (Battle01Complete)**
- Mismos 140 s.
- Las tres llamadas a «ver la siguiente parte» se sustituyen por frases de transición.
- Los rótulos de parte pasan a títulos de capítulo.

## Audio

- **Narración:** voz Piper `es_MX-claude-high` (`tools/audio/narration.py`), con dos pistas con los mismos tiempos:
  - `narracion-episodios`: 112 s de voz;
  - `narracion-completo`: 107 s de voz.
  - Son unas 60–72 palabras por episodio, ajustadas a la velocidad real de la voz para que nada cruce el corte de 35 s.
- **Banda sonora:** `tools/audio/score_batalla.py` sintetiza 9 pistas continuas de 140 s:
  - música (misterio → acción → suspenso → clímax y resolución);
  - ambiente submarino;
  - océano y olas;
  - orcas;
  - ecolocalización;
  - movimiento del agua;
  - burbujas y turbulencia;
  - tensión;
  - transiciones, con un golpe en el inicio de cada episodio.
- **Criterios de sonido:** las vocalizaciones y los clics son sintéticos. El tiburón no tiene sonidos vocales.

## Comandos

```bash
cd estudio-animacion
python3 src/episodes/batalla-orca-tiburon/data/script.py            # (desde data/) genera los dos guiones
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/batalla-orca-tiburon/data/narration-episodios.json \
  --timing src/episodes/batalla-orca-tiburon/data/narration-timing-episodios.json --out-dir <carpeta>   # ídem «completo»
python3 tools/audio/score_batalla.py
npx esbuild src/episodes/batalla-orca-tiburon/engine/check.ts --bundle --platform=node --outfile=/tmp/check.cjs && node /tmp/check.cjs
npx remotion studio src/index.ts      # Battle01Complete, Battle01Episode01…04
node scripts/render-episode.mjs --comp Battle01Complete --frames 4200 --quality final --scale 1 --seg 35 --out out/orca-vs-tiburon-completo.mp4
node scripts/render-episode.mjs --comp Battle01Episode01 --frames 1050 --quality final --scale 1 --seg 35 --out out/orca-vs-tiburon-01-el-encuentro.mp4
#   (ídem Battle01Episode02/03/04)
```

## Base científica

- **Tamaños de la simulación:** orca de 7 m (los machos adultos rondan los 6–8 m) y tiburón blanco de 5 m (adulto grande).
- **Orcas que cazan tiburones blancos:**
  - islas Farallón, California, 1997 (Pyle *et al.*, 1999, *Marine Mammal Science*);
  - Gansbaai, Sudáfrica, desde 2017, con consumo del hígado (Engelbrecht *et al.*, 2019; Towner *et al.*, 2022).
  - Los tiburones abandonan la zona durante meses (Jorgensen *et al.*, 2019, *Scientific Reports*).
  - Es propio de algunas poblaciones de orcas.
- **Inmovilidad tónica:** estado temporal observado en algunos tiburones al quedar boca arriba; no ocurre siempre. Se muestra como reconstrucción independiente, no como grabación.
- **Ecolocalización:** clics y ecos. Se muestra como representación ilustrada.

**Criterios de representación**
- El enfrentamiento es una simulación ilustrada, con la etiqueta discreta «SIMULACIÓN ILUSTRADA».
- El contacto no es gráfico: no hay sangre ni heridas.
- El resultado se presenta como probable en estas condiciones, no como regla.
