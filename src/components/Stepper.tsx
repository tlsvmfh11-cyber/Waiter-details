import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function Stepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  label,
}: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.btn, value <= min && styles.btnDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
          activeOpacity={0.6}
        >
          <Text style={[styles.btnText, value <= min && styles.btnTextDisabled]}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, value >= max && styles.btnDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
          activeOpacity={0.6}
        >
          <Text style={[styles.btnText, value >= max && styles.btnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.stepper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: COLORS.inputBg,
    opacity: 0.5,
  },
  btnText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  btnTextDisabled: {
    color: COLORS.textMuted,
  },
  valueBox: {
    minWidth: 40,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  value: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
