import { Config } from '@remotion/cli/config';

// Salida final para redes verticales.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// WebGL por software (SwiftShader vía ANGLE): funciona en cualquier máquina,
// también en servidores sin GPU. Con GPU puedes probar "angle" para ir más rápido.
Config.setChromiumOpenGlRenderer('swangle');
// Three.js con sombras es pesado: limitamos la concurrencia para no saturar memoria.
Config.setConcurrency(2);
Config.setOverwriteOutput(true);
