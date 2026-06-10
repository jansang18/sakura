# 🌸 동네벚꽃 (sakura)

사주 궁합 기반 **동네 소셜 매칭 앱**. 우리 동네에서 사주 궁합이 잘 맞는 밥친구·운동메이트·취미친구·연인을 **하루 3명씩** 이어준다. (소개팅 앱이 아니라 "동네 인연 발견" 앱)

## 스택
- **Expo SDK 56** / expo-router / TypeScript
- 사주 엔진: **lunar-typescript** (`lib/saju`) — 팔자·오행·십신·성격·궁합
- 백엔드(도입 중): **Supabase** (Auth · Postgres · RLS · Edge Functions)
- AI 심층 풀이: **Claude (Anthropic)** — Expo API route, 키 없으면 템플릿 폴백
- 배포: **Vercel** (web server output)

## 실행
```bash
npm install
npm run start      # 그다음 터미널에서 w(웹) / a(안드로이드)
```

## 환경변수
`.env.example` → `.env` 복사 후 채우기:
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` (서버 전용, `/api/report`)

## 구조
```
app/            화면 — 로그인·온보딩·홈(하루3명)·궁합카드·채팅·후기
lib/saju/       사주 계산·성격·궁합 엔진
lib/match/      daily-match 점수식 (궁합50·온도20·활동20·신규10)
lib/store/      포인트·프로필·소셜(벚꽃온도) 상태
supabase/       스키마+RLS, Edge Functions (daily-match)
DEPLOY.md       Vercel 배포 가이드
```

## 핵심 기능
- 하루 3명 사주 궁합 매칭, 궁합 점수(친구/연인/대화) + 성격 미리보기
- 유료 심층 리포트(포인트) · 1:1 채팅 · 약속 → 후기 → **벚꽃온도**(신뢰지표)

> 비공개 프로젝트. 사주/궁합 로직과 키 관련 주의 — `.env`는 깃에 올리지 않는다.
