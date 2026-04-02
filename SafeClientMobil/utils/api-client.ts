import HmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';
import { API_BASE_URL, APP_SIGNING_SECRET } from '@/constants/api';

function generateNonce(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/**
 * Executa um fetch autenticado contra a SafeClient API.
 * Assina cada requisição com HMAC-SHA256:
 *   message = "${timestamp}:${nonce}:${METHOD}:${path}"
 *
 * A API valida a assinatura, o timestamp (±30s) e o nonce (anti-replay).
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method    = (options.method ?? 'GET').toUpperCase();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce     = generateNonce();

  const pathOnly  = path.split('?')[0];
  const message   = `${timestamp}:${nonce}:${method}:${pathOnly}`;
  const signature = HmacSHA256(message, APP_SIGNING_SECRET).toString(Hex);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Timestamp':  timestamp,
    'X-Nonce':      nonce,
    'X-Signature':  signature,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error?.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ─── Helpers por endpoint ──────────────────────────────────────────────────

export type ContactType = 'phone' | 'telegram' | 'instagram' | 'email';
export type FlagType =
  | 'tentativa_golpe'
  | 'comportamento_agressivo'
  | 'nao_compareceu'
  | 'perda_de_tempo'
  | 'pagamento_recusado'
  | 'pressao_sem_camisinha';

export interface LookupResult {
  found: boolean;
  contactType?: ContactType;
  riskLevel?: 'alto' | 'medio' | 'baixo';
  reportCount?: number;
  flags?: FlagType[];
  lastReportDate?: string;
  recommendations?: string[];
}

export interface CreateReportPayload {
  contact: string;
  contactType: ContactType;
  flags: FlagType[];
  description?: string;
}

export interface RemovalRequestPayload {
  contact: string;
  contactType: ContactType;
  reason?: string;
}

export function lookupContact(contact: string, contactType: ContactType): Promise<LookupResult> {
  const params = new URLSearchParams({ contact, contactType });
  return apiRequest<LookupResult>(`/contacts/lookup?${params}`);
}

export function createReport(payload: CreateReportPayload): Promise<{ id: string; createdAt: string }> {
  return apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestRemoval(payload: RemovalRequestPayload): Promise<{ id: string; status: string; message: string }> {
  return apiRequest('/removal-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
