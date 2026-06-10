// GPS 구 인증 — 현재 위치를 역지오코딩해 행정구(구) 추정. 네이티브/웹 모두 시도.
export type GuResult = { gu: string | null; denied?: boolean; error?: boolean };

export async function detectGu(): Promise<GuResult> {
  try {
    const Location = await import('expo-location');
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { gu: null, denied: true };
    const pos = await Location.getCurrentPositionAsync({});
    const res = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    const f = res[0];
    // 한국 '구'는 보통 district/subregion/city 중 하나에 들어옴
    const gu = f?.district || f?.subregion || f?.city || null;
    return { gu };
  } catch {
    return { gu: null, error: true };
  }
}
