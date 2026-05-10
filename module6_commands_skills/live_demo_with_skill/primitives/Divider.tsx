import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function Divider() {
  return <View style={styles.line} accessibilityElementsHidden importantForAccessibility="no" />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: '100%',
  },
});
