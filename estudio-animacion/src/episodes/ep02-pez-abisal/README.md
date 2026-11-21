# Episodio 02 — "El monstruo que vive en la oscuridad"

Este episodio reutiliza el motor del Ep. 01: cámara 2.5D, parallax, perfiles de calidad,
subtítulos, rótulos, audio con ducking y render por segmentos. No modifica ningún archivo
del Ep. 01. Los cambios en el motor compartido son compatibles hacia atrás, y se comprobó
que el Ep. 01 y la demo se renderizan idénticos píxel a píxel.

## Especie elegida: *Linophryne arborifera* (hembra)

Familia Linophrynidae, dentro de los rapes de aguas profundas (Ceratioidei). La elegí porque
reúne, **en un mismo animal real**, todo lo que pide el guion:

| Rasgo pedido | En *L. arborifera* |
|---|---|
| Cuerpo redondeado | Cuerpo corto y globoso |
| Boca grande, dientes largos y curvados | Boca terminal muy grande y colmillos largos inclinados hacia dentro |
| Ojos pequeños | Sí |
| Apéndice luminoso con órgano en la punta | Illicium con esca luminosa (bacterias simbióticas) |
| Machos que se adhieren a la hembra | Parasitismo sexual **obligado** documentado en Linophrynidae |
| (rasgo propio, incluido por exactitud) | Barbilla hioidea ramificada con puntos luminosos (de ahí *arborifera*, "que lleva un árbol") |

No añadí rasgos de otras familias, como las carúnculas de los Ceratiidae.

El hábitat es **pelágico** (columna de agua), así que el escenario no tiene fondo ni rocas.

Datos usados en la narración: más de un centenar de especies de rape abisal; la luz de la
esca la producen bacterias; el illicium es una espina de la aleta dorsal modificada; los
dientes se inclinan hacia dentro; la estrategia es de espera; el estómago es distensible;
los machos son mucho más pequeños, sin señuelo y con buen olfato; la fusión de tejidos y de
circulación ocurre **solo en algunas especies**; la hembra mide unos pocos centímetros (hasta
unos 8 cm); por debajo de unos 1.000 m no llega la luz solar.

Referencias generales: T. W. Pietsch (2009), *Oceanic Anglerfishes*; T. W. Pietsch (2005),
"Dimorphism, parasitism, and sex revisited", *Ichthyological Research* 52.

Las proporciones del dibujo (macho frente a hembra, tamaño de la barbilla) son
**aproximadas**: es una ilustración, no un dibujo técnico a escala.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `narration.json` | Guion: frases + instante de entrada |
| `narration-timing.json` | Tiempos medidos sobre la voz sintetizada (generado) |
| `timeline.ts` | Línea de tiempo maestra de 5.400 fotogramas |
| `Ep02Full.tsx` | Composición del episodio |
| `../../creatures/anglerfish/` | Hembra (rig y pose pura), macho libre y adherido, pez linterna |
| `../../environments/deepsea/` | Agua según profundidad, descenso, nieve marina iluminada, máscara de luz, vida bioluminiscente, medidor de profundidad |
| `../../../tools/audio/score_ep02.py` | Banda sonora original por síntesis |

## Reproducir y exportar

```bash
npm run studio                       # elegir Ep02Full
npm run ep02:sheet -- out/s.png 30,60,90,120,150   # hoja de contacto
npm run ep02:draft                   # 540×960
npm run ep02:final                   # 1080×1920

# regenerar audio (opcional)
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep02-pez-abisal/narration.json \
  --timing src/episodes/ep02-pez-abisal/narration-timing.json --out-dir public/audio/ep02
python3 tools/audio/score_ep02.py
```
