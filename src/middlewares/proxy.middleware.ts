import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private proxy = createProxyMiddleware({
    target: 'http://localhost:3000', // Replace with your target API URL
    changeOrigin: true,
    pathRewrite: {
      '^/api/hello': '/',
    },
  });

  use(req: Request, res: Response, next: (err?: any) => void) {
    if (req.path.startsWith('/api/hello')) {
      this.proxy(req, res, next);
    } else {
      next();
    }
  }
}
