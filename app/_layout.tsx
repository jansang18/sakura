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
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
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

  const { width } = useWindowDimensions();
  if (!loaded) return null;

  // 폰 목업은 "넓은 화면(데스크톱 웹)"에서만 — 모바일 웹/네이티브는 풀스크린
  const framed = Platform.OS === 'web' && width > 600;

  return (
    <View style={[s.page, framed && s.pageFramed]}>
      <View style={[s.phone, framed && s.phoneFramed]}>
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

const s = StyleSheet.create({
  page: { flex: 1 },
  pageFramed: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#CBBDAC' },
  phone: { flex: 1, width: '100%', backgroundColor: C.night },
  phoneFramed: {
    flex: 0,
    width: '100%',
    maxWidth: PHONE_MAX,
    height: '92%',
    maxHeight: 860,
    borderRadius: 34,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
});
