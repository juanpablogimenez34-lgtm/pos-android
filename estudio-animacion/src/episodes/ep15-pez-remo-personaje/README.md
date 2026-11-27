# Pez remo gigante — personaje principal (etapa 1: solo el personaje)

Modelo 2.5D modular inspirado en la maqueta conceptual aportada (estilo cinematográfico, cuerpo
plateado con reflejos azul-violeta, aleta dorsal roja, cresta de radios largos). Módulo nuevo e
independiente: no modifica el pez remo del EP07 ni ningún otro proyecto.

| Archivo | Capa / función |
|---|---|
| `character/rig.ts` | columna de 84 articulaciones, perfil de altura, utilidades (cintas afinadas, curvas) |
| `character/BodySkin.tsx` | piel: degradado volumétrico, irisación que se desliza, escamas sobre la columna, manchas, línea lateral, brillos, luz de borde |
| `character/DorsalFin.tsx` | aleta dorsal segmentada (160 radios curvos) con onda cabeza → cola |
| `character/Head.tsx` | cabeza (cráneo, opérculo, ojo, boca protráctil animable) y cresta con retardo |
| `character/PairedFins.tsx` | pectorales que baten y pélvicas largas con extremo ensanchado |
| `character/OarfishHero.tsx` | ensamblado con orden de capas; `layers` para dibujar capas sueltas |
| `demo/OarfishDemo.tsx` | demostración de 8 s (composición `PezRemoPersonajeDemo`) |
| `demo/LayerSheet.tsx` | hoja de despiece (composición `PezRemoPersonajeCapas`) |

```bash
npx remotion render src/index.ts PezRemoPersonajeDemo entregas/ep07-pez-remo-personaje/pez-remo-personaje-demo-8s-1080x1920.mp4 --codec=h264 --crf=18
npx remotion still src/index.ts PezRemoPersonajeCapas entregas/ep07-pez-remo-personaje/pez-remo-despiece-capas.png --frame=10
```
