// hooks/useKakaoSdk.js — 카카오맵 SDK 로드 상태 확인 (단일 책임: SDK 가용 여부)
import { useState, useEffect } from 'react';

/**
 * 카카오맵 SDK 로드 완료까지 폴링으로 대기합니다.
 * 외부 스크립트 로드 타이밍이 React 마운트보다 늦을 수 있으므로
 * window.kakao.maps 가 생길 때까지 100ms 간격으로 확인합니다.
 * @returns {{ ready: boolean, error: string|null }}
 */
export function useKakaoSdk() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 이미 로드된 경우 즉시 완료
    if (window.kakao?.maps) {
      setReady(true);
      return;
    }

    let tries = 0;
    const MAX_TRIES = 50; // 최대 5초 대기

    const timer = setInterval(() => {
      tries += 1;
      if (window.kakao?.maps) {
        clearInterval(timer);
        setReady(true);
      } else if (tries >= MAX_TRIES) {
        clearInterval(timer);
        setError('카카오맵 SDK를 불러올 수 없습니다. 도메인 등록 또는 네트워크를 확인하세요.');
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return { ready, error };
}
