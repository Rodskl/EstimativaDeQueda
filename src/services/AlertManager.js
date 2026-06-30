import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export const ALERT_CHANNEL_ID = 'canal-alertas-urgentes';

export async function broadcastIncidentWarning({ simulated = false } = {}) {
  return Notifications.scheduleNotificationAsync({
    content: {
      body: simulated
        ? 'Esta é apenas uma simulação disparada pelo Monitor de Quedas.'
        : 'Nossos sensores detectaram um impacto forte. Por favor, cheque se está tudo bem.',
      data: {
        simulated,
        source: 'incident-monitor'
      },
      priority: 'max',
      sound: 'default',
      title: simulated ? 'Simulação de Emergência' : 'Atenção: Queda Identificada!'
    },
    trigger: {
      channelId: ALERT_CHANNEL_ID,
      seconds: 1,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
    }
  });
}

export async function configureDeviceAlerts() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#D64545',
      name: 'Notificações de Emergência',
      vibrationPattern: [0, 500, 200, 500, 200, 700]
    });
  }

  const activePermissions = await Notifications.getPermissionsAsync();
  let resolvedStatus = activePermissions.status;

  if (resolvedStatus !== 'granted') {
    const newPermissions = await Notifications.requestPermissionsAsync();
    resolvedStatus = newPermissions.status;
  }

  return resolvedStatus === 'granted';
}