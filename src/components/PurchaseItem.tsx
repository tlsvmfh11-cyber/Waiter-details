import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { PurchaseItem as PurchaseItemType } from '../types';
import { formatNumber, parseAmount } from '../utils/formatCurrency';

interface Props {
  item: PurchaseItemType;
  onUpdate: (field: Partial<PurchaseItemType>) => void;
  onRemove: () => void;
}

export default function PurchaseItem({ item, onUpdate, onRemove }: Props) {
  const [nameFocused, setNameFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [amountText, setAmountText] = useState('');

  return (
    <View style={styles.container}>
      <View style={[styles.nameBox, nameFocused && styles.inputFocused]}>
        <TextInput
          style={styles.nameInput}
          value={item.name}
          onChangeText={(text) => onUpdate({ name: text })}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          placeholder="이름 (예: 담배1개)"
          placeholderTextColor={COLORS.textMuted}
          selectTextOnFocus
        />
      </View>

      <View style={[styles.amountBox, amountFocused && styles.inputFocused]}>
        <TextInput
          style={styles.amountInput}
          value={amountFocused ? amountText : (item.amount > 0 ? formatNumber(item.amount) : '')}
          onFocus={() => {
            setAmountFocused(true);
            setAmountText(item.amount > 0 ? item.amount.toString() : '');
          }}
          onBlur={() => {
            setAmountFocused(false);
            onUpdate({ amount: parseAmount(amountText) });
          }}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '');
            setAmountText(cleaned);
            onUpdate({ amount: cleaned ? parseInt(cleaned, 10) : 0 });
          }}
          placeholder="금액"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          returnKeyType="done"
        />
        <Text style={styles.won}>원</Text>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nameBox: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 10,
    height: 42,
    justifyContent: 'center',
  },
  nameInput: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
  },
  amountBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 10,
    height: 42,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  amountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    padding: 0,
  },
  won: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.danger + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
