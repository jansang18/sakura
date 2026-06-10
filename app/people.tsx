import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../constants/theme';
import { buildDailyMatches, type DailyMatch } from '../lib/match/daily';
import { PEOPLE } from '../lib/mock/people';
import { usePoints } from '../lib/store/points';
import { useSocial } from '../lib/store/social';
import { PURPOSES, type Purpose, useProfile } from '../lib/store/profile';

const PLABEL = Object.fromEntries(PURPOSES.map((p) => [p.key, p.label])) as Record<Purpose, string>;
const EXTRA_COST = 300;

function gunghapColor(n: number) {
  if (n >= 80) return C.thread;
  if (n >= 65) return C.gold;
  return C.moonDim;
}

function MatchCard({ m, onPass }: { m: DailyMatch; onPass: () => void }) {
  const router = useRouter();
  const { tempBonusOf } = useSocial();
  const g = m.preview.gunghap;
  const temp = m.person.flowerTemp + tempBonusOf(m.person.id);
  const goodSignal = g.signals.find((s) => s.effect === 'good')?.label.split(' — ')[0];
  const oneLiner = `${g.grade} · ${goodSignal ?? g.freeKeywords[0] ?? '천천히 알아가요'}`;

  return (
    <View style={s.card}>
      <Pressable
        style={({ pressed }) => [s.cardBody, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: '/person/[id]', params: { id: m.person.id } })}
      >
        <View style={s.cardTop}>
          <View style={s.avatarCol}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 28 }}>{m.person.emoji}</Text>
            </View>
            <Text style={s.temp}>🌸 {temp.toFixed(1)}℃</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={s.nameRow}>
              <Text style={s.name}>{m.person.name}</Text>
              <Text style={s.meta}>
                {m.person.age} · {m.person.gu}
                {m.sameGu && <Text style={{ color: C.thread }}> · 우리 동네</Text>}
              </Text>
            </View>
            <Text style={s.persona} numberOfLines={1}>
              {m.preview.persona.title}
            </Text>
            <View style={s.chips}>
              {m.person.purposes.slice(0, 3).map((p) => {
                const on = m.sharedPurposes.includes(p);
                return (
                  <View key={p} style={[s.chip, on && s.chipOn]}>
                    <Text style={[s.chipText, on && s.chipTextOn]}>{PLABEL[p]}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={s.scoreCol}>
            <Text style={[s.scoreNum, { color: gunghapColor(g.total) }]}>{g.total}℃</Text>
            <Text style={s.scoreLabel}>궁합</Text>
          </View>
        </View>

        <Text style={s.oneLiner}>{oneLiner}</Text>
      </Pressable>

      <Pressable style={s.pass} hitSlop={10} onPress={onPass}>
        <Text style={s.passText}>✕</Text>
      </Pressable>
    </View>
  );
}

export default function Home() {
  const profile = useProfile();
  const { balance, spend, charge } = usePoints();
  const matches = useMemo(() => buildDailyMatches(profile, PEOPLE), [profile]);

  const [revealed, setRevealed] = useState(3);
  const [passed, setPassed] = useState<string[]>([]);

  const visible = matches.slice(0, revealed).filter((m) => !passed.includes(m.person.id));
  const poolRemaining = matches.length - revealed;

  function pass(id: string) {
    setPassed((prev) => [...prev, id]);
  }
  function onExtra() {
    if (spend(EXTRA_COST)) setRevealed((r) => Math.min(matches.length, r + 3));
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.brand}>
          오늘의 <Text style={{ color: C.thread }}>벚꽃 인연</Text>
        </Text>
        <View style={s.points}>
          <Text style={s.pointsText}>🌸 {balance.toLocaleString()}P</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg, paddingTop: SP.sm }} showsVerticalScrollIndicator={false}>
        <Text style={s.lead}>
          {profile.gu} 근처에서, 사주 궁합과 거리로 고른{'\n'}오늘의 인연 {Math.min(3, matches.length)}명이 도착했어요 🌸
        </Text>

        {visible.map((m) => (
          <MatchCard key={m.person.id} m={m} onPass={() => pass(m.person.id)} />
        ))}

        {visible.length === 0 && (
          <Text style={s.empty}>오늘 추천을 모두 패스했어요.{'\n'}추가 매칭으로 더 만나보거나 내일 다시 만나요.</Text>
        )}

        {/* 추가 매칭 */}
        {poolRemaining > 0 ? (
          balance >= EXTRA_COST ? (
            <Pressable style={({ pressed }) => [s.extra, pressed && { backgroundColor: C.surface2 }]} onPress={onExtra}>
              <Text style={s.extraTitle}>+{poolRemaining}명 더 있어요</Text>
              <Text style={s.extraSub}>오늘의 추천을 다 봤다면 · 추가 매칭 {EXTRA_COST}P</Text>
            </Pressable>
          ) : (
            <Pressable style={[s.extra, { borderColor: C.gold }]} onPress={() => charge(5000)}>
              <Text style={[s.extraTitle, { color: C.gold }]}>포인트가 부족해요</Text>
              <Text style={s.extraSub}>탭해서 5,000P 충전하기</Text>
            </Pressable>
          )
        ) : (
          <Text style={s.done}>오늘의 인연은 여기까지예요.{'\n'}내일 또 새로운 벚꽃이 펴요 🌸</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
  },
  brand: { fontFamily: F.serif, fontSize: 22, color: C.moon },
  points: { backgroundColor: C.goldSoft, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { fontFamily: F.sansMed, fontSize: 12.5, color: C.gold },
  lead: { fontFamily: F.sans, fontSize: 13.5, color: C.moonDim, lineHeight: 21, marginBottom: SP.md },

  card: { backgroundColor: C.surface, borderRadius: R.md, marginBottom: SP.sm, borderWidth: 1, borderColor: C.line },
  cardBody: { padding: SP.md },
  cardTop: { flexDirection: 'row', gap: SP.md },
  avatarCol: { alignItems: 'center', gap: 5 },
  avatar: {
    width: 56, height: 56, borderRadius: R.pill, backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  temp: { fontFamily: F.sansMed, fontSize: 10.5, color: C.moonDim },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: F.sansBold, fontSize: 16.5, color: C.moon },
  meta: { fontFamily: F.sans, fontSize: 12, color: C.moonDim },
  persona: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { backgroundColor: C.surface2, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3 },
  chipOn: { backgroundColor: C.threadSoft },
  chipText: { fontFamily: F.sansMed, fontSize: 11, color: C.moonDim },
  chipTextOn: { color: C.thread },
  scoreCol: { alignItems: 'center', width: 52 },
  scoreNum: { fontFamily: F.sansBold, fontSize: 21 },
  scoreLabel: { fontFamily: F.sans, fontSize: 10.5, color: C.moonDim, marginTop: -2 },
  oneLiner: { fontFamily: F.sans, fontSize: 12.5, color: C.moonDim, marginTop: SP.sm, lineHeight: 18 },

  pass: { position: 'absolute', top: 8, right: 10, padding: 4 },
  passText: { color: C.moonDim, fontSize: 14 },

  extra: {
    backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, marginTop: SP.sm,
    borderWidth: 1, borderColor: C.line, alignItems: 'center',
  },
  extraTitle: { fontFamily: F.sansBold, fontSize: 15, color: C.thread },
  extraSub: { fontFamily: F.sans, fontSize: 12.5, color: C.moonDim, marginTop: 3 },

  empty: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, textAlign: 'center', marginVertical: SP.lg, lineHeight: 20 },
  done: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, textAlign: 'center', marginTop: SP.lg, lineHeight: 20 },
});
