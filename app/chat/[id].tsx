import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../../constants/theme';
import ReportBlockMenu from '../../components/ReportBlockMenu';
import { findPerson } from '../../lib/mock/people';
import { useSocial } from '../../lib/store/social';

const WHEN_OPTIONS = ['오늘 저녁', '이번 주말', '다음 주 중'];

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const person = findPerson(id);
  const { acceptMatch, getRoom, sendMessage, setMeetup, tempBonusOf } = useSocial();

  const [draft, setDraft] = useState('');
  const [sheet, setSheet] = useState(false);
  const [place, setPlace] = useState('');
  const [when, setWhen] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (person) acceptMatch(person.id);
  }, [person?.id]);

  if (!person) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.missing}>채팅을 찾을 수 없어요.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={s.backLink}>← 돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const room = getRoom(person.id);
  const temp = person.flowerTemp + tempBonusOf(person.id);
  const bonus = tempBonusOf(person.id);

  function onSend() {
    sendMessage(person!.id, draft);
    setDraft('');
  }
  function confirmMeetup() {
    if (!when || !place.trim()) return;
    setMeetup(person!.id, place.trim(), when);
    setSheet(false);
    setPlace('');
    setWhen(null);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* 헤더 */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={s.back}>←</Text>
          </Pressable>
          <View style={s.headCenter}>
            <Text style={s.headName}>{person.name}</Text>
            <Text style={s.headTemp}>🌸 {temp.toFixed(1)}℃</Text>
          </View>
          <ReportBlockMenu targetId={person.id} targetName={person.name} tint={C.moonDim} onBlocked={() => router.back()} />
        </View>

        {/* 약속/후기 액션 바 */}
        <View style={s.actionBar}>
          {!room?.meetup ? (
            <Pressable style={s.action} onPress={() => setSheet(true)}>
              <Text style={s.actionText}>📅 약속 잡기</Text>
            </Pressable>
          ) : room.review ? (
            <View style={[s.action, { backgroundColor: C.threadSoft }]}>
              <Text style={[s.actionText, { color: C.thread }]}>
                후기 완료 · 벚꽃온도 {bonus >= 0 ? '+' : ''}{bonus.toFixed(1)}℃
              </Text>
            </View>
          ) : (
            <Pressable
              style={[s.action, { backgroundColor: C.thread }]}
              onPress={() => router.push({ pathname: '/review/[id]', params: { id: person.id } })}
            >
              <Text style={[s.actionText, { color: C.onThread }]}>만남 후기 남기기 →</Text>
            </Pressable>
          )}
          <Text style={s.realtimeNote}>실시간 채팅 자리 (Supabase Realtime 연동 예정)</Text>
        </View>

        {/* 메시지 */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SP.lg, gap: SP.sm }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {room?.messages.map((m) =>
            m.system ? (
              <View key={m.id} style={s.systemWrap}>
                <Text style={s.systemMsg}>{m.body}</Text>
              </View>
            ) : (
              <View key={m.id} style={[s.bubbleRow, m.mine ? s.rowMine : s.rowTheirs]}>
                <View style={[s.bubble, m.mine ? s.bubbleMine : s.bubbleTheirs]}>
                  <Text style={[s.bubbleText, m.mine && { color: C.onThread }]}>{m.body}</Text>
                </View>
              </View>
            ),
          )}
        </ScrollView>

        {/* 입력 */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="메시지 입력"
            placeholderTextColor={C.moonDim}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <Pressable style={[s.sendBtn, !draft.trim() && { opacity: 0.4 }]} disabled={!draft.trim()} onPress={onSend}>
            <Text style={s.sendText}>전송</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* 약속 잡기 시트 */}
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={s.backdrop} onPress={() => setSheet(false)} />
        <View style={s.modal}>
          <View style={s.handle} />
          <Text style={s.modalTitle}>약속 잡기</Text>
          <Text style={s.modalSub}>{person.name}님과 언제, 어디서 만날까요?</Text>

          <Text style={s.fieldLabel}>언제</Text>
          <View style={s.whenRow}>
            {WHEN_OPTIONS.map((w) => {
              const on = w === when;
              return (
                <Pressable key={w} style={[s.whenChip, on && s.whenChipOn]} onPress={() => setWhen(w)}>
                  <Text style={[s.whenText, on && s.whenTextOn]}>{w}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={s.fieldLabel}>어디서</Text>
          <TextInput
            style={s.placeInput}
            placeholder="예) 망원동 단골 카페"
            placeholderTextColor={C.moonDim}
            value={place}
            onChangeText={setPlace}
          />

          <Pressable
            style={[s.confirm, (!when || !place.trim()) && s.confirmOff]}
            disabled={!when || !place.trim()}
            onPress={confirmMeetup}
          >
            <Text style={[s.confirmText, (!when || !place.trim()) && { color: C.moonDim }]}>약속 잡기</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  missing: { fontFamily: F.sans, color: C.moon, textAlign: 'center', marginTop: 80, marginBottom: SP.md },
  backLink: { color: C.thread, textAlign: 'center', fontFamily: F.sansMed },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm },
  back: { color: C.moon, fontSize: 22, width: 24 },
  headCenter: { flex: 1, alignItems: 'center' },
  headName: { fontFamily: F.sansBold, fontSize: 16, color: C.moon },
  headTemp: { fontFamily: F.sans, fontSize: 11.5, color: C.moonDim, marginTop: 1 },

  actionBar: { paddingHorizontal: SP.lg, paddingBottom: SP.sm, borderBottomWidth: 1, borderColor: C.line, gap: 6 },
  action: { alignSelf: 'flex-start', backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.line },
  actionText: { fontFamily: F.sansMed, fontSize: 13, color: C.moon },
  realtimeNote: { fontFamily: F.sans, fontSize: 10.5, color: C.moonDim },

  systemWrap: { alignItems: 'center', marginVertical: 4 },
  systemMsg: { fontFamily: F.sans, fontSize: 12, color: C.moonDim, textAlign: 'center', backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' },

  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: R.md, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleMine: { backgroundColor: C.thread, borderTopRightRadius: 4 },
  bubbleTheirs: { backgroundColor: C.surface, borderTopLeftRadius: 4 },
  bubbleText: { fontFamily: F.sans, fontSize: 14, color: C.moon, lineHeight: 20 },

  inputBar: { flexDirection: 'row', alignItems: 'center', gap: SP.sm, paddingHorizontal: SP.md, paddingVertical: SP.sm, borderTopWidth: 1, borderColor: C.line },
  input: { flex: 1, backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: SP.md, paddingVertical: 11, fontFamily: F.sans, fontSize: 14, color: C.moon },
  sendBtn: { backgroundColor: C.thread, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 11 },
  sendText: { fontFamily: F.sansBold, fontSize: 14, color: C.onThread },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  modal: { backgroundColor: C.night2, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, padding: SP.lg, paddingBottom: 36, borderTopWidth: 1, borderColor: C.line2 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line2, alignSelf: 'center', marginBottom: SP.md },
  modalTitle: { fontFamily: F.sansBold, fontSize: 18, color: C.moon },
  modalSub: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, marginTop: 4, marginBottom: SP.md },
  fieldLabel: { fontFamily: F.sansMed, fontSize: 12.5, color: C.moonDim, marginTop: SP.md, marginBottom: SP.sm },
  whenRow: { flexDirection: 'row', gap: 8 },
  whenChip: { backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.line },
  whenChipOn: { backgroundColor: C.threadSoft, borderColor: C.thread },
  whenText: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim },
  whenTextOn: { color: C.thread },
  placeInput: { backgroundColor: C.surface, borderRadius: R.md, paddingHorizontal: SP.md, paddingVertical: 13, fontFamily: F.sans, fontSize: 15, color: C.moon, borderWidth: 1, borderColor: C.line },
  confirm: { backgroundColor: C.thread, borderRadius: R.md, paddingVertical: 15, alignItems: 'center', marginTop: SP.lg },
  confirmOff: { backgroundColor: C.surface2 },
  confirmText: { fontFamily: F.sansBold, fontSize: 15, color: C.onThread },
});
