// services/scoreService.js — 점수 계산 전담 (단일 책임: 비즈니스 로직)
import { SCORE_WEIGHTS } from '../constants/mapConfig';

/**
 * 시설 수 → 0~100 점수 환산
 * @param {number} count
 * @param {number} maxCount  만점 기준 개수
 */
function countToScore(count, maxCount = 5) {
  return Math.min(100, Math.round((count / maxCount) * 100));
}

/**
 * 안전도 점수 계산
 * @param {{ cctv: number, police: number, streetlight: number }} counts
 */
export function calcSafetyScore(counts) {
  const w = SCORE_WEIGHTS.safety;
  const total =
    (countToScore(counts.cctv, 10) * w.cctv +
      countToScore(counts.police, 3) * w.police +
      countToScore(counts.streetlight, 15) * w.streetlight) /
    100;
  return Math.round(total);
}

/**
 * 위험도 점수 계산
 * @param {{ entertainment: number }} counts
 */
export function calcRiskScore(counts) {
  return Math.min(100, Math.round(counts.entertainment * 20));
}

/**
 * 편의도 점수 계산
 * @param {{ convenience: number, hospital: number, busStop: number }} counts
 */
export function calcConvenienceScore(counts) {
  const w = SCORE_WEIGHTS.convenience;
  const total =
    (countToScore(counts.convenience, 5) * w.convenience +
      countToScore(counts.hospital, 3) * w.hospital +
      countToScore(counts.busStop, 5) * w.busStop) /
    100;
  return Math.round(total);
}
