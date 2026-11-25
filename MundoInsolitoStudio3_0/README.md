# Mundo Insólito Studio 3.0

Sistema de personajes volumétricos 3D procedurales (Three.js + React Three Fiber) compuestos y renderizados con Remotion. Es un proyecto independiente: no modifica `estudio-animacion/`, `oceano-profundo/` ni la app POS.

- **Personaje piloto:** delfín rosado (*Inia geoffrensis*).
- **Estado:** fases A–D entregadas para su aprobación. El documental **no** se ha empezado.

## Instalación y uso
```bash
npm install
export REMOTION_BROWSER=/ruta/chrome-headless-shell   # WebGL por software (--gl=swangle)
npm run typecheck
node scripts/model-sheet.mjs entregas/character-model-sheet.png      # Fase A
node scripts/render.mjs --comp Turntable --frames 300 --seg 10 --audio 0 --out entregas/character-turntable-10s.mp4        # Fase B
node scripts/render.mjs --comp MotionTest --frames 300 --seg 10 --audio 0 --out entregas/character-motion-test-10s.mp4     # Fase C
node scripts/render.mjs --comp CinematicTest --frames 450 --seg 15 --audio 0 --out entregas/cinematic-quality-test-15s.mp4 # Fase D
```

## Estructura
- `src/characters/inia/model.ts`: anatomía (perfiles), malla continua, esqueleto, mandíbula, dientes, ojos, aletas y cola.
- `src/characters/inia/skin.ts`: texturas procedurales (color, normales, rugosidad) para el adulto y la cría.
- `src/characters/inia/IniaDolphin.tsx`: componente 3D con los materiales.
- `src/environments/`: plató de estudio y río/bosque inundado 3D.
- `src/compositions/`: hoja de modelo, prueba de giro, prueba de movimiento y prueba cinematográfica.
- `research/`: ficha anatómica, informe técnico y registro de correcciones.
