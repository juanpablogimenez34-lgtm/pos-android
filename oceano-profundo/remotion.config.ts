import {Config} from '@remotion/cli/config';

// Formato y calidad por defecto del estudio.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);

// Concurrencia: por defecto Remotion usa la mitad de los núcleos.
// Se puede forzar con REMOTION_CONCURRENCY=4.
if (process.env.REMOTION_CONCURRENCY) {
  Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
}

// Navegador: si REMOTION_BROWSER apunta a un Chrome/Chromium ya instalado
// se usa ese y no se descarga ninguno.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}

// SVG pesado: usar ANGLE/SwiftShader estable en servidores sin GPU.
Config.setChromiumOpenGlRenderer('swangle');
