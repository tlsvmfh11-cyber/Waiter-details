import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { useAuthStore } from '../store/authStore';
import StatementScreen from '../screens/StatementScreen';
import StartTimeScreen from '../screens/StartTimeScreen';
import CountCalcScreen from '../screens/CountCalcScreen';
import AdminScreen from '../screens/AdminScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {label}
    </Text>
  );
}

export default function TabNavigator() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.cardBorder,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.cardBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Statement"
        component={StatementScreen}
        options={{
          title: '내역서 작성',
          tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} />,
          tabBarLabel: '내역서',
        }}
      />
      <Tab.Screen
        name="StartTime"
        component={StartTimeScreen}
        options={{
          title: '시작 시간 계산',
          tabBarIcon: ({ focused }) => <TabIcon label="⏱" focused={focused} />,
          tabBarLabel: '시작시간',
        }}
      />
      <Tab.Screen
        name="CountCalc"
        component={CountCalcScreen}
        options={{
          title: '끝난 개수 계산',
          tabBarIcon: ({ focused }) => <TabIcon label="🔢" focused={focused} />,
          tabBarLabel: '개수계산',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: '관리자',
            tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
            tabBarLabel: '계정관리',
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} />,
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
