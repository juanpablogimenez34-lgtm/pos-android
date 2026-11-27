import {Config} from '@remotion/cli/config';

// Studio 3.0: WebGL por software (sin GPU en este entorno) mediante ANGLE/SwiftShader.
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
if (process.env.REMOTION_CONCURRENCY) Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
