// constants/mapConfig.js — 카카오맵 관련 상수 (단일 책임: 설정값 관리)
export const KAKAO_MAP_KEY = 'a09a91cb09985afea66d090aa391e6e0'; // 실제 키로 교체

export const MAP_DEFAULT = {
  level: 4,
};

export const MARKER_CATEGORIES = {
  CCTV: { label: 'CCTV', color: '#3b82f6', emoji: '📷' },
  POLICE: { label: '경찰서', color: '#6366f1', emoji: '🚔' },
  STREETLIGHT: { label: '가로등', color: '#eab308', emoji: '💡' },
  ENTERTAINMENT: { label: '유흥업소', color: '#ef4444', emoji: '🍺' },
  CONVENIENCE: { label: '편의점', color: '#22c55e', emoji: '🏪' },
  HOSPITAL: { label: '병원', color: '#f97316', emoji: '🏥' },
};

export const SCORE_WEIGHTS = {
  safety: { cctv: 30, police: 40, streetlight: 30 },
  risk: { entertainment: 100 },
  convenience: { convenience: 50, hospital: 50 },
};
