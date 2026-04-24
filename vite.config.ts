import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { ViteDevServer } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/yt')) {
            try {
              // Parse query strings manually
              const [path, query] = req.url.split('?');
              const params = new URLSearchParams(query);
              const fakeReq = {
                method: req.method,
                query: Object.fromEntries(params.entries())
              } as any;
              
              // Dynamic import of our handler
              const handler = (await server.ssrLoadModule('/api/yt.ts')).default;
              
              // Basic mock of res.status and res.json
              const fakeRes = {
                setHeader: res.setHeader.bind(res),
                status(code: number) {
                  res.statusCode = code;
                  return fakeRes;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end: res.end.bind(res)
              } as any;

              await handler(fakeReq, fakeRes);
            } catch (err: any) {
              res.statusCode = 500;
              res.end(err.message);
            }
          } else {
            next();
          }
        });
      }
    }
  ],
});
