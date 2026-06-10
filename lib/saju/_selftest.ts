// 개발용 검증 스크립트 (앱 번들에 포함 안 됨)
// 실행: npx tsx lib/saju/_selftest.ts
import { chartPillars, compatibility, computeSaju, personality } from './index';
import { EL_LABEL, EL_WORD } from './tables';

function show(label: string, input: Parameters<typeof computeSaju>[0]) {
  const c = computeSaju(input);
  const p = personality(c);
  console.log(`\n■ ${label}`);
  console.log('  음력:', c.lunarText, '| 띠:', c.tti);
  console.log('  팔자:', chartPillars(c).map((r) => `${r.label} ${r.gz}`).join('  '));
  console.log('  일간:', c.dayMasterKo, `(${EL_WORD[c.dayMasterEl]})`, c.dayMasterYang ? '양' : '음');
  console.log(
    '  오행:',
    (['mok', 'hwa', 'to', 'geum', 'su'] as const).map((k) => `${EL_LABEL[k]}${c.elements[k]}`).join(' '),
    '| 우세:', EL_WORD[c.dominant],
    '| 부족:', c.lacking.map((k) => EL_WORD[k]).join(',') || '없음',
    '| 신강도:', c.strength.toFixed(2),
  );
  console.log('  캐릭터:', p.title, '|', p.keywords.join('·'));
  console.log('  대화:', p.free.talkStyle);
  return c;
}

const a = show('지민 1995-08-23 14:30 양력 여', { year: 1995, month: 8, day: 23, hour: 14, minute: 30, gender: 'F' });
const b = show('도윤 1993-02-11 09:00 양력 남', { year: 1993, month: 2, day: 11, hour: 9, gender: 'M' });
const cc = show('하늘 2000-12-05 시모름 여', { year: 2000, month: 12, day: 5, unknownTime: true, gender: 'F' });

function gh(x: ReturnType<typeof computeSaju>, y: ReturnType<typeof computeSaju>, t: string) {
  const g = compatibility(x, y);
  console.log(`\n◆ 궁합 [${t}]  친구 ${g.friend} / 연인 ${g.lover} / 대화 ${g.talk}  → 종합 ${g.total} (${g.grade})`);
  console.log('  무료키워드:', g.freeKeywords.join(' · '));
  console.log('  근거:', g.signals.map((s) => `${s.effect === 'good' ? '+' : '-'}${s.label}`).join('\n        '));
}

gh(a, b, '지민×도윤');
gh(a, cc, '지민×하늘');
gh(b, cc, '도윤×하늘');
