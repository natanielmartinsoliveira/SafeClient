import * as crypto from 'crypto';
import { ContactType } from '../enums/contact-type.enum';
import { normalizeContact } from './contact-normalizer.util';

/**
 * Retorna o HMAC-SHA256 (hex) do contato normalizado.
 * O mesmo input + mesmo CONTACT_HASH_SECRET sempre produz o mesmo hash,
 * permitindo lookups determinísticos sem armazenar dados identificáveis.
 *
 * LGPD: nenhum dado pessoal (telefone, e-mail, @usuario) é persistido no banco.
 */
export function hashContact(contact: string, contactType: ContactType): string {
  const secret = process.env.CONTACT_HASH_SECRET;
  if (!secret) {
    throw new Error('CONTACT_HASH_SECRET não definido nas variáveis de ambiente.');
  }
  const normalized = normalizeContact(contact, contactType);
  return crypto.createHmac('sha256', secret).update(normalized).digest('hex');
}
