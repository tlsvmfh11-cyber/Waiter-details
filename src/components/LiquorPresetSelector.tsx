import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, LIQUOR_PRESETS } from '../constants';

interface Props {
  onSelect: (name: string, price: number) => void;
  onCustom: () => void;
}

export default function LiquorPresetSelector({ onSelect, onCustom }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {LIQUOR_PRESETS.map((preset, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.presetBtn}
            onPress={() => onSelect(preset.name, preset.defaultPrice)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetName}>{preset.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.presetBtn, styles.customBtn]}
          onPress={onCustom}
          activeOpacity={0.7}
        >
          <Text style={styles.customText}>+ 직접입력</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scroll: {
    gap: 6,
    paddingRight: 8,
  },
  presetBtn: {
    backgroundColor: COLORS.stepper,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  presetName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  customBtn: {
    borderColor: COLORS.primary + '50',
    borderStyle: 'dashed',
  },
  customText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
