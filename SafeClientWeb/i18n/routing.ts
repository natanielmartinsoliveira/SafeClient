import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt', 'en', 'es'] as const,
  defaultLocale: 'pt',
  localePrefix: 'never',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
