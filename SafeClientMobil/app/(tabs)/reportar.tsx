import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';
import { type FlagType, type ContactType } from '@/data/mock';
import { useTranslation } from '@/hooks/use-translation';
import { CountryPicker, DEFAULT_COUNTRY } from '@/components/country-picker';
import type { Country } from '@/hooks/use-countries';
import { createReport } from '@/utils/api-client';

const ALL_FLAGS: FlagType[] = [
  'perda_de_tempo',
  'tentativa_golpe',
  'comportamento_agressivo',
  'nao_compareceu',
  'pagamento_recusado',
  'pressao_sem_camisinha',
];

const CONTACT_TYPES: { type: ContactType; icon: string; key: string }[] = [
  { type: 'phone',     icon: '📞', key: 'tipo_phone' },
  { type: 'telegram',  icon: '✈️', key: 'tipo_telegram' },
  { type: 'instagram', icon: '📷', key: 'tipo_instagram' },
  { type: 'email',     icon: '✉️', key: 'tipo_email' },
];

export default function ReportarScreen() {
  const [contactType, setContactType] = useState<ContactType>('phone');
  const [contact, setContact] = useState('');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [selected, setSelected] = useState<FlagType[]>([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t }  = useTranslation();
  const router = useRouter();

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function handleChangeType(type: ContactType) {
    setContactType(type);
    setContact('');
  }

  function handleChangeText(raw: string) {
    if (contactType === 'phone') {
      setContact(formatPhone(raw));
    } else if (contactType === 'telegram' || contactType === 'instagram') {
      setContact(raw.replace(/^@+/, ''));
    } else {
      setContact(raw);
    }
  }

  function isContactValid() {
    if (contactType === 'phone') return contact.replace(/\D/g, '').length >= 10;
    if (contactType === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    return contact.trim().length >= 2;
  }

  function toggleFlag(flag: FlagType) {
    setSelected((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  }

  async function handleSubmit() {
    if (!isContactValid()) {
      Alert.alert(t('reportar.atencao'), t('reportar.erro_contato'));
      return;
    }
    if (selected.length === 0) {
      Alert.alert(t('reportar.atencao'), t('reportar.erro_tipo'));
      return;
    }

    setSubmitting(true);
    try {
      await createReport({
        contact,
        contactType,
        flags: selected,
        description: description || undefined,
      });
      setContact('');
      setSelected([]);
      setDescription('');
      router.push('/reporte-enviado');
    } catch (e: any) {
      Alert.alert(t('reportar.atencao'), e?.message ?? 'Erro ao enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = isContactValid() && selected.length > 0 && !submitting;
  const keyboardType =
    contactType === 'phone' ? 'phone-pad' :
    contactType === 'email' ? 'email-address' : 'default';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('reportar.title')}</Text>

        {/* Tipo de contato */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('reportar.contato_label')}</Text>

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

          <View style={styles.inputRow}>
            {contactType === 'phone' ? (
              <CountryPicker value={country} onChange={setCountry} />
            ) : (contactType === 'telegram' || contactType === 'instagram') ? (
              <Text style={styles.atPrefix}>@</Text>
            ) : null}

            {contactType === 'phone' && <View style={styles.inputDivider} />}

            <TextInput
              style={styles.input}
              placeholder={t(`buscar.placeholder_${contactType}`)}
              placeholderTextColor={AppColors.textSecondary}
              keyboardType={keyboardType}
              autoCapitalize="none"
              autoCorrect={false}
              value={contact}
              onChangeText={handleChangeText}
            />
          </View>
        </View>

        {/* Problema */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('reportar.problema_label')}</Text>
          <View style={styles.flagsContainer}>
            {ALL_FLAGS.map((flag) => {
              const active = selected.includes(flag);
              return (
                <TouchableOpacity
                  key={flag}
                  style={[styles.flagOption, active && styles.flagOptionActive]}
                  onPress={() => toggleFlag(flag)}
                  activeOpacity={0.8}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.flagLabel, active && styles.flagLabelActive]}>
                    {t('flags.' + flag)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('reportar.descricao_label')}</Text>
          <TextInput
            style={styles.textarea}
            placeholder={t('reportar.descricao_placeholder')}
            placeholderTextColor={AppColors.textSecondary}
            multiline
            maxLength={200}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.anonRow}>
          <Text style={styles.anonIcon}>🔒</Text>
          <Text style={styles.anonText}>{t('reportar.anonimo')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}>
          <Text style={styles.buttonText}>
            {submitting ? 'Enviando...' : t('reportar.enviar')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },

  // Seletor de tipo
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  typeLabelActive: { color: '#FFFFFF' },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: AppColors.surface,
    paddingHorizontal: 12,
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: AppColors.border,
    marginHorizontal: 8,
  },
  atPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.primary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
  },

  // Flags
  flagsContainer: { gap: 10 },
  flagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  flagOptionActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AppColors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: AppColors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  flagLabel: { fontSize: 15, color: AppColors.textPrimary },
  flagLabelActive: { fontWeight: '600', color: AppColors.primary },

  // Textarea
  textarea: {
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: AppColors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  anonIcon: { fontSize: 14 },
  anonText: { fontSize: 13, color: AppColors.textSecondary },

  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
