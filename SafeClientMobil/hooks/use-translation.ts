import i18n from '@/locales';

/**
 * Retorna a função `t` para tradução e o locale atual.
 * Uso: const { t } = useTranslation();
 *      t('buscar.button') → "Analisar" / "Analyze" / etc.
 */
export function useTranslation() {
  return {
    t: (key: string, options?: Record<string, unknown>) =>
      i18n.t(key, options),
    locale: i18n.locale,
  };
}
