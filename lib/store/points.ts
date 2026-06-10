// ─────────────────────────────────────────────
// 포인트 스토어 (앱 전역) — 결제 백엔드 붙기 전 임시 인메모리 구현
// 사람별 1회 열람: unlock(personId, itemKey, cost)
// ─────────────────────────────────────────────

import { useSyncExternalStore } from 'react';

let balance = 3000; // 데모 초기 포인트
const unlocked = new Map<string, Set<string>>(); // personId -> 열람한 itemKey 집합
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

export function getBalance() {
  return balance;
}

export function isUnlocked(personId: string, key: string) {
  return unlocked.get(personId)?.has(key) ?? false;
}

/** 포인트가 충분하면 차감하고 열람 처리, 성공 여부 반환 */
export function unlock(personId: string, key: string, cost: number): boolean {
  if (balance < cost) return false;
  balance -= cost;
  let set = unlocked.get(personId);
  if (!set) {
    set = new Set();
    unlocked.set(personId, set);
  }
  set.add(key);
  emit();
  return true;
}

export function charge(amount: number) {
  balance += amount;
  emit();
}

/** 일반 차감(추가 매칭 등). 충분하면 차감하고 true. */
export function spend(cost: number): boolean {
  if (balance < cost) return false;
  balance -= cost;
  emit();
  return true;
}

/** 컴포넌트에서 포인트 상태 구독 */
export function usePoints() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { balance, isUnlocked, unlock, charge, spend };
}
