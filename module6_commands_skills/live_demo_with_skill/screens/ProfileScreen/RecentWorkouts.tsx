import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, EmptyState, Text, WorkoutRow } from '../../primitives';
import { spacing } from '../../theme';
import type { Workout } from '../../types';

interface RecentWorkoutsProps {
  workouts: Workout[];
  onLogWorkout?: () => void;
}

export function RecentWorkouts({ workouts, onLogWorkout }: RecentWorkoutsProps) {
  return (
    <View>
      <Text variant="body" tone="primary" style={styles.heading}>
        Recent workouts
      </Text>
      <Card variant="border" padding="lg">
        {workouts.length === 0 ? (
          <EmptyState
            title="No workouts yet"
            message="Once you log a session, it'll show up here."
            actionLabel={onLogWorkout ? 'Log a workout' : undefined}
            onAction={onLogWorkout}
          />
        ) : (
          workouts.map((w, i) => (
            <View key={w.id}>
              <WorkoutRow name={w.name} date={w.date} durationMinutes={w.durationMinutes} />
              {i < workouts.length - 1 ? <Divider /> : null}
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
