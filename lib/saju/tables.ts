// ─────────────────────────────────────────────
// 사주 엔진 매핑 테이블
// 계산은 lunar-typescript(=sinvoice가 쓰는 lunar-javascript의 TS 포팅)가 하고,
// 여기서는 그 한자 결과를 한글/오행으로 매핑한다.
// 천간·지지·십신 한글 라벨은 sinvoice(신의 음성) 매핑 그대로.
// ─────────────────────────────────────────────

import type { ElementKey } from '../../constants/theme';

// 천간 10 (index 0=갑 … 9=계)
export const GAN_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const GAN_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 지지 12 (index 0=자 … 11=해)
export const ZHI_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const ZHI_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
// 지지 → 띠
export const ZHI_TTI = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const;

// 천간 오행 / 음양 (index 0-9)
export const GAN_EL: ElementKey[] = ['mok', 'mok', 'hwa', 'hwa', 'to', 'to', 'geum', 'geum', 'su', 'su'];
export const GAN_YANG: boolean[] = [true, false, true, false, true, false, true, false, true, false];

// 지지 오행 / 음양 (index 0-11). 자=수, 축=토, 인=목 …
export const ZHI_EL: ElementKey[] = ['su', 'to', 'mok', 'mok', 'to', 'hwa', 'hwa', 'to', 'geum', 'geum', 'to', 'su'];
export const ZHI_YANG: boolean[] = [true, false, true, false, true, false, true, false, true, false, true, false];

// 오행 표기 (sinvoice 자연어 출력 포함)
export const EL_KEYS: ElementKey[] = ['mok', 'hwa', 'to', 'geum', 'su'];
export const EL_WORD: Record<ElementKey, string> = { mok: '나무', hwa: '불', to: '흙', geum: '쇠', su: '물' };
export const EL_HANJA: Record<ElementKey, string> = { mok: '木', hwa: '火', to: '土', geum: '金', su: '水' };
export const EL_LABEL: Record<ElementKey, string> = { mok: '목', hwa: '화', to: '토', geum: '금', su: '수' };

// 오행 상생: 목→화→토→금→수→목 (SAENG[x] = x가 생하는 오행)
export const SAENG: Record<ElementKey, ElementKey> = { mok: 'hwa', hwa: 'to', to: 'geum', geum: 'su', su: 'mok' };
// 나를 생해주는 오행 (인성). SAENG_FROM[x] = x를 생하는 오행
export const SAENG_FROM: Record<ElementKey, ElementKey> = { hwa: 'mok', to: 'hwa', geum: 'to', su: 'geum', mok: 'su' };
// 오행 상극: 목→토→수→화→금→목 (GEUK[x] = x가 극하는 오행)
export const GEUK: Record<ElementKey, ElementKey> = { mok: 'to', to: 'su', su: 'hwa', hwa: 'geum', geum: 'mok' };
// 나를 극하는 오행 (관성). GEUK_FROM[x] = x를 극하는 오행
export const GEUK_FROM: Record<ElementKey, ElementKey> = { to: 'mok', su: 'to', hwa: 'su', geum: 'hwa', mok: 'geum' };

// 십신 한자(간체/번체 모두) → 한글
export const SIPSIN_KO: Record<string, string> = {
  比肩: '비견',
  劫财: '겁재', 劫財: '겁재',
  食神: '식신',
  伤官: '상관', 傷官: '상관',
  偏财: '편재', 偏財: '편재',
  正财: '정재', 正財: '정재',
  七杀: '편관', 七殺: '편관', 偏官: '편관',
  正官: '정관',
  偏印: '편인',
  正印: '정인',
  日主: '일간', 日元: '일간', 日: '일간',
};

// 십신 → 그룹 (점수/해석용)
export type SipsinGroup = 'bigyeop' | 'siksang' | 'jaeseong' | 'gwanseong' | 'inseong' | 'self';
export const SIPSIN_GROUP: Record<string, SipsinGroup> = {
  비견: 'bigyeop', 겁재: 'bigyeop',
  식신: 'siksang', 상관: 'siksang',
  편재: 'jaeseong', 정재: 'jaeseong',
  편관: 'gwanseong', 정관: 'gwanseong',
  편인: 'inseong', 정인: 'inseong',
  일간: 'self',
};

// ── 합/충 (지지·천간) — index 기반 ──
const pair = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// 천간합: 갑기·을경·병신·정임·무계
export const GAN_HAP = new Set([pair(0, 5), pair(1, 6), pair(2, 7), pair(3, 8), pair(4, 9)]);
// 천간충: 갑경·을신·병임·정계
export const GAN_CHUNG = new Set([pair(0, 6), pair(1, 7), pair(2, 8), pair(3, 9)]);
// 지지 육합: 자축·인해·묘술·진유·사신·오미
export const ZHI_YUKHAP = new Set([pair(0, 1), pair(2, 11), pair(3, 10), pair(4, 9), pair(5, 8), pair(6, 7)]);
// 지지 충: 자오·축미·인신·묘유·진술·사해
export const ZHI_CHUNG = new Set([pair(0, 6), pair(1, 7), pair(2, 8), pair(3, 9), pair(4, 10), pair(5, 11)]);
// 지지 삼합 그룹: 신자진(水)·인오술(火)·사유축(金)·해묘미(木)
export const ZHI_SAMHAP: number[][] = [
  [8, 0, 4],
  [2, 6, 10],
  [5, 9, 1],
  [11, 3, 7],
];

export const ganPair = pair;

// 두 오행의 관계
export type ElRel = 'same' | 'aSaengB' | 'bSaengA' | 'aGeukB' | 'bGeukA';
export function elRelation(a: ElementKey, b: ElementKey): ElRel {
  if (a === b) return 'same';
  if (SAENG[a] === b) return 'aSaengB';
  if (SAENG[b] === a) return 'bSaengA';
  if (GEUK[a] === b) return 'aGeukB';
  return 'bGeukA'; // GEUK[b] === a
}
