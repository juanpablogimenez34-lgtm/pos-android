import React, {createContext, useContext} from 'react';

/**
 * Perfiles de calidad. Todo componente costoso consulta este contexto en lugar
 * de tener números mágicos: así la previsualización es rápida y el render final rico.
 */
export type QualityName = 'draft' | 'final';

export type Quality = {
  name: QualityName;
  particles: number; // partículas en suspensión (canvas)
  bokeh: number; // partículas grandes desenfocadas en primer plano
  caustics: boolean; // red de cáusticas animada (canvas)
  causticsRes: number; // divisor de resolución del canvas de cáusticas
  suckersPerArm: number; // ventosas por brazo
  armSegments: number; // segmentos de la cadena de cada brazo
  skinSpots: number; // manchas de la piel del manto
  seaweedSegments: number;
  foregroundBlur: number; // px de desenfoque del primer plano (0 = desactivado)
  fish: number;
};

export const QUALITY: Record<QualityName, Quality> = {
  draft: {
    name: 'draft',
    particles: 60,
    bokeh: 4,
    caustics: false,
    causticsRes: 8,
    suckersPerArm: 12,
    armSegments: 12,
    skinSpots: 16,
    seaweedSegments: 8,
    foregroundBlur: 0,
    fish: 8,
  },
  final: {
    name: 'final',
    particles: 150,
    bokeh: 9,
    caustics: true,
    causticsRes: 5,
    suckersPerArm: 24,
    armSegments: 18,
    skinSpots: 40,
    seaweedSegments: 14,
    foregroundBlur: 5,
    fish: 16,
  },
};

const Ctx = createContext<Quality>(QUALITY.final);
export const QualityProvider: React.FC<{quality: QualityName; children: React.ReactNode}> = ({quality, children}) => (
  <Ctx.Provider value={QUALITY[quality]}>{children}</Ctx.Provider>
);
export const useQuality = () => useContext(Ctx);
