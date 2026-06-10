// ─────────────────────────────────────────────
// Supabase 클라이언트 — env(EXPO_PUBLIC_SUPABASE_URL/ANON_KEY) 있을 때만 생성.
// 미설정 시 null → 앱은 로컬 인메모리 store로 그대로 동작(점진 전환).
// ─────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          // 웹은 supabase-js 기본(localStorage), 네이티브는 AsyncStorage
          storage: Platform.OS === 'web' ? undefined : AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // 웹은 OAuth 리다이렉트 복귀 시 URL에서 세션 감지
          detectSessionInUrl: Platform.OS === 'web',
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;

/** 세션 보장 — 없으면 익명 로그인(추후 카카오로 연동). 미설정이면 null. */
export async function ensureSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return anon.user;
}
