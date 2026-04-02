import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ContactType } from '@/data/mock';

const { width, height } = Dimensions.get('window');
const COUNTDOWN = 5;
const BG = '#1A1026';

export default function AdScreen() {
  const router = useRouter();
  const { contact, contactType } = useLocalSearchParams<{
    contact: string;
    contactType: ContactType;
  }>();

  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [canSkip, setCanSkip]   = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Barra de progresso
    Animated.timing(progress, {
      toValue: 1,
      duration: COUNTDOWN * 1000,
      useNativeDriver: false,
    }).start();

    // Contador regressivo
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function handleSkip() {
    router.replace({
      pathname: '/(tabs)/resultado',
      params: { contact, contactType },
    });
  }

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Barra de progresso no topo */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: barWidth }]} />
      </View>

      {/* Label publicidade + botão pular */}
      <View style={styles.topRow}>
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Publicidade</Text>
        </View>
        <TouchableOpacity
          style={[styles.skipBtn, !canSkip && styles.skipBtnDisabled]}
          onPress={canSkip ? handleSkip : undefined}
          activeOpacity={canSkip ? 0.8 : 1}>
          {canSkip ? (
            <Text style={styles.skipText}>Pular  ›</Text>
          ) : (
            <Text style={styles.skipCountdown}>Pular em {seconds}s</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Área do anúncio */}
      <View style={styles.adArea}>
        {/* Placeholder — substitua pelo componente real do AdMob ou outro SDK */}
        <View style={styles.adPlaceholder}>
          <Text style={styles.adPlaceholderIcon}>📢</Text>
          <Text style={styles.adPlaceholderTitle}>Seu anúncio aqui</Text>
          <Text style={styles.adPlaceholderSub}>
            Espaço disponível para patrocinadores.{'\n'}
            Anuncie para alcançar nossa comunidade.
          </Text>
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          A publicidade mantém o SafeClient gratuito para todas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // Barra de progresso
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#9B72E8',
  },

  // Topo
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  adLabel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adLabelText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  skipBtn: {
    backgroundColor: '#9B72E8',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  skipBtnDisabled: {
    backgroundColor: 'rgba(155,114,232,0.35)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  skipCountdown: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },

  // Área do anúncio
  adArea: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adPlaceholder: {
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
  adPlaceholderIcon: { fontSize: 56 },
  adPlaceholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adPlaceholderSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Rodapé
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
});
