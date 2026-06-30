import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export default function MetricCard({ label, value, helper }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  label: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.xs
  },
  helper: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xs
  }
});
