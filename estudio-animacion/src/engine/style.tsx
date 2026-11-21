import React, {createContext, useContext} from 'react';

/**
 * Indicador de "acabado refinado" (sombras suaves, volumen de ventosas, luz de
 * contorno, reflejos, oclusión de rocas). La demo aprobada lo deja en false para
 * que su render siga siendo idéntico al aprobado; el episodio completo lo activa.
 */
const Ctx = createContext({refined: false});
export const StyleProvider: React.FC<{refined: boolean; children: React.ReactNode}> = ({refined, children}) => (
  <Ctx.Provider value={{refined}}>{children}</Ctx.Provider>
);
export const useStyle = () => useContext(Ctx);
