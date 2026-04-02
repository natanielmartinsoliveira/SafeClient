import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { useTranslation } from '@/hooks/use-translation';

const PURPLE = '#8B6FC4';
const INACTIVE = '#B8AECF';
const BG = '#F0ECFF';

type TabIconProps = {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <MaterialIcons name={name} size={22} color={focused ? '#FFFFFF' : INACTIVE} />
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.buscar'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: t('tabs.reportar'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="edit-note" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="seguranca"
        options={{
          title: t('tabs.seguranca'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="favorite" focused={focused} />
          ),
        }}
      />
      {/* Tela oculta da tab bar — mantém o menu visível */}
      <Tabs.Screen
        name="resultado"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: PURPLE,
    width: 48,
    borderRadius: 24,
  },
});
