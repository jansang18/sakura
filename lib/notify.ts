// 푸시(로컬) 알림 — 데모: "오늘의 인연 도착". 네이티브에서만 동작.
import { Platform } from 'react-native';

export type NotifyResult = 'web-unsupported' | 'denied' | 'scheduled' | 'error';

export async function enableDailyMatchAlert(): Promise<NotifyResult> {
  if (Platform.OS === 'web') return 'web-unsupported';
  try {
    const Notifications = await import('expo-notifications');
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted && perm.status !== 'granted') return 'denied';
    await Notifications.scheduleNotificationAsync({
      content: { title: '동네벚꽃 🌸', body: '오늘의 벚꽃 인연 3명이 도착했어요!' },
      // 데모: 5초 뒤. 실제론 매일 아침 트리거로 교체.
      trigger: { seconds: 5 } as any,
    });
    return 'scheduled';
  } catch {
    return 'error';
  }
}
