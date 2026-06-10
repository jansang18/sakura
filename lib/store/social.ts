// ─────────────────────────────────────────────
// 소셜 루프 스토어 (인메모리) — 매칭 수락 → 채팅 → 약속 → 후기 → 벚꽃온도
// Supabase(chat_rooms/messages/meetups/reviews) 붙기 전 데모용.
// ─────────────────────────────────────────────

import { useSyncExternalStore } from 'react';

export interface Msg {
  id: string;
  mine: boolean;
  body: string;
  system?: boolean;
}
export interface Meetup {
  place: string;
  whenLabel: string;
  status: 'scheduled' | 'done';
}
export interface Review {
  rating: 'good' | 'bad';
  praises: string[];
  tempDelta: number;
}
interface Room {
  accepted: boolean;
  messages: Msg[];
  meetup?: Meetup;
  review?: Review;
}

const rooms: Record<string, Room> = {};
const tempBonus: Record<string, number> = {};
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
function ensure(id: string): Room {
  if (!rooms[id]) rooms[id] = { accepted: false, messages: [] };
  return rooms[id];
}

const REPLIES = [
  '오 반가워요! 동네에서 이렇게 만나니 신기하네요 😄',
  '저도 그 동네 자주 가요. 언제 한번 봐요!',
  '좋아요 좋아요, 시간 맞춰봐요.',
  '오늘 하루도 고생 많으셨어요 🌸',
];

export function acceptMatch(id: string) {
  const r = ensure(id);
  if (!r.accepted) {
    r.accepted = true;
    r.messages = [{ id: `s${seq++}`, mine: false, system: true, body: '서로의 벚꽃이 피었어요 🌸 이제 편하게 대화를 시작해보세요.' }];
    emit();
  }
}
export function isAccepted(id: string) {
  return !!rooms[id]?.accepted;
}
export function getRoom(id: string): Room | undefined {
  return rooms[id];
}
export function sendMessage(id: string, body: string) {
  const text = body.trim();
  if (!text) return;
  const r = ensure(id);
  r.messages = [...r.messages, { id: `m${seq++}`, mine: true, body: text }];
  emit();
  // 데모용 자동 응답 (Realtime 자리 — 서버 연동 시 교체)
  const replyIdx = r.messages.filter((m) => m.mine).length - 1;
  const reply = REPLIES[replyIdx % REPLIES.length];
  setTimeout(() => {
    const rr = ensure(id);
    rr.messages = [...rr.messages, { id: `b${seq++}`, mine: false, body: reply }];
    emit();
  }, 700);
}
export function setMeetup(id: string, place: string, whenLabel: string) {
  const r = ensure(id);
  r.meetup = { place, whenLabel, status: 'scheduled' };
  r.messages = [...r.messages, { id: `x${seq++}`, mine: false, system: true, body: `📍 약속이 잡혔어요 — ${whenLabel} · ${place}` }];
  emit();
}
export function submitReview(id: string, review: Review) {
  const r = ensure(id);
  r.review = review;
  if (r.meetup) r.meetup.status = 'done';
  tempBonus[id] = Math.round(((tempBonus[id] ?? 0) + review.tempDelta) * 10) / 10;
  emit();
}
export function tempBonusOf(id: string) {
  return tempBonus[id] ?? 0;
}

export function useSocial() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { isAccepted, getRoom, acceptMatch, sendMessage, setMeetup, submitReview, tempBonusOf };
}
