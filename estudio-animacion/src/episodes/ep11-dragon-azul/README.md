# Mundo Insólito Documentales · EP05 — El dragón azul: la criatura que parece de otro planeta

Composición Remotion **`EP05DragonAzul`** · 180 s · 1080×1920 (9:16) · 30 fps · 5.400 fotogramas ·
H.264 + AAC · español latinoamericano. Entrega: **`estudio-animacion/entregas/ep05-dragon-azul.mp4`**.

Módulo independiente `src/episodes/ep11-dragon-azul/` (ya existía un `ep05-planta-carnivora`, que
**no** se ha tocado). No se ha modificado ni borrado ningún episodio, ni la app Paulita POS ni su escáner.
Se **reutilizan sin modificar**: el motor (`src/engine`), la cámara, la iluminación y los rótulos del
Ep. 04 (`ep10-camaron-mantis`) y las partículas del Ep. 08.

## Estructura

| Carpeta / archivo | Contenido |
|---|---|
| `EP05DragonAzul.tsx` | Composición principal: escena activa, transiciones, rótulos de capítulo, subtítulos, mezcla |
| `config/episode.ts` | 12 escenas × 450 fotogramas (inicio/fin), eventos, escala fija del animal (`DS = 1.2`) |
| `character/BlueDragon.tsx` | Modelo 2.5D de *Glaucus atlanticus*: columna ondulante, cara ventral azul (banda central, bordes claros) y dorsal plateada, rinóforos, tentáculos orales, boca con mandíbulas, 4 grupos de ceratas por lado con dedos cónicos de punta oscura (cnidosacos), giro 3D simulado (`roll`), escorzo (`tilt`), alimentación, reflejo iridiscente, halo, modo rayos X (burbuja de aire) |
| `character/Organisms.tsx` | Carabela portuguesa (lateral y cenital), velela, cadenas de huevos |
| `character/DragonSheet.tsx` | Ficha de control `EP05DragonAzulFicha` |
| `animation/DragonMotion.ts` | Estados: flotación, giro, deriva, reacción a las olas, aproximación/alimentación, rotación de camuflaje, interacción por parejas, alejamiento |
| `environment/Ocean.tsx` | Océano cenital (crestas, destellos, espuma, cáusticas profundas con parallax, corrientes luminosas), plano partido en la superficie (cielo, sol, mar lejano, olas con espuma, ola grande, cara inferior, rayos, partículas), vista desde abajo, playa; paletas noche/día/atardecer |
| `science/Science.tsx` | Esquema "boca abajo" + burbuja de aire, ruta de los nematocistos, corte de una cerata, advertencias, logotipo del canal |
| `scenes/ScenesA–C.tsx` | Las 12 escenas |
| `narration/` | Guion y tiempos **medidos** de la locución |
| `subtitles/`, `audio/` | Subtítulos (máx. 2 líneas, resaltados) y mezcla de 6 pistas con ducking |

## Guion definitivo (tiempos medidos)

346 palabras · sin solapes. Frases del guion original acortadas para que quepan en 15 s por escena,
sin cambiar los datos.

| Escena | Inicio – fin (s) | Texto |
|---|---|---|
| 01 | 0.25 – 2.06 | ¡Este dragón existe de verdad! |
| 01 | 2.31 – 4.17 | Mide apenas unos centímetros… |
| 01 | 4.90 – 7.83 | ¡Y puede usar las armas urticantes de sus presas! |
| 01 | 8.80 – 14.43 | Parece una criatura de otro planeta, pero es un pequeño animal muy real. |
| 02 | 15.40 – 18.52 | Su nombre científico es Glaucus atlanticus. |
| 02 | 18.77 – 28.13 | Aunque parece un ser fantástico, es una babosa marina: un molusco gasterópodo. Sus extensiones ramificadas le dan su aspecto de pequeño dragón. |
| 03 | 30.40 – 33.78 | Este pequeño viajero vive en la superficie del mar. |
| 03 | 34.03 – 42.53 | Traga una burbuja de aire que guarda en el estómago. Así flota boca abajo y se deja llevar por el viento y las corrientes. |
| 04 | 45.40 – 47.67 | Sus colores también son camuflaje. |
| 04 | 48.00 – 56.05 | Visto desde arriba, su lado azul se confunde con el océano. Desde abajo, su lado plateado se mezcla con el brillo de la superficie. |
| 05 | 60.40 – 68.84 | Una de sus presas más conocidas es la carabela portuguesa: un organismo colonial cuyos tentáculos producen picaduras dolorosas. |
| 05 | 69.09 – 73.77 | Para muchos animales es un peligro. Para el dragón azul, es alimento. |
| 06 | 75.40 – 78.19 | Aquí está su habilidad más extraordinaria. |
| 06 | 78.44 – 88.29 | Al alimentarse, conserva las células urticantes de su presa y las almacena en las puntas de sus ceratas. Reutiliza una defensa que pertenecía a otro organismo. |
| 07 | 90.40 – 96.05 | Su tamaño engaña. Aunque parece delicado, tocarlo puede causar una picadura dolorosa. |
| 07 | 96.40 – 100.78 | Si encuentras uno en la playa, lo más seguro es observarlo sin tocarlo. |
| 08 | 105.40 – 108.90 | El dragón azul vive a merced del viento y las corrientes. |
| 08 | 109.40 – 116.33 | Puede recorrer grandes distancias flotando, junto a otros organismos de la superficie, como carabelas y velelas. |
| 09 | 120.40 – 124.92 | Esas estructuras que parecen alas no sirven para volar. Se llaman ceratas. |
| 09 | 125.40 – 131.65 | Dentro tienen ramificaciones de su sistema digestivo, y en sus puntas guarda las defensas urticantes. |
| 10 | 135.40 – 141.88 | Como otros nudibranquios, es hermafrodita: cada individuo tiene órganos masculinos y femeninos. |
| 10 | 142.40 – 148.12 | Aun así, necesita aparearse con otro para reproducirse, y después pone cadenas de huevos. |
| 11 | 150.40 – 154.18 | En el océano, la belleza no siempre significa fragilidad. |
| 11 | 154.43 – 162.70 | Este pequeño molusco combina camuflaje, flotación y defensas prestadas: soluciones de la evolución que parecen imposibles. |
| 12 | 164.80 – 170.24 | Un dragón diminuto, azul como el océano y armado con las defensas de sus presas. |
| 12 | 170.50 – 173.18 | La naturaleza sigue superando a la fantasía. |
| 12 | 173.43 – 176.87 | ¿Te atreverías a acercarte? Cuéntanos en los comentarios. |
| 12 | 177.12 – 178.89 | Mundo Insólito Documentales. |

### Notas científicas
- *Glaucus atlanticus* es un nudibranquio (babosa marina, molusco gasterópodo) de unos 3 cm.
- Traga una burbuja de aire que guarda en el estómago y flota **boca abajo**: la cara ventral (pie),
  azul, mira al cielo; la dorsal, plateada, mira al fondo. Contrasombreado: azul visto desde arriba,
  plateado visto desde abajo. *(El encargo pedía mostrar la parte azul hacia el agua y la plateada
  hacia el cielo; se ha representado al revés porque así es en el animal real y así lo dice la narración.)*
- Se alimenta de carabelas portuguesas y velelas; conserva sus nematocistos **sin disparar** y los
  almacena en cnidosacos en las puntas de las ceratas (proceso biológico, no "superpoder").
- Las ceratas contienen ramas de la glándula digestiva. Es hermafrodita, necesita aparearse y pone
  cadenas de huevos. Su picadura puede ser dolorosa: observar sin tocar.

## Comandos

```bash
cd estudio-animacion && npm install
# audio (opcional; ya generado en public/audio/ep05-dragon-azul/)
python3 tools/audio/narration.py --voice <ruta>/es_MX-claude-high.onnx \
  --src src/episodes/ep11-dragon-azul/narration/narration.json \
  --timing src/episodes/ep11-dragon-azul/narration/narration-timing.json --out-dir public/audio/ep05-dragon-azul
python3 tools/audio/score_ep11_dragon.py
# vista previa y render final por tramos
npx remotion studio
node scripts/render-episode.mjs --comp EP05DragonAzul --quality final --scale 1 --seg 30 --crf 20 --out out/ep05-dragon-azul.mp4
cp out/ep05-dragon-azul.mp4 entregas/ep05-dragon-azul.mp4
```

Android/Termux: añadir `--seg 15 --concurrency 1` (ver el README del EP04 camarón mantis para la
instalación de Chromium y la solución de problemas).

## QC (ejecutado sobre `entregas/ep05-dragon-azul.mp4`)

| Comprobación | Método | Resultado |
|---|---|---|
| Duración | `remotion ffprobe` | 180,000 s ✔ |
| Resolución / fps / fotogramas | ffprobe `-count_frames` | 1080×1920, 30/1, 5400 ✔ |
| Códecs | ffprobe | H.264 (High) + AAC LC 48 kHz estéreo ✔ |
| Tamaño | ffprobe | 99,9 MB |
| Sonoridad | loudnorm | −16,3 LUFS → −14 LUFS ✔ |
| Audio audible | RMS por ventanas de 0,1 s | RMS −17,3 dBFS; 1 sola ventana de 0,1 s casi en silencio ✔ |
| Narración sincronizada | correlación de envolventes mezcla/locución | r = 0,67, desfase ≤ 0,1 s ✔ |
| Pantallas negras | luminancia 1 fps | ninguna; solo el fundido final de 0,5 s ✔ |
| Movimiento | diferencia entre fotogramas 1 fps | sin tramos congelados ✔ |
| Subtítulos / narración | `narration.py` (problems: []) y revisión visual | 28 frases sin solapes; máx. 2 líneas ✔ |

Render: 6 tramos de 30 s, 1.144 s en total, pico de RAM 4.082 MB.
