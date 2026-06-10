// ─────────────────────────────────────────────
// daily-match — 하루 3명 매칭 배치 (설계서 §6)
// POST { user_id } → 그 사용자의 오늘 매칭 상위 3명 생성(matches upsert) 후 반환.
// 점수: 궁합 50% + 벚꽃온도 20% + 활동성 20% + 신규 10%
//
// 배포:  supabase functions deploy daily-match
// 정기실행: pg_cron 또는 Supabase Scheduled Functions에서 활성 유저별 호출.
//
// 주의: 궁합은 saju_summary(오행) 기반 "간이" 버전. 정밀 궁합(천간합충·일지 등)은
//       lib/saju/gunghap.ts 를 Deno로 포팅해 교체 예정. (service role로 saju_private.chart 사용)
// ─────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { dailyScore } from '../_shared/score.ts';

type El = 'mok' | 'hwa' | 'to' | 'geum' | 'su';
const SAENG: Record<El, El> = { mok: 'hwa', hwa: 'to', to: 'geum', geum: 'su', su: 'mok' };
const GEUK: Record<El, El> = { mok: 'to', to: 'su', su: 'hwa', hwa: 'geum', geum: 'mok' };

// 요약(오행) 기반 간이 궁합 0~100
function simpleGunghap(a: any, b: any): number {
  let score = 55;
  const ea = a?.element as El | undefined;
  const eb = b?.element as El | undefined;
  if (ea && eb) {
    if (ea === eb) score += 8;
    else if (SAENG[ea] === eb || SAENG[eb] === ea) score += 12;
    else if (GEUK[ea] === eb || GEUK[eb] === ea) score -= 8;
  }
  const la: El[] = a?.lacking ?? [];
  const lb: El[] = b?.lacking ?? [];
  const elA = a?.elements ?? {};
  const elB = b?.elements ?? {};
  let comp = 0;
  for (const k of la) if ((elB[k] ?? 0) > 0) comp++;
  for (const k of lb) if ((elA[k] ?? 0) > 0) comp++;
  score += comp * 3;
  if (a?.yinyang && b?.yinyang && a.yinyang !== b.yinyang) score += 4;
  return Math.max(8, Math.min(98, Math.round(score)));
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: me, error: meErr } = await supabase.from('profiles').select('*').eq('id', user_id).single();
    if (meErr || !me) return json({ error: 'profile not found' }, 404);

    const today = new Date().toISOString().slice(0, 10);
    const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

    // 제외: 내가 차단한 사람 + 최근 30일 추천된 사람
    const { data: blocked } = await supabase.from('blocks').select('blocked').eq('blocker', user_id);
    const blockedIds = new Set((blocked ?? []).map((b: any) => b.blocked));
    const { data: recent } = await supabase
      .from('matches').select('user_b').eq('user_a', user_id).gte('match_date', since);
    const recentIds = new Set((recent ?? []).map((m: any) => m.user_b));

    const myPurposes: string[] = me.purposes ?? [];
    const { data: pool } = await supabase.from('profiles').select('*').neq('id', user_id);

    const scored = (pool ?? [])
      .filter((p: any) => !blockedIds.has(p.id) && !recentIds.has(p.id))
      // 목적 교집합 존재(내 목적이 있으면)
      .filter((p: any) => myPurposes.length === 0 || (p.purposes ?? []).some((x: string) => myPurposes.includes(x)))
      .map((p: any) => {
        const gunghap = simpleGunghap(me.saju_summary, p.saju_summary);
        const isNew = p.created_at ? Date.now() - Date.parse(p.created_at) < 14 * 864e5 : false;
        const score = dailyScore(gunghap, {
          flowerTemp: Number(p.flower_temperature ?? 36.5),
          activity: 50, // TODO: 활동성 집계 컬럼 추가
          isNew,
        });
        return { p, gunghap, score, sameGu: p.gu === me.gu };
      })
      // 같은 구 우선 → 후보 점수
      .sort((a: any, b: any) => (a.sameGu !== b.sameGu ? (a.sameGu ? -1 : 1) : b.score - a.score))
      .slice(0, 3);

    if (scored.length) {
      await supabase.from('matches').upsert(
        scored.map((x: any) => ({
          user_a: user_id,
          user_b: x.p.id,
          match_date: today,
          gunghap_score: x.gunghap,
          status: 'pending',
        })),
        { onConflict: 'user_a,user_b,match_date' },
      );
    }

    return json({
      date: today,
      matches: scored.map((x: any) => ({
        id: x.p.id,
        nickname: x.p.nickname,
        gu: x.p.gu,
        gunghap: x.gunghap,
        score: x.score,
        same_gu: x.sameGu,
      })),
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
