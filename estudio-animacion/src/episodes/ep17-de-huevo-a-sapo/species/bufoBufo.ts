// ESPECIE: sapo común (Bufo bufo). Etapas clave del desarrollo como parámetros interpolables.
// Referencias biológicas generales: puesta en cordones gelatinosos dobles enrollados en la vegetación;
// eclosión tras ~1–2 semanas (según temperatura) con branquias externas que pronto quedan cubiertas;
// renacuajos oscuros; primero aparecen las patas posteriores y después emergen las anteriores; la cola
// se reabsorbe; el sapito recién metamorfoseado es diminuto (~1 cm); el adulto tiene piel verrugosa,
// glándulas parotoides, iris cobrizo y pupila horizontal.
import {StageKey} from '../../../lifecycle/stages';

export type ToadParams = {
  tail: number; // longitud relativa de la cola (1 completa … 0 reabsorbida)
  size: number; // escala del cuerpo
  hind: number; // desarrollo de patas posteriores (0 … 1)
  fore: number; // desarrollo de patas anteriores (0 … 1)
  toad: number; // forma del cuerpo/cabeza: 0 renacuajo … 1 sapo
  warts: number; // verrugas de la piel
  pigment: number; // color: 0 renacuajo oscuro … 1 adulto pardo-oliváceo
  eyeBulge: number; // ojos prominentes
  gills: number; // branquias externas (solo recién eclosionado)
  parotoid: number; // glándulas parotoides
};

export const BUFO_STAGES: StageKey<ToadParams>[] = [
  {g: 0.0, name: 'renacuajo recién eclosionado', params: {tail: 1, size: 0.34, hind: 0, fore: 0, toad: 0, warts: 0, pigment: 0, eyeBulge: 0, gills: 1, parotoid: 0}},
  {g: 0.15, name: 'renacuajo', params: {tail: 1, size: 0.52, hind: 0, fore: 0, toad: 0, warts: 0, pigment: 0.05, eyeBulge: 0, gills: 0, parotoid: 0}},
  {g: 0.4, name: 'renacuajo en crecimiento', params: {tail: 1, size: 0.8, hind: 0.1, fore: 0, toad: 0.04, warts: 0, pigment: 0.12, eyeBulge: 0.05, gills: 0, parotoid: 0}},
  {g: 0.55, name: 'patas posteriores', params: {tail: 1, size: 0.88, hind: 0.75, fore: 0, toad: 0.1, warts: 0.05, pigment: 0.2, eyeBulge: 0.15, gills: 0, parotoid: 0}},
  {g: 0.66, name: 'patas posteriores completas', params: {tail: 0.95, size: 0.86, hind: 1, fore: 0.15, toad: 0.22, warts: 0.1, pigment: 0.3, eyeBulge: 0.3, gills: 0, parotoid: 0}},
  {g: 0.76, name: 'metamorfosis avanzada', params: {tail: 0.72, size: 0.74, hind: 1, fore: 1, toad: 0.55, warts: 0.25, pigment: 0.48, eyeBulge: 0.6, gills: 0, parotoid: 0.05}},
  {g: 0.88, name: 'cola en reabsorción', params: {tail: 0.22, size: 0.62, hind: 1, fore: 1, toad: 0.88, warts: 0.42, pigment: 0.66, eyeBulge: 0.88, gills: 0, parotoid: 0.2}},
  {g: 0.95, name: 'sapo joven', params: {tail: 0, size: 0.56, hind: 1, fore: 1, toad: 1, warts: 0.55, pigment: 0.76, eyeBulge: 1, gills: 0, parotoid: 0.35}},
  {g: 1.0, name: 'sapo adulto', params: {tail: 0, size: 1.0, hind: 1, fore: 1, toad: 1, warts: 1, pigment: 1, eyeBulge: 1, gills: 0, parotoid: 1}},
];
