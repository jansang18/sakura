// ─────────────────────────────────────────────
// 동네벚꽃 디자인 토큰 — 밤벚꽃(밤하늘 + 벚꽃)
// 앱 이름 바꾸려면 BRAND만 수정하면 전체 반영
// ─────────────────────────────────────────────

export const BRAND = '동네벚꽃';

// 색상
export const C = {
  // 배경
  night: '#11141D', // 밤하늘
  night2: '#171B27',
  surface: '#1E2433', // 카드
  surface2: '#252C3E',

  // 선
  line: 'rgba(242,237,227,0.09)',
  line2: 'rgba(242,237,227,0.16)',

  // 글자
  moon: '#F2EDE3', // 달빛
  moonDim: '#9BA0AC',

  // 시그니처 — 벚꽃(밤벚꽃 핑크)
  thread: '#F2789F',
  threadDeep: '#DD5F88',
  threadSoft: 'rgba(242,121,159,0.14)',
  onThread: '#2A0F1C', // 분홍 버튼 위 글자색

  // 보조
  gold: '#D9A441',
  goldSoft: 'rgba(217,164,65,0.12)',

  // 오행 (다크 보정)
  mok: '#6FBF73', // 木
  hwa: '#FF6757', // 火
  to: '#E0A84E', // 土
  geum: '#AEB9C6', // 金
  su: '#6B97CE', // 水
} as const;

// 모서리
export const R = { lg: 22, md: 15, sm: 9, pill: 99 } as const;

// 폰트 (app/_layout.tsx에서 로드)
export const F = {
  serif: 'GowunBatang_700Bold',
  serifR: 'GowunBatang_400Regular',
  sans: 'IBMPlexSansKR_400Regular',
  sansMed: 'IBMPlexSansKR_500Medium',
  sansBold: 'IBMPlexSansKR_700Bold',
} as const;

// 간격
export const SP = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

// 오행 한자/색 매핑 유틸
export const ELEMENTS = {
  mok: { hanja: '木', label: '목', color: C.mok },
  hwa: { hanja: '火', label: '화', color: C.hwa },
  to: { hanja: '土', label: '토', color: C.to },
  geum: { hanja: '金', label: '금', color: C.geum },
  su: { hanja: '水', label: '수', color: C.su },
} as const;

export type ElementKey = keyof typeof ELEMENTS;
