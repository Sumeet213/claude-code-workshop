import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatTile } from '../../primitives';
import { spacing } from '../../theme';
import type { WeeklyStats } from '../../types';

interface StatsRowProps {
  stats: WeeklyStats;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <View
      style={styles.row}
      accessible={false}
      accessibilityLabel="Weekly stats"
    >
      <StatTile label="Steps" value={formatNumber(stats.steps)} />
      <StatTile label="Calories" value={formatNumber(stats.calories)} unit="kcal" />
      <StatTile label="Distance" value={stats.distanceKm.toFixed(1)} unit="km" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
