// ─────────────────────────────────────────────
// daily-match 점수식 (설계서 §6) — 순수 함수.
// 추후 Supabase Edge Function(daily-match)이 그대로 재사용.
//   후보점수 = 궁합 50% + 벚꽃온도 20% + 활동성 20% + 신규보정 10%
// ─────────────────────────────────────────────

export interface CandidateSignals {
  flowerTemp: number; // 벚꽃온도 (≈36.5 기준)
  activity: number; // 활동성 0~100
  isNew: boolean; // 신규 가입 보정
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// 벚꽃온도 30~50℃ → 0~100 정규화
function tempNorm(t: number): number {
  return clamp(((t - 30) / 20) * 100, 0, 100);
}

export function dailyScore(gunghapTotal: number, c: CandidateSignals): number {
  const s =
    0.5 * clamp(gunghapTotal, 0, 100) +
    0.2 * tempNorm(c.flowerTemp) +
    0.2 * clamp(c.activity, 0, 100) +
    0.1 * (c.isNew ? 100 : 0);
  return Math.round(clamp(s, 0, 100));
}
