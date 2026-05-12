// services/bankService.js — 은행 JSON 데이터 로드 및 반경 필터링

/** Haversine 거리(km) */
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

let _cache = null;

async function loadAll() {
  if (_cache) return _cache;
  const res = await fetch('/data/banks.json');
  if (!res.ok) throw new Error('banks.json 로드 실패');
  _cache = await res.json();
  return _cache;
}

/**
 * center 반경 radiusKm 내 은행 목록 반환
 * 반환 형식: [{ id, place_name, x(경도 문자열), y(위도 문자열), bank, branch }]
 */
export async function loadBanksNear(center, radiusKm = 0.5) {
  const all = await loadAll();
  return all
    .filter((b) => haversineKm(center.lat, center.lng, b.lat, b.lng) <= radiusKm)
    .map((b) => ({
      id: b.id,
      place_name: `${b.bank} ${b.branch}`.trim(),
      x: String(b.lng),
      y: String(b.lat),
      bank: b.bank,
      branch: b.branch,
      addr: b.addr,
    }));
}
