// ─────────────────────────────────────────────
// 심층 리포트 클라이언트 — /api/report 호출, 실패 시 null(→ 화면이 규칙 템플릿으로 폴백)
// 하이브리드: 계산은 로컬 사주 엔진, 유료 심층 문구만 Claude로 자연어 생성
// ─────────────────────────────────────────────

import type { Person } from '../mock/people';
import type { Preview } from '../preview';
import { EL_WORD } from '../saju';

// 네이티브에서는 상대경로 fetch가 안 되므로 EXPO_PUBLIC_API_BASE로 dev 서버 주소 지정 가능.
// 웹(dev/배포)에서는 비워두면 상대경로로 동작.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

function payload(item: string, person: Person, pv: Preview) {
  const c = pv.chart;
  const g = pv.gunghap;
  return {
    item,
    other: {
      name: person.name,
      dayMaster: c.dayMasterKo,
      element: EL_WORD[c.dayMasterEl],
      yinyang: c.dayMasterYang ? '양' : '음',
      dominant: EL_WORD[c.dominant],
      lacking: c.lacking.map((k) => EL_WORD[k]),
      tti: c.tti,
    },
    gunghap: {
      friend: g.friend,
      lover: g.lover,
      talk: g.talk,
      grade: g.grade,
      signals: g.signals.map((s) => ({ label: s.label, effect: s.effect })),
    },
  };
}

/** AI 심층 문구를 가져온다. 실패하면 null → 호출부가 템플릿으로 폴백. */
export async function fetchDeepReport(item: string, person: Person, pv: Preview): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(item, person, pv)),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    return data.text && data.text.trim() ? data.text.trim() : null;
  } catch {
    return null;
  }
}
