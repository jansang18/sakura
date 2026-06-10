// ─────────────────────────────────────────────
// 네이버 로그인 콜백 (Supabase 네이티브 미지원이라 자체 처리)
// 배포: supabase functions deploy naver-callback
// 네이버 콘솔 Callback URL = https://<ref>.functions.supabase.co/naver-callback
// env: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_REDIRECT(dongnebeotkkot://)
//
// 흐름: code → 네이버 access token → 네이버 프로필 → Supabase 사용자 확보 → 앱으로 세션 전달
// ※ 3단계(세션 발급)는 보안상 magiclink/admin.generateLink 등으로 마무리해야 함 (아래 TODO).
// ─────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') ?? '';
  if (!code) return new Response('missing code', { status: 400 });

  // 1) code → 네이버 access token
  const tokenRes = await fetch(
    'https://nid.naver.com/oauth2.0/token?' +
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('NAVER_CLIENT_ID')!,
        client_secret: Deno.env.get('NAVER_CLIENT_SECRET')!,
        code,
        state,
      }),
  );
  const token = await tokenRes.json();
  if (!token.access_token) return new Response('token error', { status: 502 });

  // 2) 네이버 프로필
  const meRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const me = (await meRes.json())?.response;
  const naverId: string | undefined = me?.id;
  if (!naverId) return new Response('profile error', { status: 502 });
  const email = me?.email ?? `naver_${naverId}@dongnebeotkkot.local`;
  const name = me?.nickname ?? '벚꽃이';

  // 3) Supabase 사용자 확보 (admin)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  // TODO: email로 기존 사용자 조회/생성 후 admin.generateLink({ type:'magiclink' }) 등으로
  //       일회용 세션 토큰을 만들어 앱으로 전달. (여기선 식별값만 전달하는 데모)
  void admin;

  const appRedirect = Deno.env.get('APP_REDIRECT') ?? 'dongnebeotkkot://';
  const redirect = `${appRedirect}?naver_id=${encodeURIComponent(naverId)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
  return Response.redirect(redirect, 302);
});
