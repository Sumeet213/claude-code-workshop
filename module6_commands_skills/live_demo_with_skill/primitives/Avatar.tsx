import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme';
import { Text } from './Text';

type Size = 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri: string | null;
  name: string;
  size?: Size;
}

const sizeMap: Record<Size, number> = {
  md: 48,
  lg: 72,
  xl: 96,
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function Avatar({ uri, name, size = 'lg' }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const dimension = sizeMap[size];
  const showImage = uri && !errored;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${name} avatar`}
      style={[
        styles.base,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          onError={() => setErrored(true)}
          style={{ width: dimension, height: dimension, borderRadius: dimension / 2 }}
        />
      ) : (
        <Text variant="display" tone="inverse">
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.pill,
  },
});
