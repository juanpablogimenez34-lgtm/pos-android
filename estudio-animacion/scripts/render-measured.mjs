// Renderiza y MIDE: tiempo total, pico de memoria (RSS sumado de node + Chrome)
// y tamaño del archivo final. Uso:
//   node scripts/render-measured.mjs [composición] [salida.mp4] [...flags de remotion]
import {spawn} from 'node:child_process';
import {readFileSync, readdirSync, statSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

const [comp = 'Ep01Demo', out = 'out/ep01-demo.mp4', ...extra] = process.argv.slice(2);
mkdirSync(dirname(out), {recursive: true});

// RSS (MB) de un proceso y todos sus descendientes, leyendo /proc (sólo Linux).
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

const args = ['remotion', 'render', 'src/index.ts', comp, out, ...extra];
console.log('> npx ' + args.join(' '));
const t0 = Date.now();
const child = spawn('npx', args, {stdio: ['ignore', 'pipe', 'inherit']});
let peak = 0;
const timer = setInterval(() => {
  peak = Math.max(peak, treeRssMB(child.pid));
}, 500);
child.stdout.on('data', (b) => {
  const s = b.toString();
  if (/Rendered \d+0\/|Encoded|\+/.test(s)) process.stdout.write(s);
});
child.on('exit', (code) => {
  clearInterval(timer);
  const secs = (Date.now() - t0) / 1000;
  if (code !== 0) {
    console.error(`Render falló (código ${code})`);
    process.exit(code ?? 1);
  }
  const size = statSync(out).size / (1024 * 1024);
  const report = {
    composition: comp,
    output: out,
    flags: extra,
    renderSeconds: +secs.toFixed(1),
    peakRssMB: Math.round(peak),
    fileMB: +size.toFixed(2),
  };
  console.log('\nMEDICIÓN:', JSON.stringify(report, null, 2));
  writeFileSync(out.replace(/\.mp4$/, '.metrics.json'), JSON.stringify(report, null, 2));
});
