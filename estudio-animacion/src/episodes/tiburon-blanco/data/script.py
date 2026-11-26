# Guion de «El tiburón blanco: el gran depredador» (180 s, Reels). Los "at" se reajustan con tiempos medidos.
import json
S = [
 (0, 20, [
  ("Bajo la superficie, algo observa en silencio.", []),
  ("Una sombra sube a toda velocidad desde la oscuridad.", ["toda velocidad"]),
  ("Y entonces, el océano estalla.", []),
  ("Este es el tiburón blanco, uno de los grandes depredadores del planeta.", ["tiburón blanco"]),
 ]),
 (20, 45, [
  ("Puede superar los seis metros de longitud, y las hembras suelen ser más grandes que los machos.", ["seis metros", "hembras"]),
  ("Su lomo gris se confunde con el fondo visto desde arriba, y su vientre blanco, con la luz vista desde abajo.", ["lomo gris", "vientre blanco"]),
  ("Su cuerpo en forma de torpedo y su potente cola le permiten acelerar con gran fuerza.", ["torpedo"]),
  ("Tiene cientos de dientes aserrados, ordenados en varias filas, que se reemplazan durante toda su vida.", ["dientes aserrados"]),
 ]),
 (45, 70, [
  ("Sus sentidos son extraordinarios.", []),
  ("En el hocico tiene pequeños poros llamados ampollas de Lorenzini, que detectan los débiles campos eléctricos de otros animales.", ["ampollas de Lorenzini"]),
  ("La línea lateral percibe las vibraciones del agua, y su olfato es muy sensible.", ["línea lateral", "olfato"]),
  ("Además, sus ojos tienen una capa reflectante que le ayuda a ver con poca luz.", ["capa reflectante"]),
 ]),
 (70, 95, [
  ("A diferencia de la mayoría de los peces, puede mantener partes de su cuerpo más calientes que el agua que lo rodea.", ["más calientes"]),
  ("Un sistema de vasos sanguíneos conserva el calor de sus músculos.", ["conserva el calor"]),
  ("Gracias a ello recorre enormes distancias: una hembra marcada viajó de Sudáfrica a Australia y regresó en menos de un año.", ["Sudáfrica a Australia"]),
  ("En el Pacífico, muchos pasan meses en mar abierto, en una zona apodada el café del tiburón blanco.", ["café del tiburón blanco"]),
 ]),
 (95, 121, [
  ("Para cazar focas, suele atacar desde abajo, aprovechando que su silueta destaca contra la luz.", ["desde abajo"]),
  ("Acelera hacia la superficie y, a veces, sale del agua por completo.", ["sale del agua"]),
  ("Al morder, su mandíbula superior se desplaza hacia delante.", ["mandíbula superior"]),
  ("Pero muchos intentos fracasan: la presa logra escapar.", ["fracasan"]),
 ]),
 (121, 150, [
  ("Incluso este gran depredador tiene a quien temer.", []),
  ("En Sudáfrica y en California se ha documentado que algunas orcas cazan tiburones blancos.", ["orcas"]),
  ("Cuando las orcas aparecen, los tiburones abandonan la zona y pueden tardar meses en regresar.", ["abandonan la zona"]),
  ("Las orcas buscan sobre todo su hígado, un órgano muy rico en grasas.", ["hígado"]),
 ]),
 (150, 180, [
  ("El tiburón blanco crece despacio, madura tarde y tiene pocas crías.", ["madura tarde"]),
  ("Las hembras tardan unos treinta años en madurar, y pueden vivir alrededor de setenta.", ["treinta años", "setenta"]),
  ("Hoy está catalogado como vulnerable, y los mordiscos a personas son muy poco frecuentes.", ["vulnerable", "muy poco frecuentes"]),
  ("Protegerlo es proteger el equilibrio del océano.", ["equilibrio del océano"]),
  ("¿Qué otro animal extraordinario te gustaría descubrir?", []),
 ]),
]
lines = []
for si, (a, b, ls) in enumerate(S):
    t = a + 0.6
    for k, (text, hl) in enumerate(ls):
        lines.append({"id": f"s{si+1}l{k+1}", "scene": si + 1, "at": round(t, 2), "text": text, "highlight": hl})
        t += len(text.split()) / 2.4 + 0.7
print("palabras:", sum(len(l["text"].split()) for l in lines))
json.dump({"voice": {"engine": "piper", "model": "es_MX-claude-high", "lengthScale": 0.95, "noiseScale": 0.62, "noiseW": 0.55}, "durationSec": 180, "lines": lines}, open("narration.json", "w"), ensure_ascii=False, indent=1)
json.dump([[a, b] for a, b, _ in S], open("scenes.json", "w"))
