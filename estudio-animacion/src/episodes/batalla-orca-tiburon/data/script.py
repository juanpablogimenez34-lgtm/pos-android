# Guion de BATALLAS DE LA NATURALEZA · T01 · Batalla 01: Orca vs. tiburón blanco (4 × 35 s, línea global de 140 s).
# Dos variantes con los MISMOS tiempos: "episodios" (con llamadas a la siguiente parte) y "completo" (sustituidas).
import json
EP = [
 [("¿Qué pasaría si estos dos gigantes del océano se enfrentaran?", ["dos gigantes"], 0.3),
  ("El tiburón blanco tiene dientes diseñados para cortar. La orca combina una enorme fuerza física con extraordinarias capacidades cognitivas.", ["dientes diseñados para cortar", "capacidades cognitivas"], 4.6),
  ("Aquí, la orca tiene ventaja de tamaño. Pero el tiburón posee una poderosa mandíbula y una sorprendente aceleración.", ["ventaja de tamaño", "aceleración"], 13.0),
  ("Los dos se aproximan. Antes del primer movimiento, tienes que decidir.", ["tienes que decidir"], 22.5),
  ({"episodios": "¿Equipo orca o equipo tiburón? Deja tu predicción antes de la segunda parte.", "completo": "¿Quién dará el primer paso? Observa con atención."}, ["Equipo orca", "equipo tiburón", "primer paso"], 29.5)],
 [("¡El tiburón blanco ataca primero!", ["ataca primero"], 35.3),
  ("Su cuerpo hidrodinámico le permite acelerar rápidamente, y sus dientes son una seria amenaza.", ["acelerar rápidamente"], 38.3),
  ("Pero la orca no se queda inmóvil: con sus aletas y su poderosa cola cambia de trayectoria y evita el choque.", ["cambia de trayectoria"], 46.5),
  ("El tiburón conserva su capacidad de ataque, pero la orca tiene una ventaja que podría cambiarlo todo.", ["una ventaja"], 56.5),
  ({"episodios": "¿Bastaría una mordida para vencer a la orca? Descubre su estrategia en la tercera parte.", "completo": "¿Bastaría una sola mordida? La orca prepara su estrategia."}, ["una mordida", "estrategia"], 64.5)],
 [("La orca tiene una ventaja que el tiburón no puede ignorar.", ["una ventaja"], 70.3),
  ("Es muy inteligente, y usa la ecolocalización para obtener información de lo que la rodea.", ["ecolocalización"], 73.5),
  ("Algunos tiburones pueden quedar inmóviles temporalmente en ciertas posiciones. Y se han observado orcas cazando tiburones blancos.", ["inmóviles temporalmente", "se han observado"], 82.0),
  ("Llega el momento decisivo: la potencia del tiburón contra la mayor masa y maniobrabilidad de la orca.", ["momento decisivo"], 92.0),
  ({"episodios": "Última oportunidad: ¿mantienes tu predicción o cambias de equipo?", "completo": "Los dos aceleran. El choque es inevitable."}, ["Última oportunidad", "inevitable"], 100.0)],
 [("¡Llegó el momento de descubrir al vencedor!", ["vencedor"], 105.3),
  ("La orca embiste con su enorme masa y desvía al tiburón.", ["enorme masa"], 109.0),
  ("En nuestra simulación, el tiburón se retira. La mayor masa de la orca y su maniobrabilidad inclinan el resultado a su favor.", ["se retira", "a su favor"], 118.0),
  ("Existen casos reales de orcas cazando tiburones blancos. Cada encuentro es distinto, pero la orca sería la favorita.", ["casos reales", "la favorita"], 127.0),
  ("¿Acertaste? Elige la próxima batalla: ¿león contra tigre, o cocodrilo contra anaconda?", ["león contra tigre", "cocodrilo contra anaconda"], 134.0)],
]
for variant in ["episodios", "completo"]:
    lines = []
    for e, ls in enumerate(EP):
        for k, (text, hl, at) in enumerate(ls):
            tx = text[variant] if isinstance(text, dict) else text
            lines.append({"id": f"e{e+1}l{k+1}", "scene": e + 1, "at": at, "text": tx, "highlight": hl})
    words = [sum(len(l["text"].split()) for l in lines if l["scene"] == s) for s in range(1, 5)]
    print(variant, "palabras por episodio:", words)
    json.dump({"voice": {"engine": "piper", "model": "es_MX-claude-high", "lengthScale": 0.93, "noiseScale": 0.62, "noiseW": 0.55}, "durationSec": 140, "lines": lines}, open(f"narration-{variant}.json", "w"), ensure_ascii=False, indent=1)
