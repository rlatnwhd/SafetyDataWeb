// services/scoreService.js — 점수 계산 전담 (단일 책임: 비즈니스 로직)
import { SCORE_WEIGHTS, SCORE_MAXCOUNTS } from '../constants/mapConfig';

/**
 * sqrt 스케일 점수: 처음엔 빠르게 오르고 이후 완만하게 수렴
 * base: 시설 0개일 때 기본점수
 * top : max개 도달 시 상한 점수 (100점 불가 구조)
 */
function softScore(count, max, base = 40, top = 80) {
  if (count <= 0) return base;
  const ratio = Math.sqrt(Math.min(1, count / max));
  return Math.min(top, Math.round(base + (top - base) * ratio));
}

/**
 * 안전도 점수 (0~100, 높을수록 안전)
 * = CCTV(35%) + 경찰서(25%) + 범죄안전도(40%)
 * 대부분 지역 45~75점 구간
 */
export function calcSafetyScore(counts, crimeStats = null) {
  const w = SCORE_WEIGHTS.safety;
  const m = SCORE_MAXCOUNTS;
  // 시설 기본점 40, 포화 상한 80
  const cctvScore   = softScore(counts.cctv,   m.cctv,   40, 80);
  const policeScore = softScore(counts.police, m.police, 40, 80);
  let crimeScore;
  if (crimeStats && crimeStats.length > 0) {
    const total = crimeStats.reduce((sum, r) => sum + r.count, 0);
    // sqrt 스케일: 범죄 많을수록 급감, 최저 20점
    crimeScore = Math.max(20, Math.round(100 - Math.sqrt(total / m.totalCrime) * 100));
  } else {
    crimeScore = 55; // 데이터 없으면 평균 추정
  }
  return Math.round((cctvScore * w.cctv + policeScore * w.police + crimeScore * w.crime) / 100);
}

/**
 * 위험도 점수 (0~100, 높을수록 위험)
 * = 유흥업소(40%) + 심각 강력범죄(60%)
 * 유흥업소 없으면 낮게 시작, 대부분 20~65점 구간
 */
export function calcRiskScore(counts, crimeStats = null) {
  const m = SCORE_MAXCOUNTS;
  // 유흥업소: base=0 (없으면 위험 없음), top=80
  const entertainScore = softScore(counts.entertainment, m.entertainment, 0, 80);
  if (!crimeStats || crimeStats.length === 0) {
    return entertainScore;
  }
  const w = SCORE_WEIGHTS.risk;
  const SERIOUS = ['살인', '강도', '강간', '방화'];
  const seriousCount = crimeStats
    .filter(r => r.category === '강력범죄' && SERIOUS.some(k => r.subCategory.includes(k)))
    .reduce((sum, r) => sum + r.count, 0);
  // sqrt 스케일: 심각 범죄 위험도, 최고 90점
  const crimeRiskScore = Math.min(90, Math.round(Math.sqrt(seriousCount / m.seriousCrime) * 100));
  return Math.round((entertainScore * w.entertainment + crimeRiskScore * w.violentCrime) / 100);
}

/**
 * 편의도 점수 (0~100, 높을수록 편리)
 * = 편의점(50%) + 병원(50%)
 * 대부분 40~75점 구간
 */
export function calcConvenienceScore(counts) {
  const w = SCORE_WEIGHTS.convenience;
  const m = SCORE_MAXCOUNTS;
  return Math.round(
    (softScore(counts.convenience, m.convenience, 35, 80) * w.convenience +
     softScore(counts.hospital,    m.hospital,    35, 80) * w.hospital) / 100
  );
}