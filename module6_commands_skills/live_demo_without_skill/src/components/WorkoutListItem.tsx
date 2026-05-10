import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Workout } from '../types/profile';
import { colors, radius, spacing, typography } from '../theme/colors';

type WorkoutListItemProps = {
  workout: Workout;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const WorkoutListItem: React.FC<WorkoutListItemProps> = ({ workout }) => {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${workout.name}, ${formatDate(workout.date)}, ${formatDuration(workout.durationMinutes)}`}>
      <View style={styles.iconBubble}>
        <Text style={styles.iconText}>{workout.name.charAt(0)}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name} numberOfLines={1}>{workout.name}</Text>
        <Text style={styles.date}>{formatDate(workout.date)}</Text>
      </View>
      <Text style={styles.duration}>{formatDuration(workout.durationMinutes)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  textBlock: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  duration: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
