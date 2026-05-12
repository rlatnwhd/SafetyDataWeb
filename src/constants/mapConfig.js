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

// 각 시설의 "만점" 기준 개수 및 범죄 기준치
export const SCORE_MAXCOUNTS = {
  cctv: 15,          // CCTV 15개 이상 = 100점
  police: 2,         // 경찰서 2개 이상 = 100점
  entertainment: 5,  // 유흥업소 5개 이상 = 100점
  convenience: 5,    // 편의점 5개 이상 = 100점
  hospital: 3,       // 병원 3개 이상 = 100점
  totalCrime: 300,   // 강력범죄 합계 300건 = 안전점수 0점
  seriousCrime: 50,  // 살인·강도·강간·방화 50건 = 위험점수 100점
};
