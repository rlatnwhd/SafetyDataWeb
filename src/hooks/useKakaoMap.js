// hooks/useKakaoMap.js — 카카오맵 DOM 인스턴스 관리 (MarkerClusterer 적용)
import { useEffect, useRef, useCallback } from 'react';
import { MARKER_CATEGORIES, MAP_DEFAULT } from '../constants/mapConfig';

/** SVG 이모지 마커 이미지 생성 */
function makeMarkerImage(emoji, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">` +
    `<circle cx="16" cy="16" r="14" fill="white" stroke="${color}" stroke-width="2.5"/>` +
    `<text x="16" y="22" text-anchor="middle" font-size="17">${emoji}</text></svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return new window.kakao.maps.MarkerImage(
    url,
    new window.kakao.maps.Size(32, 32),
    { offset: new window.kakao.maps.Point(16, 16) }
  );
}

export function useKakaoMap(containerRef, center) {
  const mapRef = useRef(null);
  const categoryMarkersRef = useRef({});   // key → Marker[]
  const categoryClustersRef = useRef({});  // key → MarkerClusterer
  const centerMarkerRef = useRef(null);

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current || !center || !window.kakao?.maps) return;
    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: MAP_DEFAULT.level,
    });
  }, [containerRef, center]);

  // 마커 그리기 (카테고리별 클러스터)
  const drawMarkers = useCallback((markers) => {
    // 기존 클러스터·마커 전체 제거
    Object.values(categoryClustersRef.current).forEach(cl => cl.clear());
    Object.values(categoryMarkersRef.current).flat().forEach(m => m.setMap(null));
    categoryClustersRef.current = {};
    categoryMarkersRef.current = {};
    if (centerMarkerRef.current) { centerMarkerRef.current.setMap(null); centerMarkerRef.current = null; }

    if (!mapRef.current || !window.kakao?.maps) return;

    const entries = [
      { key: 'cctv',          list: markers.cctv,          cat: MARKER_CATEGORIES.CCTV },
      { key: 'police',        list: markers.police,        cat: MARKER_CATEGORIES.POLICE },
      { key: 'entertainment', list: markers.entertainment, cat: MARKER_CATEGORIES.ENTERTAINMENT },
      { key: 'convenience',   list: markers.convenience,   cat: MARKER_CATEGORIES.CONVENIENCE },
      { key: 'hospital',      list: markers.hospital,      cat: MARKER_CATEGORIES.HOSPITAL },
      { key: 'bank',          list: markers.bank ?? [],    cat: MARKER_CATEGORIES.BANK },
      { key: 'store',         list: markers.store ?? [],   cat: MARKER_CATEGORIES.STORE },
    ];

    entries.forEach(({ key, list, cat }) => {
      const image = makeMarkerImage(cat.emoji, cat.color);
      const markerList = list.map(place =>
        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(place.y, place.x),
          image,
        })
      );
      categoryMarkersRef.current[key] = markerList;

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: mapRef.current,
        averageCenter: true,
        minLevel: 5,
        disableClickZoom: false,
        markers: markerList,
        styles: [{
          width: '42px', height: '42px',
          background: cat.color,
          opacity: '0.9',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '42px',
          fontSize: '13px',
          border: '2px solid white',
          boxSizing: 'border-box',
        }],
      });
      categoryClustersRef.current[key] = clusterer;
    });

    // 중심 마커
    centerMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(center.lat, center.lng),
      map: mapRef.current,
    });
  }, [center]);

  // 카테고리 토글
  const toggleCategory = useCallback((key, visible) => {
    const clusterer = categoryClustersRef.current[key];
    const markerList = categoryMarkersRef.current[key] || [];
    if (!clusterer) return;
    if (visible) {
      clusterer.addMarkers(markerList);
    } else {
      clusterer.clear();
    }
  }, []);

  // 중심 복귀
  const resetCenter = useCallback(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    mapRef.current.setLevel(MAP_DEFAULT.level);
  }, [center]);

  return { drawMarkers, toggleCategory, resetCenter };
}
