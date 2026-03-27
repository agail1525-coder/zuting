import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/** Result of push token registration */
interface PushTokenResult {
  granted: boolean;
  token: string | null;
}

/**
 * Request notification permissions and retrieve the Expo push token.
 * Returns the token string if granted, null otherwise.
 */
export async function registerForPushNotifications(): Promise<PushTokenResult> {
  if (Platform.OS === 'web') {
    return { granted: false, token: null };
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { granted: false, token: null };
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4A855',
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn(
      '[notifications] No EAS projectId found. Push token unavailable.',
    );
    return { granted: true, token: null };
  }

  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });

  return { granted: true, token: pushToken.data };
}

/**
 * Configure default notification behavior (foreground display).
 * Call this once at app startup.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}
