# 동네벚꽃 — Supabase 셋업

## 1) 프로젝트 만들기
1. https://supabase.com 에서 프로젝트 생성 (region: `Northeast Asia (Seoul)` 권장).
2. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사.
3. 루트 `.env` 에 넣기:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
   (`.env.example` 참고. 설정 안 하면 앱은 로컬 store로 계속 동작.)

## 2) 스키마 적용
**방법 A — SQL Editor(간단):** `migrations/0001_init.sql` 내용을 통째로 붙여넣고 Run.

**방법 B — CLI:**
```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

## 3) 익명 로그인 켜기 (필수, 토대 단계)
**Authentication → Providers → Anonymous Sign-ins → Enable.**
온보딩이 익명 세션으로 `profiles`/`saju_private`에 저장한다. (추후 카카오 OAuth로 연동·승격)

## 4) 동작 확인
앱에서 온보딩을 끝내면 **Table Editor → profiles / saju_private** 에 행이 생긴다.
- `profiles.saju_summary` = 공개 요약(일간/오행/요약)
- `saju_private.chart` = 전체 팔자 원본(본인만, RLS로 매칭 상대도 접근 불가)

## 프라이버시 설계 (설계서 §8)
생년월일시·전체 팔자는 **`saju_private`(본인 전용)** 에만 두고, 매칭 상대에게는 `profiles.saju_summary` 만 노출.
서버 로직(daily-match 등)은 service role로 RLS를 우회해 원본에 접근한다.

## 다음(아직 미구현)
- Edge Functions: `daily-match` · `gunghap` · `deep-reading` · `verify-purchase`
- 카카오 OAuth + 휴대폰 본인인증, GPS 구 인증
- 포인트/매칭 store를 Supabase로 이전
