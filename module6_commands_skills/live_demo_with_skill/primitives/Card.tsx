import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

type Variant = 'shadow' | 'border';

interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: keyof typeof spacing;
  children: React.ReactNode;
}

export function Card({
  variant = 'border',
  padding = 'lg',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding] },
        variant === 'border' ? styles.border : shadows.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
