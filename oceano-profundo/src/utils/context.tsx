// Contextos de render: tamaño del cuadro (16:9 o 9:16) y perfil de calidad.
import React, {createContext, useContext} from 'react';
import {CONFIG, Quality, QualityName} from '../config';

export type View = {w: number; h: number; q: Quality; vertical: boolean};
const Ctx = createContext<View>({w: 1920, h: 1080, q: CONFIG.quality.premium, vertical: false});
export const ViewProvider: React.FC<{w: number; h: number; quality: QualityName; children: React.ReactNode}> = ({w, h, quality, children}) => (
  <Ctx.Provider value={{w, h, q: CONFIG.quality[quality], vertical: h > w}}>{children}</Ctx.Provider>
);
export const useView = () => useContext(Ctx);
