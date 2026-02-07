import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [pressed, setPressed] = useState(false);

  const doLogout = () => {
    setPressed(true);
    useAuthStore.setState({ isLoggedIn: false, currentUser: null, isAdmin: false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <Text style={styles.userLabel}>현재 로그인</Text>
        <Text style={styles.userName}>{currentUser ?? '없음'}</Text>
        {isAdmin && <Text style={styles.adminBadge}>관리자</Text>}
        <Text style={styles.debugText}>isLoggedIn: {String(isLoggedIn)}</Text>
        {pressed && <Text style={styles.debugText}>로그아웃 호출됨</Text>}
      </View>

      <Pressable
        style={({ pressed: p }) => [
          styles.logoutBtn,
          p && { opacity: 0.6 },
        ]}
        onPress={doLogout}
      >
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
    gap: 16,
  },
  userCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    gap: 6,
  },
  userLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  userName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  adminBadge: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  debugText: {
    color: COLORS.warning,
    fontSize: 12,
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
