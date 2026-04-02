import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';
import { useCountries, type Country } from '@/hooks/use-countries';

interface Props {
  value: Country;
  onChange: (country: Country) => void;
}

export const DEFAULT_COUNTRY: Country = {
  code: 'BR',
  dialCode: '+55',
  flag: '🇧🇷',
  name: 'Brasil',
};

export function CountryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { countries, loading, error } = useCountries();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query, countries]);

  function handleSelect(country: Country) {
    onChange(country);
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      {/* Botão que abre o picker */}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Text style={styles.triggerFlag}>{value.flag}</Text>
        <Text style={styles.triggerCode}>{value.dialCode}</Text>
        <Text style={styles.triggerChevron}>▾</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top']}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar país</Text>
            <TouchableOpacity onPress={() => { setOpen(false); setQuery(''); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar país ou código..."
              placeholderTextColor={AppColors.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
              clearButtonMode="while-editing"
            />
          </View>

          {/* Lista */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Carregando países...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>Não foi possível carregar os países.</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(c) => c.code}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item.code === value.code && styles.itemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}>
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemCode}>{item.dialCode}</Text>
                  {item.code === value.code && (
                    <Text style={styles.itemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingRight: 10,
  },
  triggerFlag: { fontSize: 18 },
  triggerCode: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  triggerChevron: {
    fontSize: 10,
    color: AppColors.textSecondary,
    marginTop: 1,
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  modalClose: {
    fontSize: 18,
    color: AppColors.textSecondary,
    padding: 4,
  },

  // Busca
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: AppColors.textPrimary,
  },

  // Item
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  itemSelected: {
    backgroundColor: AppColors.primaryLight,
  },
  itemFlag: { fontSize: 22, width: 32 },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  itemCode: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    minWidth: 44,
    textAlign: 'right',
  },
  itemCheck: {
    fontSize: 15,
    color: AppColors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: 64,
  },

  // Estados
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: AppColors.textSecondary },
  errorText: { fontSize: 14, color: AppColors.danger, textAlign: 'center' },
});
