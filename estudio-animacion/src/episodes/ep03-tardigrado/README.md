# Episodio 03 — "El animal que sobrevivió al espacio" (tardígrados)

Reutiliza el motor de los episodios anteriores: cámara 2.5D, parallax, calidad, subtítulos,
rótulos, transiciones, audio con ducking y render por segmentos. No modifica ningún archivo
de los Ep. 01 y 02 ni del motor; solo registra la composición `Ep03Full` en `src/Root.tsx`.

## Estructura

| Parte | Archivo |
|---|---|
| Guion (frases + instante de entrada) | `narration.json` |
| Tiempos medidos de la locución | `narration-timing.json` (generado) |
| Personaje | `../../creatures/tardigrade/Tardigrade.tsx` (rig y pose pura) |
| Animaciones / línea de tiempo (5.400 fotogramas) | `timeline.ts` |
| Cámaras | `cameras.ts` |
| Escenarios | `scenes/ForestScene.tsx`, `scenes/MicroScene.tsx`, `scenes/ExtremeScene.tsx`; entornos reutilizables en `../../environments/moss`, `space` y `cell` |
| Subtítulos y ducking | `subtitles.ts` |
| Sonido | `sound.ts` (mezcla) y `../../../tools/audio/score_ep03.py` (síntesis) |
| Composición | `Ep03Full.tsx` |

Solo se monta el entorno visible en cada instante; las transiciones solapan dos entornos
durante unos segundos como máximo.

## El tardígrado

Ilustración genérica de un eutardígrado de musgo:
- **Cuerpo:** cabeza más 4 segmentos del tronco, con cutícula semitransparente (intestino y
  células de reserva visibles), tubo bucal con bulbo faríngeo y manchas oculares.
- **Patas:** 4 pares de patas lobópodas con garras; el 4.º par es terminal y apunta hacia atrás.
- **Marcha:** depende de la distancia recorrida, con onda de atrás hacia delante y garras fijas
  en el sustrato durante el apoyo.
- **Tonel (anhidrobiosis):** cuerpo acortado, cabeza y patas retraídas y cutícula arrugada.
  **No** se representa como muerte.

## Datos científicos usados (y cómo se matizan)

- **Tamaño y especies:** la mayoría mide menos de 1 mm. Se conocen más de mil especies, en
  musgos, suelos, agua dulce y mar.
- **Nombre:** "tardígrado" significa "caminante lento"; "oso de agua" es su nombre popular.
- **Desecación:** algunas especies forman un "tonel", pierden casi toda el agua y reducen su
  metabolismo hasta hacerlo casi indetectable (criptobiosis/anhidrobiosis).
- **Frío:** en laboratorio, en estado de tonel, han resistido nitrógeno líquido (−196 °C).
- **Muestra antártica:** en 2016 se reactivaron tardígrados de musgo antártico congelado más de
  30 años (Tsujimoto et al., 2016).
- **Calor:** se presenta como **experimento ilustrativo**, con resistencia breve y limitada,
  **sin cifras**. Se añaden los límites: especie, temperatura, duración y estado fisiológico.
- **Espacio:** en 2007, la misión **FOTON-M3** (experimento TARDIS; Jönsson et al., 2008) expuso
  tardígrados **deshidratados** 10 días al vacío y a la radiación solar en órbita baja. Muchos de
  los expuestos solo al vacío se recuperaron; la radiación UV redujo mucho la supervivencia. Se
  muestra como un experimento dentro de un equipo científico (ilustración cualitativa, sin
  porcentajes), nunca como un animal caminando por el espacio.
- **Células:**
  - Proteínas **CAHS**, en algunas especies, forman un gel al secarse (Boothby et al., 2017).
  - **Dsup** (Hashimoto et al., 2016) redujo daños en el ADN de células humanas cultivadas en
    experimentos.
  - Se dice expresamente que **no hay un único mecanismo**; la aplicación a medicamentos se
    presenta como posibilidad ("podría").
- **Rehidratación:** recuperan la actividad en minutos u horas.

## Reproducir y exportar

```bash
npm run studio                     # elegir Ep03Full
npm run ep03:sheet -- out/s.png 20,60,100,140,170
npm run ep03:draft                 # 540×960
npm run ep03:final                 # 1080×1920

# audio (opcional, regenera las pistas reales)
python3 tools/audio/narration.py --voice <es_MX-claude-high.onnx> \
  --src src/episodes/ep03-tardigrado/narration.json \
  --timing src/episodes/ep03-tardigrado/narration-timing.json --out-dir public/audio/ep03
python3 tools/audio/score_ep03.py
```
