// ─────────────────────────────────────────────
// 오늘의 매칭 빌더 — 내 프로필 기준 후보를 점수화·정렬
// (설계서 §6: 같은 구 우선, 목적 교집합, 점수 상위 N명)
// 서버 daily-match 배치의 클라이언트 데모 버전.
// ─────────────────────────────────────────────

import type { Person } from '../mock/people';
import { buildPreview, type Preview } from '../preview';
import type { MyProfile, Purpose } from '../store/profile';
import { dailyScore } from './score';

export interface DailyMatch {
  person: Person;
  preview: Preview;
  score: number; // daily-match 후보 점수 0~100
  sharedPurposes: Purpose[];
  sameGu: boolean;
}

export function buildDailyMatches(me: MyProfile, people: Person[]): DailyMatch[] {
  return people
    .map((p) => {
      const preview = buildPreview(p);
      return {
        person: p,
        preview,
        score: dailyScore(preview.gunghap.total, {
          flowerTemp: p.flowerTemp,
          activity: p.activity,
          isNew: p.isNew,
        }),
        sharedPurposes: p.purposes.filter((x) => me.purposes.includes(x)),
        sameGu: p.gu === me.gu,
      };
    })
    .sort((a, b) => {
      // 같은 구 우선 → 그다음 후보 점수
      if (a.sameGu !== b.sameGu) return a.sameGu ? -1 : 1;
      return b.score - a.score;
    });
}
