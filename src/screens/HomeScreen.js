import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Vibration,
  View
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

import StatWidget from '../components/StatWidget';
import ConditionPanel from '../components/ConditionPanel';
import IncidentRecord from '../components/IncidentRecord';
import { corners, gaps, palette } from '../constants/theme';

import {
  BASE_TRACKING_STATE,
  DETECTION_PROFILES,
  evaluateSensorData,
  fetchStatusLabel,
  formatAccelerationG
} from '../utils/IncidentAnalyzer';

import { broadcastIncidentWarning, configureDeviceAlerts } from '../services/AlertManager';

const SENSOR_INTERVAL_MS = 100;
const EMPTY_ACCELERATION = { x: 0, y: 0, z: 0 };

export default function HomeScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [notificationAllowed, setNotificationAllowed] = useState(false);
  const [acceleration, setAcceleration] = useState(EMPTY_ACCELERATION);
  const [magnitude, setMagnitude] = useState(0);
  const [phase, setPhase] = useState('normal');
  const [sensitivityKey, setSensitivityKey] = useState('media');
  const [events, setEvents] = useState([]);
  const [lastAlert, setLastAlert] = useState(null);

  const detectorStateRef = useRef({ ...BASE_TRACKING_STATE });
  const subscriptionRef = useRef(null);

  const sensitivity = useMemo(
    () => DETECTION_PROFILES[sensitivityKey],
    [sensitivityKey]
  );

  useEffect(() => {
    configureDeviceAlerts()
      .then(setNotificationAllowed)
      .catch(() => setNotificationAllowed(false));

    return () => stopMonitoring();
  }, []);

  function startMonitoring() {
    detectorStateRef.current = { ...BASE_TRACKING_STATE };
    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener((sample) => {
      const now = Date.now();
      const result = evaluateSensorData({
        now,
        sample,
        sensitivityKey,
        state: detectorStateRef.current
      });

      detectorStateRef.current = result.nextState;
      setAcceleration(sample);
      setMagnitude(result.magnitude);
      setPhase(result.nextState.phase);

      if (result.event) {
        handleFallDetected(result.event);
      }
    });

    setIsMonitoring(true);
  }

  function stopMonitoring() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    setIsMonitoring(false);
    setPhase('normal');
  }

  async function handleFallDetected(event) {
    const normalizedEvent = {
      ...event,
      simulated: Boolean(event.simulated),
      id: `${event.timestamp}-${Math.random().toString(16).slice(2)}`
    };

    setLastAlert(normalizedEvent);
    setEvents((oldEvents) => [normalizedEvent, ...oldEvents].slice(0, 8));

    Vibration.vibrate([0, 700, 200, 700, 200, 900]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    broadcastIncidentWarning({ simulated: normalizedEvent.simulated }).catch(() => {});
  }

  function toggleMonitoring(value) {
    if (value) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }

  function changeSensitivity(key) {
    setSensitivityKey(key);
    detectorStateRef.current = { ...BASE_TRACKING_STATE };
  }

  function simulateFall() {
    const simulatedEvent = {
      magnitude: DETECTION_PROFILES[sensitivityKey].impactG + 0.35,
      sensitivity: DETECTION_PROFILES[sensitivityKey].label,
      simulated: true,
      timestamp: new Date().toISOString(),
      type: 'fall',
      variation: 0.12
    };
    handleFallDetected(simulatedEvent);
  }

  function clearHistory() {
    Alert.alert(
      'Limpar Histórico',
      'Deseja apagar os dados de queda desta sessão?',
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          onPress: () => {
            setEvents([]);
            setLastAlert(null);
          },
          style: 'destructive',
          text: 'Apagar Tudo'
        }
      ]
    );
  }

  const statusTone = lastAlert ? 'danger' : phase === 'normal' ? 'normal' : 'warning';
  const statusTitle = lastAlert ? 'QUEDA DETECTADA' : isMonitoring ? fetchStatusLabel(phase) : 'SISTEMA INATIVO';
  const statusSubtitle = lastAlert
    ? 'Possível acidente registrado. Pressione o botão abaixo se você estiver bem.'
    : isMonitoring
      ? `Sensores operando. Notificações: ${notificationAllowed ? 'ON' : 'OFF'}.`
      : 'Ligue o rastreamento para iniciar a telemetria.';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.mainContainer}>
      
      <View style={styles.heroSection}>
        <View style={styles.heroTextWrapper}>
          <Text style={styles.heroTitle}>FallGuard</Text>
          <Text style={styles.heroSubtitle}>Monitoramento Ativo</Text>
        </View>
        <Switch 
          onValueChange={toggleMonitoring} 
          thumbColor={isMonitoring ? palette.textPrimary : palette.textSecondary} 
          trackColor={{ false: palette.lineDivider, true: palette.brandMain }} 
          value={isMonitoring} 
          style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }} 
        />
      </View>

      <View style={styles.statusSection}>
        <ConditionPanel subtitle={statusSubtitle} title={statusTitle} tone={statusTone} />
      </View>

      {lastAlert ? (
        <Pressable onPress={() => setLastAlert(null)} style={styles.dismissAlertButton}>
          <Text style={styles.dismissAlertText}>ESTOU BEM (DESCARTAR)</Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionLabel}>Telemetria em Tempo Real</Text>
      <View style={styles.statsGrid}>
        <StatWidget helper="Módulo" label="G-Force" value={formatAccelerationG(magnitude)} />
        <StatWidget label="X" value={formatAccelerationG(acceleration.x)} />
        <StatWidget label="Y" value={formatAccelerationG(acceleration.y)} />
        <StatWidget label="Z" value={formatAccelerationG(acceleration.z)} />
      </View>

      <View style={styles.glassPanel}>
        <Text style={styles.sectionLabel}>Perfil de Sensibilidade</Text>
        <View style={styles.pillContainer}>
          {Object.entries(DETECTION_PROFILES).map(([key, item]) => {
            const selected = key === sensitivityKey;
            return (
              <Pressable 
                key={key} 
                onPress={() => changeSensitivity(key)}
                style={[styles.pillButton, selected && styles.pillButtonActive]}
              >
                <Text style={[styles.pillLabel, selected && styles.pillLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.infoText}>{sensitivity.description}</Text>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionLabel}>Últimos Registros</Text>
        <Pressable onPress={clearHistory}>
          <Text style={styles.clearText}>Limpar</Text>
        </Pressable>
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nenhuma anomalia detectada.</Text>
        </View>
      ) : (
        events.map((event) => <IncidentRecord event={event} key={event.id} />)
      )}

      <Pressable onPress={simulateFall} style={styles.ghostBtn}>
        <Text style={styles.ghostBtnText}>Testar Simulação de Impacto</Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clearText: { color: palette.brandMain, fontSize: 14, fontWeight: '700' },
  dismissAlertButton: { alignItems: 'center', backgroundColor: palette.alertCritical, borderRadius: corners.roundedLarge, elevation: 10, marginBottom: gaps.large, padding: gaps.medium, shadowColor: palette.alertCritical, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  dismissAlertText: { color: palette.textPrimary, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  emptyState: { alignItems: 'center', backgroundColor: palette.surface, borderColor: palette.lineDivider, borderRadius: corners.roundedMedium, borderStyle: 'dashed', borderWidth: 1, padding: gaps.large },
  emptyStateText: { color: palette.textSecondary, fontSize: 14 },
  ghostBtn: { alignItems: 'center', borderColor: palette.lineDivider, borderRadius: corners.roundedLarge, borderWidth: 1, marginTop: gaps.large, padding: gaps.medium },
  ghostBtnText: { color: palette.textSecondary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  glassPanel: { backgroundColor: palette.surface, borderRadius: corners.roundedLarge, marginBottom: gaps.large, padding: gaps.large },
  heroSection: { alignItems: 'center', backgroundColor: palette.surface, borderRadius: corners.roundedLarge, flexDirection: 'row', justifyContent: 'space-between', marginBottom: gaps.small, padding: gaps.large },
  heroSubtitle: { color: palette.brandMain, fontSize: 14, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  heroTextWrapper: { flex: 1 },
  heroTitle: { color: palette.textPrimary, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  historyHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: gaps.small },
  infoText: { color: palette.textSecondary, fontSize: 13, lineHeight: 20, marginTop: gaps.medium, textAlign: 'center' },
  mainContainer: { backgroundColor: palette.screenBg, flex: 1 },
  pillButton: { alignItems: 'center', borderRadius: corners.roundedLarge, flex: 1, paddingVertical: gaps.small },
  pillButtonActive: { backgroundColor: palette.brandMain, shadowColor: palette.brandMain, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  pillContainer: { backgroundColor: palette.brandDark, borderRadius: corners.roundedLarge, flexDirection: 'row', marginTop: gaps.small, padding: 4 },
  pillLabel: { color: palette.textSecondary, fontWeight: '800' },
  pillLabelActive: { color: palette.brandDark },
  scrollContent: { padding: gaps.medium, paddingBottom: gaps.extraLarge },
  sectionLabel: { color: palette.textPrimary, fontSize: 15, fontWeight: '800', letterSpacing: 0.5, marginBottom: gaps.small, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: gaps.small, marginBottom: gaps.large },
  statusSection: { marginBottom: gaps.large }
});