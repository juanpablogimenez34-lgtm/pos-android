// Copia de ep05-planta-carnivora/anatomy/render.ts (el Ep. 05 no se modifica).
// Lista de dibujo con profundidad: cada personaje devuelve elementos con su z (mayor = más
// cerca de la cámara) y la escena los ordena juntos (pintor). Así la mosca puede quedar entre
// los dos lóbulos de la trampa, o una pata delante de una hoja y otra detrás.
import React from 'react';

export type Item = {z: number; key: string; node: React.ReactNode};

export const sortItems = (items: Item[]) => [...items].sort((a, b) => a.z - b.z);

export const f1 = (n: number) => n.toFixed(1);
