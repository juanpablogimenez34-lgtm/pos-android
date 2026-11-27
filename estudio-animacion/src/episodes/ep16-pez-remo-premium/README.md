# Pez remo gigante — personaje animado premium 2.5D

Módulo independiente: `src/episodes/ep16-pez-remo-premium/`. No modifica ningún proyecto anterior
(reutiliza, solo importándolos, la cabeza y las aletas pectorales aprobadas de `ep15-pez-remo-personaje`,
el océano por capas de `ep13`, el haz de luz y el kril de `ep14`, la iluminación de `ep10` y la
cámara del Estudio 2.0). No usa assets rasterizados: todo es SVG procedural. Sin dependencias nuevas.

| Archivo | Función |
|---|---|
| `OarfishRig.ts` | trayectoria 3D de la cabeza (Hermite), seguimiento del líder, **12 puntos de control**, spline Catmull-Rom continua (96 muestras), marcos locales 3D (avance/dorso/lateral), proyección en perspectiva |
| `OarfishMotion.ts` | coreografía de la demo: trayectoria, exposición y barrido de luz, niebla, cresta, alimentación, aleta |
| `OarfishMaterials.tsx` | paleta de la maqueta, rampa de piel en bandas deformables, irisación, degradados a lo largo del cuerpo |
| `OarfishDorsalFin.tsx` | aleta dorsal 3D (170 radios proyectados) con onda cabeza → cola independiente del cuerpo |
| `OarfishHead.tsx` | cabeza lateral (cráneo, opérculo, ojo, mandíbula animable, cresta con retardo) y vista frontal; colocadas con una matriz afín derivada de la proyección 3D |
| `OarfishCharacter.tsx` | ensamblado reutilizable: pélvicas 3D, aleta, piel, escamas, manchas, brillos, luz/niebla, contraluz, cabeza |
| `UnderwaterEnvironment.tsx` | océano por capas, niebla con parallax, haz volumétrico, bokeh, rayos, luz de sujeto, etalonaje |
| `CinematicCamera.tsx` | planos encadenados con curvas de cine que siguen al personaje |
| `OarfishDemo.tsx` | demostración de 15 s (composición `PezRemoPremiumDemo`, 450 fotogramas) |

## Uso en otras escenas
```tsx
const rig = buildRig(rigParams({t, keys: MIS_CLAVES}));          // trayectoria propia
<OarfishCharacter rig={rig} pr={{cx: cam.x, cy: cam.y, f: 1400}} look={defaultLook({mouth, fog})} uid="a" />
```

## Ejecutar y renderizar
```bash
cd estudio-animacion && npm install
npx remotion studio                                   # PezRemoPremiumDemo
npx remotion render src/index.ts PezRemoPremiumDemo entregas/ep07-pez-remo-premium/pez-remo-premium-demo-15s-1080x1920.mp4 --codec=h264 --crf=18
npx remotion render src/index.ts PezRemoPremiumDemo out/prueba-540.mp4 --scale=0.5     # prueba ligera
```
