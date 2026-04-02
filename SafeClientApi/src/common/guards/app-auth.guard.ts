import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';
import { nonceStore } from './nonce-store';

/**
 * Guard de autenticação HMAC para o app mobile.
 *
 * O app assina cada requisição com:
 *   HMAC-SHA256( "${timestamp}:${nonce}:${method}:${path}", APP_SIGNING_SECRET )
 *
 * Proteções:
 *   - Sem o secret → assinatura inválida
 *   - Timestamp fora de ±30s → rejeitado (relógio desync tolerado)
 *   - Nonce já usado → rejeitado (replay attack)
 */
@Injectable()
export class AppAuthGuard implements CanActivate {
  private readonly windowSec = parseInt(process.env.SIGNATURE_WINDOW_SEC ?? '300', 10);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Preflight CORS — deixa passar sem autenticação
    if (req.method === 'OPTIONS') return true;

    // Rotas públicas (sem HMAC): auth + web + admin (protegidas por JWT no controller)
    if (req.path.startsWith('/auth/') || req.path.startsWith('/web/') || req.path.startsWith('/admin/')) return true;

    const timestamp = req.headers['x-timestamp'] as string;
    const nonce     = req.headers['x-nonce']     as string;
    const signature = req.headers['x-signature'] as string;

    if (!timestamp || !nonce || !signature) {
      throw new UnauthorizedException('Headers de autenticação ausentes.');
    }

    // 1. Valida timestamp
    const now = Math.floor(Date.now() / 1000);
    const ts  = parseInt(timestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > this.windowSec) {
      throw new UnauthorizedException('Timestamp inválido ou expirado.');
    }

    // 2. Valida nonce (anti-replay)
    if (nonceStore.has(nonce)) {
      throw new UnauthorizedException('Nonce já utilizado.');
    }

    // 3. Valida assinatura
    const secret = process.env.APP_SIGNING_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Configuração de segurança ausente no servidor.');
    }

    const message  = `${timestamp}:${nonce}:${req.method}:${req.path}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    // timingSafeEqual previne timing attacks
    const sigBuf = Buffer.from(signature.padEnd(64, '0'));
    const expBuf = Buffer.from(expected.padEnd(64, '0'));
    const valid  = sigBuf.length === expBuf.length &&
                   crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      throw new UnauthorizedException('Assinatura inválida.');
    }

    // 4. Registra nonce para impedir reuso
    nonceStore.add(nonce);
    return true;
  }
}
