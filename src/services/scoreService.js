// services/scoreService.js — 점수 계산 전담 (단일 책임: 비즈니스 로직)
import { SCORE_WEIGHTS, SCORE_MAXCOUNTS } from '../constants/mapConfig';

function countToScore(count, max) {
  return Math.min(100, Math.round((count / max) * 100));
}

/**
 * 안전도 점수 (0~100, 높을수록 안전)
 * = CCTV밀도(35%) + 경찰서(25%) + 범죄안전도(40%)
 * 범죄안전도: 강력범죄 합계 300건 이상 = 0점
 */
export function calcSafetyScore(counts, crimeStats = null) {
  const w = SCORE_WEIGHTS.safety;
  const m = SCORE_MAXCOUNTS;
  const cctvScore   = countToScore(counts.cctv,   m.cctv);
  const policeScore = countToScore(counts.police, m.police);
  let crimeScore;
  if (crimeStats && crimeStats.length > 0) {
    const total = crimeStats.reduce((sum, r) => sum + r.count, 0);
    crimeScore = Math.max(0, 100 - Math.min(100, Math.round((total / m.totalCrime) * 100)));
  } else {
    crimeScore = 50;
  }
  return Math.round((cctvScore * w.cctv + policeScore * w.police + crimeScore * w.crime) / 100);
}

/**
 * 위험도 점수 (0~100, 높을수록 위험)
 * = 유흥업소(40%) + 심각 강력범죄(60%)
 * 심각 강력범죄: 살인·강도·강간·방화 합계 50건 이상 = 100점
 */
export function calcRiskScore(counts, crimeStats = null) {
  const m = SCORE_MAXCOUNTS;
  const entertainScore = countToScore(counts.entertainment, m.entertainment);
  if (!crimeStats || crimeStats.length === 0) {
    return entertainScore;
  }
  const w = SCORE_WEIGHTS.risk;
  const SERIOUS = ['살인', '강도', '강간', '방화'];
  const seriousCount = crimeStats
    .filter(r => r.category === '강력범죄' && SERIOUS.some(k => r.subCategory.includes(k)))
    .reduce((sum, r) => sum + r.count, 0);
  const crimeRiskScore = Math.min(100, Math.round((seriousCount / m.seriousCrime) * 100));
  return Math.round((entertainScore * w.entertainment + crimeRiskScore * w.violentCrime) / 100);
}

/**
 * 편의도 점수 (0~100, 높을수록 편리)
 * = 편의점(50%) + 병원(50%)
 */
export function calcConvenienceScore(counts) {
  const w = SCORE_WEIGHTS.convenience;
  const m = SCORE_MAXCOUNTS;
  return Math.round(
    (countToScore(counts.convenience, m.convenience) * w.convenience +
     countToScore(counts.hospital,    m.hospital)    * w.hospital) / 100
  );
}