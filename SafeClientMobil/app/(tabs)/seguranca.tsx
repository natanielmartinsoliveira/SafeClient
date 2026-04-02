import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { AppColors } from '@/constants/theme';
import { SAFETY_TIPS } from '@/data/mock';
import { useTranslation } from '@/hooks/use-translation';
import { useNearbyPlaces, formatDistance } from '@/hooks/use-nearby-places';

const COUNTDOWN = 5;

function ActionCard({
  emoji,
  title,
  subtitle,
  onPress,
  dark,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, dark && styles.actionCardDark]}
      onPress={onPress}
      activeOpacity={0.85}>
      <View style={styles.actionLeft}>
        <Text style={styles.actionEmoji}>{emoji}</Text>
        <View>
          <Text style={[styles.actionTitle, dark && styles.actionTitleDark]}>{title}</Text>
          <Text style={[styles.actionSubtitle, dark && styles.actionSubtitleDark]}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.actionChevron, dark && styles.actionChevronDark]}>›</Text>
    </TouchableOpacity>
  );
}

function EmergencyModal({
  visible,
  onCancel,
  onSend,
}: {
  visible: boolean;
  onCancel: () => void;
  onSend: () => void;
}) {
  const [count, setCount]     = useState(COUNTDOWN);
  const progress              = useRef(new Animated.Value(1)).current;
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef               = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      setCount(COUNTDOWN);
      progress.setValue(1);
      return;
    }

    // Barra de progresso regressiva
    animRef.current = Animated.timing(progress, {
      toValue: 0,
      duration: COUNTDOWN * 1000,
      useNativeDriver: false,
    });
    animRef.current.start();

    // Contador numérico
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          onSend();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current!);
      animRef.current?.stop();
    };
  }, [visible]);

  function handleCancel() {
    clearInterval(timerRef.current!);
    animRef.current?.stop();
    setCount(COUNTDOWN);
    progress.setValue(1);
    onCancel();
  }

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={modal.overlay}>
        <View style={modal.box}>
          {/* Ícone */}
          <View style={modal.iconWrap}>
            <Text style={modal.icon}>🚨</Text>
          </View>

          <Text style={modal.title}>Enviando localização</Text>
          <Text style={modal.subtitle}>
            Sua localização atual será enviada{'\n'}pelo WhatsApp em:
          </Text>

          {/* Contagem */}
          <Text style={modal.count}>{count}</Text>

          {/* Barra de progresso */}
          <View style={modal.barTrack}>
            <Animated.View style={[modal.barFill, { width: barWidth }]} />
          </View>

          <Text style={modal.hint}>O envio acontece automaticamente</Text>

          {/* Botão cancelar */}
          <TouchableOpacity style={modal.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
            <Text style={modal.cancelText}>✕  Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

type CheckInState = 'loading' | 'ready' | 'error';

interface CheckInData {
  address: string;
  mapsLink: string;
}

function CheckInModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [state, setState]   = useState<CheckInState>('loading');
  const [data, setData]     = useState<CheckInData | null>(null);
  const scaleAnim           = useRef(new Animated.Value(0.9)).current;
  const opacityAnim         = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setState('loading');
      setData(null);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    getLocation();
  }, [visible]);

  async function getLocation() {
    setState('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState('error');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const parts = [geo?.street, geo?.name, geo?.district, geo?.city].filter(Boolean);
      const address = parts.length > 0
        ? parts.join(', ')
        : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      setData({
        address,
        mapsLink: `https://maps.google.com/?q=${latitude},${longitude}`,
      });
      setState('ready');
    } catch {
      setState('error');
    }
  }

  async function handleShare() {
    if (!data) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msg = encodeURIComponent(
      `📍 Estou segura aqui:\n${data.address}\n\n${data.mapsLink}`
    );
    const whatsappUrl = `whatsapp://send?text=${msg}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    await Linking.openURL(canOpen ? whatsappUrl : `https://wa.me/?text=${msg}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={checkin.overlay}>
        <Animated.View style={[checkin.box, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>

          <View style={checkin.iconWrap}>
            <Text style={checkin.icon}>📍</Text>
          </View>

          <Text style={checkin.title}>Minha localização segura</Text>

          {state === 'loading' && (
            <>
              <ActivityIndicator size="large" color={AppColors.primary} style={{ marginVertical: 12 }} />
              <Text style={checkin.hint}>Obtendo sua localização...</Text>
            </>
          )}

          {state === 'error' && (
            <>
              <Text style={checkin.errorText}>
                Não foi possível obter a localização.{'\n'}Verifique as permissões do app.
              </Text>
              <TouchableOpacity style={checkin.retryBtn} onPress={getLocation} activeOpacity={0.8}>
                <Text style={checkin.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </>
          )}

          {state === 'ready' && data && (
            <>
              <View style={checkin.addressBox}>
                <Text style={checkin.addressLabel}>Endereço atual</Text>
                <Text style={checkin.addressText}>{data.address}</Text>
                <Text style={checkin.mapsLink} numberOfLines={1}>{data.mapsLink}</Text>
              </View>

              <TouchableOpacity style={checkin.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                <Text style={checkin.shareIcon}>💬</Text>
                <Text style={checkin.shareText}>Compartilhar no WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={checkin.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={checkin.closeText}>Fechar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function SegurancaScreen() {
  const { t } = useTranslation();
  const { places, loading, error, permissionDenied, refresh } = useNearbyPlaces();
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [checkInVisible, setCheckInVisible]     = useState(false);

  async function sendWhatsApp() {
    setEmergencyVisible(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Ative a localização para usar o botão de emergência.');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = loc.coords;
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const msg = encodeURIComponent(`🚨 PRECISO DE AJUDA! Minha localização agora:\n${mapsLink}`);

    const whatsappUrl = `whatsapp://send?text=${msg}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    await Linking.openURL(canOpen ? whatsappUrl : `https://wa.me/?text=${msg}`);
  }

  async function handleEmergency() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setEmergencyVisible(true);
  }

  async function handleCheckIn() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckInVisible(true);
  }

  function handleDicas() {
    Alert.alert('💡 ' + t('seguranca.dicas_titulo'), SAFETY_TIPS.join('\n\n'), [
      { text: t('seguranca.entendido') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <EmergencyModal
        visible={emergencyVisible}
        onCancel={() => setEmergencyVisible(false)}
        onSend={sendWhatsApp}
      />
      <CheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('seguranca.title')}</Text>

        <View style={styles.actionsSection}>
          <ActionCard
            emoji="🚨"
            title={t('seguranca.emergencia_titulo')}
            subtitle={t('seguranca.emergencia_sub')}
            onPress={handleEmergency}
            dark
          />
          <ActionCard
            emoji="📍"
            title={t('seguranca.checkin_titulo')}
            subtitle={t('seguranca.checkin_sub')}
            onPress={handleCheckIn}
            dark
          />
        </View>

        <TouchableOpacity style={styles.tipsCard} onPress={handleDicas} activeOpacity={0.85}>
          <View style={styles.tipsLeft}>
            <Text style={styles.tipsTitle}>{t('seguranca.dicas_titulo')}</Text>
          </View>
          <Text style={styles.tipsChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.tipPreview}>
          <Text style={styles.tipPreviewIcon}>💜</Text>
          <Text style={styles.tipPreviewText}>{SAFETY_TIPS[0]}</Text>
        </View>

        {/* Locais próximos via OpenStreetMap */}
        <View style={styles.locaisSection}>
          <View style={styles.locaisHeader}>
            <Text style={styles.sectionTitle}>{t('seguranca.locais_proximos')}</Text>
            {!loading && (
              <TouchableOpacity onPress={refresh} activeOpacity={0.7}>
                <Text style={styles.refreshBtn}>↻ Atualizar</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <View style={styles.stateBox}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.stateText}>Buscando locais próximos...</Text>
            </View>
          )}

          {permissionDenied && !loading && (
            <View style={styles.stateBox}>
              <Text style={styles.stateEmoji}>📍</Text>
              <Text style={styles.stateText}>
                Permissão de localização negada. Habilite nas configurações do dispositivo.
              </Text>
            </View>
          )}

          {error && !loading && !permissionDenied && (
            <View style={styles.stateBox}>
              <Text style={styles.stateEmoji}>⚠️</Text>
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={refresh} activeOpacity={0.8}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && !permissionDenied && places.length === 0 && (
            <View style={styles.stateBox}>
              <Text style={styles.stateEmoji}>🔍</Text>
              <Text style={styles.stateText}>Nenhum local encontrado num raio de 2,5 km.</Text>
            </View>
          )}

          {!loading && places.map((loc) => (
            <View key={loc.id} style={styles.locCard}>
              <Text style={styles.locEmoji}>{loc.emoji}</Text>
              <View style={styles.locLeft}>
                <Text style={styles.locName} numberOfLines={1}>{loc.name}</Text>
                <View style={styles.locTypeBadge}>
                  <Text style={styles.locTypeText}>{loc.type}</Text>
                </View>
              </View>
              <Text style={styles.locDistance}>{formatDistance(loc.distanceM)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 34 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  count: {
    fontSize: 64,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 72,
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
});

const checkin = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    gap: 14,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 34 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.primary,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: AppColors.primaryLight,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.primary,
  },
  addressBox: {
    width: '100%',
    backgroundColor: AppColors.primaryLight,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    lineHeight: 22,
  },
  mapsLink: {
    fontSize: 11,
    color: AppColors.primary,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 50,
    paddingVertical: 14,
    width: '100%',
  },
  shareIcon: { fontSize: 18 },
  shareText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 24,
  },
  actionsSection: {
    gap: 10,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  actionCardDark: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionEmoji: { fontSize: 24 },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  actionTitleDark: { color: '#FFFFFF' },
  actionSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  actionSubtitleDark: { color: 'rgba(255,255,255,0.7)' },
  actionChevron: {
    fontSize: 24,
    color: AppColors.textSecondary,
    fontWeight: '300',
  },
  actionChevronDark: { color: '#FFFFFF' },

  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    marginBottom: 12,
  },
  tipsLeft: { flex: 1 },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  tipsChevron: {
    fontSize: 24,
    color: AppColors.textSecondary,
  },

  tipPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: AppColors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
  },
  tipPreviewIcon: { fontSize: 16 },
  tipPreviewText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.primaryDark,
    lineHeight: 18,
  },

  locaisSection: { gap: 10 },
  locaisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  refreshBtn: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '600',
  },

  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  stateEmoji: { fontSize: 32 },
  stateText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: AppColors.primary,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  locCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  locEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  locLeft: { flex: 1, gap: 4 },
  locName: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  locTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  locTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.primary,
  },
  locDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textSecondary,
    minWidth: 52,
    textAlign: 'right',
  },
});
