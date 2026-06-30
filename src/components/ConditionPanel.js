import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { corners, gaps, palette } from '../constants/theme';

export default function ConditionPanel({ subtitle, title, tone = 'normal' }) {
  const isDanger = tone === 'danger';
  const isWarning = tone === 'warning';
  const statusColor = isDanger ? palette.alertCritical : isWarning ? palette.alertCaution : palette.alertPositive;

  return (
    <View style={[styles.statusWrapper, { borderColor: statusColor }]}> 
      <View style={styles.contentBox}>
        <Text style={[styles.primaryHeading, { color: statusColor }]}>{title}</Text>
        <Text style={styles.secondaryText}>{subtitle}</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: statusColor, shadowColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  contentBox: {
    flex: 1,
    paddingRight: gaps.medium
  },
  primaryHeading: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  secondaryText: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  statusDot: {
    borderRadius: 8,
    height: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    width: 16
  },
  statusWrapper: {
    alignItems: 'center',
    backgroundColor: palette.brandDark,
    borderRadius: corners.roundedMedium,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: gaps.large
  }
});