// constants/mapConfig.js — 카카오맵 관련 상수 (단일 책임: 설정값 관리)
export const KAKAO_MAP_KEY = 'a09a91cb09985afea66d090aa391e6e0'; // 실제 키로 교체

export const MAP_DEFAULT = {
  level: 4,
};

export const MARKER_CATEGORIES = {
  CCTV: { label: 'CCTV', color: '#3b82f6', emoji: '📷' },
  POLICE: { label: '경찰서', color: '#6366f1', emoji: '🚔' },
  ENTERTAINMENT: { label: '유흥업소', color: '#ef4444', emoji: '🍺' },
  CONVENIENCE: { label: '편의점', color: '#22c55e', emoji: '🏪' },
  HOSPITAL: { label: '병원', color: '#f97316', emoji: '🏥' },
};

export const SCORE_WEIGHTS = {
  safety: { cctv: 35, police: 25, crime: 40 },
  risk: { entertainment: 40, violentCrime: 60 },
  convenience: { convenience: 50, hospital: 50 },
};

// 각 시설의 "포화점" 기준 개수 및 범죄 기준치
// 포화점 = 이 수치에 도달해야 상한선(80점)에 수렴 (100점 불가)
export const SCORE_MAXCOUNTS = {
  cctv: 30,           // CCTV 30개 이상 → 포화
  police: 5,          // 경찰서 5개 이상 → 포화
  entertainment: 15,  // 유흥업소 15개 이상 → 위험도 포화
  convenience: 15,    // 편의점 15개 이상 → 포화
  hospital: 10,       // 병원 10개 이상 → 포화
  totalCrime: 500,    // 강력범죄 500건 = 안전점수 최저
  seriousCrime: 80,   // 살인·강도·강간·방화 80건 = 위험점수 최고
};
