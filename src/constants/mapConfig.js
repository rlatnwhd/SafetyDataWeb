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
  BANK: { label: '은행', color: '#0ea5e9', emoji: '🏦' },
  STORE: { label: '대형마트', color: '#a855f7', emoji: '🛒' },
};

// 전국 도시 평균 시설 수 (반경 1km 기준 추정치)
// count = avg → 50점, count = 2×avg → 75점, count = 4×avg → ~95점 (100점 불가)
export const SCORE_AVERAGES = {
  cctv: 15,          // CCTV 평균 약 15개
  police: 1,         // 경찰서 평균 약 1개
  entertainment: 3,  // 유흥업소 평균 약 3개
  convenience: 6,    // 편의점 평균 약 6개
  hospital: 4,       // 병원 평균 약 4개
  store: 1,          // 대형마트 평균 약 1개
};
