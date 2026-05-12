// services/kakaoMapService.js — 카카오맵 API 호출 전담 (단일 책임: 외부 API 통신)

/**
 * 주소 → 좌표 변환 (카카오 Geocoder)
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('카카오맵 SDK가 로드되지 않았습니다.'));
      return;
    }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
      } else {
        reject(new Error('주소를 찾을 수 없습니다. 다시 확인해주세요.'));
      }
    });
  });
}

/**
 * 카카오 키워드 검색 (Places)
 * @param {string} keyword
 * @param {{ lat: number, lng: number }} center
 * @param {number} radius  단위: m
 * @returns {Promise<Array>}
 */
export function searchPlaces(keyword, center, radius = 500) {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('카카오맵 SDK가 로드되지 않았습니다.'));
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(
      keyword,
      (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve(result);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error(`장소 검색 오류: ${status}`));
        }
      },
      {
        location: new window.kakao.maps.LatLng(center.lat, center.lng),
        radius,
      }
    );
  });
}
