// ─────────────────────────────────────────────
// 동네벚꽃 디자인 토큰 — 낮벚꽃(크림 + 벚꽃, bt.png 톤)
// 토큰 이름(night/moon 등)은 유지하고 값만 라이트로 — 전 화면 자동 재스킨
// ─────────────────────────────────────────────

export const BRAND = '동네벚꽃';

// 색상 (bt.png 팔레트: 크림 하늘 · 벚꽃 로즈 · 딥 플럼 잉크 · 따뜻한 앰버)
export const C = {
  // 배경 (크림)
  night: '#F6EEE4', // 배경(크림 하늘)
  night2: '#FCF7F1', // 시트/모달
  surface: '#FFFCF7', // 카드(웜 화이트)
  surface2: '#F2E7DC', // 칩/아바타 배경

  // 선
  line: 'rgba(74,52,60,0.10)',
  line2: 'rgba(74,52,60,0.20)',

  // 글자 (딥 플럼 잉크)
  moon: '#3B2E3A', // 본문
  moonDim: '#917E86', // 보조

  // 시그니처 — 벚꽃 로즈
  thread: '#E07A9B',
  threadDeep: '#CC6285',
  threadSoft: 'rgba(224,122,155,0.15)',
  onThread: '#3A2230', // 분홍/골드 버튼 위 글자색(딥 플럼)

  // 보조 — 따뜻한 앰버
  gold: '#C68A3C',
  goldSoft: 'rgba(198,138,60,0.14)',

  // 오행 (라이트 보정 — 크림 위 대비)
  mok: '#4E9E62', // 木
  hwa: '#E06A57', // 火
  to: '#C2902F', // 土
  geum: '#7C8A99', // 金
  su: '#4F79B0', // 水
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
