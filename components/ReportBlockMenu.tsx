import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F, R, SP } from '../constants/theme';
import { REPORT_CATEGORIES, useModeration } from '../lib/store/moderation';

type SheetView = 'menu' | 'report' | 'reported' | 'block' | null;

export default function ReportBlockMenu({
  targetId,
  targetName,
  tint = C.moon,
  onBlocked,
}: {
  targetId: string;
  targetName: string;
  tint?: string;
  onBlocked?: () => void;
}) {
  const { reportUser, blockUser } = useModeration();
  const [view, setView] = useState<SheetView>(null);
  const [cat, setCat] = useState<string | null>(null);

  function submitReport() {
    if (!cat) return;
    reportUser(targetId, cat);
    setView('reported');
  }
  function confirmBlock() {
    blockUser(targetId);
    setView(null);
    onBlocked?.();
  }
  function close() {
    setView(null);
    setCat(null);
  }

  return (
    <>
      <Pressable hitSlop={10} onPress={() => setView('menu')}>
        <Text style={[s.kebab, { color: tint }]}>⋯</Text>
      </Pressable>

      <Modal visible={view !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={s.backdrop} onPress={close} />
        <View style={s.sheet}>
          <View style={s.handle} />

          {view === 'menu' && (
            <>
              <Pressable style={s.row} onPress={() => setView('report')}>
                <Text style={s.rowText}>🚩 신고하기</Text>
              </Pressable>
              <Pressable style={s.row} onPress={() => setView('block')}>
                <Text style={[s.rowText, { color: C.thread }]}>🚫 {targetName}님 차단하기</Text>
              </Pressable>
              <Pressable style={s.cancel} onPress={close}>
                <Text style={s.cancelText}>취소</Text>
              </Pressable>
            </>
          )}

          {view === 'report' && (
            <>
              <Text style={s.title}>{targetName}님 신고</Text>
              <Text style={s.sub}>사유를 선택해주세요.</Text>
              <View style={s.cats}>
                {REPORT_CATEGORIES.map((c) => {
                  const on = c === cat;
                  return (
                    <Pressable key={c} style={[s.cat, on && s.catOn]} onPress={() => setCat(c)}>
                      <Text style={[s.catText, on && s.catTextOn]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable style={[s.primary, !cat && s.primaryOff]} disabled={!cat} onPress={submitReport}>
                <Text style={[s.primaryText, !cat && { color: C.moonDim }]}>신고 제출</Text>
              </Pressable>
              <Pressable style={s.cancel} onPress={() => setView('menu')}>
                <Text style={s.cancelText}>뒤로</Text>
              </Pressable>
            </>
          )}

          {view === 'reported' && (
            <>
              <Text style={s.bigEmoji}>🛡️</Text>
              <Text style={s.title}>신고가 접수되었어요</Text>
              <Text style={s.sub}>검토 후 운영정책에 따라 조치할게요. 더 안전한 동네벚꽃을 만들어요.</Text>
              <Pressable style={s.primary} onPress={close}>
                <Text style={s.primaryText}>닫기</Text>
              </Pressable>
            </>
          )}

          {view === 'block' && (
            <>
              <Text style={s.title}>{targetName}님을 차단할까요?</Text>
              <Text style={s.sub}>차단하면 서로 추천·대화에서 보이지 않아요.</Text>
              <Pressable style={[s.primary, { backgroundColor: C.thread }]} onPress={confirmBlock}>
                <Text style={[s.primaryText, { color: C.onThread }]}>차단하기</Text>
              </Pressable>
              <Pressable style={s.cancel} onPress={() => setView('menu')}>
                <Text style={s.cancelText}>취소</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  kebab: { fontSize: 22, fontWeight: '700', paddingHorizontal: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: C.night2, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg, padding: SP.lg, paddingBottom: 36, borderTopWidth: 1, borderColor: C.line2 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line2, alignSelf: 'center', marginBottom: SP.md },
  row: { paddingVertical: 15, borderBottomWidth: 1, borderColor: C.line },
  rowText: { fontFamily: F.sansMed, fontSize: 15.5, color: C.moon },
  cancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  cancelText: { fontFamily: F.sansMed, fontSize: 14, color: C.moonDim },
  title: { fontFamily: F.sansBold, fontSize: 17, color: C.moon, textAlign: 'center', marginTop: 4 },
  sub: { fontFamily: F.sans, fontSize: 13, color: C.moonDim, textAlign: 'center', marginTop: 6, marginBottom: SP.md, lineHeight: 19 },
  bigEmoji: { fontSize: 34, textAlign: 'center', marginBottom: 4 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: SP.md },
  cat: { backgroundColor: C.surface, borderRadius: R.pill, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: C.line },
  catOn: { backgroundColor: C.threadSoft, borderColor: C.thread },
  catText: { fontFamily: F.sansMed, fontSize: 13, color: C.moonDim },
  catTextOn: { color: C.thread },
  primary: { backgroundColor: C.surface2, borderRadius: R.md, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  primaryOff: { opacity: 0.6 },
  primaryText: { fontFamily: F.sansBold, fontSize: 15, color: C.moon },
});
