// services/scoreService.js — 점수 계산 (전국 평균 대비 상대 점수)
import { SCORE_AVERAGES } from '../constants/mapConfig';

/**
 * 전국 평균 대비 상대 점수 (log2 스케일, 100점 불가 설계)
 *   count = 0      → 10점 (또는 반전 시 90점)
 *   count = avg    → 50점
 *   count = 2×avg  → 75점
 *   count = 4×avg  → ~95점  ← 이 이상은 올라가지 않음
 * higherIsBetter=false: 많을수록 낮은 점수로 반전
 */
function relativeScore(count, avg, higherIsBetter = true) {
  if (avg <= 0) return 50;
  if (count <= 0) return higherIsBetter ? 10 : 90;
  const ratio = count / avg;
  const raw = 50 + 25 * Math.log2(ratio);
  const clamped = Math.max(5, Math.min(95, Math.round(raw)));
  return higherIsBetter ? clamped : (100 - clamped);
}

/**
 * 안전도 (0~100, 높을수록 안전)
 * CCTV 60% + 경찰서·파출소 40%
 */
export function calcSafetyScore(counts) {
  const A = SCORE_AVERAGES;
  const cctvS   = relativeScore(counts.cctv,   A.cctv);
  const policeS = relativeScore(counts.police, A.police);

  const score = Math.round((cctvS * 60 + policeS * 40) / 100);
  const detail = [
    { label: 'CCTV',          count: counts.cctv,   avg: A.cctv,   itemScore: cctvS,   weight: 60, unit: '개', inverse: false },
    { label: '경찰서·파출소', count: counts.police, avg: A.police, itemScore: policeS, weight: 40, unit: '개', inverse: false },
  ];
  return { score, detail };
}

/**
 * 불편도 (0~100, 높을수록 불편·위험)
 * 유흥업소 50% + 범죄 발생 건수 50%
 */
export function calcInconvenienceScore(counts, crimeData = null) {
  const A = SCORE_AVERAGES;
  const entertainS = relativeScore(counts.entertainment, A.entertainment);
  const crimeS     = (crimeData?.regionTotal != null && crimeData?.avgTotal)
    ? relativeScore(crimeData.regionTotal, crimeData.avgTotal)
    : 50;

  const score = Math.round((entertainS * 50 + crimeS * 50) / 100);
  const detail = [
    { label: '유흥업소',         count: counts.entertainment,       avg: A.entertainment,       itemScore: entertainS, weight: 50, unit: '개', inverse: false },
    { label: '범죄 발생 건수',   count: crimeData?.regionTotal ?? null, avg: crimeData?.avgTotal ?? null, itemScore: crimeS, weight: 50, unit: '건', inverse: false },
  ];
  return { score, detail };
}

/**
 * 편의도 (0~100, 높을수록 편리)
 * 편의점 40% + 병원 40% + 대형마트 20%
 */
export function calcConvenienceScore(counts) {
  const A = SCORE_AVERAGES;
  const convS  = relativeScore(counts.convenience, A.convenience);
  const hospS  = relativeScore(counts.hospital,    A.hospital);
  const storeS = relativeScore(counts.store,       A.store);

  const score = Math.round((convS * 40 + hospS * 40 + storeS * 20) / 100);
  const detail = [
    { label: '편의점',   count: counts.convenience, avg: A.convenience, itemScore: convS,  weight: 40, unit: '개', inverse: false },
    { label: '병원',     count: counts.hospital,    avg: A.hospital,    itemScore: hospS,  weight: 40, unit: '개', inverse: false },
    { label: '대형마트', count: counts.store,        avg: A.store,       itemScore: storeS, weight: 20, unit: '개', inverse: false },
  ];
  return { score, detail };
}