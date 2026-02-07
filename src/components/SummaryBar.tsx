import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils/formatCurrency';

interface SummaryItem {
  label: string;
  amount: number;
}

interface Props {
  items: SummaryItem[];
  grandTotal: number;
  onCopyPress: () => void;
  onResetPress?: () => void;
}

export default function SummaryBar({
  items,
  grandTotal,
  onCopyPress,
  onResetPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.itemsRow}>
        {items.filter(i => i.amount > 0).map((item, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={styles.itemValue}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>총합</Text>
          <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
        </View>
        <View style={styles.btnRow}>
          {onResetPress && (
            <TouchableOpacity style={styles.resetBtn} onPress={onResetPress}>
              <Text style={styles.resetBtnText}>초기화</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.copyBtn} onPress={onCopyPress}>
            <Text style={styles.copyBtnText}>카톡 복사</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.totalBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingBottom: 34,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  itemLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginRight: 4,
  },
  itemValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  totalInfo: {
    flexShrink: 1,
    minWidth: 0,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  totalValue: {
    color: COLORS.warning,
    fontSize: 22,
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resetBtn: {
    backgroundColor: COLORS.danger + '30',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resetBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  copyBtn: {
    backgroundColor: COLORS.copyBtn,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  copyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
