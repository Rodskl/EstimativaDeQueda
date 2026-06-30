import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { corners, gaps, palette } from '../constants/theme';

export default function IncidentRecord({ event }) {
  const date = new Date(event.timestamp);

  return (
    <View style={styles.eventCard}>
      <View style={styles.infoContainer}>
        <Text style={styles.heading}>
          {event.simulated ? 'Simulação de Queda' : 'Queda Detectada!'}
        </Text>
        <Text style={styles.detailText}>
          {date.toLocaleDateString('pt-BR')} • {date.toLocaleTimeString('pt-BR')}
        </Text>
        <Text style={styles.detailText}>
          Pico: {event.magnitude?.toFixed?.(3) || '-'} g | Nível: {event.sensitivity || '-'}
        </Text>
      </View>
      <View style={styles.iconBadge}>
        <Text style={styles.indicatorIcon}>{event.simulated ? '🧪' : '⚠️'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailText: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 4
  },
  eventCard: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.lineDivider,
    borderRadius: corners.roundedMedium,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: gaps.small,
    padding: gaps.medium
  },
  heading: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: palette.brandDark,
    borderRadius: corners.roundedSmall,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  indicatorIcon: {
    fontSize: 20
  },
  infoContainer: {
    flex: 1,
    paddingRight: gaps.medium
  }
});