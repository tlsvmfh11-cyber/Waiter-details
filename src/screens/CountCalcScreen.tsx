import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../constants';
import {
  calculateHostessCount,
  formatDuration,
  formatCount,
} from '../utils/timeCalculation';
import { generateCountCalcText } from '../utils/generateCopyText';
import SectionCard from '../components/SectionCard';
import TimeInput from '../components/TimeInput';
import SummaryBar from '../components/SummaryBar';

export default function CountCalcScreen() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const result = useMemo(() => {
    if (!startTime || !endTime) return null;
    return calculateHostessCount(startTime, endTime);
  }, [startTime, endTime]);

  const handleCopy = useCallback(async () => {
    if (!result) {
      Alert.alert('알림', '시간을 입력해주세요.');
      return;
    }
    const text = generateCountCalcText(
      startTime,
      endTime,
      result.totalMinutes,
      result.count
    );
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('클립보드에 복사되었습니다!', ToastAndroid.SHORT);
    } else {
      Alert.alert('복사 완료', '카톡에 붙여넣기 하세요!');
    }
  }, [startTime, endTime, result]);

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
        <SectionCard title="시간 입력">
          <View style={styles.timeRow}>
            <TimeInput
              value={startTime}
              onChangeValue={setStartTime}
              label="시작시간"
              placeholder="예: 1900"
            />
            <Text style={styles.timeSep}>~</Text>
            <TimeInput
              value={endTime}
              onChangeValue={setEndTime}
              label="끝난시간"
              placeholder="예: 2106"
            />
          </View>
        </SectionCard>

        {result ? (
          <SectionCard title="계산 결과">
            <View style={styles.resultCard}>
              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>경과 시간</Text>
                <Text style={styles.durationValue}>
                  {formatDuration(result.totalMinutes)}
                </Text>
                <Text style={styles.durationSub}>({result.totalMinutes}분)</Text>
              </View>

              <View style={styles.countBox}>
                <Text style={styles.countLabel}>끝난 개수</Text>
                <Text style={styles.countValue}>
                  {formatCount(result.count)}
                  <Text style={styles.countUnit}>개</Text>
                </Text>
              </View>
            </View>

            {/* 참고 테이블 */}
            <View style={styles.refTable}>
              <Text style={styles.refTitle}>계산 규칙 참고</Text>
              <View style={styles.refSection}>
                <Text style={styles.refSubtitle}>1시간 미만</Text>
                <Text style={styles.refRow}>0~10분 → 1개</Text>
                <Text style={styles.refRow}>11~30분 → 0.5개</Text>
                <Text style={styles.refRow}>31~59분 → 1개</Text>
              </View>
              <View style={styles.refSection}>
                <Text style={styles.refSubtitle}>1시간 이후 추가분 (모든 구간 동일)</Text>
                <Text style={styles.refRow}>0~5분 → +0</Text>
                <Text style={styles.refRow}>6~10분 → +0.2</Text>
                <Text style={styles.refRow}>11~30분 → +0.5</Text>
                <Text style={styles.refRow}>31~60분 → +1</Text>
              </View>
            </View>
          </SectionCard>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              시작/끝 시간을 입력하면{'\n'}끝난 개수가 자동 계산됩니다
            </Text>
          </View>
        )}
      </ScrollView>

      <SummaryBar items={[]} grandTotal={0} onCopyPress={handleCopy} />
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  timeSep: {
    color: COLORS.textSecondary,
    fontSize: 18,
    paddingBottom: 10,
  },
  resultCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    marginBottom: 16,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  durationLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  durationValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  durationSub: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  countBox: {
    alignItems: 'center',
  },
  countLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  countValue: {
    color: COLORS.success,
    fontSize: 48,
    fontWeight: '800',
  },
  countUnit: {
    fontSize: 20,
    fontWeight: '600',
  },
  refTable: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  refTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  refSection: {
    marginBottom: 8,
  },
  refSubtitle: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  refRow: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 18,
    paddingLeft: 8,
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
});
