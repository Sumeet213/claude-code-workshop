import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, Card, Divider } from '../../primitives';
import { spacing } from '../../theme';

export function ProfileSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading profile" accessibilityRole="progressbar">
      <View style={styles.header}>
        <Skeleton width={96} height={96} radius={48} />
        <Skeleton width={160} height={20} style={{ marginTop: spacing.lg }} />
        <Skeleton width={220} height={14} style={{ marginTop: spacing.sm }} />
      </View>

      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.statSlot}>
            <Skeleton height={88} radius={16} />
          </View>
        ))}
      </View>

      <Card variant="border" style={styles.list}>
        <Skeleton width={140} height={18} />
        <View style={{ height: spacing.md }} />
        {[0, 1, 2].map((i) => (
          <View key={i}>
            <View style={styles.listRow}>
              <Skeleton width={8} height={8} radius={4} />
              <View style={styles.listBody}>
                <Skeleton width={'70%'} height={16} />
                <View style={{ height: spacing.xs }} />
                <Skeleton width={'40%'} height={12} />
              </View>
              <Skeleton width={48} height={16} />
            </View>
            {i < 2 ? <Divider /> : null}
          </View>
        ))}
      </Card>

      <Skeleton height={48} radius={16} style={{ marginTop: spacing.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statSlot: {
    flex: 1,
  },
  list: {
    gap: 0,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  listBody: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
});
