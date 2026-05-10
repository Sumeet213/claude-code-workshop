import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { WorkoutListItem } from '../components/WorkoutListItem';
import { mockProfile } from '../data/mockProfile';
import { UserProfile } from '../types/profile';
import { colors, spacing, typography } from '../theme/colors';

type ProfileScreenProps = {
  profile?: UserProfile;
  onEditProfile?: () => void;
};

const formatNumber = (n: number): string => n.toLocaleString();

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile = mockProfile,
  onEditProfile,
}) => {
  const { name, tagline, avatarUrl, weeklyStats, recentWorkouts } = profile;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar uri={avatarUrl} size={104} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        {/* Weekly stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsRow}>
            <StatCard value={formatNumber(weeklyStats.steps)} label="Steps" />
            <StatCard value={formatNumber(weeklyStats.calories)} label="Calories" />
            <StatCard value={`${weeklyStats.distanceKm.toFixed(1)} km`} label="Distance" />
          </View>
        </View>

        {/* Recent workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View>
            {recentWorkouts.map((w) => (
              <WorkoutListItem key={w.id} workout={w} />
            ))}
          </View>
        </View>

        {/* Edit profile */}
        <PrimaryButton
          label="Edit Profile"
          onPress={onEditProfile}
          style={styles.editBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  name: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  editBtn: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.sm,
  },
});

export default ProfileScreen;
