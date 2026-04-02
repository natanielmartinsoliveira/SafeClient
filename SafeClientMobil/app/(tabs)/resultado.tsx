import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  lookupContact,
  requestRemoval,
  type LookupResult,
  type ContactType,
} from '@/utils/api-client';
import { useTranslation } from '@/hooks/use-translation';

const { width } = Dimensions.get('window');

const BG         = '#7B52B8';
const FLAGS_CARD = 'rgba(255,255,255,0.14)';
const DIVIDER    = 'rgba(255,255,255,0.18)';
const TEXT       = '#FFFFFF';
const TEXT_MUTED = 'rgba(255,255,255,0.68)';

type RiskLevel = 'alto' | 'medio' | 'baixo';

function RemovalCard({ contact, contactType }: { contact: string; contactType: ContactType }) {
  const [sending, setSending] = useState(false);
  const [done, setDone]       = useState(false);

  async function handleRequest() {
    if (done) return;
    setSending(true);
    try {
      await requestRemoval({ contact, contactType });
      setDone(true);
      Alert.alert('✅ Solicitação enviada', 'Em até 12 horas os dados serão removidos.');
    } catch (e: any) {
      Alert.alert('Atenção', e?.message ?? 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.removalCard}>
      <Text style={styles.removalTitle}>🛡️ Seus dados aqui?</Text>
      <Text style={styles.removalText}>
        Solicite a remoção dos seus dados. Nossa equipe analisará as informações e em até{' '}
        <Text style={styles.removalBold}>12 horas</Text> os dados serão removidos.
      </Text>
      <TouchableOpacity
        onPress={handleRequest}
        disabled={sending || done}
        activeOpacity={0.8}
        style={[styles.removalLink, (sending || done) && { opacity: 0.6 }]}>
        <Text style={styles.removalLinkText}>
          {done ? '✓ Solicitação enviada' : sending ? 'Enviando...' : 'Solicitar remoção →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function NotFoundCard({ t }: { t: (key: string) => string }) {
  return (
    <View style={styles.notFoundWrap}>
      <Text style={styles.notFoundEmoji}>✅</Text>
      <Text style={styles.notFoundTitle}>{t('resultado.nao_encontrado_titulo')}</Text>
      <Text style={styles.notFoundSub}>{t('resultado.nao_encontrado_sub')}</Text>
      <Text style={styles.notFoundSub}>{t('resultado.nao_encontrado_hint')}</Text>
    </View>
  );
}

function ResultContent({
  result,
  onSaibaMais,
  t,
}: {
  result: LookupResult;
  onSaibaMais: () => void;
  t: (key: string) => string;
}) {
  const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; emoji: string }> = {
    alto:  { label: t('risco.alto'),  color: '#DC2626', bg: '#FEE2E2', emoji: '⚠️' },
    medio: { label: t('risco.medio'), color: '#D97706', bg: '#FEF3C7', emoji: '⚡' },
    baixo: { label: t('risco.baixo'), color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  };

  const risk = RISK_CONFIG[result.riskLevel as RiskLevel];

  return (
    <>
      <TouchableOpacity style={styles.riskBanner} activeOpacity={0.9}>
        <View style={styles.riskLeft}>
          <View style={[styles.riskIconBox, { backgroundColor: risk.bg }]}>
            <Text style={styles.riskEmoji}>{risk.emoji}</Text>
          </View>
          <View>
            <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
            <Text style={styles.riskSub}>
              {result.reportCount}{' '}
              {result.reportCount === 1
                ? t('resultado.advertencia_single')
                : t('resultado.advertencia_plural')}{' '}
              {t('resultado.advertencias')}
            </Text>
          </View>
        </View>
        <Text style={styles.riskChevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.flagsCard}>
        {(result.flags ?? []).map((flag, i) => (
          <View key={flag}>
            <View style={styles.flagRow}>
              <View style={styles.flagCircle}>
                <Text style={styles.flagCheck}>✓</Text>
              </View>
              <Text style={styles.flagText}>{t('flags.' + flag)}</Text>
            </View>
            {i < (result.flags?.length ?? 0) - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      <Text style={styles.recsTitle}>{t('resultado.recomendacoes')}</Text>
      {(result.recommendations ?? []).map((rec, i) => (
        <View key={i} style={styles.recRow}>
          <Text style={styles.recCheck}>✓</Text>
          <Text style={styles.recText}>{rec}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.saibaMaisBtn} onPress={onSaibaMais} activeOpacity={0.85}>
        <Text style={styles.saibaMaisText}>{t('resultado.saiba_mais')}</Text>
      </TouchableOpacity>
    </>
  );
}

export default function ResultadoScreen() {
  const { contact, contactType } = useLocalSearchParams<{
    contact: string;
    contactType: ContactType;
  }>();
  const router = useRouter();
  const { t }  = useTranslation();

  const type = (contactType ?? 'phone') as ContactType;

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<LookupResult | null>(null);

  useEffect(() => {
    if (!contact) return;
    setLoading(true);
    setError(null);
    lookupContact(contact, type)
      .then(setResult)
      .catch((e) => setError(e?.message ?? 'Erro ao consultar. Tente novamente.'))
      .finally(() => setLoading(false));
  }, [contact, type]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      <View style={styles.headerSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('resultado.title')}</Text>
          <View style={styles.backBtn} />
        </View>
        <Svg width={width} height={48} viewBox={`-2 0 ${width + 4} 48`}>
          <Path
            d={`M-2,16 Q${width * 0.5},50 ${width + 2},16 L${width + 2},50 L-2,50 Z`}
            fill={BG}
          />
        </Svg>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll}>

        {loading && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
            <Text style={styles.stateText}>Consultando...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setLoading(true);
                setError(null);
                lookupContact(contact!, type)
                  .then(setResult)
                  .catch((e) => setError(e?.message ?? 'Erro ao consultar.'))
                  .finally(() => setLoading(false));
              }}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && result?.found && (
          <>
            <ResultContent
              result={result}
              t={t}
              onSaibaMais={() =>
                router.push({ pathname: '/registrar-ocorrencia', params: { contact, contactType: type } })
              }
            />
            <RemovalCard contact={contact!} contactType={type} />
          </>
        )}

        {!loading && !error && result && !result.found && (
          <>
            <NotFoundCard t={t} />
            <TouchableOpacity
              style={styles.saibaMaisBtn}
              onPress={() =>
                router.push({ pathname: '/registrar-ocorrencia', params: { contact, contactType: type } })
              }
              activeOpacity={0.85}>
              <Text style={styles.saibaMaisText}>{t('resultado.registrar')}</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  headerSection: { backgroundColor: 'rgba(255,255,255,0.13)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 4,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 34, color: TEXT, lineHeight: 38, fontWeight: '300' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: TEXT, textAlign: 'center' },

  scrollView: { backgroundColor: BG },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Estados
  stateBox: { alignItems: 'center', paddingVertical: 48, gap: 14 },
  stateEmoji: { fontSize: 40 },
  stateText: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
  },
  retryText: { color: TEXT, fontWeight: '600', fontSize: 14 },

  riskBanner: {
    backgroundColor: FLAGS_CARD, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  riskLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  riskIconBox: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  riskEmoji: { fontSize: 22 },
  riskLabel: { fontSize: 19, fontWeight: '700' },
  riskSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  riskChevron: { fontSize: 26, color: TEXT_MUTED },

  flagsCard: { backgroundColor: FLAGS_CARD, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  divider: { height: 1, backgroundColor: DIVIDER },
  flagCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: TEXT_MUTED, alignItems: 'center', justifyContent: 'center' },
  flagCheck: { color: TEXT_MUTED, fontSize: 12, fontWeight: '700' },
  flagText: { fontSize: 15, color: TEXT },

  recsTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 12 },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  recCheck: { color: '#C4A8FF', fontSize: 14, fontWeight: '700', lineHeight: 21 },
  recText: { flex: 1, fontSize: 14, color: TEXT, lineHeight: 21 },

  saibaMaisBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
  },
  saibaMaisText: { color: TEXT, fontSize: 16, fontWeight: '700' },

  removalCard: {
    marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16, padding: 18, gap: 8, backgroundColor: 'rgba(0,0,0,0.15)',
  },
  removalTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  removalText: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19 },
  removalBold: { fontWeight: '700', color: TEXT },
  removalLink: {
    alignSelf: 'flex-start', marginTop: 4,
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  removalLinkText: { fontSize: 13, fontWeight: '700', color: '#D4BBFF' },

  notFoundWrap: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  notFoundEmoji: { fontSize: 52, marginBottom: 8 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  notFoundSub: { fontSize: 14, color: TEXT_MUTED, textAlign: 'center', paddingHorizontal: 24 },
});
