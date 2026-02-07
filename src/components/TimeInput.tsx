import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  value: string; // "HH:mm" format (24h)
  onChangeValue: (v: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * 오전/오후 토글 + 12시간 입력 → 24시간 변환
 * "730" + 오후 → "19:30"
 * "730" + 오전 → "07:30"
 */
export default function TimeInput({
  value,
  onChangeValue,
  label,
  placeholder = '예: 730',
}: Props) {
  const [isPm, setIsPm] = useState(() => {
    if (!value) return true; // 기본 오후
    const h = parseInt(value.split(':')[0], 10);
    return h >= 12;
  });
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // 24h value 변경 시 AM/PM 동기화
  useEffect(() => {
    if (value) {
      const h = parseInt(value.split(':')[0], 10);
      setIsPm(h >= 12);
    }
  }, [value]);

  // 12h raw digits + isPm → 24h "HH:mm"
  const convertTo24h = useCallback((text: string, pm: boolean): string => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits || digits.length < 3) return '';

    let h: number, m: number;
    if (digits.length === 3) {
      h = parseInt(digits[0], 10);
      m = parseInt(digits.slice(1), 10);
    } else {
      h = parseInt(digits.slice(0, 2), 10);
      m = parseInt(digits.slice(2, 4), 10);
    }

    if (h > 12) h = 12;
    if (h === 0) h = 12;
    if (m > 59) m = 59;

    // 12h → 24h
    if (pm) {
      if (h !== 12) h += 12;
    } else {
      if (h === 12) h = 0;
    }

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }, []);

  // 24h → 12h display
  const getDisplay = useCallback((val: string): string => {
    if (!val) return '';
    const [hStr, mStr] = val.split(':');
    let h = parseInt(hStr, 10);
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${mStr}`;
  }, []);

  // 24h → raw digits (12h)
  const getRawFromValue = useCallback((val: string): string => {
    if (!val) return '';
    const [hStr, mStr] = val.split(':');
    let h = parseInt(hStr, 10);
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}${mStr}`;
  }, []);

  const handleToggleAmPm = useCallback((pm: boolean) => {
    setIsPm(pm);
    if (value) {
      const raw = getRawFromValue(value);
      const converted = convertTo24h(raw, pm);
      if (converted) onChangeValue(converted);
    }
  }, [value, getRawFromValue, convertTo24h, onChangeValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRawText(value ? getRawFromValue(value) : '');
  }, [value, getRawFromValue]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = convertTo24h(rawText, isPm);
    if (parsed) onChangeValue(parsed);
  }, [rawText, isPm, convertTo24h, onChangeValue]);

  const handleChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setRawText(cleaned);
    if (cleaned.length >= 3) {
      const parsed = convertTo24h(cleaned, isPm);
      if (parsed) onChangeValue(parsed);
    }
  }, [isPm, convertTo24h, onChangeValue]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <View style={styles.ampmGroup}>
          <TouchableOpacity
            style={[styles.ampmBtn, !isPm && styles.ampmActive]}
            onPress={() => handleToggleAmPm(false)}
          >
            <Text style={[styles.ampmText, !isPm && styles.ampmActiveText]}>오전</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ampmBtn, isPm && styles.ampmActive]}
            onPress={() => handleToggleAmPm(true)}
          >
            <Text style={[styles.ampmText, isPm && styles.ampmActiveText]}>오후</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.inputRow, isFocused && styles.inputFocused]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={isFocused ? rawText : getDisplay(value)}
            onChangeText={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ampmGroup: {
    flexDirection: 'column',
    gap: 2,
    width: 64,
    flexShrink: 0,
  },
  ampmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  ampmActive: {
    backgroundColor: COLORS.primary + '30',
    borderColor: COLORS.primary,
  },
  ampmText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ampmActiveText: {
    color: COLORS.primary,
  },
  inputRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 12,
    height: 44,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    padding: 0,
    textAlign: 'center',
  },
});
