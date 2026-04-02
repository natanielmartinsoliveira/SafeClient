/**
 * Armazena nonces recentes em memória para prevenir replay attacks.
 * Cada nonce expira junto com a janela de tempo do timestamp (60s).
 * Em produção com múltiplas instâncias, substituir por Redis.
 */
export class NonceStore {
  private readonly store = new Map<string, number>();
  private readonly ttlMs: number;

  constructor(ttlSeconds = 60) {
    this.ttlMs = ttlSeconds * 1000;
    // Limpa entradas expiradas a cada minuto
    setInterval(() => this.cleanup(), 60_000);
  }

  has(nonce: string): boolean {
    return this.store.has(nonce);
  }

  add(nonce: string): void {
    this.store.set(nonce, Date.now());
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [nonce, ts] of this.store.entries()) {
      if (ts < cutoff) this.store.delete(nonce);
    }
  }
}

export const nonceStore = new NonceStore(60);
