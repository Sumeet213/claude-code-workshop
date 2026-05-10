import React, { useCallback } from 'react';
import {
  AccessibilityRole,
  Platform,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, motion, radii, spacing } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(motion.press.button, motion.spring);
  }, [reducedMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(1, motion.spring);
  }, [reducedMotion, scale]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }, [onPress]);

  const containerStyle: ViewStyle = {
    backgroundColor: variant === 'primary' ? colors.accent : 'transparent',
    borderWidth: variant === 'secondary' ? 1 : 0,
    borderColor: colors.border,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      hitSlop={8}
      testID={testID}
      style={[styles.base, containerStyle, animatedStyle]}
    >
      <Text
        variant="body"
        tone={variant === 'primary' ? 'inverse' : 'primary'}
        style={styles.label}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
