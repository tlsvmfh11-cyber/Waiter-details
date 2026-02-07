import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { useAuthStore, UserAccount } from '../store/authStore';

export default function AdminScreen() {
  const users = useAuthStore((s) => s.users);
  const addUser = useAuthStore((s) => s.addUser);
  const removeUser = useAuthStore((s) => s.removeUser);
  const changeUserPassword = useAuthStore((s) => s.changeUserPassword);

  const [newId, setNewId] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newName, setNewName] = useState('');

  const handleAddUser = async () => {
    if (!newId.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!newPw.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (!newName.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    const result = await addUser(newId.trim(), newPw.trim(), newName.trim());
    if (result.success) {
      Alert.alert('완료', `"${newName.trim()}" 계정이 생성되었습니다.`);
      setNewId('');
      setNewPw('');
      setNewName('');
    } else {
      Alert.alert('실패', result.message);
    }
  };

  const handleRemoveUser = (user: UserAccount) => {
    Alert.alert(
      '계정 삭제',
      `"${user.name}" (${user.id}) 계정을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => removeUser(user.id),
        },
      ],
    );
  };

  const handleChangePassword = (user: UserAccount) => {
    Alert.prompt
      ? Alert.prompt(
          '비밀번호 변경',
          `"${user.name}" 의 새 비밀번호를 입력하세요.`,
          (newPw) => {
            if (newPw && newPw.trim()) {
              changeUserPassword(user.id, newPw.trim());
              Alert.alert('완료', '비밀번호가 변경되었습니다.');
            }
          },
        )
      : promptPasswordChange(user);
  };

  const [editingPwUserId, setEditingPwUserId] = useState<string | null>(null);
  const [editingPwText, setEditingPwText] = useState('');

  const promptPasswordChange = (user: UserAccount) => {
    setEditingPwUserId(user.id);
    setEditingPwText('');
  };

  const confirmPasswordChange = (user: UserAccount) => {
    if (!editingPwText.trim()) {
      Alert.alert('알림', '새 비밀번호를 입력해주세요.');
      return;
    }
    changeUserPassword(user.id, editingPwText.trim());
    setEditingPwUserId(null);
    setEditingPwText('');
    Alert.alert('완료', '비밀번호가 변경되었습니다.');
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: () => useAuthStore.getState().logout() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 계정 추가 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 추가</Text>
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            value={newId}
            onChangeText={setNewId}
            placeholder="아이디"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={newPw}
            onChangeText={setNewPw}
            placeholder="비밀번호"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="이름"
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddUser}>
            <Text style={styles.addBtnText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 유저 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>등록된 계정 ({users.length}명)</Text>
        {users.length === 0 ? (
          <Text style={styles.emptyText}>등록된 계정이 없습니다.</Text>
        ) : (
          users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userId}>@{user.id}</Text>
              </View>

              {editingPwUserId === user.id ? (
                <View style={styles.pwEditRow}>
                  <TextInput
                    style={styles.pwInput}
                    value={editingPwText}
                    onChangeText={setEditingPwText}
                    placeholder="새 비밀번호"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="none"
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.pwConfirmBtn}
                    onPress={() => confirmPasswordChange(user)}
                  >
                    <Text style={styles.pwConfirmText}>변경</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pwCancelBtn}
                    onPress={() => setEditingPwUserId(null)}
                  >
                    <Text style={styles.pwCancelText}>취소</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => promptPasswordChange(user)}
                  >
                    <Text style={styles.actionBtnText}>비밀번호 변경</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleRemoveUser(user)}
                  >
                    <Text style={styles.deleteBtnText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  logoutBtn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.danger + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  addForm: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 10,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  userCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  userName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  userId: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: COLORS.danger + '20',
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  pwEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pwInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 14,
  },
  pwConfirmBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pwConfirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  pwCancelBtn: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  pwCancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
