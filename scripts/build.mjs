import { cp, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const output = resolve(root, 'dist');
const entries = ['index.html', 'css', 'js', 'assets'];

for (const entry of ['index.html', 'css/styles.css', 'js/main.js']) {
  const info = await stat(resolve(root, entry));
  if (!info.isFile() || !info.size) throw new Error(`Falta el archivo: ${entry}`);
}

// Check local HTML assets so a build cannot silently publish broken references.
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)];
for (const [, reference] of refs) {
  if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(reference)) continue;
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]).replace(/^\//, '');
  if (!clean) continue;
  const asset = resolve(root, clean);
  const path = relative(root, asset);
  if (path.startsWith('..') || isAbsolute(path)) throw new Error(`Ruta fuera del sitio: ${reference}`);
  if (!(await stat(asset)).isFile()) throw new Error(`Referencia local no válida: ${reference}`);
}

const hosting = JSON.parse(await readFile(resolve(root, '.openai/hosting.json'), 'utf8'));

// Rebuild only these exact generated directories; never follow a redirected dist.
await mkdir(output, { recursive: true });
if (relative(root, await realpath(output)) !== 'dist') {
  throw new Error('La carpeta de salida debe permanecer dentro de este proyecto.');
}
for (const directory of ['client', 'server']) {
  const target = resolve(output, directory);
  if (relative(output, target) !== directory || isAbsolute(relative(output, target))) {
    throw new Error(`Ruta de limpieza no permitida: ${target}`);
  }
  await rm(target, { recursive: true, force: true });
}

for (const entry of entries) {
  await cp(resolve(root, entry), resolve(output, 'client', entry), { recursive: true });
}
await mkdir(resolve(output, 'server'), { recursive: true });
await writeFile(resolve(output, 'server/index.js'), `// Static portfolio: assets are supplied by the hosting platform.
export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Método no permitido.', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return env.ASSETS.fetch(request);
  }
};
`, 'utf8');

await mkdir(resolve(output, '.openai'), { recursive: true });
await writeFile(resolve(output, '.openai/hosting.json'), `${JSON.stringify(hosting, null, 2)}\n`, 'utf8');

async function countFiles(directory) {
  const contents = await readdir(directory, { withFileTypes: true });
  const counts = await Promise.all(contents.map(entry => entry.isDirectory()
    ? countFiles(resolve(directory, entry.name))
    : 1));
  return counts.reduce((sum, count) => sum + count, 0);
}
console.log(`Compilación lista: dist/client (${await countFiles(resolve(output, 'client'))} archivos).`);
console.log('Worker de alojamiento: dist/server/index.js');
