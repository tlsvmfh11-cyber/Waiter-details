import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  rightAction?: React.ReactNode;
}

export default function SectionCard({
  title,
  children,
  collapsible = false,
  collapsed = false,
  onToggle,
  rightAction,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={collapsible ? onToggle : undefined}
        activeOpacity={collapsible ? 0.7 : 1}
        disabled={!collapsible}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {collapsible && (
            <Text style={styles.arrow}>{collapsed ? '▼' : '▲'}</Text>
          )}
        </View>
        {rightAction && <View>{rightAction}</View>}
      </TouchableOpacity>
      {!collapsed && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  content: {
    padding: 12,
  },
});
