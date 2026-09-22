import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('El puerto debe ser un número entre 1 y 65535.');
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

function message(response, code, body, headers = {}) {
  response.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  response.end(body);
}

const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(request.method)) {
    return message(response, 405, 'Método no permitido.', { Allow: 'GET, HEAD' });
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const localPath = pathname === '/' ? 'index.html' : pathname.slice(1);
    const segments = localPath.split('/');
    if (localPath.includes('\\') || localPath.includes('\0') || segments.some(part => part.startsWith('.'))) {
      return message(response, 404, 'Archivo no encontrado.');
    }
    if (localPath !== 'index.html' && !['assets', 'css', 'js'].includes(segments[0])) {
      return message(response, 404, 'Archivo no encontrado.');
    }
    const file = await realpath(resolve(root, ...segments));
    const local = relative(root, file);
    if (local.startsWith(`..${sep}`) || local === '..' || isAbsolute(local)) {
      return message(response, 404, 'Archivo no encontrado.');
    }
    const info = await stat(file);
    if (!info.isFile()) return message(response, 404, 'Archivo no encontrado.');

    response.writeHead(200, {
      'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
    });
    if (request.method === 'HEAD') return response.end();
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error instanceof URIError) return message(response, 400, 'Dirección no válida.');
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return message(response, 404, 'Archivo no encontrado.');
    }
    console.error(error.message);
    return message(response, 500, 'No se pudo leer el archivo.');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `El puerto ${port} está ocupado. Usa npm run dev -- --port 4174.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Portafolio Migdalia: http://127.0.0.1:${port}/`);
  console.log('Pulsa Ctrl+C para detener el servidor.');
});
