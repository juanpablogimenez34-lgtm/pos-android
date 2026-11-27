# Mundo Insólito Studio 3.0: informe técnico de las fases A–D (sistema de personajes)

## 1. Herramientas comprobadas en el entorno (no supuestas)

| Herramienta | Resultado | Uso |
|---|---|---|
| GPU / `nvidia-smi` / `/dev/dri` | **No hay** | — |
| Blender / `bpy` | No instalado. Existe una rueda de `bpy` 5.3, pero sin GPU solo funcionaría Cycles por CPU, a minutos por fotograma; EEVEE requiere OpenGL acelerado. | Descartado |
| Chromium headless + WebGL por software (ANGLE/SwiftShader, `--gl=swangle`) | **Funciona**: materiales PBR, sombras suaves y *clearcoat* | Base del render 3D |
| three 0.169 + @react-three/fiber 8.17 + @remotion/three 4.0.545 | Instalados y verificados | Escena 3D compuesta en Remotion |

- **Rendimiento medido a 1080×1920:**
  - Giro: 0,4 s por fotograma (estudio).
  - Movimiento: 0,65 s por fotograma.
  - Prueba cinematográfica: 0,75 s por fotograma (bosque completo).
- **Disco:** el entorno tiene un límite de escritura. Antes de instalar se liberaron 1,48 GB de copias **idénticas byte a byte** de videos que ya estaban en `entregas/`, además de cachés de pip/uv. No se eliminó ningún original.

## 2. Arquitectura del personaje (*Inia geoffrensis*, macho adulto de 2,30 m)

- **Malla continua**, generada por *loft* de secciones transversales anatómicas:
  - 150 secciones × 78 vértices; superelipse con exponente variable.
  - Incluye melón, rostro con punta roma, estrechamiento del cuello, cresta dorsal baja y quillas del pedúnculo.
  - Normales analíticas, sin costuras de sombreado.
  - Orden de caras verificado: normal hacia el exterior, tras corregir un error en el que estaban invertidas.
- **Boca con volumen:**
  - Arcos superior e inferior separados a lo largo de la comisura.
  - La mandíbula gira sobre su bisagra con un peso que se desvanece hacia la comisura, sin pliegue brusco.
  - Paladar, suelo de la boca y garganta.
  - 24 dientes por hemimandíbula: cónicos delante y de corona ancha detrás (heterodontos).
- **Esqueleto procedural:**
  - Cadena de articulaciones a lo largo de la columna, con raíz en el centro de masa (s = 0,42).
  - Ondulación dorsoventral creciente hacia la cola.
  - Cuello con límites de giro (±70°) y cabeceo (±30°).
  - Curvatura lateral en los giros, alabeo y arqueo postural.
  - Cada sección se coloca sobre su marco posado, de modo que el volumen se conserva.
- **Aletas pectorales y cola:**
  - Superficies con perfil aerodinámico y espesor real.
  - Articulaciones de abducción, barrido y torsión en las pectorales.
  - Cabeceo con retraso y flexión de las puntas en la cola.
- **Ojos:** pequeños y oscuros, con iris, pupila, córnea húmeda (*clearcoat*), párpado anular y dirección de la mirada.
- **Piel procedural** (2048×1024, determinista):
  - Color dorsal → flancos → vientre y rostro más rosado; rubor vascular y moteado.
  - Cicatrices en grupos paralelos (marcas de dientes de congéneres) y línea de la boca.
  - Mapa de normales con poros, arrugas del cuello y surcos de las cicatrices.
  - Rugosidad variable.
  - Se indexa por (s, φ), así que permanece adherida a la anatomía.
  - Variante de cría gris sobre la **misma** malla.

## 3. Entorno (fase D)

- **Agua:** degradado con niebla exponencial que simula absorción y turbidez.
- **Lecho:**
  - Lodo con textura periódica, sin costuras.
  - 900 hojas instanciadas.
- **Troncos:**
  - Corteza con relieve.
  - Raíces tabulares en la base.
- **Raíces sumergidas:** tubos a lo largo de curvas.
- **Superficie desde abajo:** ventana de Snell que se funde con la distancia.
- **Luz y partículas:**
  - Haces de luz aditivos.
  - Partículas redondas.
- **Peces:** carácidos que huyen del delfín.
- **Iluminación:**
  - Sol con sombras.
  - Hemisférica (cielo/lecho).
  - Contraluz.
  - Relleno.
  - Tone mapping neutro.

## 4. Inspección realizada (no solo compilación)

- **Fotogramas revisados:** se extrajeron e inspeccionaron visualmente fotogramas de todas las pruebas, más secuencias consecutivas del giro de la prueba de movimiento.
- **Continuidad medida** (cambio medio entre fotogramas consecutivos, escala de grises):

| Prueba | Fotogramas | Duración | Cambio máximo entre fotogramas |
|---|---|---|---|
| Giro | 300 | 10,000 s | 1,67, sin saltos |
| Movimiento | 300 | 10,000 s | 1,03, sin saltos |
| Cinematográfica | 450 | 15,000 s | Único salto en el corte intencionado de 8,5 s |

- Formato de las tres pruebas: 1080×1920, H.264 (ffprobe).

## 5. Limitaciones conocidas (honestas)

- **Profundidad de campo:** no se usa desenfoque óptico real (postprocesado). La profundidad se sugiere con niebla, escala y oclusión.
- **Dispersión subsuperficial:** se aproxima con *sheen* rosado, no con SSS física.
- **Superficie vista desde arriba:** no está construida todavía. La respiración en superficie del documental necesitará un entorno aéreo específico (pendiente).
- **Fuentes:** las de la ficha anatómica no se pudieron verificar en línea (no hay red a revistas).
