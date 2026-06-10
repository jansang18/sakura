import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F } from '../constants/theme';

// 인트로 영상 (광고식) → 끝나거나 건너뛰면 환영화면으로
export default function Intro() {
  const router = useRouter();
  const done = useRef(false);
  const [count, setCount] = useState(3);

  const player = useVideoPlayer(require('../assets/video/bt.mp4'), (p) => {
    p.loop = false;
    p.muted = true; // 자동재생(특히 웹) 위해 음소거
    p.play();
  });

  function finish() {
    if (done.current) return;
    done.current = true;
    router.replace('/welcome');
  }

  // 영상 끝나면 자동 진행
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => finish());
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // 건너뛰기 카운트다운 (3 → 0)
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const canSkip = count <= 0;

  return (
    <View style={s.root}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />

      <Pressable
        style={[s.skip, !canSkip && s.skipWait]}
        disabled={!canSkip}
        onPress={finish}
        hitSlop={8}
      >
        <Text style={s.skipText}>{canSkip ? '광고 건너뛰기 ›' : `${count}`}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  skip: {
    position: 'absolute',
    top: 18,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipWait: { width: 38, height: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 0, paddingVertical: 0 },
  skipText: { fontFamily: F.sansBold, fontSize: 13, color: '#fff' },
});
