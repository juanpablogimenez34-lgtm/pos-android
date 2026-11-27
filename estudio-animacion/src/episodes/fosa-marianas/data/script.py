# Genera narration.json (guion base del episodio). Se ejecuta una vez; los "at" se reajustan después con tiempos medidos.
import json
S = [
 [  # 1 · 0–60
  ("Imagina un lugar tan profundo que incluso el monte Everest desaparecería completamente bajo el agua.", ["monte Everest"]),
  ("En el Pacífico occidental, cerca de las islas Marianas, se encuentra una enorme fosa que alcanza casi once kilómetros de profundidad.", ["islas Marianas", "once kilómetros"]),
  ("El Everest mide unos ocho mil ochocientos cuarenta y nueve metros: en el fondo de la fosa, su cumbre quedaría a unos dos kilómetros bajo el agua.", ["dos kilómetros"]),
  ("Hoy descenderemos hasta su punto más profundo, descubriendo las criaturas que habitan cada zona del océano.", ["punto más profundo"]),
  ("Comenzamos en la zona iluminada: en los primeros doscientos metros, la luz permite la fotosíntesis del fitoplancton, base de casi toda la vida marina.", ["zona iluminada", "fitoplancton"]),
  ("Delfines, atunes, tiburones y bancos de peces aprovechan esta abundancia.", []),
  ("Pero el agua absorbe la luz: primero desaparece el rojo, luego el amarillo, y al final solo queda el azul.", ["solo queda el azul"]),
 ],
 [  # 2 · 60–120
  ("A partir de los doscientos metros comienza la zona crepuscular. La luz del sol se debilita y las condiciones cambian por completo.", ["zona crepuscular"]),
  ("Aquí encontramos peces linterna, capaces de producir luz mediante órganos especializados llamados fotóforos.", ["peces linterna", "fotóforos"]),
  ("Muchos suben cada noche hacia la superficie para alimentarse y regresan a la profundidad al amanecer: es una de las mayores migraciones diarias del planeta.", ["migraciones diarias"]),
  ("Otros poseen ojos extraordinarios. El pez de cabeza transparente, del Pacífico Norte, tiene ojos tubulares dentro de un escudo transparente lleno de líquido, y puede girarlos para mirar hacia arriba o hacia delante.", ["ojos tubulares"]),
  ("Las dos manchas sobre su boca no son ojos: son sus órganos olfativos.", ["órganos olfativos"]),
  ("Cerca de los mil metros, la última luz solar se apaga. Algunas medusas, como la medusa corona, producen destellos azules cuando se sienten amenazadas.", ["medusa corona"]),
 ],
 [  # 3 · 120–180
  ("Al superar aproximadamente los mil metros, entramos en la zona de medianoche, un mundo donde la luz solar ya no llega.", ["zona de medianoche"]),
  ("Aquí, muchos animales producen su propia luz. La bioluminiscencia es una reacción química: una molécula llamada luciferina se oxida con ayuda de una enzima, la luciferasa, y libera energía en forma de luz.", ["luciferina", "luciferasa"]),
  ("Puede servir para atraer presas, comunicarse, defenderse o evitar ser detectado.", []),
  ("El rape abisal lleva sobre la cabeza un señuelo iluminado por bacterias. Una presa curiosa se acerca, y su enorme boca hace el resto.", ["señuelo"]),
  ("El pez dragón tiene dientes largos y afilados, una barbilla luminosa y filas de fotóforos a lo largo del cuerpo.", ["pez dragón"]),
  ("En esta oscuridad permanente, cada adaptación puede marcar la diferencia entre sobrevivir y desaparecer.", []),
 ],
 [  # 4 · 180–240
  ("Entre los animales asociados con las profundidades encontramos criaturas de proporciones impresionantes.", []),
  ("El calamar gigante tiene ojos de hasta unos veintisiete centímetros, entre los más grandes del reino animal, y dos largos tentáculos para capturar alimento.", ["calamar gigante", "veintisiete centímetros"]),
  ("Fue fotografiado vivo por primera vez en 2004, a unos novecientos metros de profundidad, cerca de las islas Ogasawara, al norte de las Marianas.", ["novecientos metros"]),
  ("El cachalote suele bucear entre cuatrocientos y mil metros, y se han registrado inmersiones de unos dos mil metros.", ["cachalote", "dos mil metros"]),
  ("Utiliza la ecolocalización para explorar donde la luz resulta insuficiente, y en el estómago de muchos cachalotes se han encontrado picos de calamares.", ["ecolocalización"]),
  ("Esta escena es una reconstrucción: nadie ha filmado todavía un enfrentamiento entre ambos en las profundidades.", ["reconstrucción"]),
 ],
 [  # 5 · 240–300
  ("Cuanto más descendemos, más difícil resulta encontrar alimento.", []),
  ("Gran parte de la materia orgánica que llega hasta aquí procede de las capas superiores: restos de organismos, excrementos y mucosidades que caen lentamente como copos. Es la nieve marina.", ["nieve marina"]),
  ("Algunas partículas tardan semanas en llegar al fondo.", []),
  ("El pez pelícano tiene una boca enorme, con una mandíbula que se abre como una bolsa, y se alimenta sobre todo de pequeños crustáceos.", ["pez pelícano"]),
  ("El pulpo dumbo nada agitando dos aletas que recuerdan a orejas, y planea con la membrana que une sus ocho brazos.", ["pulpo dumbo"]),
  ("Se ha observado a casi siete mil metros, más profundo que cualquier otro pulpo conocido.", ["siete mil metros"]),
  ("Ahorrar energía es la clave: muchos animales profundos se mueven poco y aprovechan cada oportunidad de alimentarse.", ["Ahorrar energía"]),
 ],
 [  # 6 · 300–360
  ("Entre los cuatro mil y los seis mil metros se extiende la zona abisal. Aunque parece un desierto oscuro y silencioso, alberga numerosos organismos adaptados.", ["zona abisal"]),
  ("El agua está a uno o dos grados, y la presión es cientos de veces mayor que en la superficie.", ["cientos de veces"]),
  ("Los pepinos de mar recorren los sedimentos y se alimentan de las partículas orgánicas que se depositan en el fondo.", ["pepinos de mar"]),
  ("Aquí también viven los xenofióforos. Aunque pueden medir más de diez centímetros, cada uno es una sola célula que construye su caparazón pegando granos de sedimento.", ["xenofióforos", "una sola célula"]),
  ("No son animales: pertenecen a los foraminíferos, un grupo de organismos unicelulares.", ["No son animales"]),
  ("Las marcas del sedimento son huellas y madrigueras de animales que rara vez vemos.", []),
  ("Más adelante, el fondo comienza a inclinarse. Estamos al borde de la fosa.", []),
 ],
 [  # 7 · 360–420
  ("Al superar los seis mil metros entramos en la zona hadal, una región formada principalmente por las grandes fosas oceánicas.", ["zona hadal"]),
  ("La fosa de las Marianas mide unos dos mil quinientos cincuenta kilómetros de largo y, en promedio, unos sesenta y nueve de ancho.", ["dos mil quinientos cincuenta kilómetros"]),
  ("La fosa de las Marianas existe porque la placa del Pacífico, más antigua y densa, se hunde bajo la placa de las Marianas. Este proceso se llama subducción.", ["subducción"]),
  ("La presión aumenta aproximadamente una atmósfera por cada diez metros de profundidad. A siete mil metros, ronda las setecientas atmósferas.", ["setecientas atmósferas"]),
  ("Aun así, los animales no se aplastan: sus cuerpos están llenos de agua, que casi no se comprime, y no tienen cavidades de aire.", ["no se aplastan"]),
  ("Los anfípodos hadales, pequeños crustáceos parientes de las pulgas de mar, llegan en grupos en cuanto detectan alimento.", ["anfípodos hadales"]),
 ],
 [  # 8 · 420–480
  ("En las profundidades de las Marianas vive un pez que desafía nuestra imaginación: el pez caracol de las Marianas.", ["pez caracol de las Marianas"]),
  ("Fue descrito en 2017 a partir de ejemplares capturados entre unos seis mil novecientos y casi ocho mil metros.", ["2017"]),
  ("Su cuerpo es blando y translúcido, sin escamas, y su cráneo no está completamente osificado.", ["sin escamas"]),
  ("Sus tejidos acumulan una molécula llamada óxido de trimetilamina, que ayuda a estabilizar las proteínas frente a la presión.", ["óxido de trimetilamina"]),
  ("Se alimenta de pequeños crustáceos, como los anfípodos, que succiona cerca del fondo.", []),
  ("Pero incluso los peces más especializados parecen tener un límite. El récord lo tiene otro pez caracol, filmado a unos ocho mil trescientos metros en la fosa de Izu-Ogasawara.", ["ocho mil trescientos metros"]),
 ],
 [  # 9 · 480–540
  ("Más allá de las mayores profundidades donde se han observado peces, la vida no desaparece.", ["la vida no desaparece"]),
  ("Los anfípodos Hirondellea gigas viven incluso cerca del fondo del abismo Challenger, y producen enzimas capaces de digerir la celulosa de restos vegetales que llegan desde la superficie.", ["Hirondellea gigas", "celulosa"]),
  ("En los sedimentos viven bacterias y arqueas piezófilas, microorganismos que crecen mejor bajo presiones enormes.", ["piezófilas"]),
  ("Sus membranas contienen más grasas insaturadas, que las mantienen flexibles, y sus proteínas siguen funcionando donde otras dejarían de hacerlo.", ["grasas insaturadas"]),
  ("En el fondo de la fosa, la actividad microbiana es incluso mayor que en las llanuras abisales cercanas, porque allí se acumula la materia orgánica.", ["actividad microbiana"]),
  ("Aquí, la oscuridad es permanente, y la presión ya supera unas mil veces la que sentimos en la superficie.", ["mil veces"]),
 ],
 [  # 10 · 540–600
  ("Hemos llegado al abismo Challenger, el punto más profundo conocido de los océanos.", ["abismo Challenger"]),
  ("Una medición de 2021 lo situó en unos diez mil novecientos treinta y cinco metros; otras expediciones han obtenido valores ligeramente distintos.", ["diez mil novecientos treinta y cinco"]),
  ("Bajo casi once kilómetros de agua, la presión supera aproximadamente mil veces la de la superficie. Y, aun así, la vida ha encontrado una manera de existir.", ["la vida"]),
  ("En 1960, Jacques Piccard y Don Walsh llegaron al fondo a bordo del batiscafo Trieste. En 2012, James Cameron descendió en solitario, y desde 2019 varios sumergibles han regresado.", ["Trieste"]),
  ("Cada expedición nos recuerda cuánto desconocemos todavía de nuestro propio planeta.", []),
  ("¿Qué otros secretos podrían esconderse en las profundidades?", []),
 ],
]
lines = []
for si, sc in enumerate(S):
    t = si * 60 + 0.8
    for k, (text, hl) in enumerate(sc):
        lines.append({"id": f"s{si+1}l{k+1}", "scene": si + 1, "at": round(t, 2), "text": text, "highlight": hl})
        t += len(text.split()) / 2.45 + 0.8
words = sum(len(l["text"].split()) for l in lines)
print("palabras:", words, "frases:", len(lines))
json.dump({"voice": {"engine": "piper", "model": "es_MX-claude-high", "lengthScale": 0.97, "noiseScale": 0.62, "noiseW": 0.55}, "durationSec": 600, "lines": lines}, open("narration.json", "w"), ensure_ascii=False, indent=1)
