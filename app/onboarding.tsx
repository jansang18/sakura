import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../constants/theme';
import { detectGu } from '../lib/geo';
import { saveMyProfile } from '../lib/db/profile';
import { PURPOSES, type MyProfile, type Purpose, setProfile } from '../lib/store/profile';

const GU_LIST = [
  '종로구', '중구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구',
  '도봉구', '노원구', '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구', '금천구',
  '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구',
];

// 실제 존재하는 날짜인지 검증 (2/31, 비윤년 2/29 등 차단)
function isValidDate(calendar: 'solar' | 'lunar', y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  if (calendar === 'lunar') return d <= 30; // 음력 대소월/윤달은 만세력 라이브러리가 처리
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// 작은 세그먼트 토글
function Seg<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} style={[s.segItem, on && s.segItemOn]} onPress={() => onChange(o.key)}>
            <Text style={[s.segText, on && s.segTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // 생년월일시
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [isLeap, setIsLeap] = useState(false);
  const [unknownTime, setUnknownTime] = useState(false);
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | null>(null);

  // 구 / 목적
  const [gu, setGu] = useState<string | null>(null);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [geoMsg, setGeoMsg] = useState('');

  async function onDetectGu() {
    setGeoMsg('현재 위치 확인 중…');
    const { gu: detected, denied } = await detectGu();
    if (denied) return setGeoMsg('위치 권한이 거부됐어요. 아래에서 직접 선택해주세요.');
    if (!detected) return setGeoMsg('위치를 못 찾았어요. 직접 선택해주세요.');
    setGu(detected);
    setGeoMsg(`📍 ${detected}${GU_LIST.includes(detected) ? ' 선택됨' : ' (목록에 없으면 직접 선택)'}`);
  }

  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const h = Number(hour);
  const step0Valid =
    year.length === 4 && y >= 1900 && y <= 2025 &&
    isValidDate(calendar, y, m, d) &&
    gender !== null &&
    (unknownTime || (hour !== '' && h >= 0 && h <= 23));
  const step1Valid = gu !== null;
  const step2Valid = purposes.length > 0;
  const canNext = step === 0 ? step0Valid : step === 1 ? step1Valid : step2Valid;

  function togglePurpose(p: Purpose) {
    setPurposes((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function onBack() {
    if (step === 0) router.back();
    else setStep(step - 1);
  }

  function onNext() {
    if (!canNext) return;
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    // 완료 → 로컬 store 저장 + Supabase 영속화(설정 시)
    const p: MyProfile = {
      name: '나',
      gu: gu!,
      purposes,
      birth: {
        year: y,
        month: m,
        day: d,
        hour: unknownTime ? undefined : h,
        minute: 0,
        isLunar: calendar === 'lunar',
        isLeapMonth: calendar === 'lunar' ? isLeap : false,
        gender: gender!,
        unknownTime,
      },
      onboarded: true,
    };
    setProfile(p);
    void saveMyProfile(p);
    router.replace('/people');
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 헤더 + 진행 점 */}
        <View style={s.header}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={s.back}>←</Text>
          </Pressable>
          <View style={s.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.dot, i <= step && s.dotOn]} />
            ))}
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: SP.lg }} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text style={s.title}>생년월일시</Text>
              <Text style={s.sub}>사주를 보려면 정확한 정보가 필요해요.</Text>

              <Seg
                options={[{ key: 'solar', label: '양력' }, { key: 'lunar', label: '음력' }]}
                value={calendar}
                onChange={setCalendar}
              />

              <View style={s.dateRow}>
                <View style={s.dateField}>
                  <TextInput
                    style={s.input}
                    placeholder="YYYY"
                    placeholderTextColor={C.moonDim}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={year}
                    onChangeText={setYear}
                  />
                  <Text style={s.unit}>년</Text>
                </View>
                <View style={s.dateField}>
                  <TextInput
                    style={s.input}
                    placeholder="MM"
                    placeholderTextColor={C.moonDim}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={month}
                    onChangeText={setMonth}
                  />
                  <Text style={s.unit}>월</Text>
                </View>
                <View style={s.dateField}>
                  <TextInput
                    style={s.input}
                    placeholder="DD"
                    placeholderTextColor={C.moonDim}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={day}
                    onChangeText={setDay}
                  />
                  <Text style={s.unit}>일</Text>
                </View>
              </View>

              {calendar === 'lunar' && (
                <Pressable style={s.checkRow} onPress={() => setIsLeap((v) => !v)}>
                  <View style={[s.check, isLeap && s.checkOn]}>{isLeap && <Text style={s.checkMark}>✓</Text>}</View>
                  <Text style={s.checkLabel}>윤달이에요</Text>
                </Pressable>
              )}

              <Text style={s.fieldLabel}>태어난 시(時)</Text>
              <Pressable style={s.checkRow} onPress={() => setUnknownTime((v) => !v)}>
                <View style={[s.check, unknownTime && s.checkOn]}>{unknownTime && <Text style={s.checkMark}>✓</Text>}</View>
                <Text style={s.checkLabel}>태어난 시를 몰라요</Text>
              </Pressable>
              {!unknownTime && (
                <View style={[s.dateField, { alignSelf: 'flex-start', minWidth: 120 }]}>
                  <TextInput
                    style={s.input}
                    placeholder="0~23"
                    placeholderTextColor={C.moonDim}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={hour}
                    onChangeText={setHour}
                  />
                  <Text style={s.unit}>시</Text>
                </View>
              )}

              <Text style={s.fieldLabel}>성별</Text>
              <Seg
                options={[{ key: 'F', label: '여성' }, { key: 'M', label: '남성' }]}
                value={gender}
                onChange={setGender}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={s.title}>어느 동네에서 만날까요?</Text>
              <Text style={s.sub}>걸어서 닿는 우리 구(區)를 골라주세요.</Text>
              <Pressable style={s.gpsBtn} onPress={onDetectGu}>
                <Text style={s.gpsText}>📍 현재 위치로 인증</Text>
              </Pressable>
              {geoMsg ? <Text style={s.geoMsg}>{geoMsg}</Text> : null}
              <View style={s.guWrap}>
                {GU_LIST.map((g) => {
                  const on = g === gu;
                  return (
                    <Pressable key={g} style={[s.guChip, on && s.guChipOn]} onPress={() => setGu(g)}>
                      <Text style={[s.guText, on && s.guTextOn]}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={s.title}>무엇을 위해 만나고 싶어요?</Text>
              <Text style={s.sub}>여러 개 골라도 돼요.</Text>
              <View style={s.purposeWrap}>
                {PURPOSES.map((p) => {
                  const on = purposes.includes(p.key);
                  return (
                    <Pressable key={p.key} style={[s.purpose, on && s.purposeOn]} onPress={() => togglePurpose(p.key)}>
                      <Text style={s.purposeEmoji}>{p.emoji}</Text>
                      <Text style={[s.purposeText, on && s.purposeTextOn]}>{p.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Pressable
            disabled={!canNext}
            style={[s.cta, !canNext && s.ctaOff]}
            onPress={onNext}
          >
            <Text style={[s.ctaText, !canNext && s.ctaTextOff]}>{step < 2 ? '다음' : '시작하기'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm },
  back: { color: C.moon, fontSize: 22, width: 24 },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.surface2 },
  dotOn: { backgroundColor: C.thread, width: 18 },

  title: { fontFamily: F.serif, fontSize: 24, color: C.moon },
  sub: { fontFamily: F.sans, fontSize: 14, color: C.moonDim, marginTop: 8, marginBottom: SP.xl, lineHeight: 21 },
  fieldLabel: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim, marginTop: SP.xl, marginBottom: SP.sm },

  seg: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.md, padding: 4, gap: 4 },
  segItem: { flex: 1, paddingVertical: 11, borderRadius: R.sm, alignItems: 'center' },
  segItemOn: { backgroundColor: C.thread },
  segText: { fontFamily: F.sansMed, fontSize: 14, color: C.moonDim },
  segTextOn: { color: C.onThread, fontFamily: F.sansBold },

  dateRow: { flexDirection: 'row', gap: SP.sm, marginTop: SP.md },
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.md,
    paddingHorizontal: SP.md,
    borderWidth: 1,
    borderColor: C.line,
  },
  input: { flex: 1, fontFamily: F.sansMed, fontSize: 18, color: C.moon, paddingVertical: 14 },
  unit: { fontFamily: F.sans, fontSize: 14, color: C.moonDim, marginLeft: 4 },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: SP.md },
  check: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.line2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: C.thread, borderColor: C.thread },
  checkMark: { color: C.onThread, fontSize: 13, fontFamily: F.sansBold },
  checkLabel: { fontFamily: F.sans, fontSize: 14, color: C.moon },

  gpsBtn: { alignSelf: 'flex-start', backgroundColor: C.threadSoft, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.thread, marginBottom: SP.sm },
  gpsText: { fontFamily: F.sansMed, fontSize: 13, color: C.thread },
  geoMsg: { fontFamily: F.sans, fontSize: 12, color: C.moonDim, marginBottom: SP.sm },
  guWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  guChip: { backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.line },
  guChipOn: { backgroundColor: C.threadSoft, borderColor: C.thread },
  guText: { fontFamily: F.sansMed, fontSize: 13.5, color: C.moonDim },
  guTextOn: { color: C.thread },

  purposeWrap: { gap: SP.sm },
  purpose: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, borderWidth: 1, borderColor: C.line,
  },
  purposeOn: { backgroundColor: C.threadSoft, borderColor: C.thread },
  purposeEmoji: { fontSize: 22 },
  purposeText: { fontFamily: F.sansMed, fontSize: 15, color: C.moon },
  purposeTextOn: { color: C.thread, fontFamily: F.sansBold },

  footer: { paddingHorizontal: SP.lg, paddingTop: SP.sm, paddingBottom: SP.md },
  cta: { backgroundColor: C.thread, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  ctaOff: { backgroundColor: C.surface2 },
  ctaText: { fontFamily: F.sansBold, fontSize: 16, color: C.onThread },
  ctaTextOff: { color: C.moonDim },
});
