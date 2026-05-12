/**
 * 생활대규모점포.csv (EUC-KR, TM중부원점 좌표) → public/data/stores.json 변환
 * TM(EPSG:2097, 중부원점 Bessel 1841) → WGS84 역투영
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../public/data/생활대규모점포.csv');
const OUT_PATH = path.join(__dirname, '../public/data/stores.json');

// ── TM(중부원점) → WGS84 역투영 ─────────────────────────────────────────
// EPSG:2097 파라미터 (Bessel 1841, 중부원점)
function tmToWgs84(E, N) {
  const a   = 6377397.155;
  const f   = 1 / 299.1528128;
  const b   = a * (1 - f);
  const e2  = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);
  const k0  = 1.0;
  const lat0 = 38 * Math.PI / 180;
  const lon0 = 127 * Math.PI / 180;
  const FE  = 200000;
  const FN  = 500000;

  const e4 = e2 * e2, e6 = e4 * e2;

  // 기준위도 자오선 호장
  function meridianArc(lat) {
    return a * (
      (1 - e2/4 - 3*e4/64 - 5*e6/256) * lat
      - (3*e2/8 + 3*e4/32 + 45*e6/1024) * Math.sin(2*lat)
      + (15*e4/256 + 45*e6/1024) * Math.sin(4*lat)
      - (35*e6/3072) * Math.sin(6*lat)
    );
  }

  const M0 = meridianArc(lat0);
  const x  = E - FE;
  const y  = N - FN;
  const M  = M0 + y / k0;
  const mu = M / (a * (1 - e2/4 - 3*e4/64 - 5*e6/256));

  const e1  = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const e12 = e1 * e1, e13 = e12 * e1, e14 = e13 * e1;

  // 발모각(footprint latitude)
  const lat1 = mu
    + (3*e1/2 - 27*e13/32)    * Math.sin(2*mu)
    + (21*e12/16 - 55*e14/32) * Math.sin(4*mu)
    + (151*e13/96)             * Math.sin(6*mu)
    + (1097*e14/512)           * Math.sin(8*mu);

  const sinL = Math.sin(lat1), cosL = Math.cos(lat1), tanL = Math.tan(lat1);
  const N1 = a / Math.sqrt(1 - e2 * sinL * sinL);
  const T1 = tanL * tanL,  T1_2 = T1 * T1;
  const C1 = ep2 * cosL * cosL, C1_2 = C1 * C1;
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * sinL * sinL, 1.5);
  const D  = x / (N1 * k0);
  const D2 = D*D, D3=D2*D, D4=D3*D, D5=D4*D, D6=D5*D;

  const lat = lat1 - (N1 * tanL / R1) * (
    D2/2
    - (5 + 3*T1 + 10*C1 - 4*C1_2 - 9*ep2) * D4/24
    + (61 + 90*T1 + 298*C1 + 45*T1_2 - 252*ep2 - 3*C1_2) * D6/720
  );
  const lon = lon0 + (
    D
    - (1 + 2*T1 + C1) * D3/6
    + (5 - 2*C1 + 28*T1 - 3*C1_2 + 8*ep2 + 24*T1_2) * D5/120
  ) / cosL;

  return { lat: lat * 180 / Math.PI, lng: lon * 180 / Math.PI };
}

// ── CSV 파싱 ──────────────────────────────────────────────────────────────
const bytes = fs.readFileSync(CSV_PATH);
const text  = new TextDecoder('euc-kr').decode(bytes);
const lines = text.trim().split(/\r?\n/);

// CSV 행 파싱 (따옴표 처리)
function parseLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  cols.push(cur.trim());
  return cols;
}

const stores = [];
for (let i = 1; i < lines.length; i++) {
  const cols = parseLine(lines[i]);
  if (cols.length < 24) continue;

  const status = cols[4];  // 영업상태명
  const name   = cols[12]; // 사업장명
  const type   = cols[13]; // 업태구분명
  const addr   = cols[16]; // 도로명주소
  const xRaw   = cols[22]; // TM X (중부원점)
  const yRaw   = cols[23]; // TM Y (중부원점)

  // 영업 중인 것만 + 좌표 있는 것만
  if (!status.includes('영업') || !xRaw || !yRaw) continue;
  const tmX = parseFloat(xRaw), tmY = parseFloat(yRaw);
  if (!tmX || !tmY) continue;

  const { lat, lng } = tmToWgs84(tmX, tmY);

  // 한반도 범위 체크 (위도 33~39, 경도 124~132)
  if (lat < 33 || lat > 39 || lng < 124 || lng > 132) continue;

  stores.push({
    id:   `store_${i}`,
    name: name || '대규모점포',
    type: type || '',
    addr: addr || '',
    lat:  Math.round(lat * 1e7) / 1e7,
    lng:  Math.round(lng * 1e7) / 1e7,
  });
}

fs.writeFileSync(OUT_PATH, JSON.stringify(stores, null, 0), 'utf-8');
console.log(`✅ 변환 완료: ${stores.length}개 점포 → ${OUT_PATH}`);

// 업태 종류 확인
const types = [...new Set(stores.map(s => s.type))].sort();
console.log('업태 종류:', types.join(', '));
