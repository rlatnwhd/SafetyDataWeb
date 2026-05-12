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
 * CCTV정보.csv 파싱 — 헤더에서 위도/경도 컬럼 자동 탐지
 * 예상 컬럼 예시: 연번, 소재지도로명주소, 위도, 경도, 카메라대수, ...
 */
function parseCctvCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  const latIdx = headers.findIndex(
    (h) => h === 'WGS84위도' || h === '위도' || h.toLowerCase() === 'lat' || h.toLowerCase() === 'latitude'
  );
  const lngIdx = headers.findIndex(
    (h) =>
      h === 'WGS84경도' ||
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
let cctvCache = null;
let crimeCache = null;

/** 캐시 초기화 (개발 편의용) */
export function clearCsvCache() {
  cctvCache = null;  crimeCache = null;}

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

/**
 * 범죄발생지역별통계.csv 로드 및 파싱
 * 구조: 범죄대분류, 범죄중분류, [지역명...] (컬럼)
 */
async function loadCrimeData() {
  if (crimeCache) return crimeCache;
  const text = await fetchCsvEucKr('범죄발생지역별통계.csv');
  if (!text) { crimeCache = { headers: [], rows: [] }; return crimeCache; }

  const lines = text.trim().split(/\r?\n/);
  const rawHeaders = lines[0].split(',');
  // 헤더: 첫 2열(범죄대분류, 범죄중분류) 제외, 나머지 지역명
  const headers = rawHeaders.slice(2).map(h => h.trim().replace(/\s+/g, ' '));

  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    return {
      category: cols[0]?.trim(),
      subCategory: cols[1]?.trim(),
      values: cols.slice(2).map(v => parseInt(v.trim(), 10) || 0),
    };
  }).filter(r => r.category && r.subCategory);

  crimeCache = { headers, rows };
  console.log(`[csvService] 범죄통계 ${rows.length}행, ${headers.length}개 지역 로드`);
  return crimeCache;
}

/**
 * 특정 시군구 범죄 통계 반환
 * @param {string} regionKey  예: "대구 중구"
 * @returns {Promise<Array<{category, subCategory, count}> | null>}
 */
export async function getCrimesByRegion(regionKey) {
  const data = await loadCrimeData();
  if (!data.headers.length) return null;

  const normalized = regionKey.replace(/\s+/g, '');
  const colIdx = data.headers.findIndex(h => h.replace(/\s+/g, '') === normalized);
  if (colIdx === -1) {
    console.warn(`[csvService] 범죄통계에서 "${regionKey}" 지역을 찾을 수 없습니다.`);
    return null;
  }

  return data.rows.map(row => ({
    category: row.category,
    subCategory: row.subCategory,
    count: row.values[colIdx] || 0,
  }));
}

/**
 * 전국 모든 시군구의 총 범죄 건수 평균 반환
 * scoreService에서 현재 지역 범죄율 상대 비교용
 * @returns {Promise<number|null>}
 */
export async function getAvgRegionCrimeTotal() {
  const data = await loadCrimeData();
  if (!data.headers.length || !data.rows.length) return null;
  const totals = data.headers.map((_, i) =>
    data.rows.reduce((sum, r) => sum + (r.values[i] || 0), 0)
  );
  return Math.round(totals.reduce((s, v) => s + v, 0) / totals.length);
}

/**
 * 같은 시도(광역시·도) 내 구/군 평균 범죄 대분류별 건수 반환
 * 예: regionKey = "부산 남구" → 부산 내 모든 구/군 평균
 * @param {string} regionKey  예: "부산 남구"
 * @returns {Promise<Record<string,number>|null>}
 */
export async function getAvgCrimeByCat(regionKey) {
  const data = await loadCrimeData();
  if (!data.headers.length || !data.rows.length) return null;

  // 시도 추출: "부산 남구" → "부산"
  const sido = regionKey.split(' ')[0];
  // 같은 시도에 속하는 열 인덱스
  const idxList = data.headers
    .map((h, i) => (h.startsWith(sido + ' ') ? i : -1))
    .filter(i => i !== -1);
  if (!idxList.length) return null;

  // 대분류별로 해당 시도 내 구/군 합산 후 평균
  const catSums = {};
  for (const row of data.rows) {
    const catSum = idxList.reduce((s, i) => s + (row.values[i] || 0), 0);
    catSums[row.category] = (catSums[row.category] ?? 0) + catSum;
  }
  return Object.fromEntries(
    Object.entries(catSums).map(([cat, sum]) => [cat, Math.round(sum / idxList.length)])
  );
}
