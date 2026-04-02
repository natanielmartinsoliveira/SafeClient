import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors } from '@/constants/theme';
import { FLAG_LABELS, type FlagType } from '@/data/mock';

const ALL_FLAGS: FlagType[] = [
  'perda_de_tempo',
  'tentativa_golpe',
  'comportamento_agressivo',
  'nao_compareceu',
  'pagamento_recusado',
  'pressao_sem_camisinha',
];

export default function RegistrarOcorrenciaScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{ phone: string }>();

  const initialPhone = phoneParam
    ? `(${phoneParam.slice(0, 2)}) ${phoneParam.slice(2, 7)}-${phoneParam.slice(7)}`
    : '';

  const [phone, setPhone] = useState(initialPhone);
  const [selected, setSelected] = useState<FlagType[]>([]);
  const [description, setDescription] = useState('');

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function toggleFlag(flag: FlagType) {
    setSelected((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  }

  function handleSubmit() {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Atenção', 'Informe o número de telefone do cliente.');
      return;
    }
    if (selected.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um tipo de ocorrência.');
      return;
    }
    Alert.alert(
      'Ocorrência registrada!',
      'Obrigada por contribuir com a segurança da comunidade. Seu relato foi enviado anonimamente.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  const canSubmit = phone.replace(/\D/g, '').length >= 10 && selected.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Ocorrência</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qual foi o problema?</Text>
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
                    {FLAG_LABELS[flag]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descrição (opcional)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Adicione mais detalhes (máx. 200 caracteres)"
            placeholderTextColor={AppColors.textSecondary}
            multiline
            maxLength={200}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}>
          <Text style={styles.buttonText}>Enviar</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: AppColors.primary,
    lineHeight: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
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
  flagsContainer: {
    gap: 10,
  },
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
  radioActive: {
    borderColor: AppColors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.primary,
  },
  flagLabel: {
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  flagLabelActive: {
    fontWeight: '600',
    color: AppColors.primary,
  },
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
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
