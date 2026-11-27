// Tipografías locales (public/fonts, licencia OFL): el render espera a que estén cargadas.
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT = 'Montserrat';
const FACES = [
  {weight: '600', file: 'fonts/montserrat-latin-600-normal.woff2'},
  {weight: '800', file: 'fonts/montserrat-latin-800-normal.woff2'},
  {weight: '900', file: 'fonts/montserrat-latin-900-normal.woff2'},
];
let loaded = false;
export function ensureFonts() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Cargando tipografías');
  Promise.all(FACES.map((f) => new FontFace(FONT, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight}).load().then((ff) => (document.fonts as unknown as Set<FontFace>).add(ff))))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
