import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!id.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    const result = await login(id.trim(), password);
    if (!result.success) {
      Alert.alert('로그인 실패', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>웨이터 내역서</Text>
        <Text style={styles.subtitle}>로그인이 필요합니다</Text>

        <View style={styles.form}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            value={id}
            onChangeText={setId}
            placeholder="아이디 입력"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호 입력"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 340,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
