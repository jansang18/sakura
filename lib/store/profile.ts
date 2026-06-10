// ─────────────────────────────────────────────
// 내 프로필 스토어 — 온보딩 입력값(생년월일시·구·목적)을 앱 전역에 보관
// 서버/영구저장 붙기 전 임시 인메모리 구현
// ─────────────────────────────────────────────

import { useSyncExternalStore } from 'react';
import type { BirthInput } from '../saju';

export type Purpose = 'meal' | 'exercise' | 'hobby' | 'friend' | 'love';

export const PURPOSES: { key: Purpose; label: string; emoji: string }[] = [
  { key: 'meal', label: '밥친구', emoji: '🍚' },
  { key: 'exercise', label: '운동메이트', emoji: '🏃' },
  { key: 'hobby', label: '취미친구', emoji: '🎨' },
  { key: 'friend', label: '그냥 친구', emoji: '🤝' },
  { key: 'love', label: '연인', emoji: '💗' },
];

export interface MyProfile {
  name: string;
  gu: string;
  purposes: Purpose[];
  birth: BirthInput;
  onboarded: boolean;
}

// 기본값(온보딩 전) — 데모가 바로 돌아가도록 임시 값
let profile: MyProfile = {
  name: '나',
  gu: '마포구',
  purposes: ['meal', 'friend'],
  birth: { year: 1996, month: 3, day: 14, hour: 10, minute: 0, gender: 'F' },
  onboarded: false,
};

let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getProfile(): MyProfile {
  return profile;
}

export function setProfile(p: MyProfile) {
  profile = p;
  emit();
}

export function useProfile(): MyProfile {
  useSyncExternalStore(subscribe, () => version, () => version);
  return profile;
}
