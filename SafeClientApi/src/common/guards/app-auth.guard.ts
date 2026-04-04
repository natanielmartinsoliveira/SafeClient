import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';
import { nonceStore } from './nonce-store';

/**
 * Guard de autenticação para a SafeClient API.
 *
 * Rotas HMAC (app mobile / web server):
 *   Assina com HMAC-SHA256( "${timestamp}:${nonce}:${method}:${path}", APP_SIGNING_SECRET )
 *
 * Rota /contacts/ (server-to-server):
 *   Aceita x-api-key (bot, web Next.js, mobile atualizado)
 *   OU HMAC (mobile legado / web legado) como fallback
 *
 * Proteções HMAC:
 *   - Sem o secret → assinatura inválida
 *   - Timestamp fora de ±windowSec → rejeitado
 *   - Nonce já usado → rejeitado (anti-replay)
 */
@Injectable()
export class AppAuthGuard implements CanActivate {
  private readonly windowSec = parseInt(process.env.SIGNATURE_WINDOW_SEC ?? '300', 10);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Preflight CORS — deixa passar sem autenticação
    if (req.method === 'OPTIONS') return true;

    // Em desenvolvimento, bypassa tudo para facilitar testes via Swagger/curl
    if (process.env.NODE_ENV !== 'production') return true;

    // /contacts/ — aceita x-api-key OU HMAC
    if (req.path.startsWith('/contacts/')) {
      return this.checkContactsAuth(req);
    }

    // Rotas públicas sem qualquer autenticação
    if (
      req.path.startsWith('/auth/') ||
      req.path.startsWith('/web/') ||
      req.path.startsWith('/admin/') ||
      req.path.startsWith('/removal-requests')
    )
      return true;

    // Demais rotas — HMAC completo
    return this.validateHmac(req);
  }

  /**
   * /contacts/ aceita dois mecanismos de autenticação:
   *   1. x-api-key  → server-to-server (bot, web Next.js, mobile atualizado)
   *   2. HMAC       → fallback para clientes legados que ainda não atualizaram
   *
   * Se CONTACTS_API_KEY não estiver configurado, permite acesso (opt-in).
   */
  private checkContactsAuth(req: Request): boolean {
    const configuredKey = process.env.CONTACTS_API_KEY;

    // Chave não configurada → acesso permitido (compatibilidade retroativa)
    if (!configuredKey) return true;

    const providedKey = (req.headers['x-api-key'] as string) ?? '';

    if (providedKey) {
      // x-api-key presente → valida com timingSafeEqual (previne timing attack)
      const pad = 64;
      const a = Buffer.from(configuredKey.padEnd(pad, '\0').substring(0, pad));
      const b = Buffer.from(providedKey.padEnd(pad, '\0').substring(0, pad));

      if (!crypto.timingSafeEqual(a, b)) {
        throw new UnauthorizedException('API key inválida.');
      }
      return true;
    }

    // Sem x-api-key → tenta HMAC (fallback para clientes legados)
    const timestamp = req.headers['x-timestamp'] as string;
    const nonce = req.headers['x-nonce'] as string;
    const signature = req.headers['x-signature'] as string;

    if (timestamp && nonce && signature) {
      return this.validateHmac(req);
    }

    throw new UnauthorizedException('Autenticação necessária: envie x-api-key ou headers HMAC.');
  }

  /**
   * Validação HMAC completa — usada por rotas protegidas e como fallback de /contacts/.
   */
  private validateHmac(req: Request): boolean {
    const timestamp = req.headers['x-timestamp'] as string;
    const nonce = req.headers['x-nonce'] as string;
    const signature = req.headers['x-signature'] as string;

    if (!timestamp || !nonce || !signature) {
      throw new UnauthorizedException('Headers de autenticação ausentes.');
    }

    // 1. Valida timestamp
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
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

    const message = `${timestamp}:${nonce}:${req.method}:${req.path}`;
    const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');

    // timingSafeEqual previne timing attacks
    const sigBuf = Buffer.from(signature.padEnd(64, '0'));
    const expBuf = Buffer.from(expected.padEnd(64, '0'));
    const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      throw new UnauthorizedException('Assinatura inválida.');
    }

    // 4. Registra nonce para impedir reuso
    nonceStore.add(nonce);
    return true;
  }
}
