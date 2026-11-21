import {continueRender, delayRender, staticFile} from 'remotion';

// Carga de tipografías locales (public/fonts, licencia OFL) bloqueando el
// render hasta que estén listas, para que ningún fotograma use una fuente de reserva.
export const FONT_FAMILY = 'Montserrat';

const FACES: {weight: string; file: string}[] = [
  {weight: '600', file: 'fonts/montserrat-latin-600-normal.woff2'},
  {weight: '800', file: 'fonts/montserrat-latin-800-normal.woff2'},
  {weight: '900', file: 'fonts/montserrat-latin-900-normal.woff2'},
];

let loaded = false;
export function ensureFonts() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Cargando tipografías');
  Promise.all(
    FACES.map((f) => {
      const face = new FontFace(FONT_FAMILY, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight});
      return face.load().then((ff) => (document.fonts as unknown as Set<FontFace>).add(ff));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
