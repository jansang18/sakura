import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F, R, SP } from '../constants/theme';
import { supabase } from '../lib/supabase';

// 카카오 말풍선 심볼
function KakaoBubble() {
  return (
    <Svg width={19} height={19} viewBox="0 0 18 18">
      <Path
        d="M9 2C4.58 2 1 4.79 1 8.23c0 2.2 1.46 4.13 3.67 5.24-.16.57-.58 2.06-.66 2.38-.1.4.15.39.31.28.13-.08 2.05-1.39 2.88-1.95.58.08 1.18.13 1.8.13 4.42 0 8-2.79 8-6.23S13.42 2 9 2z"
        fill="#191600"
      />
    </Svg>
  );
}

function AuthButton({
  bg,
  color,
  label,
  icon,
  onPress,
}: {
  bg: string;
  color: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.btn, { backgroundColor: bg }, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={s.btnIcon}>{icon}</View>
      <Text style={[s.btnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function Login() {
  const router = useRouter();

  // 미설정(키 없음/실패) 시 데모 진행
  const start = () => router.push('/onboarding');

  // 카카오: Supabase OAuth (프로바이더 활성화 + 키 필요)
  async function kakaoLogin() {
    if (!supabase) return start();
    try {
      const redirectTo = Linking.createURL('/');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
      });
      if (error || !data?.url) return start();
      if (Platform.OS === 'web') return; // 웹은 자동 리다이렉트
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type === 'success' && res.url) {
        const code = Linking.parse(res.url).queryParams?.code;
        if (typeof code === 'string') await supabase.auth.exchangeCodeForSession(code);
      }
      router.replace('/onboarding');
    } catch {
      start();
    }
  }

  // 네이버: 자체 콜백 Edge Function 경유 (EXPO_PUBLIC_NAVER_* 설정 시)
  async function naverLogin() {
    const clientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
    const callback = process.env.EXPO_PUBLIC_NAVER_CALLBACK;
    if (!clientId || !callback) return start();
    try {
      const authUrl =
        'https://nid.naver.com/oauth2.0/authorize?response_type=code' +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(callback)}&state=dnbk`;
      await WebBrowser.openAuthSessionAsync(authUrl, Linking.createURL('/'));
      router.replace('/onboarding');
    } catch {
      start();
    }
  }

  return (
    <ImageBackground source={require('../assets/images/login-bg.png')} style={s.bg} resizeMode="cover">
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <View style={s.panel}>
          <AuthButton
            bg="#FEE500"
            color="#191600"
            label="카카오톡으로 시작하기"
            icon={<KakaoBubble />}
            onPress={kakaoLogin}
          />
          <AuthButton
            bg="#03C75A"
            color="#FFFFFF"
            label="네이버로 시작하기"
            icon={<Text style={s.naverN}>N</Text>}
            onPress={naverLogin}
          />

          <Pressable style={s.browse} hitSlop={8} onPress={() => router.push('/onboarding')}>
            <Text style={s.browseText}>로그인 없이 둘러보기</Text>
          </Pressable>

          <Text style={s.legal}>시작하면 이용약관과 개인정보처리방침에 동의하게 돼요.</Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    backgroundColor: 'rgba(246,238,228,0.86)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26,
    gap: SP.sm,
  },

  btn: {
    height: 54,
    borderRadius: R.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  btnIcon: { position: 'absolute', left: 18, width: 22, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: F.sansBold, fontSize: 15.5 },
  naverN: { color: '#fff', fontFamily: F.sansBold, fontSize: 18 },

  browse: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
  browseText: { fontFamily: F.sansMed, fontSize: 13.5, color: '#5A3F49', textDecorationLine: 'underline' },

  legal: { fontFamily: F.sans, fontSize: 11.5, color: 'rgba(60,30,42,0.6)', textAlign: 'center' },
});
