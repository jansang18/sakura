// ─────────────────────────────────────────────
// Expo Router API 라우트 (서버 전용) — 사주/궁합 데이터로 심층 리포트 자연어 생성
// 키는 서버 환경변수(ANTHROPIC_API_KEY)에서만 읽음. 클라이언트 번들에 포함되지 않음.
// 키가 없거나 실패하면 클라이언트가 규칙 기반 템플릿으로 폴백한다.
// ─────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

const ITEM_GOAL: Record<string, string> = {
  friendFit: '이 사람과 친구로 잘 맞는 이유',
  lover: '이 사람과 연인으로 발전할 가능성',
  core: '이 사람의 성격을 깊이 있게 들여다본 모습',
  caution: '이 사람과 대화할 때 조심하면 좋은 점',
  approach: '이 사람과 자연스럽게 친해지는 구체적인 공략법',
  role: '동네 모임에서 이 사람과 잘 맞는 역할이나 조합',
};

const SYSTEM = [
  '너는 사주명리에 밝지만 미신을 부추기지 않는, 따뜻하고 현실적인 동네 친구 같은 상담가야.',
  '주어진 사주 요약과 궁합 점수를 근거로, 요청한 주제 한 가지를 한국어 존댓말로 풀어 써.',
  '2~3문장, 약 80~140자. 단정적 운명론("반드시", "무조건")은 피하고 "~할 수 있어요", "~인 편이에요" 같은 부드러운 톤.',
  '사주 전문용어를 늘어놓지 말고 성격·관계의 결로 번역해서 말해. 이모지는 최대 1개. 따옴표 없이 본문만.',
].join(' ');

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'no_key' }, { status: 503 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }

  const goal = ITEM_GOAL[body?.item];
  if (!goal) return Response.json({ error: 'unknown_item' }, { status: 400 });

  const o = body.other ?? {};
  const g = body.gunghap ?? {};
  const signals = Array.isArray(g.signals)
    ? g.signals.map((s: any) => `${s.effect === 'good' ? '좋음' : '주의'}: ${s.label}`).join(' / ')
    : '';

  const userPrompt = [
    `상대: ${o.name ?? '상대'}님`,
    `사주 요약 — 일간 ${o.dayMaster}(${o.element}) ${o.yinyang}, 강한 기운 ${o.dominant}` +
      (o.lacking?.length ? `, 부족한 기운 ${o.lacking.join('·')}` : '') +
      (o.tti ? `, ${o.tti}띠` : ''),
    `궁합 점수 — 친구 ${g.friend} / 연인 ${g.lover} / 대화 ${g.talk} (${g.grade})`,
    signals ? `궁합 신호 — ${signals}` : '',
    '',
    `위 정보를 바탕으로 "${goal}"을(를) 자연스럽게 써 줘.`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
    if (!text) return Response.json({ error: 'empty' }, { status: 502 });
    return Response.json({ text });
  } catch (e: any) {
    return Response.json({ error: 'upstream', message: e?.message ?? 'error' }, { status: 502 });
  }
}
