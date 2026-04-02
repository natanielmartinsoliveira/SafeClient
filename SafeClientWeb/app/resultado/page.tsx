import { lookupContact, type ContactType, type FlagType, type LookupResult } from '@/lib/api';
import Link from 'next/link';

const FLAG_LABELS: Record<FlagType, string> = {
  tentativa_golpe: 'Tentativa de Golpe',
  comportamento_agressivo: 'Comportamento Agressivo',
  nao_compareceu: 'Não Compareceu',
  perda_de_tempo: 'Perda de Tempo',
  pagamento_recusado: 'Pagamento Recusado',
  pressao_sem_camisinha: 'Pressão Sem Camisinha',
};

const RISK_CONFIG = {
  alto: { label: 'Alto Risco', color: '#DC2626', bg: '#FEE2E2', emoji: '⚠️' },
  medio: { label: 'Risco Médio', color: '#D97706', bg: '#FEF3C7', emoji: '⚡' },
  baixo: { label: 'Baixo Risco', color: '#059669', bg: '#D1FAE5', emoji: '✅' },
};

function RiskBanner({ result }: { result: LookupResult }) {
  const risk = RISK_CONFIG[result.riskLevel!];
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}
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
          {result.reportCount === 1 ? 'advertência registrada' : 'advertências registradas'}
        </p>
      </div>
    </div>
  );
}

function FlagsCard({ flags }: { flags: FlagType[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.14)' }}>
      {flags.map((flag, i) => (
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
          {i < flags.length - 1 && (
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginLeft: 56 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function RecommendationsSection({ recs }: { recs: string[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-white mb-3">Recomendações</p>
      <div className="flex flex-col gap-2">
        {recs.map((rec, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-sm font-bold mt-0.5 flex-shrink-0" style={{ color: '#C4A8FF' }}>
              ✓
            </span>
            <span className="text-sm text-white leading-relaxed">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotFoundCard() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <span className="text-6xl">✅</span>
      <p className="text-xl font-bold text-white">Nenhum relato encontrado</p>
      <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Este contato não possui ocorrências registradas.
      </p>
      <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Se tiver uma experiência negativa, use o app para registrar.
      </p>
    </div>
  );
}

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string; contactType?: string }>;
}) {
  const { contact, contactType } = await searchParams;

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
      {/* Título + onda */}
      <div className="w-full" style={{ background: 'rgba(255,255,255,0.13)' }}>
        <div className="w-full max-w-2xl mx-auto px-6 pt-6 pb-4 text-center">
          <h1 className="text-lg font-bold text-white">Resultado da Análise</h1>
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

      {/* Conteúdo principal */}
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
              Tentar novamente
            </Link>
          </div>
        )}

        {result?.found && (
          <>
            <RiskBanner result={result} />
            <FlagsCard flags={result.flags ?? []} />
            <RecommendationsSection recs={result.recommendations ?? []} />
          </>
        )}

        {result && !result.found && <NotFoundCard />}

        {/* Nova consulta */}
        <Link
          href="/"
          className="w-full py-4 rounded-2xl text-white text-center font-bold text-sm transition-colors"
          style={{
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          ← Nova consulta
        </Link>
      </div>
    </main>
  );
}
