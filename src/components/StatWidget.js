import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { corners, gaps, palette } from '../constants/theme';

export default function StatWidget({ helper, label, value }) {
  return (
    <View style={styles.metricContainer}>
      <Text style={styles.titleText}>{label}</Text>
      <Text style={styles.metricResult}>{value}</Text>
      {helper ? <Text style={styles.auxiliaryText}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  auxiliaryText: {
    color: palette.brandMain,
    fontSize: 11,
    fontWeight: '700',
    marginTop: gaps.tiny
  },
  metricContainer: {
    backgroundColor: palette.brandDark,
    borderColor: palette.lineDivider,
    borderRadius: corners.roundedMedium,
    borderWidth: 1,
    flex: 1,
    minWidth: '30%',
    padding: gaps.medium
  },
  metricResult: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: gaps.tiny
  },
  titleText: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});