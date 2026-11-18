# Curiosidades animales · Documentales 3D verticales

**Episodio 1: "El pulpo que tiene tres corazones"**. Etapa 1: demo técnica de 15 s.

Todo es **procedural y en código**: el pulpo, el fondo marino, las algas, la luz y la cámara.
No hace falta descargar modelos, texturas ni recursos externos.

## Requisitos
* Node.js 18 o superior (probado con Node 22)
* ~2 GB de espacio libre (Remotion descarga su propio Chrome Headless la primera vez)

## Instalación
```bash
cd documentales-curiosidades
npm install
```

## Ver y editar en tiempo real (Remotion Studio)
```bash
npm run studio
```
Se abre http://localhost:3000. Elige la composición **Ep01Demo15s**. En el panel de props puedes
activar `showHud` para ver el nombre de cada plano y el tiempo exacto.

## Renderizar el vídeo final (1080×1920, 30 fps, 15 s)
```bash
npm run render:demo            # -> out/ep01-demo-15s.mp4
npm run render:demo:preview    # mitad de resolución, más rápido, para revisar movimiento
npm run still                  # un fotograma suelto (frame 150) -> out/still.png
```

### Rendimiento
* Por defecto se usa WebGL por **software** (`swangle`) para que funcione en cualquier equipo,
  incluido un servidor sin GPU. Es lento (del orden de 1–3 s por fotograma).
* Si tienes GPU, prueba: `npx remotion render src/index.ts Ep01Demo15s out/demo.mp4 --gl=angle`
  (o `--gl=vulkan` en Linux con drivers). Puede ser 5–10 veces más rápido.
* Si te quedas sin memoria, baja la concurrencia en `remotion.config.ts`.
* Si Remotion no puede descargar su Chrome, apunta a uno instalado:
  `--browser-executable=/ruta/a/chrome-headless-shell`.

## Qué revisar en esta demo
| Tiempo | Plano | Qué comprobar |
|---|---|---|
| 0–4,2 s | Grúa descendente | Escenario: rocas, arena con cáusticas, algas, rayos de luz, partículas, peces al fondo |
| 4,2–8,4 s | Travelling lateral bajo | Los 8 brazos se mueven por separado; apoyos fijos en el suelo, puntas enrolladas |
| 8,4–12 s | Primer plano | El pulpo trepa la roca, se detiene, explora con los brazos delanteros y se **camufla** |
| 12–15 s | Grúa ascendente | Revelación del arrecife con el pulpo reanudando la marcha |

## ¿Hacen falta modelos 3D externos?
**No para esta demo.** Si más adelante queremos un nivel "fotorrealista de película", estas son las
mejoras reales posibles (deben conseguirse/licenciarse aparte; no están incluidas):
1. **Modelo de pulpo esculpido y riggeado** (GLB/FBX con esqueleto de brazos) de un artista 3D o
   de un marketplace (Sketchfab, CGTrader, TurboSquid) con licencia que permita uso comercial en
   redes. Nuestro solver de brazos puede conducir sus huesos en lugar de generar el tubo.
2. **Texturas PBR escaneadas** de roca y arena (p. ej. Poly Haven o ambientCG, ambas CC0).
3. **HDRI submarino** para reflejos más ricos.

Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para el diseño completo y las próximas etapas.
