// 신고/차단 (인메모리 데모 — Supabase reports/blocks 붙기 전)
import { useSyncExternalStore } from 'react';

export const REPORT_CATEGORIES = ['스팸·홍보', '부적절한 프로필', '욕설·비방', '사칭 의심', '기타'];

interface Report {
  id: string;
  target: string;
  category: string;
}
const blocked = new Set<string>();
const reports: Report[] = [];
let seq = 0;
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

export function isBlocked(id: string) {
  return blocked.has(id);
}
export function blockedIds() {
  return Array.from(blocked);
}
export function blockUser(id: string) {
  blocked.add(id);
  emit();
}
export function unblockUser(id: string) {
  blocked.delete(id);
  emit();
}
export function reportUser(target: string, category: string) {
  reports.push({ id: `r${seq++}`, target, category });
  emit();
}

export function useModeration() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { isBlocked, blockUser, unblockUser, reportUser, blockedIds };
}
