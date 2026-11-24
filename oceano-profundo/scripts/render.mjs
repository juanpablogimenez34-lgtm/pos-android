// OCÉANO PROFUNDO — render por SEGMENTOS (vídeo sin audio) + pista de audio única
// + unión sin recomprimir. Mide cada tramo (tiempo y pico de RAM de node+Chrome),
// verifica nº de fotogramas y duración, y escribe un informe JSON.
//
//   node scripts/render.mjs --comp Documental --quality preview --scale 0.5 --from 0 --to 600 --out out/muestra-20s.mp4
//   node scripts/render.mjs --comp Documental --quality premium --scale 1 --crf 20 --out out/oceano-profundo-documental-10min-1080p.mp4
//   node scripts/render.mjs --comp Short1 --frames 2100 --quality premium --scale 1 --out out/short-1.mp4
//
// Si un tramo ya existe se reutiliza (FORCE=1 para rehacerlo): un fallo no obliga a empezar de cero.
import {spawn, execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const COMP = arg('comp', 'Documental');
const QUALITY = arg('quality', 'preview');
const SCALE = Number(arg('scale', QUALITY === 'premium' ? '1' : '0.5'));
const SEG = Number(arg('seg', '30'));
const OUT = arg('out', `out/documental-${QUALITY}.mp4`);
const FPS = 30;
const FROM = Number(arg('from', '0'));
const TO = Number(arg('to', arg('frames', '18000')));
const FRAMES = TO - FROM;
const CRF = arg('crf', QUALITY === 'premium' ? '20' : '24');
const CONC = arg('concurrency', process.env.REMOTION_CONCURRENCY ?? '4');
const work = path.join(path.dirname(OUT), `.${path.basename(OUT, '.mp4')}`);
mkdirSync(work, {recursive: true});
const propsFile = path.join(work, 'props.json');
writeFileSync(propsFile, JSON.stringify({quality: QUALITY, showSubtitles: true, audio: true}));

function treeRssMB(rootPid) {
  const children = new Map();
  const rss = new Map();
  for (const d of readdirSync('/proc')) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = readFileSync(`/proc/${d}/stat`, 'utf8');
      const ppid = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
      const m = readFileSync(`/proc/${d}/status`, 'utf8').match(/VmRSS:\s+(\d+)/);
      rss.set(Number(d), m ? Number(m[1]) / 1024 : 0);
      if (!children.has(ppid)) children.set(ppid, []);
      children.get(ppid).push(Number(d));
    } catch {}
  }
  let total = 0;
  const stack = [rootPid];
  while (stack.length) {
    const p = stack.pop();
    total += rss.get(p) ?? 0;
    stack.push(...(children.get(p) ?? []));
  }
  return total;
}

function run(args, label) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const child = spawn('npx', args, {stdio: ['ignore', 'pipe', 'pipe']});
    let peak = 0;
    let errText = '';
    const timer = setInterval(() => (peak = Math.max(peak, treeRssMB(child.pid))), 500);
    child.stdout.on('data', () => {});
    child.stderr.on('data', (b) => (errText += b.toString()));
    child.on('exit', (code) => {
      clearInterval(timer);
      const secs = (Date.now() - t0) / 1000;
      if (code !== 0) return reject(new Error(`${label} falló (${code})\n${errText.slice(-2000)}`));
      resolve({secs: +secs.toFixed(1), peakMB: Math.round(peak)});
    });
  });
}

const probe = (file) =>
  JSON.parse(execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-count_packets', '-show_entries', 'stream=codec_type,codec_name,width,height,nb_read_packets,r_frame_rate', '-show_entries', 'format=duration,size', '-of', 'json', file]).toString());

// el código se empaqueta UNA vez al empezar: editar src/ durante el render no afecta a los tramos pendientes
const bundleDir = path.join(work, 'bundle');
execFileSync('npx', ['remotion', 'bundle', 'src/index.ts', '--out-dir', bundleDir, '--log=error'], {stdio: 'inherit'});
const report = {composition: COMP, quality: QUALITY, scale: SCALE, crf: CRF, concurrency: Number(CONC), segmentSeconds: SEG, segments: [], startedAt: new Date().toISOString()};
const T0 = Date.now();
const parts = [];
for (let start = FROM; start < TO; start += SEG * FPS) {
  const end = Math.min(TO - 1, start + SEG * FPS - 1);
  const file = path.join(work, `seg-${String(start).padStart(5, '0')}.mp4`);
  parts.push(file);
  if (existsSync(file) && !process.env.FORCE) {
    console.log(`= tramo ${start}-${end} reutilizado`);
    const saved = existsSync(file + '.json') ? JSON.parse(readFileSync(file + '.json', 'utf8')) : {};
    report.segments.push({start, end, ...saved, reused: true});
    continue;
  }
  process.stdout.write(`> tramo ${start}-${end} (${(start / FPS).toFixed(0)}–${((end + 1) / FPS).toFixed(0)} s)… `);
  const m = await run(
    ['remotion', 'render', bundleDir, COMP, file, `--frames=${start}-${end}`, '--muted', `--props=${propsFile}`, `--scale=${SCALE}`, '--codec=h264', `--crf=${CRF}`, `--concurrency=${CONC}`, '--log=error'],
    `tramo ${start}`,
  );
  console.log(`${m.secs} s, pico ${m.peakMB} MB`);
  writeFileSync(file + '.json', JSON.stringify(m));
  report.segments.push({start, end, ...m});
}
writeFileSync(path.join(work, 'list.txt'), parts.map((p) => `file '${path.basename(p)}'`).join('\n'));
const video = path.join(work, 'video.mp4');
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-c', 'copy', video]);

// el audio no depende de la calidad de imagen: se reutiliza si ya existe (AUDIO_FROM=ruta para copiarlo de otro render)
const audio = path.join(work, 'audio.aac');
let am = existsSync(audio + '.json') ? {...JSON.parse(readFileSync(audio + '.json', 'utf8')), reused: true} : {secs: 0, peakMB: 0, reused: true};
if (process.env.AUDIO_FROM && !existsSync(audio)) execFileSync('cp', [process.env.AUDIO_FROM, audio]);
if (!existsSync(audio) || process.env.FORCE) {
  process.stdout.write('> audio (voz, música con ducking, ambiente, efectos, transiciones)… ');
  am = await run(['remotion', 'render', bundleDir, COMP, audio, '--codec=aac', `--frames=${FROM}-${TO - 1}`, `--props=${propsFile}`, '--log=error'], 'audio');
  console.log(`${am.secs} s`);
  writeFileSync(audio + '.json', JSON.stringify(am));
} else console.log('= audio reutilizado');
report.audio = am;

// sonoridad: normalización EBU R128 en dos pasadas (lineal, sin comprimir la dinámica)
const LUFS = -14;
const raw = execFileSync('bash', ['-c', `npx remotion ffmpeg -hide_banner -i "${audio}" -af loudnorm=I=${LUFS}:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p'`]).toString();
const ln = JSON.parse(raw);
const audioNorm = path.join(work, 'audio-norm.aac');
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', audio, '-af',
  `loudnorm=I=${LUFS}:TP=-1.5:LRA=11:measured_I=${ln.input_i}:measured_TP=${ln.input_tp}:measured_LRA=${ln.input_lra}:measured_thresh=${ln.input_thresh}:offset=${ln.target_offset}:linear=true`,
  '-t', String(FRAMES / FPS), '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', audioNorm]);
report.loudness = {inputLUFS: Number(ln.input_i), inputTruePeak: Number(ln.input_tp), targetLUFS: LUFS};

execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', video, '-i', audioNorm, '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-t', String(FRAMES / FPS), '-movflags', '+faststart', OUT]);

const info = probe(OUT);
const v = info.streams.find((s) => s.codec_type === 'video');
const a = info.streams.find((s) => s.codec_type === 'audio');
report.wallSecondsThisRun = +((Date.now() - T0) / 1000).toFixed(1);
// tiempo de cómputo real acumulado (incluye tramos/audio reutilizados de ejecuciones anteriores)
report.totalSeconds = +(report.segments.reduce((a, x) => a + (x.secs ?? 0), 0) + (am.secs ?? 0)).toFixed(1);
report.peakRssMB = Math.max(...report.segments.map((s) => s.peakMB ?? 0), am.peakMB);
report.output = {
  file: OUT,
  sizeMB: +(statSync(OUT).size / 1048576).toFixed(2),
  width: v.width,
  height: v.height,
  fps: v.r_frame_rate,
  videoFrames: Number(v.nb_read_packets),
  durationSec: Number(info.format.duration),
  videoCodec: v.codec_name,
  audioCodec: a?.codec_name ?? null,
};
report.framesOk = report.output.videoFrames === FRAMES;
writeFileSync(OUT.replace(/\.mp4$/, '.report.json'), JSON.stringify(report, null, 2));
console.log('\nINFORME:', JSON.stringify(report.output, null, 2));
console.log(`Fotogramas: ${report.output.videoFrames} / ${FRAMES} ${report.framesOk ? '✔' : '✘'} · tiempo total ${report.totalSeconds} s · pico RAM ${report.peakRssMB} MB`);
if (!report.framesOk) process.exit(3);
