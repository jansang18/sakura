import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, R, SP } from '../constants/theme';
import { TOPICS, type Topic } from '../lib/mock/topics';
import { useInterests } from '../lib/store/interests';
import { useProfile } from '../lib/store/profile';

function TopicCard({ topic, mygu }: { topic: Topic; mygu: string }) {
  const { isJoined, joinTopic, leaveTopic } = useInterests();
  const joined = isJoined(topic.id);
  return (
    <View style={s.card}>
      <View style={s.emojiBox}>
        <Text style={{ fontSize: 24 }}>{topic.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{topic.title}</Text>
        <Text style={s.meta}>
          {topic.gu}
          {topic.gu === mygu && <Text style={{ color: C.thread }}> · 우리 동네</Text>} · 멤버 {topic.members} · {topic.when}
        </Text>
        <View style={s.tagRow}>
          <View style={s.tag}>
            <Text style={s.tagText}>#{topic.tag}</Text>
          </View>
        </View>
      </View>
      <Pressable
        style={[s.joinBtn, joined && s.joinedBtn]}
        onPress={() => (joined ? leaveTopic(topic.id) : joinTopic(topic.id, topic.tag))}
      >
        <Text style={[s.joinText, joined && { color: C.moonDim }]}>{joined ? '가입됨' : '가입'}</Text>
      </Pressable>
    </View>
  );
}

export default function Topics() {
  const router = useRouter();
  const profile = useProfile();
  const { joinedCount } = useInterests();

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>동네 소모임</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SP.lg, paddingTop: SP.sm }} showsVerticalScrollIndicator={false}>
        <Text style={s.lead}>
          관심사로 모이는 {profile.gu} 소모임.{'\n'}가입하면 취향 궁합에 반영돼요. (가입 {joinedCount}개)
        </Text>
        {TOPICS.map((t) => (
          <TopicCard key={t.id} topic={t} mygu={profile.gu} />
        ))}
        <Text style={s.foot}>마음에 드는 모임에 가입하고, 거기서 만난 사람과 궁합도 봐요 🌸</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm },
  back: { color: C.moon, fontSize: 22, width: 24 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: F.serif, fontSize: 19, color: C.moon },
  lead: { fontFamily: F.sans, fontSize: 13.5, color: C.moonDim, lineHeight: 21, marginBottom: SP.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: SP.md, backgroundColor: C.surface, borderRadius: R.md, padding: SP.md, marginBottom: SP.sm, borderWidth: 1, borderColor: C.line },
  emojiBox: { width: 48, height: 48, borderRadius: R.sm, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.sansBold, fontSize: 15, color: C.moon },
  meta: { fontFamily: F.sans, fontSize: 11.5, color: C.moonDim, marginTop: 3 },
  tagRow: { flexDirection: 'row', marginTop: 7 },
  tag: { backgroundColor: C.threadSoft, borderRadius: R.sm, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: F.sansMed, fontSize: 11, color: C.thread },
  joinBtn: { backgroundColor: C.thread, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 8 },
  joinedBtn: { backgroundColor: C.surface2 },
  joinText: { fontFamily: F.sansBold, fontSize: 13, color: C.onThread },
  foot: { fontFamily: F.sans, fontSize: 12, color: C.moonDim, textAlign: 'center', marginTop: SP.lg },
});
