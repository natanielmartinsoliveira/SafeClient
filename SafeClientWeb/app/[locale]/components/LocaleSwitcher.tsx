'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { routing, type Locale } from '../../../i18n/routing';

const FLAGS: Record<Locale, string> = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
      window.location.reload();
    });
  }

  return (
    <div className="relative flex items-center" title={t('pt')}>
      <span className="text-base mr-1 pointer-events-none select-none">{FLAGS[locale]}</span>
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        className="appearance-none bg-transparent text-xs font-semibold pr-4 cursor-pointer outline-none disabled:opacity-50"
        style={{ color: 'inherit' }}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} style={{ color: '#2E1B6E', background: '#FFFFFF' }}>
            {t(l)}
          </option>
        ))}
      </select>
      <span className="text-xs pointer-events-none select-none" style={{ marginLeft: -14 }}>▾</span>
    </div>
  );
}
