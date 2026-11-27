# Guion de BATALLAS DE LA NATURALEZA · Hormiga negra vs. hormiga roja (180 s). Los "at" se reajustan con tiempos medidos.
import json
S = [
 (0, 20, [
  ("Una posee mandíbulas poderosas. La otra lleva un aguijón capaz de administrar veneno.", ["mandíbulas", "veneno"]),
  ("Aunque parecen pequeñas, tienen defensas extraordinarias.", ["defensas extraordinarias"]),
  ("Si una hormiga negra y una hormiga roja se enfrentaran, ¿cuál tendría más posibilidades de ganar?", ["hormiga negra", "hormiga roja"]),
  ("Elige tu favorita antes de conocer el resultado.", ["Elige tu favorita"]),
 ]),
 (20, 45, [
  ("La hormiga carpintera negra posee un cuerpo robusto y mandíbulas fuertes para transportar alimento, defenderse y trabajar la madera.", ["hormiga carpintera negra", "mandíbulas fuertes"]),
  ("Excava galerías en madera blanda o húmeda para construir su nido, pero no se alimenta de ella como las termitas.", ["no se alimenta de ella"]),
  ("Algunas obreras son mucho más grandes que otras.", ["más grandes"]),
  ("No tiene aguijón: se defiende mordiendo y rociando secreciones con ácido fórmico.", ["ácido fórmico"]),
 ]),
 (45, 70, [
  ("La hormiga de fuego roja tiene una combinación de armas muy diferente.", ["hormiga de fuego roja"]),
  ("Puede sujetarse con sus mandíbulas y usar un aguijón para administrar veneno.", ["aguijón", "veneno"]),
  ("Sus antenas terminan en una pequeña maza, y su cintura tiene dos segmentos.", ["dos segmentos"]),
  ("Además, las obreras responden en grupo ante una amenaza, y la colonia se convierte en un adversario formidable.", ["en grupo", "colonia"]),
 ]),
 (70, 95, [
  ("En nuestro duelo individual, la negra tiene ventaja de tamaño: diez milímetros frente a cinco.", ["ventaja de tamaño", "diez milímetros frente a cinco"]),
  ("Pero la hormiga roja dispone de un aguijón funcional.", ["aguijón funcional"]),
  ("Ambas exploran con sus antenas y se comunican mediante señales químicas.", ["señales químicas"]),
  ("La fuerza no siempre decide un encuentro: la posición, la movilidad y la defensa también importan.", ["posición", "movilidad"]),
 ]),
 (95, 120, [
  ("Las dos se acercan a la misma fuente de alimento, y se detectan.", ["se detectan"]),
  ("En un enfrentamiento individual entre estos dos ejemplares, la diferencia de tamaño podría favorecer a la hormiga negra.", ["diferencia de tamaño"]),
  ("Sin embargo, la hormiga roja sigue siendo peligrosa gracias a su aguijón.", ["peligrosa"]),
  ("Nuestra simulación favorece a la obrera más grande, aunque un encuentro real podría terminar de otra manera.", ["obrera más grande", "otra manera"]),
 ]),
 (120, 150, [
  ("Pero entre las hormigas, una batalla individual no cuenta toda la historia.", ["toda la historia"]),
  ("Las hormigas de fuego dejan rastros químicos que reclutan a muchas obreras.", ["rastros químicos"]),
  ("Una colonia puede reunir decenas de miles de individuos.", ["decenas de miles"]),
  ("Con una clara superioridad numérica, esa respuesta colectiva podría cambiar por completo el resultado.", ["superioridad numérica"]),
 ]),
 (150, 180, [
  ("Entonces, ¿quién ganaría? Uno contra uno, la hormiga negra tiene ventaja por su tamaño.", ["Uno contra uno"]),
  ("Pero en grupo, el número y la coordinación de las hormigas rojas pueden cambiarlo todo.", ["en grupo"]),
  ("No existe un vencedor universal: depende de las especies, el tamaño, el número y las circunstancias.", ["vencedor universal"]),
  ("¿Acertaste? Elige la próxima batalla: ¿escorpión contra tarántula, o avispa contra mantis religiosa?", ["escorpión contra tarántula", "avispa contra mantis"]),
 ]),
]
lines = []
for si, (a, b, ls) in enumerate(S):
    t = a + 0.5
    for k, (text, hl) in enumerate(ls):
        lines.append({"id": f"s{si+1}l{k+1}", "scene": si + 1, "at": round(t, 2), "text": text, "highlight": hl})
        t += len(text.split()) / 2.4 + 0.7
print("palabras:", sum(len(l["text"].split()) for l in lines))
json.dump({"voice": {"engine": "piper", "model": "es_MX-claude-high", "lengthScale": 0.95, "noiseScale": 0.62, "noiseW": 0.55}, "durationSec": 180, "lines": lines}, open("narration.json", "w"), ensure_ascii=False, indent=1)
json.dump([[a, b] for a, b, _ in S], open("scenes.json", "w"))
