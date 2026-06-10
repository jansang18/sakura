// 관심사(소모임 가입으로 채워짐) — 취향 궁합의 실제 데이터원
import { useSyncExternalStore } from 'react';

// 온보딩엔 관심사 입력이 없어 기본값을 둠. 소모임 가입 시 확장.
const BASE = ['카페', '사주공부', '영화', '산책', '글쓰기'];
const joined = new Map<string, string>(); // topicId -> 관심사 태그

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

export function joinTopic(topicId: string, tag: string) {
  joined.set(topicId, tag);
  emit();
}
export function leaveTopic(topicId: string) {
  joined.delete(topicId);
  emit();
}
export function isJoined(topicId: string) {
  return joined.has(topicId);
}
export function joinedCount() {
  return joined.size;
}
/** 내 관심사 = 기본 + 가입한 소모임 태그 */
export function myInterests(): string[] {
  return Array.from(new Set([...BASE, ...joined.values()]));
}

export function useInterests() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { joinTopic, leaveTopic, isJoined, myInterests, joinedCount: joined.size };
}
