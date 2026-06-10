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
import { C } from '../constants/theme';

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
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.night },
          animation: 'fade',
        }}
      />
    </>
  );
}
