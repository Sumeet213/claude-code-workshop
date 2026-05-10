import React, { useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorState } from '../../primitives';
import { colors, spacing } from '../../theme';
import { useProfile, type SimulatedState } from '../../hooks';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSkeleton } from './ProfileSkeleton';
import { StatsRow } from './StatsRow';
import { RecentWorkouts } from './RecentWorkouts';

interface ProfileScreenProps {
  onEditProfile?: () => void;
  onLogWorkout?: () => void;
  simulate?: SimulatedState;
}

export function ProfileScreen({
  onEditProfile,
  onLogWorkout,
  simulate,
}: ProfileScreenProps) {
  const { data, isLoading, error, refetch } = useProfile({ simulate });

  const handleEdit = useCallback(() => {
    onEditProfile?.();
  }, [onEditProfile]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <View style={styles.stateWrapper}>
            <ErrorState message={error.message} onRetry={refetch} />
          </View>
        ) : data ? (
          <View style={styles.populated}>
            <ProfileHeader
              name={data.name}
              tagline={data.tagline}
              avatarUrl={data.avatarUrl}
            />
            <View style={styles.block}>
              <StatsRow stats={data.stats} />
            </View>
            <View style={styles.block}>
              <RecentWorkouts
                workouts={data.recentWorkouts}
                onLogWorkout={onLogWorkout}
              />
            </View>
            <View style={styles.block}>
              <Button
                label="Edit Profile"
                onPress={handleEdit}
                accessibilityHint="Opens the profile editor"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  populated: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  block: {
    marginTop: spacing.xl,
  },
  stateWrapper: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
});
