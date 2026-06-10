// ─────────────────────────────────────────────
// 사람 미리보기 조립 — 내 프로필(온보딩 입력) 기준으로 상대의 사주/성격/궁합/취향 계산
// ─────────────────────────────────────────────

import type { Person } from './mock/people';
import { myInterests } from './store/interests';
import { getProfile } from './store/profile';
import { compatibility, computeSaju, personality, type Gunghap, type Personality, type SajuChart } from './saju';

export interface Preview {
  chart: SajuChart;
  persona: Personality;
  gunghap: Gunghap;
  shared: string[]; // 겹치는 관심사
  tasteScore: number; // 취향 궁합 0-100
}

/** 내 사주 차트 (온보딩 입력 기준) */
export function myChart(): SajuChart {
  return computeSaju(getProfile().birth);
}

function tasteCompat(a: string[], b: string[]): number {
  const setB = new Set(b);
  const inter = a.filter((x) => setB.has(x)).length;
  if (inter === 0) return 20;
  const denom = Math.min(a.length, b.length);
  return Math.min(98, Math.round((inter / denom) * 100));
}

export function buildPreview(p: Person): Preview {
  const me = myChart();
  const chart = computeSaju(p.birth);
  const mine = myInterests();
  return {
    chart,
    persona: personality(chart),
    gunghap: compatibility(me, chart),
    shared: p.interests.filter((i) => mine.includes(i)),
    tasteScore: tasteCompat(mine, p.interests),
  };
}
