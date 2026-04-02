import { createHmac, randomBytes } from 'crypto';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';
const SECRET  = process.env.APP_SIGNING_SECRET ?? '';

function sign(method: string, path: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce     = randomBytes(8).toString('hex');
  const message   = `${timestamp}:${nonce}:${method}:${path}`;
  const signature = createHmac('sha256', SECRET).update(message).digest('hex');
  return { timestamp, nonce, signature };
}

export type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';
export type FlagType =
  | 'tentativa_golpe'
  | 'comportamento_agressivo'
  | 'nao_compareceu'
  | 'perda_de_tempo'
  | 'pagamento_recusado'
  | 'pressao_sem_camisinha';

export interface LookupResult {
  found:            boolean;
  contactType?:     ContactType;
  riskLevel?:       'alto' | 'medio' | 'baixo';
  reportCount?:     number;
  flags?:           FlagType[];
  lastReportDate?:  string;
  recommendations?: string[];
}

export async function lookupContact(
  contact: string,
  contactType: ContactType,
): Promise<LookupResult> {
  const path   = '/contacts/lookup';
  const params = new URLSearchParams({ contact, contactType });
  const { timestamp, nonce, signature } = sign('GET', path);

  const res = await fetch(`${API_URL}${path}?${params}`, {
    headers: {
      'X-Timestamp': timestamp,
      'X-Nonce':     nonce,
      'X-Signature': signature,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<LookupResult>;
}
