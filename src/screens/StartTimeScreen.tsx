import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../constants';
import { calcHalfTime, calcFullTime } from '../utils/timeCalculation';
import { generateStartTimeText } from '../utils/generateCopyText';
import SectionCard from '../components/SectionCard';
import TimeInput from '../components/TimeInput';
import SummaryBar from '../components/SummaryBar';

export default function StartTimeScreen() {
  const [hostessName, setHostessName] = useState('');
  const [startTime, setStartTime] = useState('');

  const halfTime = useMemo(() => {
    if (!startTime) return '';
    return calcHalfTime(startTime);
  }, [startTime]);

  const fullTime = useMemo(() => {
    if (!startTime) return '';
    return calcFullTime(startTime);
  }, [startTime]);

  const handleCopy = useCallback(async () => {
    if (!startTime) {
      Alert.alert('알림', '시작시간을 입력해주세요.');
      return;
    }
    const text = generateStartTimeText(hostessName || '-', startTime, halfTime, fullTime);
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('클립보드에 복사되었습니다!', ToastAndroid.SHORT);
    } else {
      Alert.alert('복사 완료', '카톡에 붙여넣기 하세요!');
    }
  }, [hostessName, startTime, halfTime, fullTime]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard title="시작 시간 입력">
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>아가씨 이름</Text>
              <TextInput
                style={styles.textInput}
                value={hostessName}
                onChangeText={setHostessName}
                placeholder="이름"
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroupWide}>
              <TimeInput
                value={startTime}
                onChangeValue={setStartTime}
                label="시작시간"
                placeholder="예: 1900"
              />
            </View>
          </View>
        </SectionCard>

        {startTime ? (
          <SectionCard title="계산 결과">
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>시작시간</Text>
                <Text style={styles.resultTime}>{startTime}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <View style={styles.resultLabelRow}>
                  <Text style={styles.resultLabel}>반티</Text>
                  <Text style={styles.resultSub}>(+11분)</Text>
                </View>
                <Text style={[styles.resultTime, styles.halfTime]}>{halfTime}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <View style={styles.resultLabelRow}>
                  <Text style={styles.resultLabel}>완티</Text>
                  <Text style={styles.resultSub}>(+31분)</Text>
                </View>
                <Text style={[styles.resultTime, styles.fullTime]}>{fullTime}</Text>
              </View>
            </View>
          </SectionCard>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>시작시간을 입력하면{'\n'}반티/완티가 자동 계산됩니다</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <SummaryBar
          items={[]}
          grandTotal={0}
          onCopyPress={handleCopy}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupWide: {
    flex: 1.5,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.text,
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  resultLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  resultSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  resultTime: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  halfTime: {
    color: COLORS.warning,
  },
  fullTime: {
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  placeholder: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomBar: {
    // SummaryBar handles its own styling
  },
});
