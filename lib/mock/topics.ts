// 데모용 동네 소모임(관심사 토픽)
export interface Topic {
  id: string;
  emoji: string;
  title: string;
  tag: string; // 관심사 태그 (가입 시 내 관심사에 추가)
  gu: string;
  members: number;
  when: string;
}

export const TOPICS: Topic[] = [
  { id: 't1', emoji: '☕', title: '망원동 카페 도장깨기', tag: '카페', gu: '마포구', members: 18, when: '매주 토 오후' },
  { id: 't2', emoji: '🏃', title: '한강 아침 러닝크루', tag: '러닝', gu: '마포구', members: 42, when: '화·목 아침' },
  { id: 't3', emoji: '🔮', title: '타로·사주 같이 공부해요', tag: '사주공부', gu: '마포구', members: 9, when: '격주 일' },
  { id: 't4', emoji: '🍜', title: '동네 맛집 탐험대', tag: '맛집', gu: '성동구', members: 27, when: '매주 금 저녁' },
  { id: 't5', emoji: '🎬', title: '심야 영화 모임', tag: '영화', gu: '마포구', members: 15, when: '금 밤' },
  { id: 't6', emoji: '🐶', title: '멍멍이 산책 친구', tag: '반려동물', gu: '마포구', members: 31, when: '매일 저녁' },
  { id: 't7', emoji: '🎲', title: '보드게임 번개', tag: '보드게임', gu: '관악구', members: 12, when: '주말' },
  { id: 't8', emoji: '✍️', title: '퇴근 후 글쓰기', tag: '글쓰기', gu: '성동구', members: 7, when: '수 밤' },
];
