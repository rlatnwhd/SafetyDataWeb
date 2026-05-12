// hooks/useKakaoMap.js — 카카오맵 DOM 인스턴스 관리 (단일 책임: 지도 렌더링)
import { useEffect, useRef, useCallback } from 'react';
import { MARKER_CATEGORIES, MAP_DEFAULT } from '../constants/mapConfig';

export function useKakaoMap(containerRef, center) {
  const mapRef = useRef(null);
  // 카테고리 키 → 오버레이 배열
  const categoryOverlaysRef = useRef({});
  const centerMarkerRef = useRef(null);

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current || !center || !window.kakao?.maps) return;

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: MAP_DEFAULT.level,
    };
    mapRef.current = new window.kakao.maps.Map(containerRef.current, options);
  }, [containerRef, center]);

  // 마커 그리기 (카테고리별 분리 보관)
  const drawMarkers = useCallback((markers) => {
    // 기존 오버레이 전체 제거
    Object.values(categoryOverlaysRef.current).flat().forEach((o) => o.setMap(null));
    categoryOverlaysRef.current = {};
    if (centerMarkerRef.current) { centerMarkerRef.current.setMap(null); centerMarkerRef.current = null; }

    if (!mapRef.current || !window.kakao?.maps) return;

    const entries = [
      { key: 'cctv',          list: markers.cctv,          cat: MARKER_CATEGORIES.CCTV },
      { key: 'police',        list: markers.police,        cat: MARKER_CATEGORIES.POLICE },
      { key: 'entertainment', list: markers.entertainment, cat: MARKER_CATEGORIES.ENTERTAINMENT },
      { key: 'convenience',   list: markers.convenience,   cat: MARKER_CATEGORIES.CONVENIENCE },
      { key: 'hospital',      list: markers.hospital,      cat: MARKER_CATEGORIES.HOSPITAL },
      { key: 'bank',          list: markers.bank ?? [],     cat: MARKER_CATEGORIES.BANK },
      { key: 'store',         list: markers.store ?? [],    cat: MARKER_CATEGORIES.STORE },
    ];

    entries.forEach(({ key, list, cat }) => {
      const overlays = list.map((place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        const content = `<div style="font-size:18px;line-height:1;background:#fff;border:2px solid ${cat.color};border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:default;">${cat.emoji}</div>`;
        const overlay = new window.kakao.maps.CustomOverlay({ position, content, yAnchor: 1 });
        overlay.setMap(mapRef.current);
        return overlay;
      });
      categoryOverlaysRef.current[key] = overlays;
    });

    // 중심 마커
    centerMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(center.lat, center.lng),
      map: mapRef.current,
    });
  }, [center]);

  // 카테고리 토글
  const toggleCategory = useCallback((key, visible) => {
    const overlays = categoryOverlaysRef.current[key] || [];
    overlays.forEach((o) => o.setMap(visible ? mapRef.current : null));
  }, []);

  // 중심 복귀
  const resetCenter = useCallback(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    mapRef.current.setLevel(MAP_DEFAULT.level);
  }, [center]);

  return { drawMarkers, toggleCategory, resetCenter };
}
