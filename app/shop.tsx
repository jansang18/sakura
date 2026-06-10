import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../constants/theme';
import { usePoints } from '../lib/store/points';

const PACKS = [
  { p: 1000, won: 1900, tag: '' },
  { p: 3500, won: 5900, tag: '인기' },
  { p: 8000, won: 11900, tag: '+10% 보너스' },
];

export default function Shop() {
  const router = useRouter();
  const { balance, charge } = usePoints();
  const [msg, setMsg] = useState('');

  function buy(p: number) {
    charge(p);
    setMsg(`+${p.toLocaleString()}P 충전 완료 (데모)`);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>포인트 충전</Text>
        <View style={s.points}>
          <Text style={s.pointsText}>🌸 {balance.toLocaleString()}P</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg }} showsVerticalScrollIndicator={false}>
        {msg !== '' && (
          <View style={s.toast}>
            <Text style={s.toastText}>{msg}</Text>
          </View>
        )}

        <Text style={s.sectionTitle}>벚꽃포인트</Text>
        {PACKS.map((pk) => (
          <Pressable key={pk.p} style={({ pressed }) => [s.pack, pressed && { backgroundColor: C.surface2 }]} onPress={() => buy(pk.p)}>
            <View style={{ flex: 1 }}>
              <Text style={s.packP}>
                🌸 {pk.p.toLocaleString()}P {pk.tag ? <Text style={s.packTag}> {pk.tag}</Text> : null}
              </Text>
            </View>
            <View style={s.priceBtn}>
              <Text style={s.priceText}>{pk.won.toLocaleString()}원</Text>
            </View>
          </Pressable>
        ))}

        <Text style={s.sectionTitle}>구독 · 벚꽃패스</Text>
        <View style={s.passCard}>
          <Text style={s.passTitle}>벚꽃패스</Text>
          <Text style={s.passDesc}>매일 +1 추천 · 깊은 풀이 월 5회 · 벚꽃온도 뱃지</Text>
          <Pressable style={s.passBtn} onPress={() => setMsg('벚꽃패스 구독 시작 (데모)')}>
            <Text style={s.passBtnText}>월 7,900원 구독하기</Text>
          </Pressable>
        </View>

        <Text style={s.legal}>실제 결제는 Google Play 인앱결제(RevenueCat)로 연동 예정 — 지금은 데모 충전이에요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm },
  back: { color: C.moon, fontSize: 22, width: 24 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: F.serif, fontSize: 19, color: C.moon },
  points: { backgroundColor: C.goldSoft, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { fontFamily: F.sansMed, fontSize: 12.5, color: C.gold },

  toast: { backgroundColor: C.threadSoft, borderRadius: R.md, padding: SP.md, marginBottom: SP.md, borderWidth: 1, borderColor: C.thread },
  toastText: { fontFamily: F.sansMed, fontSize: 13.5, color: C.thread, textAlign: 'center' },

  sectionTitle: { fontFamily: F.sansBold, fontSize: 14, color: C.moon, marginTop: SP.lg, marginBottom: SP.sm },
  pack: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, marginBottom: SP.sm, borderWidth: 1, borderColor: C.line },
  packP: { fontFamily: F.sansBold, fontSize: 16, color: C.moon },
  packTag: { fontFamily: F.sansMed, fontSize: 11.5, color: C.gold },
  priceBtn: { backgroundColor: C.thread, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 9 },
  priceText: { fontFamily: F.sansBold, fontSize: 13.5, color: C.onThread },

  passCard: { backgroundColor: C.surface, borderRadius: R.md, padding: SP.lg, borderWidth: 1, borderColor: C.gold },
  passTitle: { fontFamily: F.serif, fontSize: 18, color: C.gold },
  passDesc: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 6, lineHeight: 19 },
  passBtn: { backgroundColor: C.gold, borderRadius: R.md, paddingVertical: 14, alignItems: 'center', marginTop: SP.md },
  passBtnText: { fontFamily: F.sansBold, fontSize: 15, color: C.onThread },

  legal: { fontFamily: F.sans, fontSize: 11.5, color: C.moonDim, textAlign: 'center', marginTop: SP.lg, lineHeight: 17 },
});
