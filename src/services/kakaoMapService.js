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
        // 주소 검색 실패 → 장소명 키워드 검색으로 폴백
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(address, (plResult, plStatus) => {
          if (plStatus === window.kakao.maps.services.Status.OK && plResult.length > 0) {
            resolve({ lat: parseFloat(plResult[0].y), lng: parseFloat(plResult[0].x) });
          } else {
            reject(new Error('주소를 찾을 수 없습니다. 다시 확인해주세요.'));
          }
        });
      }
    });
  });
}

/**
 * 좌표 → 시군구 구역 명칭 (역지오코딩)
 * 반환: { regionKey: "대구 중구", city1: "대구광역시", city2: "중구" } | null
 */
export function reverseGeocodeRegion(lat, lng) {
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) { resolve(null); return; }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) { resolve(null); return; }
      const region = result.find(r => r.region_type === 'B') || result[0];
      if (!region) { resolve(null); return; }
      const CITY_MAP = {
        '서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구',
        '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
        '울산광역시': '울산', '세종특별자치시': '세종시',
        '경기도': '경기도', '강원도': '강원도', '충청북도': '충딉',
        '충청남도': '충남', '전라북도': '전딉', '전라남도': '전남',
        '경상북도': '경딉', '경상남도': '경남', '제주특별자치도': '제주',
      };
      const abbr = CITY_MAP[region.region_1depth_name] || region.region_1depth_name;
      const city2 = region.region_2depth_name;
      // 법정동코드 앞 8자리 = 읍면동코드 (시도2+시군구3+읍면동3)
      const emdCd = region.code ? region.code.substring(0, 8) : null;
      resolve({ regionKey: `${abbr} ${city2}`, city1: region.region_1depth_name, city2, emdCd });
    });
  });
}

/**
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
