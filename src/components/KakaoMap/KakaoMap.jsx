// components/KakaoMap/KakaoMap.jsx — 카카오맵 렌더링 (단일 책임: 지도 표시)
import { useRef, useEffect, useState } from 'react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { MARKER_CATEGORIES } from '../../constants/mapConfig';
import styles from './KakaoMap.module.css';

const TOGGLE_ITEMS = [
  { key: 'cctv',          cat: MARKER_CATEGORIES.CCTV },
  { key: 'police',        cat: MARKER_CATEGORIES.POLICE },
  { key: 'entertainment', cat: MARKER_CATEGORIES.ENTERTAINMENT },
  { key: 'convenience',   cat: MARKER_CATEGORIES.CONVENIENCE },
  { key: 'hospital',      cat: MARKER_CATEGORIES.HOSPITAL },
  { key: 'bank',          cat: MARKER_CATEGORIES.BANK },
];

export default function KakaoMap({ center, markers }) {
  const containerRef = useRef(null);
  const { drawMarkers, toggleCategory, resetCenter } = useKakaoMap(containerRef, center);

  // 카테고리별 표시 여부 (초기 모두 ON)
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(TOGGLE_ITEMS.map(({ key }) => [key, true]))
  );

  useEffect(() => {
    if (markers) drawMarkers(markers);
  }, [markers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (key) => {
    const next = !visible[key];
    setVisible((prev) => ({ ...prev, [key]: next }));
    toggleCategory(key, next);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.mapArea}>
        <div ref={containerRef} className={styles.container} />
        <button className={styles.resetBtn} onClick={resetCenter} title="검색 위치로 돌아가기">
          📍
        </button>
      </div>
      <div className={styles.toggleBar}>
        {TOGGLE_ITEMS.map(({ key, cat }) => (
          <button
            key={key}
            className={`${styles.toggleBtn} ${visible[key] ? styles.on : styles.off}`}
            onClick={() => handleToggle(key)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
