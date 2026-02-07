import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { LiquorItem as LiquorItemType } from '../types';
import { formatCurrency, formatNumber, parseAmount } from '../utils/formatCurrency';
import Stepper from './Stepper';

interface Props {
  item: LiquorItemType;
  onUpdate: (field: Partial<LiquorItemType>) => void;
  onRemove: () => void;
}

export default function LiquorItem({ item, onUpdate, onRemove }: Props) {
  const lineTotal = item.bottles * item.pricePerBottle;
  const [priceFocused, setPriceFocused] = useState(false);
  const [priceText, setPriceText] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.nameBox}>
          <TextInput
            style={styles.nameInput}
            value={item.name}
            onChangeText={(text) => onUpdate({ name: text })}
            placeholder="주류명 입력"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Stepper
          value={item.bottles}
          onIncrement={() => onUpdate({ bottles: item.bottles + 1 })}
          onDecrement={() => onUpdate({ bottles: Math.max(0, item.bottles - 1) })}
          label="병수"
        />

        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>병당</Text>
          <View style={[styles.priceInputRow, priceFocused && styles.priceInputFocused]}>
            <TextInput
              style={styles.priceInput}
              value={priceFocused ? priceText : (item.pricePerBottle > 0 ? formatNumber(item.pricePerBottle) : '')}
              onFocus={() => {
                setPriceFocused(true);
                setPriceText(item.pricePerBottle > 0 ? item.pricePerBottle.toString() : '');
              }}
              onBlur={() => {
                setPriceFocused(false);
                onUpdate({ pricePerBottle: parseAmount(priceText) });
              }}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setPriceText(cleaned);
                onUpdate({ pricePerBottle: cleaned ? parseInt(cleaned, 10) : 0 });
              }}
              placeholder="금액"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <Text style={styles.won}>원</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>합계</Text>
          <Text style={styles.totalValue}>{formatCurrency(lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameBox: {
    flex: 1,
  },
  nameInput: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.danger + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  priceBox: {
    flex: 1,
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 8,
    height: 38,
  },
  priceInputFocused: {
    borderColor: COLORS.primary,
  },
  priceInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    padding: 0,
  },
  won: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 2,
  },
  totalBox: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  totalValue: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '700',
  },
});
