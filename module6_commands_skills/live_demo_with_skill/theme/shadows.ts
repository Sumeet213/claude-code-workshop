import { Platform, ViewStyle } from 'react-native';

const ios = (
  offsetY: number,
  radius: number,
  opacity: number,
): ViewStyle => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

export const shadows = {
  none: {} as ViewStyle,
  card: Platform.select({
    ios: ios(4, 12, 0.25),
    android: { elevation: 3 },
    default: ios(4, 12, 0.25),
  }) as ViewStyle,
  raised: Platform.select({
    ios: ios(8, 20, 0.3),
    android: { elevation: 6 },
    default: ios(8, 20, 0.3),
  }) as ViewStyle,
} as const;

export type ShadowToken = keyof typeof shadows;
