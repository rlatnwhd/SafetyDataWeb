// components/KakaoMap/KakaoMap.jsx — 카카오맵 렌더링 (단일 책임: 지도 표시)
import { useRef, useEffect } from 'react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import styles from './KakaoMap.module.css';

export default function KakaoMap({ center, markers }) {
  const containerRef = useRef(null);
  const { drawMarkers } = useKakaoMap(containerRef, center);

  useEffect(() => {
    if (markers) drawMarkers(markers);
  }, [markers]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className={styles.container} />;
}
