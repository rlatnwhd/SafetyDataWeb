// components/KakaoMap/KakaoMap.jsx — 카테고리/서브카테고리 필터 패널
import { useRef, useEffect, useState } from 'react';
import { useKakaoMap } from '../../hooks/useKakaoMap';
import { MARKER_CATEGORIES } from '../../constants/mapConfig';
import styles from './KakaoMap.module.css';

/* ─── 서브카테고리 정의 ─────────────────────────────────── */
const cn = p => p.category_name || '';
const pn = p => p.bank || p.place_name || '';

const HOSPITAL_SUBS = [
  { key: 'univ',    label: '대학병원',      test: p => cn(p).includes('대학병원') },
  { key: 'general', label: '종합병원',      test: p => cn(p).includes('종합병원') },
  { key: 'internal',label: '내과',          test: p => cn(p).includes('내과') },
  { key: 'surgery', label: '외과',          test: p => cn(p).includes('외과') && !cn(p).includes('정형외과') && !cn(p).includes('성형외과') && !cn(p).includes('신경외과') },
  { key: 'ortho',   label: '정형외과',      test: p => cn(p).includes('정형외과') },
  { key: 'plastic', label: '성형외과',      test: p => cn(p).includes('성형외과') },
  { key: 'rehab',   label: '재활의학과',    test: p => cn(p).includes('재활의학과') },
  { key: 'neuro',   label: '신경외과/신경과', test: p => cn(p).includes('신경외과') || (cn(p).includes('신경과') && !cn(p).includes('신경외과')) },
  { key: 'eye',     label: '안과',          test: p => cn(p).includes('안과') },
  { key: 'ent',     label: '이비인후과',    test: p => cn(p).includes('이비인후과') },
  { key: 'derm',    label: '피부과',        test: p => cn(p).includes('피부과') },
  { key: 'dent',    label: '치과',          test: p => cn(p).includes('치과') },
  { key: 'peds',    label: '소아청소년과',  test: p => cn(p).includes('소아청소년과') || cn(p).includes('소아과') },
  { key: 'ob',      label: '산부인과',      test: p => cn(p).includes('산부인과') },
  { key: 'psych',   label: '정신건강의학과', test: p => cn(p).includes('정신건강의학과') || cn(p).includes('정신과') },
  { key: 'oriental',label: '한의원',        test: p => cn(p).includes('한의원') },
  { key: 'animal',  label: '동물병원',      test: p => cn(p).includes('동물병원') },
  { key: 'other_hosp', label: '기타',       test: () => true },
];

const CONVENIENCE_SUBS = [
  { key: 'gs25',     label: 'GS25',     test: p => /^GS25/i.test(pn(p)) },
  { key: 'cu',       label: 'CU',       test: p => /^CU[\s(]/i.test(pn(p)) || pn(p).toUpperCase() === 'CU' },
  { key: 'seven',    label: '세븐일레븐', test: p => pn(p).includes('세븐일레븐') },
  { key: 'emart24',  label: '이마트24',  test: p => pn(p).includes('이마트24') },
  { key: 'ministop', label: '미니스톱',  test: p => pn(p).includes('미니스톱') },
  { key: 'other_cv', label: '기타',      test: () => true },
];

// banks.json 실 데이터 기준 17개 은행 (convert-bank.mjs 로 EUC-KR 디코딩 후 확인)
const BANK_SUBS = [
  // ── 4대 시중은행 ──────────────────────────────────
  { key: 'kb',      label: 'KB국민',    test: p => pn(p) === 'KB국민은행' },
  { key: 'shinhan', label: '신한',      test: p => pn(p) === '신한은행' },
  { key: 'woori',   label: '우리',      test: p => pn(p) === '우리은행' },
  { key: 'hana',    label: '하나',      test: p => pn(p) === '하나은행' },
  // ── 기타 시중/특수은행 ────────────────────────────
  { key: 'nh',      label: 'NH농협',    test: p => pn(p) === 'NH농협은행' },
  { key: 'ibk',     label: 'IBK기업',   test: p => pn(p) === 'IBK기업은행' },
  { key: 'sc',      label: 'SC제일',    test: p => pn(p) === 'SC제일은행' },
  { key: 'sh',      label: 'Sh수협',    test: p => pn(p) === 'Sh수협은행' },
  { key: 'kdb',     label: '한국산업',  test: p => pn(p) === '한국산업은행' },
  { key: 'exim',    label: '수출입',    test: p => pn(p) === '수출입은행' },
  { key: 'citi',    label: '한국씨티',  test: p => pn(p) === '한국씨티은행' },
  // ── 지방은행 ─────────────────────────────────────
  { key: 'bnk_bs',  label: 'BNK부산',   test: p => pn(p) === 'BNK부산은행' },
  { key: 'bnk_gn',  label: 'BNK경남',   test: p => pn(p) === 'BNK경남은행' },
  { key: 'im',      label: 'iM뱅크',    test: p => pn(p) === 'iM뱅크(구 대구은행)' },
  { key: 'gwangju', label: '광주은행',   test: p => pn(p) === '광주은행' },
  { key: 'jb',      label: '전북은행',   test: p => pn(p) === '전북은행' },
  { key: 'jeju',    label: '제주은행',   test: p => pn(p) === '제주은행' },
  // ── 기타 ─────────────────────────────────────────
  { key: 'other_bk', label: '기타',     test: () => true },
];

const STORE_SUBS = [
  { key: 'emart',    label: '이마트',       test: p => pn(p).includes('이마트') && !pn(p).includes('이마트24') },
  { key: 'lotte',    label: '롯데마트',     test: p => pn(p).includes('롯데마트') },
  { key: 'homeplus', label: '홈플러스',     test: p => pn(p).includes('홈플러스') },
  { key: 'costco',   label: '코스트코',     test: p => pn(p).includes('코스트코') },
  { key: 'traders',  label: '트레이더스',   test: p => pn(p).includes('트레이더스') },
  { key: 'mega',     label: '메가마트',     test: p => pn(p).includes('메가마트') },
  { key: 'hanaro',   label: '하나로마트',   test: p => pn(p).includes('하나로마트') },
  { key: 'nobrand',  label: '노브랜드',     test: p => pn(p).includes('노브랜드') },
  { key: 'other_st', label: '기타',         test: () => true },
];

const SUB_CONFIG = {
  hospital:    HOSPITAL_SUBS,
  convenience: CONVENIENCE_SUBS,
  bank:        BANK_SUBS,
  store:       STORE_SUBS,
};

const NO_SUBS  = ['cctv', 'police', 'entertainment'];
const HAS_SUBS = ['convenience', 'hospital', 'bank', 'store'];

/* ─── 필터 상태 ─────────────────────────────────────────── */
function initFilter() {
  const s = {};
  NO_SUBS.forEach(k => { s[k] = true; });
  HAS_SUBS.forEach(k => {
    const sub = { _main: true };
    SUB_CONFIG[k].forEach(c => { sub[c.key] = true; });
    s[k] = sub;
  });
  return s;
}

function allOffFilter() {
  const s = {};
  NO_SUBS.forEach(k => { s[k] = false; });
  HAS_SUBS.forEach(k => {
    const sub = { _main: false };
    SUB_CONFIG[k].forEach(c => { sub[c.key] = false; });
    s[k] = sub;
  });
  return s;
}

function applyFilter(allMarkers, filter) {
  if (!allMarkers) return null;
  const result = {};
  NO_SUBS.forEach(k => { result[k] = filter[k] ? (allMarkers[k] || []) : []; });
  HAS_SUBS.forEach(k => {
    const state = filter[k];
    if (!state._main) { result[k] = []; return; }
    const subs     = SUB_CONFIG[k];
    const nonOther = subs.filter(s => !s.key.startsWith('other_'));
    const otherKey = subs.find(s => s.key.startsWith('other_'))?.key;
    const showOther = otherKey ? state[otherKey] : false;
    result[k] = (allMarkers[k] || []).filter(place => {
      const isOther = !nonOther.some(s => s.test(place));
      if (isOther) return showOther;
      return nonOther.filter(s => s.test(place)).some(s => state[s.key]);
    });
  });
  return result;
}

/* ─── 카테고리 메타 ──────────────────────────────────────── */
const MAIN_CATEGORIES = [
  { key: 'cctv',          cat: MARKER_CATEGORIES.CCTV,          hasSubs: false },
  { key: 'police',        cat: MARKER_CATEGORIES.POLICE,        hasSubs: false },
  { key: 'entertainment', cat: MARKER_CATEGORIES.ENTERTAINMENT, hasSubs: false },
  { key: 'convenience',   cat: MARKER_CATEGORIES.CONVENIENCE,   hasSubs: true  },
  { key: 'hospital',      cat: MARKER_CATEGORIES.HOSPITAL,      hasSubs: true  },
  { key: 'bank',          cat: MARKER_CATEGORIES.BANK,          hasSubs: true  },
  { key: 'store',         cat: MARKER_CATEGORIES.STORE,         hasSubs: true  },
];

/* ─── 컴포넌트 ───────────────────────────────────────────── */
export default function KakaoMap({ center, markers }) {
  const containerRef  = useRef(null);
  const allMarkersRef = useRef(null);
  const { drawMarkers, resetCenter } = useKakaoMap(containerRef, center);

  const [filter,   setFilter]   = useState(initFilter);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!markers) return;
    allMarkersRef.current = markers;
    drawMarkers(applyFilter(markers, filter));
  }, [markers]); // eslint-disable-line

  useEffect(() => {
    if (!allMarkersRef.current) return;
    drawMarkers(applyFilter(allMarkersRef.current, filter));
  }, [filter]); // eslint-disable-line

  const toggleMain = key => {
    setFilter(prev => {
      if (typeof prev[key] === 'boolean') return { ...prev, [key]: !prev[key] };
      const next = !prev[key]._main;
      const sub  = { _main: next };
      SUB_CONFIG[key].forEach(s => { sub[s.key] = next; });
      return { ...prev, [key]: sub };
    });
  };

  const toggleSub = (catKey, subKey) => {
    setFilter(prev => {
      const cat = { ...prev[catKey], [subKey]: !prev[catKey][subKey] };
      cat._main = SUB_CONFIG[catKey].some(s => cat[s.key]);
      return { ...prev, [catKey]: cat };
    });
  };

  const isMainOn = key => typeof filter[key] === 'boolean' ? filter[key] : filter[key]._main;
  const isSubOn  = (catKey, subKey) => filter[catKey]?.[subKey] ?? true;
  const subOnCount = catKey => SUB_CONFIG[catKey].filter(s => filter[catKey]?.[s.key]).length;

  return (
    <div className={styles.wrap}>
      {/* 필터 패널 — 왼쪽 */}
      <div className={styles.panel}>
        {/* 패널 헤더 */}
        <div className={styles.panelHead}>
          <span className={styles.panelTitle}>지도 마커 필터</span>
          <div className={styles.headActions}>
            <button className={styles.headBtn} onClick={() => setFilter(initFilter())}>전체 켜기</button>
            <span className={styles.headSep}>·</span>
            <button className={styles.headBtn} onClick={() => setFilter(allOffFilter())}>전체 끄기</button>
          </div>
        </div>

        {/* 카테고리 행 */}
        <div className={styles.catRows}>
          {MAIN_CATEGORIES.map(({ key, cat, hasSubs }) => {
            const on   = isMainOn(key);
            const open = !!expanded[key];
            return (
              <div key={key} className={styles.catGroup}>
                <div className={styles.catRow}>
                  {/* 아이콘 + 이름 */}
                  <div className={styles.catInfo}>
                    <span
                      className={styles.catIcon}
                      style={{ background: on ? `${cat.color}22` : '#f3f4f6', color: on ? cat.color : '#9ca3af' }}
                    >
                      {cat.emoji}
                    </span>
                    <span className={`${styles.catName} ${on ? '' : styles.catNameOff}`}>{cat.label}</span>
                    {hasSubs && on && (
                      <span className={styles.badge}>{subOnCount(key)}/{SUB_CONFIG[key].length}</span>
                    )}
                  </div>

                  {/* 컨트롤 */}
                  <div className={styles.catControls}>
                    {hasSubs && (
                      <button
                        className={`${styles.detailBtn} ${open ? styles.detailOpen : ''}`}
                        onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
                      >
                        {open ? '접기' : '상세'}
                      </button>
                    )}
                    <button
                      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
                      style={on ? { '--tog-color': cat.color } : {}}
                      onClick={() => toggleMain(key)}
                      aria-label={`${cat.label} ${on ? '끄기' : '켜기'}`}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                  </div>
                </div>

                {/* 서브카테고리 */}
                {hasSubs && open && (
                  <div className={styles.subArea}>
                    <div className={styles.subChips}>
                      {SUB_CONFIG[key].map(sub => {
                        const subOn = isSubOn(key, sub.key);
                        return (
                          <button
                            key={sub.key}
                            className={`${styles.chip} ${subOn ? styles.chipOn : styles.chipOff}`}
                            style={subOn ? { '--chip-color': cat.color, '--chip-bg': `${cat.color}18` } : {}}
                            onClick={() => toggleSub(key, sub.key)}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 지도 영역 — 오른쪽 */}
      <div className={styles.mapArea}>
        <div ref={containerRef} className={styles.container} />
        <button className={styles.resetBtn} onClick={resetCenter} title="검색 위치로 돌아가기">📍</button>
      </div>
    </div>
  );
}
