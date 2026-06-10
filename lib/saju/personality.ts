// ─────────────────────────────────────────────
// 성격 리포트 — 일간(10) 원형 + 오행 우세 + 신강/신약으로 구성
// free: 무료 노출 / deep: 결제 후 노출 (나중에 Claude 자연어 생성으로 교체 가능)
// ─────────────────────────────────────────────

import type { SajuChart } from './compute';
import { EL_WORD, SIPSIN_GROUP } from './tables';

export interface Personality {
  title: string; // 한 줄 캐릭터 ("부드러운 물 같은 사람")
  keywords: string[]; // 무료 키워드
  free: {
    talkStyle: string; // 대화 스타일 (미리보기)
    firstImpression: string;
  };
  deep: {
    // 유료
    core: string; // 성격 깊이보기
    friendFit: string; // 친구로 잘 맞는 이유
    loverPotential: string; // 연인으로 발전 가능성
    caution: string; // 조심해야 할 대화 방식
    approach: string; // 친해지는 공략법
    groupRole: string; // 모임에서 잘 맞는 역할
  };
}

// 일간별 원형 (index 0=갑 … 9=계)
const DAYMASTER: { title: string; kw: string[]; talk: string; core: string; role: string }[] = [
  { title: '곧게 자란 나무 같은 사람', kw: ['추진력', '리더', '곧음'], talk: '단도직입적이고 솔직해요', core: '목표가 서면 끝까지 밀어붙이는 우두머리 기질. 굽히는 걸 싫어해 가끔 고집으로 비쳐요.', role: '모임을 끌고 가는 리더·기획자' },
  { title: '바람에 휘는 덩굴 같은 사람', kw: ['유연함', '센스', '친화'], talk: '상황 봐가며 부드럽게 맞춰요', core: '환경에 잘 적응하고 사람을 잘 엮는 타입. 속은 의외로 끈질겨요.', role: '분위기 메이커·연결고리' },
  { title: '환하게 타오르는 불 같은 사람', kw: ['열정', '표현', '밝음'], talk: '감정 표현이 솔직하고 화통해요', core: '에너지가 크고 주목받는 자리를 즐겨요. 식으면 빨리 식는 게 약점.', role: '판을 띄우는 에너자이저' },
  { title: '은은한 촛불 같은 사람', kw: ['섬세함', '배려', '집중'], talk: '조곤조곤 따뜻하게 말해요', core: '속정 깊고 디테일에 강해요. 신경 쓰는 만큼 예민해지기도.', role: '챙기고 돌보는 살림꾼' },
  { title: '넓은 들판 같은 사람', kw: ['든든함', '포용', '중심'], talk: '말수는 적어도 무게가 있어요', core: '믿음직하고 포용력이 커 사람이 모여요. 변화를 더디게 받아들여요.', role: '중심을 잡아주는 기둥' },
  { title: '촉촉한 텃밭 흙 같은 사람', kw: ['온화함', '현실감', '꾸준함'], talk: '편안하고 다정하게 말해요', core: '실속 있고 사람을 잘 품어요. 우유부단해 보일 때가 있어요.', role: '두루 챙기는 살림 담당' },
  { title: '벼린 칼 같은 사람', kw: ['결단', '의리', '강단'], talk: '핵심만 짧고 분명하게 말해요', core: '맺고 끊음이 분명하고 의리파. 직설적이라 날이 설 때가 있어요.', role: '결정을 매듭짓는 해결사' },
  { title: '맑은 보석 같은 사람', kw: ['세련됨', '예민함', '미감'], talk: '정제된 말투로 깔끔하게 말해요', core: '감각이 섬세하고 자존심이 있어요. 상처를 오래 담아두는 편.', role: '디테일·퀄리티 지킴이' },
  { title: '넓게 흐르는 강 같은 사람', kw: ['포용', '지혜', '대범'], talk: '여유롭게 큰 틀로 말해요', core: '스케일이 크고 사람을 가리지 않아요. 종잡기 어려울 때가 있어요.', role: '멀리 보는 전략가' },
  { title: '부드러운 이슬 같은 사람', kw: ['섬세함', '직관', '다정'], talk: '부드럽고 천천히 다가가요', core: '눈치 빠르고 정이 많아요. 친해지는 덴 시간이 걸리지만 한번 가까워지면 오래가요.', role: '속 깊은 상담자' },
];

function strengthNote(s: number): string {
  if (s >= 0.55) return '자기 중심이 뚜렷해 끌고 가는 힘이 있어요.';
  if (s <= 0.3) return '주변에 맞춰주는 유연함이 강점이에요.';
  return '상황 따라 강약을 조절할 줄 알아요.';
}

export function personality(c: SajuChart): Personality {
  const dm = DAYMASTER[c.dayGanIdx];
  const domWord = EL_WORD[c.dominant];

  // 십신 그룹 분포 (천간 기준 — 성향 가늠)
  const groups = [c.year, c.month, c.hour]
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => SIPSIN_GROUP[p.sipsin])
    .filter(Boolean);
  const has = (g: string) => groups.includes(g as never);

  const friendFit = has('bigyeop')
    ? '비슷한 결이 있어 함께 있으면 편하고, 한번 친해지면 의리로 오래 갑니다.'
    : '서로 다른 부분을 채워주는 친구라, 같이 있으면 시야가 넓어져요.';
  const loverPotential = has('jaeseong') || has('gwanseong')
    ? '연인으로 발전할 불씨가 있는 사주예요. 밀당보다 솔직함이 잘 통합니다.'
    : '천천히 신뢰를 쌓을수록 깊어지는 타입이라, 급하면 오히려 멀어져요.';
  const caution = has('siksang')
    ? '하고 싶은 말을 직설적으로 던질 때가 있어, 표현 수위를 살짝만 낮추면 좋아요.'
    : '속마음을 잘 안 꺼내는 편이라, 먼저 물어봐 주면 마음을 엽니다.';
  const approach = `${domWord} 기운이 강한 사람이라, ${c.dominant === 'hwa' ? '같이 신나는 활동' : c.dominant === 'su' ? '편한 대화와 깊은 이야기' : c.dominant === 'mok' ? '새로운 걸 함께 시작하는 자리' : c.dominant === 'geum' ? '명확한 약속과 깔끔한 진행' : '느긋하고 안정적인 만남'}으로 다가가면 빨리 가까워져요.`;

  return {
    title: dm.title,
    keywords: dm.kw,
    free: {
      talkStyle: dm.talk,
      firstImpression: `${dm.kw[0]} · ${dm.kw[1]} 인상`,
    },
    deep: {
      core: `${dm.core} ${strengthNote(c.strength)}`,
      friendFit,
      loverPotential,
      caution,
      approach,
      groupRole: dm.role,
    },
  };
}
