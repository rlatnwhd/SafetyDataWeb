// hooks/useAddressSearch.js — 주소 검색 + 점수 계산 상태 관리 (단일 책임: 검색 상태)
import { useState, useCallback } from 'react';
import { geocodeAddress, searchPlaces } from '../services/kakaoMapService';
import { calcSafetyScore, calcRiskScore, calcConvenienceScore } from '../services/scoreService';

const INITIAL_STATE = {
  loading: false,
  error: null,
  result: null,
};

export function useAddressSearch() {
  const [state, setState] = useState(INITIAL_STATE);

  const search = useCallback(async (address) => {
    if (!address.trim()) return;
    setState({ loading: true, error: null, result: null });

    try {
      const center = await geocodeAddress(address);

      const [cctvList, policeList, entertainmentList, convenienceList, hospitalList, busStopList] =
        await Promise.all([
          searchPlaces('CCTV', center, 500),
          searchPlaces('경찰서', center, 1000),
          searchPlaces('유흥업소', center, 500),
          searchPlaces('편의점', center, 500),
          searchPlaces('병원', center, 500),
          searchPlaces('버스정류장', center, 300),
        ]);

      const safetyScore = calcSafetyScore({
        cctv: cctvList.length,
        police: policeList.length,
        streetlight: 0,
      });
      const riskScore = calcRiskScore({ entertainment: entertainmentList.length });
      const convenienceScore = calcConvenienceScore({
        convenience: convenienceList.length,
        hospital: hospitalList.length,
        busStop: busStopList.length,
      });

      setState({
        loading: false,
        error: null,
        result: {
          address,
          center,
          safetyScore,
          riskScore,
          convenienceScore,
          markers: {
            cctv: cctvList,
            police: policeList,
            entertainment: entertainmentList,
            convenience: convenienceList,
            hospital: hospitalList,
            busStop: busStopList,
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
