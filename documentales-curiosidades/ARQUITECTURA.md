# Arquitectura · Serie "Curiosidades animales" (Remotion + Three.js)

Formato: vertical 9:16 · 1080×1920 · 30 fps · H.264 (yuv420p, CRF 16).

## 1. Principio rector: todo es una función del tiempo

Remotion renderiza cada fotograma **por separado y en paralelo** (varias pestañas de Chromium
a la vez). Por eso no puede haber simulaciones con estado ("posición del fotograma anterior + velocidad").
Toda la animación es **determinista**: `estado = f(t, semilla)`.

| Problema | Solución sin estado |
|---|---|
| Recorrido del pulpo con velocidad variable | Se integra **una vez** en una tabla (LUT) distancia(t) a 120 Hz → `CrawlMotion.poseAt(t)` |
| Pasos de los 8 brazos | Cada brazo tiene un ciclo con fase propia; el apoyo del ciclo *k* se deduce de la pose del cuerpo en el instante medio de ese apoyo → `OctopusGait.contact(arm, t)` |
| Cámara con inercia | Media ponderada de la pose del sujeto en una ventana pasada (≈ filtro paso-bajo sin memoria) |
| Algas, partículas, cáusticas, peces | Shaders/CPU con `uTime = frame / fps` |
| Rocas, algas, piedras | Generadores con semilla fija (`createRng(seed)`) |

## 2. Capas del proyecto

```
src/
├── index.ts / Root.tsx            Registro de composiciones (demo hoy; episodio de 180 s después)
├── config/video.ts                1080×1920, 30 fps, duraciones
│
├── core/                          ► MOTOR REUTILIZABLE POR TODA LA SERIE
│   ├── math/                      ruido determinista, PRNG con semilla, easing
│   ├── shaders/                   GLSL (ruido, cáusticas, relieve) + patchMaterial()
│   │                              → inyecta código en materiales PBR de Three.js sin perder
│   │                                luces, sombras ni niebla
│   ├── environment/               Ecosistema submarino genérico
│   │   ├── seabed.ts              Fondo ANALÍTICO h(x,z): arena + rocas. Lo usan malla, brazos y cámara
│   │   ├── Terrain.tsx            Malla 26×26 m (420² segmentos), color arena/roca/algas, cáusticas
│   │   ├── Boulders.tsx           Rocas grandes procedurales + piedrecitas/conchas
│   │   ├── Vegetation.tsx         Algas pardas, pasto marino (vaivén en vertex shader), esponjas
│   │   ├── WaterVolume.tsx        Niebla, cúpula con ventana de Snell, tone mapping ACES
│   │   ├── SunLight.tsx           Sol filtrado con sombras suaves que siguen al sujeto
│   │   ├── GodRays.tsx            Haces de luz volumétricos (aditivos)
│   │   ├── MarineSnow.tsx         7000 partículas en suspensión con bokeh
│   │   └── FishSchool.tsx         Banco de peces instanciado con nado procedural
│   ├── camera/
│   │   ├── shots.ts               Lenguaje de planos declarativo (azimut, elevación, distancia, fov…)
│   │   ├── CinematicCamera.tsx    Cámara: seguimiento con inercia, cámara en mano, anti-colisión
│   │   └── cameraSafety.ts        Precalcula el recorrido de cámara y aparta rocas/algas que estorben
│   └── overlays/                  Etalonaje (viñeta + grano), título, subtítulos karaoke, HUD técnico
│
├── creatures/                     ► ANIMALES (uno por carpeta; reutilizables entre episodios)
│   └── octopus/
│       ├── anatomy.ts             Medidas reales aprox. (manto 15 cm, brazos 72-80 cm), fases de marcha
│       ├── locomotion.ts          Pose del cuerpo sobre el relieve (altura, cabeceo, alabeo, balanceo)
│       ├── gait.ts                Marcha de 8 brazos: apoyo / fase aérea, zancada adaptativa
│       ├── armSolver.ts           Esqueleto de 56 puntos por brazo: Bézier + punta enrollada,
│       │                          ondas musculares, contacto con la roca, marco de transporte paralelo
│       ├── armMesh.ts             Tubo dinámico (20 lados), 240 ventosas instanciadas, membrana
│       ├── skinMaterial.ts        Piel PBR: cromatóforos, papilas, camuflaje y "nubes pasajeras"
│       └── Octopus.tsx            Ensamblado: cabeza, manto que respira, ojos con pupila horizontal,
│                                  sifón, 8 brazos, exploración
│
└── episodes/                      ► CADA EPISODIO = DIRECCIÓN + ESCENOGRAFÍA
    └── ep01-pulpo/
        ├── layout.ts              Recorrido, rocas, semillas, color del agua
        ├── direction.ts           Guion técnico: velocidad, comportamiento, planos, subtítulos
        ├── Scene3D.tsx            Monta la escena 3D
        └── Demo15s.tsx            Composición: 3D + etalonaje + títulos + subtítulos
```

### Separación de responsabilidades
* **core/** no sabe nada de pulpos ni de episodios.
* **creatures/** no sabe nada de cámaras ni de guiones: expone `poseAt(t)` y acepta un `behavior(t)`.
* **episodes/** es el "director": decide qué hace el animal y cómo se filma, con datos declarativos.

## 3. Cómo se anima el pulpo (resumen técnico)

1. **Cuerpo**: avanza por una curva Catmull-Rom; su altura sale de la media del relieve bajo él;
   cabeceo y alabeo siguen la pendiente; leve balanceo con cada tirón de los brazos.
2. **Marcha**: patrón alterno (brazos vecinos en contrafase). En apoyo, la punta queda fija
   en el mundo mientras el cuerpo avanza; en fase aérea, se levanta en arco hacia el siguiente apoyo.
3. **Forma del brazo**: Bézier desde la raíz hasta el apoyo, y desde ahí la punta se extiende y
   **se enrolla** (rasgo típico); ondas musculares viajan por el brazo; nunca atraviesa la roca.
4. **Comportamientos** (por guion): pausa en la roca, brazos delanteros que exploran,
   camuflaje (color + papilas erizadas) y ondas oscuras de "nubes pasajeras".

## 4. Etapas del proyecto

| Etapa | Contenido | Estado |
|---|---|---|
| 1 | Arquitectura + demo 15 s (pulpo caminando, escenario, cámara) | **esta entrega** |
| 2 | Natación a reacción (sifón + brazos en paraguas), tinta, camuflaje avanzado | pendiente |
| 3 | Guion de 180 s y storyboard plano a plano; secuencia "tres corazones" (corte anatómico 3D: 2 corazones branquiales + 1 sistémico, sangre azul por hemocianina) | pendiente |
| 4 | Audio: narración es-LA, música de suspenso, efectos, subtítulos sincronizados a la locución | pendiente |
| 5 | Render final 180 s, control de calidad, versiones por plataforma | pendiente |

### Audio previsto (etapa 4)
* `public/audio/narracion.mp3`, `musica.mp3`, `sfx/*.mp3` → `<Audio>` / `<Sequence>` de Remotion.
* Subtítulos: archivo `.srt`/JSON con tiempos de la locución (p. ej. generados con Whisper sobre la
  narración real) → componente `Subtitles` ya existente.
* Fuentes de voz posibles: locutor humano, o TTS (ElevenLabs, Azure Neural TTS es-MX/es-CO, Google
  Cloud TTS). Música/SFX: bibliotecas con licencia (Artlist, Epidemic Sound, Pixabay Music,
  freesound.org con licencia CC). **No se incluye ningún audio todavía**: no se inventan recursos.
