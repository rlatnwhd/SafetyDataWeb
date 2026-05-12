// services/csvService.js — CSV 공공데이터 로드 및 거리 필터링 (단일 책임: 정적 데이터 접근)

/** Haversine 공식으로 두 좌표 간 거리(km) 계산 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** EUC-KR 인코딩 CSV fetch */
async function fetchCsvEucKr(filename) {
  try {
    const res = await fetch(`/data/${filename}`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new TextDecoder('euc-kr').decode(buf);
  } catch {
    return null;
  }
}

/**
 * 버스정류장정보.csv 파싱
 * 컬럼 구조: 정류장노드ID, 정류장명, 경도, 위도, 운수업체코드, 운수업체명
 */
function parseBusStopCsv(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1) // 헤더 제외
    .map((line) => {
      const cols = line.split(',');
      const id = cols[0]?.trim();
      const name = cols[1]?.trim();
      const lng = parseFloat(cols[2]);
      const lat = parseFloat(cols[3]);
      if (!id || isNaN(lat) || isNaN(lng)) return null;
      return { id, place_name: name || '버스정류장', x: String(lng), y: String(lat) };
    })
    .filter(Boolean);
}

/**
 * CCTV정보.csv 파싱 — 헤더에서 위도/경도 컬럼 자동 탐지
 * 예상 컬럼 예시: 연번, 소재지도로명주소, 위도, 경도, 카메라대수, ...
 */
function parseCctvCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  const latIdx = headers.findIndex(
    (h) => h === '위도' || h.toLowerCase() === 'lat' || h.toLowerCase() === 'latitude'
  );
  const lngIdx = headers.findIndex(
    (h) =>
      h === '경도' ||
      h.toLowerCase() === 'lng' ||
      h.toLowerCase() === 'lon' ||
      h.toLowerCase() === 'longitude'
  );
  const nameIdx = headers.findIndex(
    (h) =>
      h.includes('주소') || h.includes('장소') || h.includes('설치') || h.includes('위치')
  );

  if (latIdx === -1 || lngIdx === -1) {
    console.warn('[csvService] CCTV CSV에서 위도/경도 컬럼을 찾을 수 없습니다. 헤더:', headers);
    return [];
  }

  return lines
    .slice(1)
    .map((line, i) => {
      const cols = line.split(',');
      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);
      if (isNaN(lat) || isNaN(lng)) return null;
      return {
        id: String(i),
        place_name: (nameIdx >= 0 ? cols[nameIdx]?.trim() : '') || 'CCTV',
        x: String(lng),
        y: String(lat),
      };
    })
    .filter(Boolean);
}

// 메모리 캐시 (앱 수명 동안 1회만 로드)
let busStopCache = null;
let cctvCache = null;

/** 캐시 초기화 (개발 편의용) */
export function clearCsvCache() {
  busStopCache = null;
  cctvCache = null;
}

/**
 * 특정 좌표 반경 내 버스정류장 목록 반환
 * @param {{ lat: number, lng: number }} center
 * @param {number} radiusKm  기본 0.5km (500m)
 */
export async function loadBusStopsNear(center, radiusKm = 0.5) {
  if (!busStopCache) {
    const text = await fetchCsvEucKr('버스정류장정보.csv');
    busStopCache = text ? parseBusStopCsv(text) : [];
    console.log(`[csvService] 버스정류장 ${busStopCache.length}건 로드`);
  }
  return busStopCache.filter(
    (r) =>
      haversineKm(center.lat, center.lng, parseFloat(r.y), parseFloat(r.x)) <= radiusKm
  );
}

/**
 * 특정 좌표 반경 내 CCTV 목록 반환
 * @param {{ lat: number, lng: number }} center
 * @param {number} radiusKm  기본 0.5km (500m)
 */
export async function loadCctvNear(center, radiusKm = 0.5) {
  if (!cctvCache) {
    const text = await fetchCsvEucKr('CCTV정보.csv');
    cctvCache = text ? parseCctvCsv(text) : [];
    console.log(`[csvService] CCTV ${cctvCache.length}건 로드`);
  }
  return cctvCache.filter(
    (r) =>
      haversineKm(center.lat, center.lng, parseFloat(r.y), parseFloat(r.x)) <= radiusKm
  );
}
