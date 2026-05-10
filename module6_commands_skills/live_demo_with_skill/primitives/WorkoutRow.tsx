import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { Text } from './Text';

interface WorkoutRowProps {
  name: string;
  date: string;
  durationMinutes: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function WorkoutRow({ name, date, durationMinutes }: WorkoutRowProps) {
  const dateLabel = formatDate(date);
  const durationLabel = `${durationMinutes} min`;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${name}, ${dateLabel}, ${durationLabel}`}
      style={styles.row}
    >
      <View style={styles.indicator} />
      <View style={styles.body}>
        <Text variant="body" tone="primary" style={styles.title}>
          {name}
        </Text>
        <Text variant="caption" tone="secondary">
          {dateLabel}
        </Text>
      </View>
      <Text variant="body" tone="accent">
        {durationLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
});
