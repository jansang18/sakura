import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, ELEMENTS, F, R, SP } from '../constants/theme';
import { enableDailyMatchAlert } from '../lib/notify';
import { chartPillars, computeSaju, EL_WORD, personality } from '../lib/saju';
import { usePoints } from '../lib/store/points';
import { PURPOSES, type Purpose, useProfile } from '../lib/store/profile';

const PLABEL = Object.fromEntries(PURPOSES.map((p) => [p.key, p.label])) as Record<Purpose, string>;
const EL_ORDER = ['mok', 'hwa', 'to', 'geum', 'su'] as const;

export default function Me() {
  const router = useRouter();
  const profile = useProfile();
  const { balance } = usePoints();
  const [notif, setNotif] = useState('');

  const chart = computeSaju(profile.birth);
  const persona = personality(chart);
  const maxEl = Math.max(1, ...EL_ORDER.map((k) => chart.elements[k]));

  async function onAlert() {
    setNotif('요청 중…');
    const r = await enableDailyMatchAlert();
    setNotif(
      r === 'scheduled' ? '알림 예약됨 (5초 뒤 데모 알림)' :
      r === 'web-unsupported' ? '웹에선 미지원 — 앱에서 동작해요' :
      r === 'denied' ? '알림 권한이 거부됐어요' : '알림 설정 실패',
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>마이</Text>
        <Pressable style={s.points} onPress={() => router.push('/shop')}>
          <Text style={s.pointsText}>🌸 {balance.toLocaleString()}P</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg }} showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={s.profile}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 34 }}>🌸</Text>
          </View>
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.sub}>
            {profile.gu} · 벚꽃온도 36.5℃ · {chart.tti}띠
          </Text>
          <View style={s.chips}>
            {profile.purposes.map((p) => (
              <View key={p} style={s.chip}>
                <Text style={s.chipText}>{PLABEL[p]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 내 사주 */}
        <Text style={s.sectionTitle}>내 사주</Text>
        <View style={s.scard}>
          <View style={s.pillarRow}>
            {chartPillars(chart).map((p) => (
              <View key={p.label} style={s.pillar}>
                <Text style={s.pillarGz}>{p.gz}</Text>
                <Text style={s.pillarLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.divider} />
          <Text style={s.dayMaster}>
            일간 <Text style={{ color: ELEMENTS[chart.dayMasterEl].color }}>{chart.dayMasterKo}({EL_WORD[chart.dayMasterEl]})</Text>
            {'  ·  '}{chart.dayMasterYang ? '양' : '음'}
          </Text>
          <View style={{ marginTop: SP.md, gap: 7 }}>
            {EL_ORDER.map((k) => (
              <View key={k} style={s.barRow}>
                <Text style={[s.barLabel, { color: ELEMENTS[k].color }]}>{EL_WORD[k]}</Text>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${(chart.elements[k] / maxEl) * 100}%`, backgroundColor: ELEMENTS[k].color }]} />
                </View>
                <Text style={s.barCount}>{chart.elements[k]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 성격 */}
        <Text style={s.sectionTitle}>내 성격</Text>
        <View style={s.scard}>
          <Text style={s.personaTitle}>{persona.title}</Text>
          <View style={s.kwRow}>
            {persona.keywords.map((k) => (
              <View key={k} style={s.kw}><Text style={s.kwText}>{k}</Text></View>
            ))}
          </View>
          <Text style={s.personaBody}>{persona.deep.core}</Text>
          <Text style={s.personaBody}>대화 스타일 — {persona.free.talkStyle}</Text>
        </View>

        {/* 액션 */}
        <Text style={s.sectionTitle}>설정</Text>
        <View style={s.menu}>
          <Pressable style={s.menuRow} onPress={() => router.push('/topics')}>
            <Text style={s.menuText}>🎨 동네 소모임</Text><Text style={s.arrow}>›</Text>
          </Pressable>
          <Pressable style={s.menuRow} onPress={() => router.push('/shop')}>
            <Text style={s.menuText}>🌸 포인트 충전</Text><Text style={s.arrow}>›</Text>
          </Pressable>
          <Pressable style={s.menuRow} onPress={onAlert}>
            <Text style={s.menuText}>🔔 오늘의 인연 알림 받기</Text>
            <Text style={s.menuHint}>{notif}</Text>
          </Pressable>
          <Pressable style={s.menuRow} onPress={() => router.push('/onboarding')}>
            <Text style={s.menuText}>✏️ 생년월일시·구·목적 수정</Text><Text style={s.arrow}>›</Text>
          </Pressable>
          <Pressable style={[s.menuRow, { borderBottomWidth: 0 }]} onPress={() => router.replace('/welcome')}>
            <Text style={[s.menuText, { color: C.moonDim }]}>로그아웃</Text>
          </Pressable>
        </View>
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

  profile: { alignItems: 'center', marginTop: SP.sm, marginBottom: SP.lg },
  avatar: { width: 76, height: 76, borderRadius: R.pill, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line2 },
  name: { fontFamily: F.sansBold, fontSize: 20, color: C.moon, marginTop: SP.md },
  sub: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' },
  chip: { backgroundColor: C.surface2, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontFamily: F.sansMed, fontSize: 11.5, color: C.moonDim },

  sectionTitle: { fontFamily: F.sansBold, fontSize: 14, color: C.moon, marginTop: SP.xl, marginBottom: SP.sm },
  scard: { backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, borderWidth: 1, borderColor: C.line },
  pillarRow: { flexDirection: 'row', justifyContent: 'space-around' },
  pillar: { alignItems: 'center' },
  pillarGz: { fontFamily: F.serif, fontSize: 18, color: C.moon },
  pillarLabel: { fontFamily: F.sans, fontSize: 11, color: C.moonDim, marginTop: 3 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: SP.md },
  dayMaster: { fontFamily: F.sansMed, fontSize: 14.5, color: C.moon },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontFamily: F.sansMed, fontSize: 12, width: 22 },
  track: { flex: 1, height: 7, borderRadius: 4, backgroundColor: C.surface2, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 4 },
  barCount: { fontFamily: F.sansMed, fontSize: 12, color: C.moonDim, width: 14, textAlign: 'right' },

  personaTitle: { fontFamily: F.serif, fontSize: 16, color: C.thread },
  kwRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 10 },
  kw: { backgroundColor: C.threadSoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  kwText: { fontFamily: F.sansMed, fontSize: 12, color: C.thread },
  personaBody: { fontFamily: F.sans, fontSize: 13.5, color: C.moon, lineHeight: 20, marginTop: 6 },

  menu: { backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line, paddingHorizontal: SP.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: C.line },
  menuText: { fontFamily: F.sansMed, fontSize: 14.5, color: C.moon },
  menuHint: { fontFamily: F.sans, fontSize: 11.5, color: C.gold },
  arrow: { fontFamily: F.sans, fontSize: 18, color: C.moonDim },
});
