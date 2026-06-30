import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export default function EventItem({ event }) {
  const date = new Date(event.timestamp);

  return (
    <View style={styles.item}>
      <Text style={styles.icon}>{event.simulated ? '🧪' : '⚠️'}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{event.simulated ? 'Alerta simulado' : 'Queda provável'}</Text>
        <Text style={styles.description}>
          {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR')}
        </Text>
        <Text style={styles.description}>
          Pico: {event.magnitude?.toFixed?.(3) || '-'} g | Sensibilidade: {event.sensitivity || '-'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm
  },
  icon: {
    fontSize: 23,
    marginRight: spacing.md
  },
  content: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15
  },
  description: {
    color: colors.textLight,
    marginTop: 3,
    fontSize: 12
  }
});
