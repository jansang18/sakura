// ─────────────────────────────────────────────
// 궁합 — 두 사람의 사주로 친구/연인/대화 궁합 점수 산출
// 규칙 기반(결정적). 가중치는 WEIGHTS에서 튜닝.
// 점수 산출 신호:
//  · 일간 오행 관계 (같음/상생/상극)
//  · 천간합·천간충 (일간끼리)
//  · 일지 육합·삼합·충 (배우자궁)
//  · 음양 조화
//  · 오행 보완 (서로 부족한 기운을 채워주는지)
// ─────────────────────────────────────────────

import type { ElementKey } from '../../constants/theme';
import type { SajuChart } from './compute';
import {
  EL_KEYS,
  EL_WORD,
  GAN_CHUNG,
  GAN_HAP,
  ZHI_CHUNG,
  ZHI_SAMHAP,
  ZHI_YUKHAP,
  elRelation,
  ganPair,
} from './tables';

export type SignalEffect = 'good' | 'bad';
export interface Signal {
  key: string;
  label: string; // 사람에게 보여줄 한 줄
  effect: SignalEffect;
}

export interface Gunghap {
  friend: number; // 친구 궁합 0-100
  lover: number; // 연인 궁합 0-100
  talk: number; // 대화 궁합 0-100
  total: number; // 종합
  grade: string; // 등급 라벨
  signals: Signal[]; // 근거 (유료 상세에서 풀어서 사용)
  freeKeywords: string[]; // 첫인상 키워드 3개 (무료)
}

const clamp = (n: number) => Math.max(8, Math.min(98, Math.round(n)));

function gradeOf(total: number): string {
  if (total >= 88) return '천생연분';
  if (total >= 75) return '아주 잘 맞음';
  if (total >= 62) return '잘 맞는 편';
  if (total >= 48) return '무난함';
  if (total >= 35) return '노력 필요';
  return '상극 주의';
}

/** 서로 부족한 오행을 채워주는 정도 (0..1) */
function complement(a: SajuChart, b: SajuChart): number {
  let score = 0;
  for (const k of EL_KEYS) {
    if (a.elements[k] === 0 && b.elements[k] > 0) score += 1;
    if (b.elements[k] === 0 && a.elements[k] > 0) score += 1;
  }
  return score / (EL_KEYS.length * 2);
}

export function compatibility(a: SajuChart, b: SajuChart): Gunghap {
  const signals: Signal[] = [];

  // 기준점
  let friend = 55;
  let lover = 52;
  let talk = 55;

  const aGan = a.day.ganIdx;
  const bGan = b.day.ganIdx;
  const aZhi = a.day.zhiIdx;
  const bZhi = b.day.zhiIdx;
  const gp = ganPair(aGan, bGan);

  // 1) 일간 오행 관계
  const rel = elRelation(a.dayMasterEl, b.dayMasterEl);
  if (rel === 'same') {
    friend += 12;
    talk += 6;
    lover += 2;
    signals.push({ key: 'el-same', label: '비슷한 기운 — 말 안 해도 통하는 결', effect: 'good' });
  } else if (rel === 'aSaengB' || rel === 'bSaengA') {
    friend += 8;
    talk += 14;
    lover += 10;
    const giver = rel === 'aSaengB' ? a : b;
    const taker = rel === 'aSaengB' ? b : a;
    signals.push({
      key: 'el-saeng',
      label: `${EL_WORD[giver.dayMasterEl]} 기운이 ${EL_WORD[taker.dayMasterEl]} 기운을 북돋아 줘요`,
      effect: 'good',
    });
  } else {
    // 상극
    friend -= 8;
    talk -= 6;
    lover += 4; // 긴장감/끌림은 약간 +
    signals.push({ key: 'el-geuk', label: '기운이 부딪힐 수 있어요 — 거리 조절이 중요', effect: 'bad' });
  }

  // 2) 천간합 / 천간충 (일간끼리)
  if (GAN_HAP.has(gp)) {
    lover += 16;
    talk += 8;
    friend += 4;
    signals.push({ key: 'gan-hap', label: '천간합 — 자연스럽게 끌리는 사이', effect: 'good' });
  } else if (GAN_CHUNG.has(gp)) {
    lover -= 12;
    talk -= 8;
    friend -= 4;
    signals.push({ key: 'gan-chung', label: '천간충 — 첫인상은 강렬해도 충돌 잦음', effect: 'bad' });
  }

  // 3) 일지(배우자궁) 합/충
  const zp = ganPair(aZhi, bZhi);
  if (ZHI_YUKHAP.has(zp)) {
    lover += 14;
    friend += 8;
    signals.push({ key: 'zhi-yukhap', label: '일지 육합 — 곁에 있으면 편안한 궁합', effect: 'good' });
  }
  const sameSamhap = ZHI_SAMHAP.some((g) => g.includes(aZhi) && g.includes(bZhi) && aZhi !== bZhi);
  if (sameSamhap) {
    friend += 12;
    lover += 8;
    talk += 6;
    signals.push({ key: 'zhi-samhap', label: '일지 삼합 — 함께 뭔가 도모하기 좋은 짝', effect: 'good' });
  }
  if (ZHI_CHUNG.has(zp)) {
    lover -= 14;
    friend -= 6;
    signals.push({ key: 'zhi-chung', label: '일지충 — 가까워질수록 부딪히는 지점이 생겨요', effect: 'bad' });
  }

  // 4) 음양 조화 (일간)
  if (a.dayMasterYang !== b.dayMasterYang) {
    lover += 8;
    signals.push({ key: 'yinyang', label: '음양이 달라 서로 끌리는 힘이 있어요', effect: 'good' });
  } else {
    friend += 5;
    talk += 3;
  }

  // 5) 오행 보완
  const comp = complement(a, b);
  if (comp > 0) {
    const add = Math.round(comp * 24);
    friend += add;
    talk += Math.round(add * 0.7);
    lover += Math.round(add * 0.5);
    signals.push({ key: 'complement', label: '서로 부족한 기운을 채워주는 관계', effect: 'good' });
  }

  friend = clamp(friend);
  lover = clamp(lover);
  talk = clamp(talk);
  const total = clamp(friend * 0.4 + lover * 0.3 + talk * 0.3);

  // 첫인상 키워드 3개 (무료): good 신호 우선, 모자라면 점수 기반 기본 키워드
  const goodLabels = signals.filter((s) => s.effect === 'good').map((s) => s.label.split(' — ')[0]);
  const base = [
    talk >= 70 ? '대화가 잘 통함' : '말수 조절 필요',
    friend >= 70 ? '오래 갈 친구' : '천천히 친해짐',
    lover >= 70 ? '설렘 포인트 있음' : '편안한 거리감',
  ];
  const freeKeywords = [...new Set([...goodLabels, ...base])].slice(0, 3);

  return { friend, lover, talk, total, grade: gradeOf(total), signals, freeKeywords };
}
