// Polyfill globalThis.crypto for Node 18 + @nestjs/schedule v5 compatibility.
// Node 18 ships the Web Crypto API but does not always expose it as `globalThis.crypto`.
import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}
