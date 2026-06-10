import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../../constants/theme';
import { findPerson } from '../../lib/mock/people';
import { useSocial } from '../../lib/store/social';

type Rating = 'good' | 'bad';

const PRAISE: Record<Rating, string[]> = {
  good: ['시간 약속을 잘 지켜요', '대화가 편했어요', '매너가 좋아요', '또 만나고 싶어요', '배려심이 있어요'],
  bad: ['시간을 안 지켜요', '대화가 불편했어요', '연락이 뜸했어요', '약속을 어겼어요'],
};

function computeDelta(rating: Rating, count: number): number {
  if (rating === 'good') return Math.min(1.5, Math.round((0.5 + count * 0.2) * 10) / 10);
  return Math.max(-1.5, Math.round((-0.8 - count * 0.2) * 10) / 10);
}

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const person = findPerson(id);
  const { submitReview } = useSocial();

  const [rating, setRating] = useState<Rating | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  if (!person) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.missing}>대상을 찾을 수 없어요.</Text>
      </SafeAreaView>
    );
  }

  const delta = rating ? computeDelta(rating, selected.length) : 0;

  function toggle(p: string) {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }
  function onSubmit() {
    if (!rating) return;
    submitReview(person!.id, { rating, praises: selected, tempDelta: delta });
    router.back();
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.title}>만남 후기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg }}>
        <Text style={s.q}>{person.name}님과의 만남은 어땠나요?</Text>
        <Text style={s.sub}>후기는 더 안전한 동네벚꽃을 만드는 데 쓰여요.</Text>

        <View style={s.ratingRow}>
          <Pressable style={[s.rating, rating === 'good' && s.ratingGood]} onPress={() => { setRating('good'); setSelected([]); }}>
            <Text style={s.ratingEmoji}>😊</Text>
            <Text style={[s.ratingText, rating === 'good' && { color: C.thread }]}>좋았어요</Text>
          </Pressable>
          <Pressable style={[s.rating, rating === 'bad' && s.ratingBad]} onPress={() => { setRating('bad'); setSelected([]); }}>
            <Text style={s.ratingEmoji}>😞</Text>
            <Text style={[s.ratingText, rating === 'bad' && { color: C.moonDim }]}>아쉬웠어요</Text>
          </Pressable>
        </View>

        {rating && (
          <>
            <Text style={s.fieldLabel}>{rating === 'good' ? '어떤 점이 좋았어요?' : '어떤 점이 아쉬웠어요?'}</Text>
            <View style={s.chips}>
              {PRAISE[rating].map((p) => {
                const on = selected.includes(p);
                return (
                  <Pressable key={p} style={[s.chip, on && s.chipOn]} onPress={() => toggle(p)}>
                    <Text style={[s.chipText, on && s.chipTextOn]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.deltaCard}>
              <Text style={s.deltaLabel}>{person.name}님의 벚꽃온도</Text>
              <Text style={[s.deltaVal, { color: delta >= 0 ? C.thread : C.moonDim }]}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}℃
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={[s.cta, !rating && s.ctaOff]} disabled={!rating} onPress={onSubmit}>
          <Text style={[s.ctaText, !rating && { color: C.moonDim }]}>후기 남기기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  missing: { fontFamily: F.sans, color: C.moon, textAlign: 'center', marginTop: 80 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm },
  back: { color: C.moon, fontSize: 22, width: 24 },
  title: { flex: 1, textAlign: 'center', fontFamily: F.serif, fontSize: 18, color: C.moon },

  q: { fontFamily: F.serif, fontSize: 21, color: C.moon, marginTop: SP.sm },
  sub: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 8, marginBottom: SP.xl },

  ratingRow: { flexDirection: 'row', gap: SP.md },
  rating: { flex: 1, alignItems: 'center', gap: 8, backgroundColor: C.surface, borderRadius: R.md, paddingVertical: SP.lg, borderWidth: 1, borderColor: C.line },
  ratingGood: { borderColor: C.thread, backgroundColor: C.threadSoft },
  ratingBad: { borderColor: C.line2 },
  ratingEmoji: { fontSize: 30 },
  ratingText: { fontFamily: F.sansMed, fontSize: 14, color: C.moon },

  fieldLabel: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim, marginTop: SP.xl, marginBottom: SP.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.threadSoft, borderColor: C.thread },
  chipText: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim },
  chipTextOn: { color: C.thread },

  deltaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, marginTop: SP.xl, borderWidth: 1, borderColor: C.line },
  deltaLabel: { fontFamily: F.sansMed, fontSize: 14, color: C.moon },
  deltaVal: { fontFamily: F.sansBold, fontSize: 20 },

  footer: { paddingHorizontal: SP.lg, paddingTop: SP.sm, paddingBottom: SP.md },
  cta: { backgroundColor: C.thread, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  ctaOff: { backgroundColor: C.surface2 },
  ctaText: { fontFamily: F.sansBold, fontSize: 16, color: C.onThread },
});
