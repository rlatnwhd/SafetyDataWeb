// hooks/useAddressSearch.js — 주소 검색 + 점수 계산 상태 관리 (단일 책임: 검색 상태)
import { useState, useCallback } from 'react';
import { geocodeAddress, searchPlaces, reverseGeocodeRegion } from '../services/kakaoMapService';
import { loadCctvNear, getCrimesByRegion } from '../services/csvService';
import { loadBanksNear } from '../services/bankService';
import { loadStoresNear } from '../services/storeService';
import { calcSafetyScore, calcRiskScore, calcConvenienceScore } from '../services/scoreService';

const INITIAL_STATE = {
  loading: false,
  error: null,
  result: null,
};

export function useAddressSearch() {
  const [state, setState] = useState(INITIAL_STATE);

  const search = useCallback(async (address, preResolvedCenter = null) => {
    if (!address.trim()) return;
    setState({ loading: true, error: null, result: null });

    try {
      // 자동완성 클릭 시 이미 좌표가 있으면 geocode 건너뜀
      const center = preResolvedCenter ?? (await geocodeAddress(address));

      // 병렬 로드: CCTV CSV + 카카오 Places + 역지오코딩 + 은행
      const RADIUS_M = 1000;  // 모든 카테고리 통일 반경 (m)
      const [cctvList, policeList, entertainmentList, convenienceList, hospitalList, bankList, storeList, regionInfo] =
        await Promise.all([
          loadCctvNear(center, RADIUS_M / 1000),
          searchPlaces('경찰서', center, RADIUS_M),
          searchPlaces('유흥업소', center, RADIUS_M),
          searchPlaces('편의점', center, RADIUS_M),
          searchPlaces('병원', center, RADIUS_M),
          loadBanksNear(center, RADIUS_M / 1000),
          loadStoresNear(center, RADIUS_M),
          reverseGeocodeRegion(center.lat, center.lng),
        ]);

      // 시군구 확인 후 범죄통계 로드
      const crimeStats = regionInfo ? await getCrimesByRegion(regionInfo.regionKey) : null;
      const regionKey = regionInfo?.regionKey ?? null;

      const safetyScore = calcSafetyScore({
        cctv: cctvList.length,
        police: policeList.length,
      }, crimeStats);
      const riskScore = calcRiskScore({ entertainment: entertainmentList.length }, crimeStats);
      const convenienceScore = calcConvenienceScore({
        convenience: convenienceList.length,
        hospital: hospitalList.length,
      });

      setState({
        loading: false,
        error: null,
        result: {
          address,
          center,
          regionKey,
          safetyScore,
          riskScore,
          convenienceScore,
          crimeStats,
          markers: {
            cctv: cctvList,
            police: policeList,
            entertainment: entertainmentList,
            convenience: convenienceList,
            hospital: hospitalList,
            bank: bankList,
            store: storeList,
          },
        },
      });
    } catch (err) {
      setState({ loading: false, error: err.message, result: null });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, search, reset };
}
