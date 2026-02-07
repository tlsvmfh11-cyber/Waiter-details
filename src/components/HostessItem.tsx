import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';
import { HostessItem as HostessItemType } from '../types';
import { formatCount } from '../utils/timeCalculation';
import { formatNumber, parseAmount } from '../utils/formatCurrency';
import TimeInput from './TimeInput';

interface Props {
  item: HostessItemType;
  onUpdate: (field: Partial<HostessItemType>) => void;
  onRemove: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function HostessItem({ item, onUpdate, onRemove, collapsed, onToggle }: Props) {
  const [nameEditing, setNameEditing] = useState(false);
  const [countEditing, setCountEditing] = useState(false);
  const [countText, setCountText] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [amountText, setAmountText] = useState('');
  const hasData = item.startTime || item.endTime || item.count > 0 || item.amount > 0;

  const handleCountStep = (delta: number) => {
    const newCount = Math.max(0, Math.round((item.count + delta) * 10) / 10);
    onUpdate({ count: newCount });
  };

  const handleCountSubmit = () => {
    setCountEditing(false);
    const parsed = parseFloat(countText);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate({ count: Math.round(parsed * 10) / 10 });
    }
  };

  return (
    <View style={[styles.container, hasData && styles.containerActive]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nameCenter} onPress={onToggle} activeOpacity={0.7}>
          {nameEditing ? (
            <TextInput
              style={styles.nameInput}
              value={item.name}
              onChangeText={(text) => onUpdate({ name: text })}
              onBlur={() => setNameEditing(false)}
              autoFocus
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setNameEditing(true)} style={styles.nameTap}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.nameHint}>눌러서 이름변경</Text>
            </TouchableOpacity>
          )}
          {item.count > 0 && (
            <Text style={styles.countBadge}>{formatCount(item.count)}개</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.arrow}>{collapsed ? '▼' : '▲'}</Text>
      </View>

      {!collapsed && (
        <View style={styles.content}>
          <View style={styles.timeRow}>
            <TimeInput
              value={item.startTime}
              onChangeValue={(v) => onUpdate({ startTime: v })}
              label="시작시간"
              placeholder="예: 1900"
            />
            <Text style={styles.timeSep}>~</Text>
            <TimeInput
              value={item.endTime}
              onChangeValue={(v) => onUpdate({ endTime: v })}
              label="끝난시간"
              placeholder="예: 2106"
            />
          </View>

          <View style={styles.countRow}>
            <View style={styles.countLeft}>
              <Text style={styles.countLabel}>끝난 개수</Text>
              <View style={styles.countControl}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleCountStep(-0.5)}
                >
                  <Text style={styles.stepBtnText}>-</Text>
                </TouchableOpacity>
                {countEditing ? (
                  <TextInput
                    style={styles.countInput}
                    value={countText}
                    onChangeText={setCountText}
                    onBlur={handleCountSubmit}
                    onSubmitEditing={handleCountSubmit}
                    autoFocus
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    selectTextOnFocus
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.countTap}
                    onPress={() => {
                      setCountEditing(true);
                      setCountText(item.count > 0 ? item.count.toString() : '0');
                    }}
                  >
                    <Text style={styles.countValue}>
                      {formatCount(item.count)}개
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleCountStep(0.5)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.countLabel}>금액</Text>
              <View style={[styles.amountInputRow, amountFocused && styles.amountInputFocused]}>
                <TextInput
                  style={styles.amountInput}
                  value={amountFocused ? amountText : (item.amount > 0 ? formatNumber(item.amount) : '')}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setAmountText(cleaned);
                    onUpdate({ amount: cleaned ? parseInt(cleaned, 10) : 0 });
                  }}
                  onFocus={() => {
                    setAmountFocused(true);
                    setAmountText(item.amount > 0 ? item.amount.toString() : '');
                  }}
                  onBlur={() => {
                    setAmountFocused(false);
                    const parsed = parseAmount(amountText);
                    onUpdate({ amount: parsed });
                  }}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                <Text style={styles.amountSuffix}>원</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: 'hidden',
  },
  containerActive: {
    borderColor: COLORS.accent + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  nameCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nameTap: {
    alignItems: 'center',
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  nameHint: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  nameInput: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: COLORS.card,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  countBadge: {
    backgroundColor: COLORS.accent + '30',
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  content: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  timeSep: {
    color: COLORS.textSecondary,
    fontSize: 18,
    paddingBottom: 10,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },
  countLeft: {
    alignItems: 'center',
  },
  countLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  countControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.stepper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  stepBtnText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  countTap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minWidth: 60,
    alignItems: 'center',
  },
  countValue: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
  },
  countInput: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  amountBox: {
    flex: 1,
    minWidth: 120,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 10,
    height: 38,
  },
  amountInputFocused: {
    borderColor: COLORS.primary,
  },
  amountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    padding: 0,
  },
  amountSuffix: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
});
