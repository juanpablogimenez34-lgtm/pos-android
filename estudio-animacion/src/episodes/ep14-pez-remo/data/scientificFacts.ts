// HECHOS, HIPÓTESIS, RECREACIONES Y LEYENDAS del episodio (también en entregas/ep07-pez-remo/FUENTES.md).
// Durante la producción NO hubo acceso a fuentes externas (red restringida): los datos marcados con
// `verificar: true` deben comprobarse antes de publicar.
export type Fact = {claim: string; kind: 'hecho' | 'hipotesis' | 'recreacion' | 'leyenda'; verificar?: boolean; note?: string};

export const FACTS: Fact[] = [
  {claim: 'Nombre científico Regalecus glesne; familia Regalecidae, orden Lampriformes', kind: 'hecho'},
  {claim: 'Pez óseo; uno de los más largos que se conocen', kind: 'hecho'},
  {claim: 'Cuerpo plateado, muy alargado y comprimido lateralmente; aleta dorsal rojiza a lo largo del cuerpo, con radios alargados sobre la cabeza; aletas pélvicas largas con extremo ensanchado', kind: 'hecho'},
  {claim: 'Se han documentado ejemplares de varios metros (las cifras máximas varían según la fuente; se muestra un ejemplar ILUSTRATIVO de 5 m)', kind: 'hecho', verificar: true},
  {claim: 'Habita principalmente aguas oceánicas profundas y a veces aparece cerca de la superficie; sin profundidad exacta', kind: 'hecho', verificar: true},
  {claim: 'Se alimenta de organismos pequeños, como kril y otros crustáceos planctónicos', kind: 'hecho', verificar: true},
  {claim: 'Puede desplazarse mediante ondas de la aleta dorsal con el cuerpo relativamente recto', kind: 'hecho', verificar: true},
  {claim: 'Observado nadando casi en vertical en grabaciones con vehículos submarinos (ROV)', kind: 'hecho', verificar: true, note: 'Benfield et al. (2013), Journal of Fish Biology — golfo de México'},
  {claim: 'Su aspecto ha contribuido a relatos de serpientes marinas', kind: 'hipotesis', note: 'interpretación histórica habitual, no demostrable caso por caso'},
  {claim: 'En Japón se lo asocia con terremotos (Ryūgū no tsukai, "mensajero del palacio del dios del mar")', kind: 'leyenda', verificar: true},
  {claim: 'No hay evidencia sólida de que su aparición permita predecir terremotos; un estudio con registros de Japón no halló relación', kind: 'hecho', verificar: true, note: 'Orihara et al. (2019), Bulletin of the Seismological Society of America'},
  {claim: 'Escena del barco, costa estilizada, alimentación de kril y encuentro con el ROV', kind: 'recreacion'},
];
