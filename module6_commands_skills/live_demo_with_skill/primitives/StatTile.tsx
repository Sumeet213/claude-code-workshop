import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { Card } from './Card';
import { Text } from './Text';

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  accessibilityLabel?: string;
}

export function StatTile({ label, value, unit, accessibilityLabel }: StatTileProps) {
  return (
    <Card
      variant="border"
      padding="md"
      style={styles.card}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text variant="display" tone="primary" style={styles.value}>
          {value}
        </Text>
        {unit ? (
          <Text variant="caption" tone="secondary" style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
  },
  unit: {
    marginLeft: spacing.xs,
  },
});
