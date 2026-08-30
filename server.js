import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    let reqUrl = decodeURIComponent(req.url.split('?')[0]);

    if (reqUrl === '/api/inspect-headers') {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const headerData = {
        clientIp,
        httpVersion: req.httpVersion,
        method: req.method,
        headers: req.headers,
        timestamp: new Date().toISOString()
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(headerData, null, 2));
      return;
    }

    if (reqUrl === '/api/ip-intel') {
      const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').replace(/^::ffff:/, '');
      const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');
      const intel = {
        ip: clientIp,
        isLoopback,
        connectionType: isLoopback ? 'Localhost / Intranet' : 'Public WAN',
        detectedProtocols: ['HTTP/' + req.httpVersion],
        timestamp: new Date().toISOString()
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(intel, null, 2));
      return;
    }

    if (reqUrl === '/') reqUrl = '/index.html';

    const rootDir = path.resolve(__dirname);
    const safePath = path.normalize(path.join(rootDir, reqUrl));

    if (!safePath.toLowerCase().startsWith(rootDir.toLowerCase())) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden: Directory traversal prohibited');
      return;
    }

    const extname = String(path.extname(safePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(safePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[!] Port ${port} is occupied, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  Browser Auditor Engine running at: http://localhost:${port}`);
    console.log(`======================================================\n`);
  });
}

startServer(Number(PORT));
