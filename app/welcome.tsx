import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { BRAND, C, F, R, SP } from '../constants/theme';

// 별 위치 (고정 — 렌더마다 흔들리지 않게)
const STARS = [
  { x: 0.12, y: 0.06, s: 2.5, o: 0.35 },
  { x: 0.78, y: 0.04, s: 2, o: 0.28 },
  { x: 0.45, y: 0.11, s: 1.5, o: 0.2 },
  { x: 0.9, y: 0.15, s: 2.5, o: 0.3, gold: true },
  { x: 0.25, y: 0.19, s: 1.5, o: 0.15 },
  { x: 0.62, y: 0.23, s: 2, o: 0.22 },
  { x: 0.08, y: 0.3, s: 1.5, o: 0.18 },
  { x: 0.85, y: 0.34, s: 1.5, o: 0.16, gold: true },
];

// 흩날리는 벚꽃잎 (고정 위치)
const PETALS = [
  { x: 0.16, y: 0.09, s: 17, o: 0.5, r: '14deg' },
  { x: 0.82, y: 0.14, s: 13, o: 0.4, r: '-20deg' },
  { x: 0.68, y: 0.06, s: 11, o: 0.32, r: '32deg' },
  { x: 0.3, y: 0.27, s: 12, o: 0.28, r: '-8deg' },
];

function Starfield() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((st, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: st.x * width,
            top: st.y * height,
            width: st.s,
            height: st.s,
            borderRadius: st.s / 2,
            backgroundColor: st.gold ? C.gold : C.thread,
            opacity: st.o,
          }}
        />
      ))}
      {PETALS.map((p, i) => (
        <Text
          key={`p${i}`}
          style={{
            position: 'absolute',
            left: p.x * width,
            top: p.y * height,
            fontSize: p.s,
            opacity: p.o,
            transform: [{ rotate: p.r }],
          }}
        >
          🌸
        </Text>
      ))}
    </View>
  );
}

// 로고 아래 흐르는 벚꽃빛 선
function ThreadLine() {
  return (
    <Svg width={170} height={22} viewBox="0 0 170 22" fill="none">
      <Path
        d="M4 11 C 40 2, 60 20, 85 11 S 140 2, 166 11"
        stroke={C.thread}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={4} cy={11} r={3} fill={C.thread} />
      <Circle cx={166} cy={11} r={3} fill={C.thread} />
    </Svg>
  );
}

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.root}>
      <Starfield />

      <View style={s.logoWrap}>
        <Text style={s.knot}>🌸</Text>
        <Text style={s.logotype}>
          {BRAND.slice(0, 2)}
          <Text style={{ color: C.thread }}>{BRAND.slice(2)}</Text>
        </Text>
        <View style={{ marginTop: SP.md }}>
          <ThreadLine />
        </View>
      </View>

      <Text style={s.sub}>
        걸어서 닿는 거리, 취향이 닿는 사람.{'\n'}우리 구(區)에서 좋아하는 걸로 모여요.{'\n\n'}
        카페·러닝·타로·맛집 ·· 관심사로 만나고,{'\n'}사주로 결이 맞는 사람부터 살짝.
      </Text>

      <View style={{ flex: 1 }} />

      <Pressable
        style={({ pressed }) => [s.cta, pressed && { backgroundColor: C.threadDeep }]}
        onPress={() => router.push('/login')}
      >
        <Text style={s.ctaText}>동네 친구 만나러 가기</Text>
      </Pressable>

      <Pressable style={s.ghost} onPress={() => router.push('/login')}>
        <Text style={s.ghostText}>이미 계정이 있어요 · 로그인</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.night,
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 96,
  },
  knot: {
    fontSize: 50,
    textShadowColor: 'rgba(242,121,159,0.5)',
    textShadowRadius: 22,
    textShadowOffset: { width: 0, height: 0 },
  },
  logotype: {
    fontFamily: F.serif,
    fontSize: 34,
    color: C.moon,
    letterSpacing: 3,
    marginTop: SP.lg,
  },
  sub: {
    fontFamily: F.sans,
    fontSize: 14.5,
    lineHeight: 24,
    color: C.moonDim,
    textAlign: 'center',
    marginTop: SP.xl,
  },
  cta: {
    backgroundColor: C.thread,
    borderRadius: R.md,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: C.thread,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaText: {
    fontFamily: F.sansBold,
    fontSize: 16,
    color: C.onThread,
  },
  ghost: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: SP.md,
  },
  ghostText: {
    fontFamily: F.sansMed,
    fontSize: 13,
    color: C.moonDim,
  },
});
