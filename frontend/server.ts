import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const API_TARGET = (process.env.API_BASE_URL || '').replace(/\/api\/?$/, '');

  // Proxy requests to the remote server, preserving the full path
  app.use(createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    secure: false,
    pathFilter: ['/api', '/uploads'],
    on: {
      proxyRes: (proxyRes: any, req: any) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      },
      error: (err: any, req: any, res: any) => {
        console.error('Proxy Error:', err);
        if (res && !res.headersSent) {
          if (typeof res.status === 'function') {
            res.status(500).send('Proxy Error');
          } else if (typeof res.end === 'function') {
            res.end('Proxy Error');
          }
        }
      }
    }
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Proxying /api to ${API_TARGET}`);
  });
}

startServer();
