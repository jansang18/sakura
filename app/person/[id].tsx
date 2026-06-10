import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, ELEMENTS, F, R, SP } from '../../constants/theme';
import { fetchDeepReport } from '../../lib/ai/report';
import { acceptMatch } from '../../lib/store/social';
import { findPerson } from '../../lib/mock/people';
import { buildPreview, type Preview } from '../../lib/preview';
import { EL_WORD } from '../../lib/saju';
import { usePoints } from '../../lib/store/points';

// 유료 항목 정의 — 무료(궁합 점수/키워드)는 미끼, 깊은 해석은 결제
interface PremiumItem {
  key: string;
  icon: string;
  title: string;
  price: number;
  get: (pv: Preview) => string;
}
const PREMIUM: PremiumItem[] = [
  { key: 'friendFit', icon: '🤝', title: '친구로 잘 맞는 이유', price: 1000, get: (pv) => pv.persona.deep.friendFit },
  { key: 'lover', icon: '💗', title: '연인으로 발전 가능성', price: 1500, get: (pv) => pv.persona.deep.loverPotential },
  { key: 'core', icon: '🪞', title: '상대방 성격 깊이보기', price: 1000, get: (pv) => pv.persona.deep.core },
  { key: 'caution', icon: '⚠️', title: '조심해야 할 대화 방식', price: 1000, get: (pv) => pv.persona.deep.caution },
  { key: 'approach', icon: '🗝️', title: '친해지는 공략법', price: 1000, get: (pv) => pv.persona.deep.approach },
  { key: 'role', icon: '🎭', title: '모임에서 잘 맞는 역할', price: 2000, get: (pv) => pv.persona.deep.groupRole },
];

const SCORES = [
  { key: 'friend', label: '친구', color: C.gold },
  { key: 'lover', label: '연인', color: C.thread },
  { key: 'talk', label: '대화', color: C.su },
] as const;

function mask(text: string) {
  return text.slice(0, 14) + ' ⋯⋯⋯⋯⋯⋯';
}

export default function PersonPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const person = findPerson(id);
  const { balance, isUnlocked, unlock, charge } = usePoints();
  const [sheet, setSheet] = useState<PremiumItem | null>(null);
  const [aiText, setAiText] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  if (!person) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.missing}>사람을 찾을 수 없어요.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={s.back}>← 돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const pv = buildPreview(person);
  const g = pv.gunghap;
  const el = pv.chart.dayMasterEl;
  const scoreVal = { friend: g.friend, lover: g.lover, talk: g.talk };

  function onConfirm() {
    if (!sheet) return;
    const item = sheet;
    if (unlock(person!.id, item.key, item.price)) {
      setSheet(null);
      loadAi(item);
    }
  }

  async function loadAi(item: PremiumItem) {
    setAiLoading((m) => ({ ...m, [item.key]: true }));
    const t = await fetchDeepReport(item.key, person!, pv);
    setAiLoading((m) => ({ ...m, [item.key]: false }));
    if (t) setAiText((m) => ({ ...m, [item.key]: t }));
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>사람 미리보기</Text>
        <View style={s.points}>
          <Text style={s.pointsText}>🌸 {balance.toLocaleString()}P</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={s.profile}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 40 }}>{person.emoji}</Text>
          </View>
          <Text style={s.name}>
            {person.name} <Text style={s.meta}>{person.age} · {person.gu}</Text>
          </Text>
          <Text style={s.personaTitle}>{pv.persona.title}</Text>
          <View style={s.chips}>
            <View style={[s.elChip, { borderColor: ELEMENTS[el].color }]}>
              <Text style={[s.elChipText, { color: ELEMENTS[el].color }]}>
                {pv.chart.dayMasterKo}({EL_WORD[el]}) · {pv.chart.tti}띠
              </Text>
            </View>
            {person.interests.map((it) => (
              <View key={it} style={s.chip}>
                <Text style={s.chipText}>{it}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 궁합 히어로 */}
        <View style={s.hero}>
          <View style={s.scoreRow}>
            {SCORES.map((sc) => {
              const v = scoreVal[sc.key];
              return (
                <View key={sc.key} style={s.scoreCol}>
                  <Text style={[s.scoreNum, { color: sc.color }]}>{v}</Text>
                  <Text style={s.scoreLabel}>{sc.label} 궁합</Text>
                  <View style={s.track}>
                    <View style={[s.fill, { width: `${v}%`, backgroundColor: sc.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
          <View style={s.gradeRow}>
            <Text style={s.gradePill}>종합 {g.total} · {g.grade}</Text>
            <Text style={s.taste}>
              취향 궁합 {pv.tasteScore} · 겹치는 관심사 {pv.shared.length}개
            </Text>
          </View>
        </View>

        {/* 무료 섹션 */}
        <Text style={s.sectionTitle}>미리보기 <Text style={s.freeTag}>· 무료</Text></Text>
        <View style={s.freeCard}>
          <Text style={s.rowLabel}>첫인상 키워드</Text>
          <View style={s.chips}>
            {pv.persona.keywords.map((k) => (
              <View key={k} style={s.kwChip}>
                <Text style={s.kwText}>{k}</Text>
              </View>
            ))}
          </View>
          <View style={s.divider} />
          <Text style={s.rowLabel}>대화 스타일</Text>
          <Text style={s.rowText}>{pv.persona.free.talkStyle}</Text>
          <View style={s.divider} />
          <Text style={s.rowLabel}>취향 궁합</Text>
          <Text style={s.rowText}>
            {pv.shared.length > 0 ? `겹치는 관심사 — ${pv.shared.join(' · ')}` : '겹치는 관심사는 없지만 새로운 자극이 될 수 있어요'}
          </Text>
          <View style={s.divider} />
          <Text style={s.rowLabel}>친구 가능성</Text>
          <Text style={s.rowText}>
            {g.friend >= 70 ? '오래 갈 친구가 될 결이 보여요.' : g.friend >= 55 ? '천천히 친해지면 편안한 사이.' : '결이 달라 거리 조절이 필요해요.'}
          </Text>
        </View>

        {/* 유료 섹션 */}
        <Text style={s.sectionTitle}>더 깊이 보기 <Text style={s.lockTag}>· 잠금</Text></Text>
        {PREMIUM.map((item) => {
          const opened = isUnlocked(person.id, item.key);
          const template = item.get(pv);
          const ai = aiText[item.key];
          const loading = aiLoading[item.key];
          const bodyText = opened ? (loading ? '✨ 사주를 읽어 풀어내는 중…' : ai ?? template) : mask(template);
          return (
            <Pressable
              key={item.key}
              disabled={opened}
              onPress={() => setSheet(item)}
              style={({ pressed }) => [s.premium, pressed && !opened && { backgroundColor: C.surface2 }]}
            >
              <View style={s.premiumHead}>
                <Text style={s.premiumIcon}>{item.icon}</Text>
                <Text style={s.premiumTitle}>{item.title}</Text>
                {!opened ? (
                  <View style={s.pricePill}>
                    <Text style={s.priceText}>{item.price.toLocaleString()}P</Text>
                  </View>
                ) : ai ? (
                  <Text style={s.aiTag}>✨ AI 해석</Text>
                ) : (
                  <Text style={s.opened}>열람함</Text>
                )}
              </View>
              <Text style={[s.premiumBody, !opened && s.premiumLocked, loading && { color: C.moonDim }]}>
                {bodyText}
              </Text>
              {!opened && <Text style={s.tapHint}>탭하면 포인트로 열려요 🔒</Text>}
            </Pressable>
          );
        })}

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [s.cta, pressed && { backgroundColor: C.threadDeep }]}
          onPress={() => {
            acceptMatch(person.id);
            router.push({ pathname: '/chat/[id]', params: { id: person.id } });
          }}
        >
          <Text style={s.ctaText}>대화 신청하기</Text>
        </Pressable>
        <Text style={s.disclaimer}>궁합·성격은 사주 기반 참고 정보예요. 가볍게 즐겨주세요 🌸</Text>
      </ScrollView>

      {/* 결제 시트 */}
      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={s.backdrop} onPress={() => setSheet(null)} />
        <View style={s.sheet}>
          {sheet && (
            <>
              <View style={s.sheetHandle} />
              <Text style={s.sheetIcon}>{sheet.icon}</Text>
              <Text style={s.sheetTitle}>{sheet.title}</Text>
              <Text style={s.sheetSub}>{person.name}님의 사주를 바탕으로 풀어드려요</Text>

              <View style={s.sheetInfo}>
                <Text style={s.sheetInfoLabel}>필요 포인트</Text>
                <Text style={s.sheetInfoVal}>{sheet.price.toLocaleString()}P</Text>
              </View>
              <View style={s.sheetInfo}>
                <Text style={s.sheetInfoLabel}>보유 포인트</Text>
                <Text style={[s.sheetInfoVal, balance < sheet.price && { color: C.thread }]}>
                  {balance.toLocaleString()}P
                </Text>
              </View>

              {balance >= sheet.price ? (
                <Pressable style={({ pressed }) => [s.sheetBtn, pressed && { backgroundColor: C.threadDeep }]} onPress={onConfirm}>
                  <Text style={s.sheetBtnText}>{sheet.price.toLocaleString()}P로 열기</Text>
                </Pressable>
              ) : (
                <Pressable style={({ pressed }) => [s.sheetBtn, { backgroundColor: C.gold }, pressed && { opacity: 0.85 }]} onPress={() => charge(5000)}>
                  <Text style={[s.sheetBtnText, { color: C.onThread }]}>포인트가 부족해요 · 5,000P 충전</Text>
                </Pressable>
              )}
              <Pressable onPress={() => setSheet(null)} style={s.sheetCancel}>
                <Text style={s.sheetCancelText}>다음에</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  missing: { fontFamily: F.sans, color: C.moon, textAlign: 'center', marginTop: 80, marginBottom: SP.md },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm, gap: SP.md },
  back: { color: C.moon, fontSize: 22, width: 24 },
  headerTitle: { flex: 1, fontFamily: F.serif, fontSize: 18, color: C.moon },
  points: { backgroundColor: C.goldSoft, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { fontFamily: F.sansMed, fontSize: 12.5, color: C.gold },

  profile: { alignItems: 'center', marginTop: SP.sm, marginBottom: SP.lg },
  avatar: { width: 84, height: 84, borderRadius: R.pill, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line2 },
  name: { fontFamily: F.sansBold, fontSize: 22, color: C.moon, marginTop: SP.md },
  meta: { fontFamily: F.sans, fontSize: 14, color: C.moonDim },
  personaTitle: { fontFamily: F.serif, fontSize: 15, color: C.thread, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' },
  elChip: { borderWidth: 1, borderRadius: R.sm, paddingHorizontal: 9, paddingVertical: 4 },
  elChipText: { fontFamily: F.sansMed, fontSize: 11.5 },
  chip: { backgroundColor: C.surface2, borderRadius: R.sm, paddingHorizontal: 9, paddingVertical: 4 },
  chipText: { fontFamily: F.sansMed, fontSize: 11.5, color: C.moonDim },

  hero: { backgroundColor: C.surface, borderRadius: R.lg, padding: SP.lg, borderWidth: 1, borderColor: C.line },
  scoreRow: { flexDirection: 'row', gap: SP.md },
  scoreCol: { flex: 1, alignItems: 'center' },
  scoreNum: { fontFamily: F.sansBold, fontSize: 30 },
  scoreLabel: { fontFamily: F.sans, fontSize: 12, color: C.moonDim, marginTop: 2 },
  track: { width: '80%', height: 4, borderRadius: 2, backgroundColor: C.surface2, marginTop: 8, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  gradeRow: { alignItems: 'center', marginTop: SP.lg, gap: 6 },
  gradePill: { fontFamily: F.sansBold, fontSize: 14, color: C.moon, backgroundColor: C.threadSoft, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 6, overflow: 'hidden' },
  taste: { fontFamily: F.sans, fontSize: 12.5, color: C.moonDim },

  sectionTitle: { fontFamily: F.sansBold, fontSize: 15, color: C.moon, marginTop: SP.xl, marginBottom: SP.sm },
  freeTag: { fontFamily: F.sansMed, fontSize: 12, color: C.mok },
  lockTag: { fontFamily: F.sansMed, fontSize: 12, color: C.gold },

  freeCard: { backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, borderWidth: 1, borderColor: C.line },
  rowLabel: { fontFamily: F.sansMed, fontSize: 12, color: C.moonDim, marginBottom: 4 },
  rowText: { fontFamily: F.sans, fontSize: 14, color: C.moon, lineHeight: 21 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: SP.md },
  kwChip: { backgroundColor: C.threadSoft, borderRadius: R.pill, paddingHorizontal: 11, paddingVertical: 5 },
  kwText: { fontFamily: F.sansMed, fontSize: 12.5, color: C.thread },

  premium: { backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, marginBottom: SP.sm, borderWidth: 1, borderColor: C.line },
  premiumHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  premiumIcon: { fontSize: 16 },
  premiumTitle: { flex: 1, fontFamily: F.sansBold, fontSize: 14.5, color: C.moon },
  pricePill: { backgroundColor: C.goldSoft, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  priceText: { fontFamily: F.sansBold, fontSize: 12, color: C.gold },
  opened: { fontFamily: F.sansMed, fontSize: 11.5, color: C.mok },
  aiTag: { fontFamily: F.sansBold, fontSize: 11, color: C.gold },
  premiumBody: { fontFamily: F.sans, fontSize: 13.5, color: C.moon, lineHeight: 20, marginTop: 8 },
  premiumLocked: { color: C.moonDim },
  tapHint: { fontFamily: F.sans, fontSize: 11.5, color: C.moonDim, marginTop: 8 },

  cta: { backgroundColor: C.thread, borderRadius: R.md, paddingVertical: 16, alignItems: 'center', marginTop: SP.xl, shadowColor: C.thread, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  ctaText: { fontFamily: F.sansBold, fontSize: 15.5, color: C.onThread },
  disclaimer: { fontFamily: F.sans, fontSize: 11.5, color: C.moonDim, textAlign: 'center', marginTop: SP.md },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: C.night2, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, padding: SP.lg, paddingBottom: 36, alignItems: 'center', borderTopWidth: 1, borderColor: C.line2 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: SP.md },
  sheetIcon: { fontSize: 34 },
  sheetTitle: { fontFamily: F.sansBold, fontSize: 18, color: C.moon, marginTop: 8 },
  sheetSub: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 4, marginBottom: SP.lg },
  sheetInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderColor: C.line },
  sheetInfoLabel: { fontFamily: F.sans, fontSize: 13.5, color: C.moonDim },
  sheetInfoVal: { fontFamily: F.sansBold, fontSize: 14, color: C.moon },
  sheetBtn: { backgroundColor: C.thread, borderRadius: R.md, paddingVertical: 15, alignItems: 'center', width: '100%', marginTop: SP.lg },
  sheetBtnText: { fontFamily: F.sansBold, fontSize: 15, color: C.onThread },
  sheetCancel: { paddingVertical: 12, marginTop: 4 },
  sheetCancelText: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim },
});
