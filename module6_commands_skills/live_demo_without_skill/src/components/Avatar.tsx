import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/colors';

type AvatarProps = {
  uri: string;
  size?: number;
};

export const Avatar: React.FC<AvatarProps> = ({ uri, size = 96 }) => {
  return (
    <View
      style={[
        styles.ring,
        { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 },
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityLabel="Profile avatar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
