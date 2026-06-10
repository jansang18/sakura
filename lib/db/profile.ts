// ─────────────────────────────────────────────
// 프로필 영속화 — 온보딩 완료 시 Supabase에 저장
//  · profiles      : 공개 요약(saju_summary) + 구/목적 등
//  · saju_private  : 생년월일시 + 전체 팔자(본인 전용)
// Supabase 미설정이면 조용히 no-op (로컬 store만으로 동작).
// ─────────────────────────────────────────────

import { computeSaju, type SajuChart } from '../saju';
import { ensureSession, supabase } from '../supabase';
import type { MyProfile } from '../store/profile';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** 매칭 상대에게 공개해도 되는 요약(원본 아님) */
function publicSummary(c: SajuChart) {
  return {
    dayMaster: c.dayMasterKo,
    element: c.dayMasterEl,
    yinyang: c.dayMasterYang ? '양' : '음',
    dominant: c.dominant,
    lacking: c.lacking,
    tti: c.tti,
    strength: c.strength,
    elements: c.elements,
  };
}

/** 온보딩 완료 시 호출. 실패해도 throw 안 함(베스트 에포트). */
export async function saveMyProfile(profile: MyProfile): Promise<void> {
  if (!supabase) return;
  try {
    const user = await ensureSession();
    if (!user) return;

    const chart = computeSaju(profile.birth);
    const b = profile.birth;

    const { error: pErr } = await supabase.from('profiles').upsert({
      id: user.id,
      nickname: profile.name,
      gender: b.gender ?? 'F',
      sido: '서울특별시', // TODO: 온보딩 구 목록이 수원으로 바뀌면 함께 조정
      gu: profile.gu,
      purposes: profile.purposes,
      saju_summary: publicSummary(chart),
    });
    if (pErr) throw pErr;

    const { error: sErr } = await supabase.from('saju_private').upsert({
      user_id: user.id,
      birth_date: `${b.year}-${pad(b.month)}-${pad(b.day)}`,
      birth_time: b.unknownTime ? null : b.hour ?? null,
      is_lunar: !!b.isLunar,
      is_leap_month: !!b.isLeapMonth,
      chart,
    });
    if (sErr) throw sErr;
  } catch (e) {
    // 토대 단계: 실패는 무시하고 로컬 store로 계속 진행
    console.warn('[saveMyProfile] skipped:', (e as Error)?.message);
  }
}
