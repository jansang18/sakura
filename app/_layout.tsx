import {
  GowunBatang_400Regular,
  GowunBatang_700Bold,
} from '@expo-google-fonts/gowun-batang';
import {
  IBMPlexSansKR_400Regular,
  IBMPlexSansKR_500Medium,
  IBMPlexSansKR_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-kr';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { C } from '../constants/theme';

const PHONE_MAX = 400;

// 폰트 로딩 끝날 때까지 스플래시 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    GowunBatang_400Regular,
    GowunBatang_700Bold,
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <View style={s.page}>
      <View style={s.phone}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: C.night },
            animation: 'fade',
          }}
        />
      </View>
    </View>
  );
}

// 웹(데스크톱)에선 화면 정중앙에 둥근 폰 목업 — 네이티브에선 풀스크린
const s = StyleSheet.create({
  page:
    Platform.OS === 'web'
      ? { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#CBBDAC' }
      : { flex: 1 },
  phone:
    Platform.OS === 'web'
      ? {
          width: '100%',
          maxWidth: PHONE_MAX,
          height: '92%',
          maxHeight: 860,
          backgroundColor: C.night,
          borderRadius: 34,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 12 },
        }
      : { flex: 1, width: '100%', backgroundColor: C.night },
});
