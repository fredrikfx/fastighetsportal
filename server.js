// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    
    // Hantera förfrågningar till /assets genom att serva från assets-mappen
    if (pathname.startsWith('/assets/')) {
      const filePath = path.join(__dirname, pathname);
      try {
        const fileContent = fs.readFileSync(filePath);
        
        // Ställ in Content-Type baserat på filtyp
        const ext = path.extname(filePath);
        const contentTypeMap = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        
        res.setHeader('Content-Type', contentTypeMap[ext.toLowerCase()] || 'application/octet-stream');
        res.end(fileContent);
        return;
      } catch (err) {
        console.error(`Failed to serve ${filePath}:`, err);
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
    }
    
    // Hantera alla andra förfrågningar med Next.js
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});