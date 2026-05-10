import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography, TypographyToken } from '../theme';

type Tone = 'primary' | 'secondary' | 'inverse' | 'accent' | 'danger';

interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  tone?: Tone;
  children: React.ReactNode;
}

const toneToColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  inverse: colors.textInverse,
  accent: colors.accent,
  danger: colors.danger,
};

export function Text({
  variant = 'body',
  tone = 'primary',
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.6}
      style={[styles.base, typography[variant], { color: toneToColor[tone] }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
