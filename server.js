// Production entry point for Hostinger / LiteSpeed Node.js runtime (lsnode.js)
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Auto-load .env / .env.production if available
const loadEnvFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  } catch (e) {}
};

loadEnvFile(path.join(__dirname, '.env.production'));
loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(process.cwd(), '.env.production'));
loadEnvFile(path.join(process.cwd(), '.env'));

// Production API URLs fallback for Hostinger
if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL.includes('.local')) {
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://admin.sandiegobusinesscircle.com';
}
if (!process.env.WORDPRESS_API_URL || process.env.WORDPRESS_API_URL.includes('.local')) {
  process.env.WORDPRESS_API_URL = 'https://admin.sandiegobusinesscircle.com';
}

// Check candidate directories for the production .next build
const candidateDirs = [
  __dirname,
  process.cwd(),
  path.join(__dirname, 'nodejs'),
  path.join(__dirname, '..'),
  path.join(process.cwd(), 'nodejs'),
  path.join(process.cwd(), '..'),
];

let appDir = __dirname;
let buildFound = false;

for (const dir of candidateDirs) {
  if (fs.existsSync(path.join(dir, '.next', 'BUILD_ID'))) {
    appDir = dir;
    buildFound = true;
    console.log(`> Located Next.js production build in: ${path.join(dir, '.next')}`);
    break;
  }
}

// Fallback: If standalone build exists
const standaloneServer = path.join(appDir, '.next', 'standalone', 'server.js');
if (fs.existsSync(standaloneServer)) {
  require(standaloneServer);
} else {
  const next = require('next');
  const port = parseInt(process.env.PORT || '3000', 10);
  const hostname = '0.0.0.0';

  if (!buildFound) {
    console.warn(`! Warning: .next/BUILD_ID not found in candidate paths: ${candidateDirs.join(', ')}`);
  }

  const app = next({ dev: false, hostname, port, dir: appDir });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      const server = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error('Error handling request:', req.url, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        }
      });

      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Next.js production server ready on http://${hostname}:${port} (dir: ${appDir})`);
      });
    })
    .catch((err) => {
      console.error('Fatal error during Next.js server startup:', err);
      process.exit(1);
    });
}
