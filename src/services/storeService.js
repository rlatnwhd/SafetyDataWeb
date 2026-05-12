// services/storeService.js — 생활대규모점포 JSON 로드 및 반경 필터링

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
  const res = await fetch('/data/stores.json');
  if (!res.ok) throw new Error('stores.json 로드 실패');
  _cache = await res.json();
  return _cache;
}

// 업태구분명 → 표시용 라벨
function typeLabel(type) {
  const map = {
    '대형마트': '대형마트',
    '백화점': '백화점',
    '복합쇼핑몰': '복합쇼핑몰',
    '쇼핑센터': '쇼핑센터',
    '시장': '시장',
    '전문점': '전문점',
    '그 밖의 대규모점포': '대형점포',
  };
  return map[type] || '대형점포';
}

/**
 * center 반경 radiusKm 내 대형점포 반환
 * 반환 형식: [{ id, place_name, x(경도 문자열), y(위도 문자열), storeType }]
 */
export async function loadStoresNear(center, radiusKm = 0.5) {
  const all = await loadAll();
  return all
    .filter((s) => haversineKm(center.lat, center.lng, s.lat, s.lng) <= radiusKm)
    .map((s) => ({
      id: s.id,
      place_name: `${typeLabel(s.type)} ${s.name}`.trim(),
      x: String(s.lng),
      y: String(s.lat),
      storeType: typeLabel(s.type),
      addr: s.addr,
    }));
}
