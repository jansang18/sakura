// ─────────────────────────────────────────────
// 사주팔자 계산 — lunar-typescript로 팔자/십신을 뽑고 한글·오행으로 변환
// ─────────────────────────────────────────────

import { Lunar, Solar } from 'lunar-typescript';
import type { ElementKey } from '../../constants/theme';
import {
  EL_KEYS,
  GAN_EL,
  GAN_HANJA,
  GAN_KO,
  GAN_YANG,
  SAENG_FROM,
  SIPSIN_KO,
  ZHI_EL,
  ZHI_HANJA,
  ZHI_KO,
  ZHI_TTI,
} from './tables';

export type Gender = 'M' | 'F';

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour?: number; // 0-23, 모르면 unknownTime
  minute?: number;
  isLunar?: boolean; // 음력 입력 여부
  isLeapMonth?: boolean; // 윤달
  gender?: Gender;
  unknownTime?: boolean; // 태어난 시(時)를 모름
}

export interface Pillar {
  ganKo: string;
  zhiKo: string;
  ganIdx: number;
  zhiIdx: number;
  ganEl: ElementKey;
  zhiEl: ElementKey;
  ganYang: boolean;
  sipsin: string; // 천간 십신 (한글). 일주 천간은 '일간'
}

export interface SajuChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null; // 시 모름이면 null
  dayGanIdx: number;
  dayMasterKo: string; // 일간 (한글)
  dayMasterEl: ElementKey;
  dayMasterYang: boolean;
  tti: string; // 띠 (연지 기준)
  elements: Record<ElementKey, number>; // 오행 분포 (드러난 글자 기준, 시 모름이면 6글자)
  dominant: ElementKey; // 가장 강한 오행
  lacking: ElementKey[]; // 0개인 오행
  strength: number; // 신강도 0..1 (휴리스틱)
  lunarText: string; // 음력 표기
  input: BirthInput;
}

function emptyElements(): Record<ElementKey, number> {
  return { mok: 0, hwa: 0, to: 0, geum: 0, su: 0 };
}

function buildPillar(gan: string, zhi: string, sipsinHanja: string): Pillar {
  const ganIdx = GAN_HANJA.indexOf(gan as (typeof GAN_HANJA)[number]);
  const zhiIdx = ZHI_HANJA.indexOf(zhi as (typeof ZHI_HANJA)[number]);
  return {
    ganKo: GAN_KO[ganIdx],
    zhiKo: ZHI_KO[zhiIdx],
    ganIdx,
    zhiIdx,
    ganEl: GAN_EL[ganIdx],
    zhiEl: ZHI_EL[zhiIdx],
    ganYang: GAN_YANG[ganIdx],
    sipsin: SIPSIN_KO[sipsinHanja] ?? sipsinHanja,
  };
}

/** 생년월일시 → 사주팔자 차트 */
export function computeSaju(input: BirthInput): SajuChart {
  const h = input.unknownTime ? 12 : input.hour ?? 12;
  const mi = input.minute ?? 0;

  // 음력 입력이면 Lunar에서 직접, 양력이면 Solar→Lunar
  const lunar = input.isLunar
    ? Lunar.fromYmdHms(input.year, input.isLeapMonth ? -input.month : input.month, input.day, h, mi, 0)
    : Solar.fromYmdHms(input.year, input.month, input.day, h, mi, 0).getLunar();

  const ec = lunar.getEightChar();

  const year = buildPillar(ec.getYearGan(), ec.getYearZhi(), ec.getYearShiShenGan());
  const month = buildPillar(ec.getMonthGan(), ec.getMonthZhi(), ec.getMonthShiShenGan());
  const day = buildPillar(ec.getDayGan(), ec.getDayZhi(), '日主');
  const hour = input.unknownTime ? null : buildPillar(ec.getTimeGan(), ec.getTimeZhi(), ec.getTimeShiShenGan());

  // 오행 분포: 드러난 천간·지지 글자 카운트 (시 모름이면 시주 제외)
  const elements = emptyElements();
  const counted: Pillar[] = hour ? [year, month, day, hour] : [year, month, day];
  for (const p of counted) {
    elements[p.ganEl] += 1;
    elements[p.zhiEl] += 1;
  }

  const dayMasterEl = day.ganEl;
  const inseongEl = SAENG_FROM[dayMasterEl]; // 나를 생하는 오행

  // 신강도(휴리스틱): 일간과 같은 오행(비겁) + 인성 오행이 차지하는 비율
  const totalChars = counted.length * 2;
  const support = (elements[dayMasterEl] ?? 0) + (elements[inseongEl] ?? 0);
  const strength = totalChars > 0 ? support / totalChars : 0;

  // 우세/부족 오행
  let dominant: ElementKey = 'mok';
  let max = -1;
  for (const k of EL_KEYS) {
    if (elements[k] > max) {
      max = elements[k];
      dominant = k;
    }
  }
  const lacking = EL_KEYS.filter((k) => elements[k] === 0);

  return {
    year,
    month,
    day,
    hour,
    dayGanIdx: day.ganIdx,
    dayMasterKo: day.ganKo,
    dayMasterEl,
    dayMasterYang: day.ganYang,
    tti: ZHI_TTI[year.zhiIdx],
    elements,
    dominant,
    lacking,
    strength,
    lunarText: lunar.toString(),
    input,
  };
}

/** 팔자를 "갑자 / 을축 …" 식으로 표기 */
export function chartPillars(c: SajuChart): { label: string; gz: string }[] {
  const rows = [
    { label: '연주', p: c.year },
    { label: '월주', p: c.month },
    { label: '일주', p: c.day },
  ];
  if (c.hour) rows.push({ label: '시주', p: c.hour });
  return rows.map((r) => ({ label: r.label, gz: `${r.p.ganKo}${r.p.zhiKo}` }));
}
