import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatNumber, parseAmount } from '../utils/formatCurrency';

interface Props {
  value: number;
  onChangeValue: (v: number) => void;
  label?: string;
  placeholder?: string;
  suffix?: string;
}

export default function AmountInput({
  value,
  onChangeValue,
  label,
  placeholder = '0',
  suffix = '원',
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayText, setDisplayText] = useState(value > 0 ? value.toString() : '');

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayText(value > 0 ? value.toString() : '');
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseAmount(displayText);
    onChangeValue(parsed);
    setDisplayText(parsed > 0 ? parsed.toString() : '');
  }, [displayText, onChangeValue]);

  const handleChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setDisplayText(cleaned);
    onChangeValue(cleaned ? parseInt(cleaned, 10) : 0);
  }, [onChangeValue]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, isFocused && styles.inputFocused]}>
        <TextInput
          style={styles.input}
          value={isFocused ? displayText : (value > 0 ? formatNumber(value) : '')}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  inputRow: {
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
  },
  suffix: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 4,
  },
});
