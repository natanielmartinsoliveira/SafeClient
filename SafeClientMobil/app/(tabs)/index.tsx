import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/theme';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from '@/hooks/use-translation';
import { CountryPicker, DEFAULT_COUNTRY } from '@/components/country-picker';
import type { Country } from '@/hooks/use-countries';
import type { ContactType } from '@/data/mock';

const { width } = Dimensions.get('window');
const HEADER_BG = '#7B52B8';

const CONTACT_TYPES: { type: ContactType; icon: string; key: string }[] = [
  { type: 'phone',     icon: '📞', key: 'tipo_phone' },
  { type: 'telegram',  icon: '✈️', key: 'tipo_telegram' },
  { type: 'instagram', icon: '📷', key: 'tipo_instagram' },
  { type: 'email',     icon: '✉️', key: 'tipo_email' },
];

export default function BuscarScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [value, setValue] = useState('');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handleChangeType(type: ContactType) {
    setContactType(type);
    setValue('');
  }

  function handleChangeText(raw: string) {
    if (contactType === 'phone') {
      setValue(formatPhone(raw));
    } else if (contactType === 'telegram' || contactType === 'instagram') {
      // Remove @ if user types it, we'll show it as prefix
      setValue(raw.replace(/^@+/, ''));
    } else {
      setValue(raw);
    }
  }

  function isValid() {
    if (contactType === 'phone') return value.replace(/\D/g, '').length >= 10;
    if (contactType === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return value.trim().length >= 2;
  }

  function handleAnalizar() {
    if (!isValid()) return;
    router.push({
      pathname: '/ad',
      params: { contact: value, contactType },
    });
  }

  const placeholder = t(`buscar.placeholder_${contactType}`);
  const keyboardType =
    contactType === 'phone' ? 'phone-pad' :
    contactType === 'email' ? 'email-address' : 'default';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Wrapper roxo: texto com padding + onda sem padding */}
        <View style={styles.titleWrapper}>
          <View style={styles.titleSection}>
            <View style={styles.bubbleTop} />
            <Text style={styles.greeting}>{t('buscar.greeting')}</Text>
          </View>
          {/* SVG corta o fundo roxo com a cor lavanda */}
          <Svg width={width} height={48} viewBox={`-2 0 ${width + 4} 48`}>
            <Path
              d={`M-2,16 Q${width * 0.5},50 ${width + 2},16 L${width + 2},50 L-2,50 Z`}
              fill={AppColors.background}
            />
          </Svg>
        </View>

        {/* Formulário */}
        <ScrollView
          style={styles.formSection}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>{t('buscar.label')}</Text>

          {/* Seletor de tipo de contato */}
          <View style={styles.typeRow}>
            {CONTACT_TYPES.map(({ type, icon, key }) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, contactType === type && styles.typeChipActive]}
                onPress={() => handleChangeType(type)}
                activeOpacity={0.8}>
                <Text style={styles.typeIcon}>{icon}</Text>
                <Text style={[styles.typeLabel, contactType === type && styles.typeLabelActive]}>
                  {t(`buscar.${key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de entrada */}
          <View style={styles.phoneRow}>
            {contactType === 'phone' ? (
              <>
                <CountryPicker value={country} onChange={setCountry} />
                <View style={styles.dividerV} />
              </>
            ) : (contactType === 'telegram' || contactType === 'instagram') ? (
              <Text style={styles.atPrefix}>@</Text>
            ) : null}

            <TextInput
              style={styles.phoneInput}
              placeholder={placeholder}
              placeholderTextColor={AppColors.wave}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={handleChangeText}
            />
            <Text style={styles.chevron}>›</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid() && styles.buttonDisabled]}
            onPress={handleAnalizar}
            disabled={!isValid()}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('buscar.button')}</Text>
          </TouchableOpacity>

          <View style={styles.privacyRow}>
            <Text style={styles.privacyIcon}>ℹ</Text>
            <Text style={styles.privacyText}>{t('buscar.privacy')}</Text>
          </View>
        </ScrollView>

        {/* Onda S-curve no rodapé */}
        <Svg
          width={width}
          height={56}
          viewBox={`0 0 ${width} 56`}
          style={styles.waveBottom}>
          <Path
            d={`M0,56 L0,32 Q${width * 0.25},4 ${width * 0.5},28 Q${width * 0.75},52 ${width},24 L${width},56 Z`}
            fill={AppColors.wave}
            fillOpacity={0.55}
          />
        </Svg>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  flex: { flex: 1 },

  titleWrapper: {
    backgroundColor: HEADER_BG,
  },
  titleSection: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  bubbleTop: {
    position: 'absolute',
    top: -width * 0.52,
    right: -width * 0.08,
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  titleWave: {
    marginBottom: -2,
  },

  formSection: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  formContent: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 80,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.primaryDark,
    marginBottom: 12,
  },

  // Seletor de tipo
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  typeChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  typeIcon: { fontSize: 13 },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  typeLabelActive: {
    color: '#FFFFFF',
  },

  // Campo de telefone/contato
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: AppColors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dividerV: {
    width: 1,
    height: 20,
    backgroundColor: AppColors.border,
    marginRight: 10,
  },
  atPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.primary,
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textPrimary,
    paddingVertical: 12,
  },
  chevron: {
    fontSize: 22,
    color: AppColors.textSecondary,
    marginLeft: 8,
  },

  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: AppColors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: {
    color: AppColors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  privacyIcon: { fontSize: 13, color: AppColors.textSecondary },
  privacyText: { fontSize: 12, color: AppColors.textSecondary },

  waveBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
