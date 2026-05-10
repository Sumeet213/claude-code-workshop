import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { Text } from './Text';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text variant="body" tone="danger" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" tone="secondary" style={styles.message}>
        {message}
      </Text>
      <View style={styles.action}>
        <Button label={retryLabel} onPress={onRetry} variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: spacing.lg,
  },
});
