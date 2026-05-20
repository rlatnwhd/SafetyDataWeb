// services/storeService.js — 카카오 Places API MT1 카테고리로 대형마트만 검색
import { searchPlacesByCategory } from './kakaoMapService';

// SSM(기업형 슈퍼마켓) 브랜드 제외 패턴 — 노브랜드·트레이더스는 필터에서 별도 선택 가능하므로 유지
const SSM_PATTERN = /익스프레스|더프레시|에브리데이/;

/**
 * MT1 = 대형마트 카테고리, SSM 필터링 후 반환
 */
export async function loadStoresNear(center, radiusM = 1000) {
  const result = await searchPlacesByCategory('MT1', center, radiusM);
  return result.filter(p => !SSM_PATTERN.test(p.place_name));
}
