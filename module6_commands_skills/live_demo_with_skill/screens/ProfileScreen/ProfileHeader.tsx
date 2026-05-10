import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from '../../primitives';
import { spacing } from '../../theme';

interface ProfileHeaderProps {
  name: string;
  tagline: string;
  avatarUrl: string | null;
}

export function ProfileHeader({ name, tagline, avatarUrl }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Avatar uri={avatarUrl} name={name} size="xl" />
      <Text
        variant="display"
        tone="primary"
        style={styles.name}
        accessibilityRole="header"
      >
        {name}
      </Text>
      <Text variant="caption" tone="secondary" style={styles.tagline}>
        {tagline}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  name: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 320,
  },
});
