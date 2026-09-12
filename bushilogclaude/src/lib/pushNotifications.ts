import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL = 'https://irie-server.onrender.com';
const EAS_PROJECT_ID = '7ebcec43-c280-4917-a26f-92272781112e';
const ENABLED_KEY = 'push_enabled';
const PROMPTED_KEY = 'push_prompted';

// expo-notifications is required lazily: the native module is absent in builds
// older than 75, and a top-level import would crash bundle evaluation
// (same failure mode as the ExpoLocation incident).
function getNotifications(): any | null {
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

export async function wasPromptedForPush(): Promise<boolean> {
  return (await AsyncStorage.getItem(PROMPTED_KEY)) === '1';
}

export async function markPromptedForPush(): Promise<void> {
  await AsyncStorage.setItem(PROMPTED_KEY, '1');
}

export async function isPushEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) === '1';
}

/** Ask OS permission, fetch the Expo push token and register it. Returns true when enabled. */
export async function enablePush(deviceId: string): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.warn('[push] expo-notifications native module unavailable (pre-75 build)');
    return false;
  }
  try {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    const res = await fetch(`${SERVER_URL}/register-push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, token, enabled: true }),
    });
    if (!res.ok) return false;
    await AsyncStorage.setItem(ENABLED_KEY, '1');
    return true;
  } catch (e) {
    console.warn('[push] enable failed:', e);
    return false;
  }
}

export async function disablePush(deviceId: string): Promise<void> {
  try {
    await fetch(`${SERVER_URL}/register-push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, enabled: false }),
    });
  } catch (e) {
    console.warn('[push] disable failed:', e);
  }
  await AsyncStorage.setItem(ENABLED_KEY, '0');
}
