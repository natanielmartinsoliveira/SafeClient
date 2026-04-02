import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTranslation } from '@/hooks/use-translation';

const { width } = Dimensions.get('window');

const BG        = '#7B52B8';
const BG_LIGHT  = '#9B72D8';
const TEXT      = '#FFFFFF';
const TEXT_MUTED = 'rgba(255,255,255,0.72)';

export default function ReporteEnviadoScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideY,  { toValue: 0,  duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fundo decorativo */}
      <Svg
        style={StyleSheet.absoluteFillObject}
        width={width}
        height="100%"
        viewBox={`0 0 ${width} 800`}
        preserveAspectRatio="xMidYMid slice">
        <Circle cx={width * 0.8} cy={-40}   r={180} fill={BG_LIGHT} opacity={0.35} />
        <Circle cx={-40}         cy={700}    r={200} fill={BG_LIGHT} opacity={0.25} />
        <Circle cx={width * 0.5} cy={400}    r={300} fill={BG_LIGHT} opacity={0.1}  />
      </Svg>

      <View style={styles.content}>
        {/* Ícone animado */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Circle cx={50} cy={50} r={50} fill="rgba(255,255,255,0.18)" />
            <Circle cx={50} cy={50} r={38} fill="rgba(255,255,255,0.22)" />
            {/* Checkmark */}
            <Path
              d="M28 52 L42 66 L72 36"
              stroke="#FFFFFF"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Texto */}
        <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
          <Text style={styles.title}>{t('sucesso.titulo')}</Text>
          <Text style={styles.message}>{t('sucesso.mensagem')}</Text>
          <Text style={styles.tagline}>{t('sucesso.tagline')}</Text>
        </Animated.View>

        {/* Divisor decorativo */}
        <Animated.View style={[styles.dividerWrap, { opacity }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerHeart}>♥</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Botão */}
        <Animated.View style={{ opacity, width: '100%' }}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)/reportar')}>
            <Text style={styles.buttonText}>{t('sucesso.voltar')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  iconWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 34,
  },
  message: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 4,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 25,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '70%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerHeart: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
});
