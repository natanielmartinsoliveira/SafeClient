import { lookupContact, type ContactType, type FlagType, type LookupResult } from '@/lib/api';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import RemovalRequestButton from '../components/RemovalRequestButton';

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string; contactType?: string }>;
}) {
  const t = await getTranslations('Resultado');
  const tf = await getTranslations('Flags');
  const { contact, contactType } = await searchParams;

  const FLAG_LABELS: Record<FlagType, string> = {
    tentativa_golpe: tf('tentativa_golpe'),
    comportamento_agressivo: tf('comportamento_agressivo'),
    nao_compareceu: tf('nao_compareceu'),
    perda_de_tempo: tf('perda_de_tempo'),
    pagamento_recusado: tf('pagamento_recusado'),
    pressao_sem_camisinha: tf('pressao_sem_camisinha'),
  };

  const RISK_CONFIG = {
    alto: { label: t('riskHigh'), color: '#DC2626', bg: '#FEE2E2', emoji: '⚠️' },
    medio: { label: t('riskMedium'), color: '#D97706', bg: '#FEF3C7', emoji: '⚡' },
    baixo: { label: t('riskLow'), color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  };

  let result: LookupResult | null = null;
  let error: string | null = null;

  if (contact && contactType) {
    try {
      result = await lookupContact(contact, contactType as ContactType);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Erro ao consultar. Tente novamente.';
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: '#7B52B8' }}>
      <div className="w-full" style={{ background: 'rgba(255,255,255,0.13)' }}>
        <div className="w-full max-w-2xl mx-auto px-6 pt-6 pb-4 text-center">
          <h1 className="text-lg font-bold text-white">{t('title')}</h1>
        </div>
        <svg
          width="100%"
          height="48"
          viewBox="-2 0 1444 48"
          preserveAspectRatio="none"
          display="block"
        >
          <path d="M-2,16 Q721,50 1446,16 L1446,50 L-2,50 Z" fill="#7B52B8" />
        </svg>
      </div>

      <div className="w-full max-w-2xl px-6 py-6 flex flex-col gap-5" style={{ marginTop: -1 }}>
        {error && (
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            <span className="text-4xl">⚠️</span>
            <p className="text-white text-sm text-center">{error}</p>
            <Link
              href="/"
              className="px-6 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              {t('retry')}
            </Link>
          </div>
        )}

        {result?.found &&
          (() => {
            const risk = RISK_CONFIG[result.riskLevel!];
            return (
              <>
                {/* Risk banner */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: risk.bg }}
                  >
                    {risk.emoji}
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: risk.color }}>
                      {risk.label}
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {result.reportCount}{' '}
                      {result.reportCount === 1 ? t('warningOne') : t('warningMany')}
                    </p>
                  </div>
                </div>

                {/* Flags */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.14)' }}
                >
                  {(result.flags ?? []).map((flag, i) => (
                    <div key={flag}>
                      <div className="flex items-center gap-3 px-5 py-4">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}
                        >
                          <span className="text-xs text-white font-bold">✓</span>
                        </div>
                        <span className="text-white text-sm">{FLAG_LABELS[flag] ?? flag}</span>
                      </div>
                      {i < (result.flags ?? []).length - 1 && (
                        <div
                          style={{
                            height: 1,
                            background: 'rgba(255,255,255,0.15)',
                            marginLeft: 56,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {(result.recommendations ?? []).length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-white mb-3">{t('recommendations')}</p>
                    <div className="flex flex-col gap-2">
                      {(result.recommendations ?? []).map((rec, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span
                            className="text-sm font-bold mt-0.5 flex-shrink-0"
                            style={{ color: '#C4A8FF' }}
                          >
                            ✓
                          </span>
                          <span className="text-sm text-white leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Removal request */}
                <RemovalRequestButton contact={contact!} contactType={contactType!} />
              </>
            );
          })()}

        {result && !result.found && (
          <div className="flex flex-col items-center gap-4 py-12">
            <span className="text-6xl">✅</span>
            <p className="text-xl font-bold text-white">{t('noReports')}</p>
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('noReportsDesc1')}
            </p>
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('noReportsDesc2')}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="w-full py-4 rounded-2xl text-white text-center font-bold text-sm transition-colors"
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          {t('newSearch')}
        </Link>
      </div>
    </main>
  );
}
