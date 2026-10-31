import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
const root = resolve('dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.csv':'text/csv','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg'};
createServer(async (req,res) => {
  const path = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  const file = resolve(root, '.'+path, path.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(root+'/') && file !== root) { res.writeHead(403).end(); return; }
  try { const s = await stat(file); if (!s.isFile()) throw Error('not file'); res.writeHead(200,{'Content-Type':mime[extname(file)] || 'application/octet-stream'}); res.end(await readFile(file)); }
  catch { res.writeHead(404).end('Not found'); }
}).listen(4173,'127.0.0.1',()=>console.log('Preview at http://127.0.0.1:4173'));
