// ─────────────────────────────────────────────
// 데모용 목 데이터 — 동네 사람들 (서버 profiles 붙기 전까지)
// ─────────────────────────────────────────────

import type { BirthInput } from '../saju';
import type { Purpose } from '../store/profile';

export interface Person {
  id: string;
  name: string;
  age: number;
  gu: string;
  emoji: string;
  tagline: string;
  interests: string[];
  purposes: Purpose[];
  flowerTemp: number; // 벚꽃온도
  activity: number; // 활동성 0~100
  isNew: boolean; // 신규 가입
  birth: BirthInput;
}

export const PEOPLE: Person[] = [
  {
    id: 'jimin',
    name: '지민',
    age: 29,
    gu: '마포구',
    emoji: '🌿',
    tagline: '조용한 카페 탐험가',
    interests: ['카페', '사주공부', '글쓰기', '전시'],
    purposes: ['meal', 'hobby', 'friend'],
    flowerTemp: 37.2,
    activity: 60,
    isNew: false,
    birth: { year: 1995, month: 8, day: 23, hour: 14, minute: 30, gender: 'F' },
  },
  {
    id: 'doyun',
    name: '도윤',
    age: 31,
    gu: '성동구',
    emoji: '🏃',
    tagline: '주말엔 무조건 러닝',
    interests: ['러닝', '맛집', '영화', '등산'],
    purposes: ['exercise', 'meal', 'friend'],
    flowerTemp: 35.8,
    activity: 80,
    isNew: false,
    birth: { year: 1993, month: 2, day: 11, hour: 9, minute: 0, gender: 'M' },
  },
  {
    id: 'haneul',
    name: '하늘',
    age: 26,
    gu: '관악구',
    emoji: '🔮',
    tagline: '타로와 혼술 사이',
    interests: ['타로', '혼술', '동네수다', '영화'],
    purposes: ['hobby', 'friend', 'love'],
    flowerTemp: 39.5,
    activity: 45,
    isNew: true,
    birth: { year: 2000, month: 12, day: 5, unknownTime: true, gender: 'F' },
  },
  {
    id: 'seoyun',
    name: '서윤',
    age: 28,
    gu: '마포구',
    emoji: '🐶',
    tagline: '산책 메이트 구해요',
    interests: ['반려동물', '산책', '카페', '보드게임'],
    purposes: ['exercise', 'friend', 'meal'],
    flowerTemp: 36.5,
    activity: 70,
    isNew: false,
    birth: { year: 1997, month: 6, day: 30, hour: 18, minute: 20, gender: 'F' },
  },
  {
    id: 'minjae',
    name: '민재',
    age: 30,
    gu: '마포구',
    emoji: '🎸',
    tagline: '퇴근 후 합주하실 분',
    interests: ['음악', '맛집', '영화', '산책'],
    purposes: ['hobby', 'friend'],
    flowerTemp: 38.0,
    activity: 72,
    isNew: false,
    birth: { year: 1994, month: 9, day: 9, hour: 21, minute: 0, gender: 'M' },
  },
  {
    id: 'soyul',
    name: '소율',
    age: 27,
    gu: '성동구',
    emoji: '📷',
    tagline: '주말 사진 산책 같이해요',
    interests: ['산책', '전시', '카페', '반려동물'],
    purposes: ['hobby', 'exercise', 'friend'],
    flowerTemp: 41.2,
    activity: 85,
    isNew: true,
    birth: { year: 1998, month: 4, day: 22, hour: 7, minute: 40, gender: 'F' },
  },
];

export function findPerson(id: string | undefined): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}
