import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@zuting/push-token';

// Configure notification handler — call once at app startup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and retrieve the Expo push token.
 * Persists the token to AsyncStorage for later retrieval.
 * Returns the token string if granted, null otherwise.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Joinus通知',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn(
        '[notifications] No EAS projectId found. Push token unavailable.',
      );
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Retrieve the previously saved push token from AsyncStorage.
 */
export async function getSavedPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}
