// hooks/useKakaoMap.js — 카카오맵 DOM 인스턴스 관리 (MarkerClusterer + 마트/편의점/은행 로고 마커)
import { useEffect, useRef, useCallback } from 'react';
import { MARKER_CATEGORIES, MAP_DEFAULT } from '../constants/mapConfig';

/* ─── 한글 파일명 URL 인코딩 헬퍼 ────────────────────── */
const bk = name => `/BankLogo/${encodeURIComponent(name)}`;

/* ─── 마트 로고 ──────────────────────────────────────────── */
const STORE_LOGO_URLS = {
  emart:    '/MTLogo/Emart.png',
  lotte:    '/MTLogo/Lottemart.png',
  homeplus: '/MTLogo/Homeplus.png',
  costco:   '/MTLogo/Costco.png',
  traders:  '/MTLogo/TradersWholesaleClub.png',
  mega:     '/MTLogo/Megamart.png',
  hanaro:   '/MTLogo/Hanaromart.png',
  nobrand:  '/MTLogo/Nobrand.png',
};

/* ─── 편의점 로고 ────────────────────────────────────────── */
const CVS_LOGO_URLS = {
  gs25:     '/CvsLogo/GS25.png',
  cu:       '/CvsLogo/CU.png',
  emart24:  '/CvsLogo/EMART24.png',
  seven:    '/CvsLogo/7-ELEVEN.png',
  ministop: '/CvsLogo/MINISTOP.png',
};

/* ─── 은행 로고 (한글 파일명 → encodeURIComponent 적용) ─────────── */
const BANK_LOGO_URLS = {
  kb:      bk('국민은행.png'),
  shinhan: bk('신한은행.png'),
  woori:   bk('우리은행.png'),
  hana:    bk('하나은행.png'),
  nh:      bk('농협은행.png'),
  ibk:     bk('기업은행.png'),
  sc:      bk('제일은행.png'),
  sh:      bk('수협은행.png'),
  kdb:     bk('한국산업은행.png'),
  exim:    bk('한국수출입은행.png'),
  citi:    bk('한국씨티은행.png'),
  bnk_bs:  bk('부산은행.png'),
  bnk_gn:  bk('경남은행.png'),
  im:      bk('iM뱅크.png'),
  gwangju: bk('광주은행.png'),
  jb:      bk('전북은행.png'),
  jeju:    bk('제주은행.png'),
};

/** 마트 장소명 → 브랜드 키 */
function getStoreBrand(name = '') {
  if (/^이마트(?!24)/.test(name)) return 'store_emart';
  if (/롯데마트/.test(name))      return 'store_lotte';
  if (/홈플러스/.test(name))      return 'store_homeplus';
  if (/코스트코/.test(name))      return 'store_costco';
  if (/트레이더스/.test(name))     return 'store_traders';
  if (/메가마트/.test(name))      return 'store_mega';
  if (/하나로마트/.test(name))     return 'store_hanaro';
  if (/노브랜드/.test(name))      return 'store_nobrand';
  return null;
}

/** 편의점 장소명 → 브랜드 키 */
function getCvsBrand(name = '') {
  if (/^GS25/.test(name))       return 'cvs_gs25';
  if (/^CU/.test(name))         return 'cvs_cu';
  if (/^이마트24/.test(name))   return 'cvs_emart24';
  if (/^세븐일레븐/.test(name)) return 'cvs_seven';
  if (/^미니스톱/.test(name))   return 'cvs_ministop';
  return null;
}

/** 은행 장소 객체 (place.bank || place.place_name) → 브랜드 키 */
function getBankBrand(place) {
  const name = place.bank || place.place_name || '';
  if (name === 'KB국민은행')           return 'bank_kb';
  if (name === '신한은행')              return 'bank_shinhan';
  if (name === '우리은행')              return 'bank_woori';
  if (name === '하나은행')              return 'bank_hana';
  if (name === 'NH농협은행')           return 'bank_nh';
  if (name === 'IBK기업은행')          return 'bank_ibk';
  if (name === 'SC제일은행')           return 'bank_sc';
  if (name === 'Sh수협은행')           return 'bank_sh';
  if (name === '한국산업은행')         return 'bank_kdb';
  if (name === '수출입은행')           return 'bank_exim';
  if (name === '한국씨티은행')         return 'bank_citi';
  if (name === 'BNK부산은행')          return 'bank_bnk_bs';
  if (name === 'BNK경남은행')          return 'bank_bnk_gn';
  if (name === 'iM뱅크(구 대구은행)')  return 'bank_im';
  if (name === '광주은행')              return 'bank_gwangju';
  if (name === '전북은행')              return 'bank_jb';
  if (name === '제주은행')              return 'bank_jeju';
  return null;
}

/**
 * 로고 PNG를 fetch → base64 인라인 SVG로 원형 마커 이미지 생성
 * (화질 깨짐 없음, 기존 이모지 마커와 동일 모양/크기)
 */
async function makeLogoMarkerImage(logoUrl, color) {
  let base64;
  try {
    const res  = await fetch(logoUrl);
    const blob = await res.blob();
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }

  // 기존 이모지 마커와 동일: 32×32, circle r=14
  const SIZE = 32, CX = 16, CY = 16, R = 14;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIZE}" height="${SIZE}">`,
    `<defs><clipPath id="lc"><circle cx="${CX}" cy="${CY}" r="${R - 1}"/></clipPath></defs>`,
    `<circle cx="${CX}" cy="${CY}" r="${R}" fill="white" stroke="${color}" stroke-width="2.5"/>`,
    `<image href="${base64}" x="4" y="4" width="24" height="24" preserveAspectRatio="xMidYMid meet" clip-path="url(#lc)"/>`,
    `</svg>`,
  ].join('');

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return new window.kakao.maps.MarkerImage(
    url,
    new window.kakao.maps.Size(SIZE, SIZE),
    { offset: new window.kakao.maps.Point(CX, CY) }
  );
}

/** 마트 + 편의점 + 은행 로고 전체 사전 로드 */
async function preloadAllLogos() {
  const targets = [
    ...Object.entries(STORE_LOGO_URLS).map(([k, url]) => ({
      key: `store_${k}`, url, color: MARKER_CATEGORIES.STORE.color,
    })),
    ...Object.entries(CVS_LOGO_URLS).map(([k, url]) => ({
      key: `cvs_${k}`, url, color: MARKER_CATEGORIES.CONVENIENCE.color,
    })),
    ...Object.entries(BANK_LOGO_URLS).map(([k, url]) => ({
      key: `bank_${k}`, url, color: MARKER_CATEGORIES.BANK.color,
    })),
  ];
  const pairs = await Promise.all(
    targets.map(async ({ key, url, color }) => {
      const img = await makeLogoMarkerImage(url, color);
      return [key, img];
    })
  );
  return Object.fromEntries(pairs.filter(([, v]) => v !== null));
}

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
  const logoImagesRef = useRef({});        // brand → MarkerImage (사전 로드)
  const lastMarkersRef = useRef(null);     // 마지막으로 그린 markers (로고 로드 후 재드로우용)
  const forceRedrawRef = useRef(null);     // drawMarkers 맰 한번 더 실행하는 함수
  const radiusCircleRef = useRef(null);    // 반경 표시 원

  // 지도 초기화 + 반경 원 + 로고 사전 로드
  useEffect(() => {
    if (!containerRef.current || !center || !window.kakao?.maps) return;
    mapRef.current = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: MAP_DEFAULT.level,
    });

    // 기존 반경 원 제거 후 재그리기
    if (radiusCircleRef.current) radiusCircleRef.current.setMap(null);
    radiusCircleRef.current = new window.kakao.maps.Circle({
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      radius: 1000,
      strokeWeight: 1.5,
      strokeColor: '#2563eb',
      strokeOpacity: 0.35,
      strokeStyle: 'solid',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      map: mapRef.current,
    });

    // 이미 로드된 경우 재로드 생략
    if (Object.keys(logoImagesRef.current).length === 0) {
      preloadAllLogos().then(imgs => {
        logoImagesRef.current = imgs;
        // 로고 로드 완료 시점에 이미 마커가 그려져 있으면 재드로우
        forceRedrawRef.current?.();
      });
    }
  }, [containerRef, center]);

  // 마커 그리기 (카테고리별 클러스터)
  const drawMarkers = useCallback((markers) => {
    lastMarkersRef.current = markers; // 재드로우를 위해 저장
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
      const defaultImage = makeMarkerImage(cat.emoji, cat.color);
      const markerList = list.map(place => {
        let image = defaultImage;
        // 마트 마커: 브랜드별 로고 이미지 사용
        if (key === 'store') {
          const brand = getStoreBrand(place.place_name || '');
          if (brand && logoImagesRef.current[brand]) {
            image = logoImagesRef.current[brand];
          }
        }
        // 편의점 마커: 브랜드별 로고 이미지 사용
        if (key === 'convenience') {
          const brand = getCvsBrand(place.place_name || '');
          if (brand && logoImagesRef.current[brand]) {
            image = logoImagesRef.current[brand];
          }
        }
        // 은행 마커: 은행명별 로고 이미지 사용
        if (key === 'bank') {
          const brand = getBankBrand(place);
          if (brand && logoImagesRef.current[brand]) {
            image = logoImagesRef.current[brand];
          }
        }
        return new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(place.y, place.x),
          image,
        });
      });
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

  // forceRedrawRef 를 drawMarkers와 동기화 (신규 center가 올 때마다 갱신)
  useEffect(() => {
    forceRedrawRef.current = () => {
      if (lastMarkersRef.current) drawMarkers(lastMarkersRef.current);
    };
  }, [drawMarkers]);

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
