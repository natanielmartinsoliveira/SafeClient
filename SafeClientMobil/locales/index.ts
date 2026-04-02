import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

import en from './en';
import pt from './pt';
import es from './es';
import fr from './fr';
import it from './it';

const i18n = new I18n({ en, pt, es, fr, it });

// Detecta o idioma do dispositivo automaticamente
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';

// Mapeia variantes (ex: pt-BR → pt, fr-CA → fr)
const SUPPORTED = ['en', 'pt', 'es', 'fr', 'it'];
i18n.locale = SUPPORTED.includes(deviceLocale) ? deviceLocale : 'en';

// Fallback para inglês se alguma chave não existir
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

/** Idioma atualmente ativo */
export function getActiveLocale() {
  return i18n.locale;
}

/** Troca manual de idioma (útil para settings futuros) */
export function setLocale(lang: string) {
  i18n.locale = lang;
}
