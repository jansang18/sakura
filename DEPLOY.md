# 동네벚꽃 — Vercel 배포

Expo Router 서버 출력(`web.output: "server"`)을 Vercel에 올린다. 설정은 `vercel.json` + `api/index.js`(서버 어댑터)에 이미 들어 있음.

## 한 번만: 배포
git 없이 CLI로 바로 올리는 게 가장 빠르다.

```bash
npm i -g vercel        # 또는 매번 npx vercel
vercel login           # 브라우저로 로그인
vercel                 # 미리보기 배포 (프로젝트 연결 질문엔 엔터)
vercel --prod          # 프로덕션 → https://<프로젝트>.vercel.app
```

빌드 설정은 `vercel.json`이 자동 적용한다:
- Build Command: `expo export -p web`
- Output: `dist/client` (정적) / `dist/server` (SSR·API는 `api/index.js`가 위임)

> GitHub 연동을 원하면: 레포 push → vercel.com에서 Import. 빌드 설정은 그대로 잡힌다.

## 환경변수 (Vercel → Settings → Environment Variables)
**배포 전에** 넣어야 한다. `EXPO_PUBLIC_*`는 빌드 시 인라인되므로 특히 중요.

| 이름 | 용도 | 환경 |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase | Production + Preview |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Production + Preview |
| `ANTHROPIC_API_KEY` | `/api/report`(심층 리포트) 서버 키 | Production + Preview |

넣고 나면 재배포(`vercel --prod`).

## 배포 후 = OAuth용 도메인 확보
나온 `https://<프로젝트>.vercel.app` 을 이렇게 쓴다:
- **Supabase** → Authentication → URL Configuration → Redirect URLs 에 `https://<프로젝트>.vercel.app` 추가
- **카카오** → Web 플랫폼 사이트 도메인에 `https://<프로젝트>.vercel.app` 추가 (로그인 Redirect는 여전히 supabase 콜백)
- **네이버** → 서비스 URL = `https://<프로젝트>.vercel.app`, Callback = 여기에 만들 콜백 라우트(예: `/api/auth/naver/callback`)

## 참고 / 트러블슈팅
- Node 22 권장(Vercel 기본).
- 첫 배포 후 POST(`/api/report`)가 JSON 파싱 에러/타임아웃이면 `@expo/server` 버전 이슈일 수 있음 → 최신으로 올리고 재배포.
- 함수 런타임은 `@vercel/node@5.1.8`로 고정해둠(테스트된 조합). 문제 시 버전만 조정.
