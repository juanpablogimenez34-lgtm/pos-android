// EPISODIO 01 — "EL ANIMAL QUE TIENE TRES CORAZONES"
// Guion completo de 180 s (base del usuario ampliada). Sólo datos verificables:
//  · Tres corazones: dos branquiales y uno sistémico.
//  · Sangre azul por hemocianina (proteína con cobre), disuelta en la hemolinfa.
//  · El corazón sistémico deja de latir durante la natación a chorro (Wells, 1979).
//  · Cromatóforos controlados por músculos y nervios; papilas que cambian la textura.
//  · Tinta con melanina; "pseudomorfos" de tinta como señuelo en cefalópodos.
//  · Morenas entre sus depredadores.
//  · ~500 millones de neuronas, cerca de 2/3 en los brazos.
//  · Quimiorreceptores en las ventosas ("saborear al tocar").
//  · O. vulgaris abre frascos con tapa de rosca en laboratorio.
//  · Amphioctopus marginatus ("pulpo de coco") transporta cáscaras como refugio.
//  · O. vulgaris suele vivir 1–2 años.

import {SceneScript} from '../../engine/types';

export const EP01_SCRIPT: SceneScript[] = [
  {
    id: 's1',
    title: 'EL MISTERIO',
    start: 0,
    end: 20,
    visual: 'Cámara avanza hacia una cueva; un ojo brilla en la oscuridad; el pulpo emerge y camina.',
    narration: [
      {text: 'En las profundidades del océano vive una criatura extraordinaria.', pauseAfter: 0.4},
      {text: 'Tiene ocho brazos, una inteligencia sorprendente y algo que parece imposible: tres corazones.', pauseAfter: 0.6},
      {text: 'Es el pulpo común, Octopus vulgaris.', pauseAfter: 0.4},
      {text: 'Y lo más extraño ocurre cuando empieza a nadar.', pauseAfter: 0.8},
    ],
    sfx: [
      {t: 0, id: 'amb_deep', note: 'Ambiente submarino grave, burbujas lejanas'},
      {t: 3.2, id: 'sting_eye', note: 'Acento sutil al aparecer el ojo'},
      {t: 13, id: 'title_hit', note: 'Golpe cinematográfico para el título'},
    ],
  },
  {
    id: 's2',
    title: 'LOS TRES CORAZONES',
    start: 20,
    end: 45,
    visual: 'Esquema científico animado: dos corazones branquiales, branquias y corazón sistémico; flujo azul.',
    narration: [
      {text: 'Dos de sus corazones, llamados branquiales, bombean la sangre hacia las branquias, donde obtiene oxígeno.', pauseAfter: 0.4},
      {text: 'El tercero, el corazón sistémico, la distribuye por todo el cuerpo.', pauseAfter: 0.5},
      {text: 'Su sangre es azul porque utiliza hemocianina, una proteína que contiene cobre.', pauseAfter: 0.4},
      {text: 'Y en lugar de viajar dentro de glóbulos rojos, va disuelta en la sangre.', pauseAfter: 0.6},
    ],
  },
  {
    id: 's3',
    title: 'EL PRECIO DE NADAR',
    start: 45,
    end: 70,
    visual: 'El pulpo camina sobre rocas (CRAWLING) y después se impulsa con el sifón (SWIMMING).',
    narration: [
      {text: 'Cuando camina, utiliza sus ocho brazos y avanza pegado a las rocas.', pauseAfter: 0.3},
      {text: 'Pero cuando necesita escapar rápidamente, llena su manto de agua y la expulsa con fuerza por el sifón.', pauseAfter: 0.4},
      {text: 'Durante la natación, su corazón sistémico puede detenerse temporalmente.', pauseAfter: 0.4},
      {text: 'Por eso nadar le exige un esfuerzo considerable, y quizás por eso suele preferir arrastrarse.', pauseAfter: 0.6},
    ],
  },
  {
    id: 's4',
    title: 'EL CAMUFLAJE',
    start: 70,
    end: 95,
    visual: 'Estado CAMOUFLAGING: color, patrón y papilas se funden con la roca.',
    narration: [
      {text: 'Su piel puede cambiar de apariencia en fracciones de segundo.', pauseAfter: 0.3},
      {text: 'Contiene miles de células de pigmento, los cromatóforos, que se expanden o se contraen controladas por músculos y nervios.', pauseAfter: 0.4},
      {text: 'Además, levanta pequeñas protuberancias llamadas papilas para cambiar su textura.', pauseAfter: 0.4},
      {text: 'Es uno de los mecanismos de camuflaje más impresionantes del océano.', pauseAfter: 0.7},
    ],
  },
  {
    id: 's5',
    title: 'EL PELIGRO',
    start: 95,
    end: 120,
    visual: 'Una morena surge entre las rocas; THREATENED → INK_ESCAPE con nube de tinta.',
    narration: [
      {text: 'Pero no está a salvo de todos los peligros.', pauseAfter: 0.4},
      {text: 'Las morenas, que cazan entre las grietas del arrecife, están entre sus depredadores.', pauseAfter: 0.4},
      {text: 'Cuando aparece una, el pulpo puede liberar una nube de tinta oscura, rica en melanina.', pauseAfter: 0.3},
      {text: 'A veces la tinta forma una mancha de tamaño parecido al suyo, que distrae al atacante mientras él huye.', pauseAfter: 0.6},
    ],
    sfx: [
      {t: 97, id: 'tension_rise', note: 'Tensión creciente'},
      {t: 108, id: 'ink_burst', note: 'Expulsión de tinta + chorro'},
    ],
  },
  {
    id: 's6',
    title: 'LA INTELIGENCIA',
    start: 120,
    end: 150,
    visual: 'EXPLORING: el pulpo examina una concha con las ventosas; primeros planos de ventosas.',
    narration: [
      {text: 'Su sistema nervioso es asombroso: tiene alrededor de quinientos millones de neuronas, y cerca de dos tercios están en los brazos.', pauseAfter: 0.5},
      {text: 'Sus ventosas detectan sustancias químicas al tocar, como si saborearan lo que exploran.', pauseAfter: 0.4},
      {text: 'En laboratorio, los pulpos comunes han aprendido a abrir frascos con tapa de rosca.', pauseAfter: 0.4},
      {text: 'Y un pariente suyo, el pulpo de coco, transporta cáscaras para usarlas como refugio.', pauseAfter: 0.7},
    ],
  },
  {
    id: 's7',
    title: 'EL FINAL',
    start: 150,
    end: 180,
    visual: 'Regresa a la cueva (HIDING) y desaparece mediante camuflaje. Pregunta final a la audiencia.',
    narration: [
      {text: 'Al terminar su recorrido, regresa a su refugio.', pauseAfter: 0.4},
      {text: 'Su vida es breve: el pulpo común suele vivir entre uno y dos años.', pauseAfter: 0.4},
      {text: 'Tres corazones, sangre azul y ocho brazos extraordinarios.', pauseAfter: 0.5},
      {text: 'El pulpo demuestra que la naturaleza todavía guarda secretos increíbles.', pauseAfter: 0.6},
      {text: '¿Qué otra criatura te gustaría descubrir?', pauseAfter: 1.5},
    ],
  },
];
