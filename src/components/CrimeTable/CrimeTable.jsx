// components/CrimeTable/CrimeTable.jsx — 지역별 범죄통계 (요약 + 상세)
import { useState, Fragment } from 'react';
import styles from './CrimeTable.module.css';

// 자취 관련 주요 범죄 카테고리
const KEY_CATS = ['강력범죄', '절도범죄', '폭력범죄', '성범죄'];

const CAT_COLOR = {
  '강력범죄': '#ef4444',
  '절도범죄': '#f97316',
  '폭력범죄': '#eab308',
  '성범죄':   '#ec4899',
  '지능범죄': '#6366f1',
  '풍속범죄': '#8b5cf6',
  '마약범죄': '#8b5cf6',
  '교통범죄': '#14b8a6',
};

function levelLabel(regionTotal, avgTotal) {
  if (regionTotal == null || !avgTotal) return { text: '알 수 없음', cls: 'levelUnknown' };
  const ratio = regionTotal / avgTotal;
  if (ratio < 0.7)  return { text: '낮음',   cls: 'levelLow' };
  if (ratio < 1.3)  return { text: '보통',   cls: 'levelMid' };
  if (ratio < 2.0)  return { text: '높음',   cls: 'levelHigh' };
  return              { text: '매우 높음', cls: 'levelHigh' };
}

function catLevel(catTotal, allCatTotals) {
  const values = Object.values(allCatTotals).filter(v => v > 0);
  if (!values.length) return '알 수 없음';
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  if (catTotal < avg * 0.6) return '낮음';
  if (catTotal < avg * 1.4) return '보통';
  return '높음';
}

export default function CrimeTable({ crimeStats, regionKey, crimeData }) {
  const [showDetail, setShowDetail] = useState(false);

  if (!regionKey) return null;

  if (!crimeStats) {
    return (
      <div className={styles.wrap}>
        <h3 className={styles.title}>📊 범죄 발생 통계 <span className={styles.year}>('24년 기준)</span></h3>
        <p className={styles.noData}>'{regionKey}' 지역의 통계 데이터가 없습니다.</p>
      </div>
    );
  }

  // 범죄대분류별 그룹화 및 소계
  const grouped = crimeStats.reduce((acc, row) => {
    (acc[row.category] ??= []).push(row);
    return acc;
  }, {});

  const catTotals = Object.fromEntries(
    Object.entries(grouped).map(([cat, rows]) => [cat, rows.reduce((s, r) => s + r.count, 0)])
  );
  const total = Object.values(catTotals).reduce((s, v) => s + v, 0);

  // 요약용 주요 범죄 — KEY_CATS 4개끼리만 상대 비교
  const keyTotals = Object.fromEntries(KEY_CATS.map(k => [k, catTotals[k] ?? 0]));
  const keySummary = KEY_CATS.map(cat => ({
    cat,
    total: catTotals[cat] ?? 0,
    level: catLevel(catTotals[cat] ?? 0, keyTotals),
  }));

  // 주의 요소 (평균 이상인 주요 범죄)
  const warnings = keySummary.filter(k => k.level === '높음');

  const overallLevel = levelLabel(crimeData?.regionTotal, crimeData?.avgTotal);

  // 기타(KEY_CATS에 없는) 항목
  const otherCats = Object.keys(grouped).filter(c => !KEY_CATS.includes(c));
  const otherTotal = otherCats.reduce((s, c) => s + catTotals[c], 0);

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>
        📊 {regionKey} 범죄 발생 통계
        <span className={styles.year}> ('24년 기준)</span>
      </h3>

      {/* ── 요약 카드 ── */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>범죄 발생 수준</span>
          <span className={`${styles.levelBadge} ${styles[overallLevel.cls]}`}>{overallLevel.text}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>총 범죄 발생 건수</span>
          <span className={styles.summaryVal}>{total.toLocaleString()}건</span>
        </div>

        {/* 주요 범죄 항목 */}
        <div className={styles.keySection}>
          {keySummary.map(({ cat, total: t, level }) => (
            <div key={cat} className={styles.keyCatRow}>
              <span className={styles.keyCatName} style={{ color: CAT_COLOR[cat] ?? '#6b7280' }}>{cat}</span>
              <span className={styles.keyCatCount}>{t.toLocaleString()}건</span>
              <span className={`${styles.levelBadge} ${styles[level === '높음' ? 'levelHigh' : level === '낮음' ? 'levelLow' : 'levelMid']}`}>{level}</span>
            </div>
          ))}
          {otherTotal > 0 && (
            <div className={styles.keyCatRow}>
              <span className={styles.keyCatName} style={{ color: '#9ca3af' }}>기타 범죄</span>
              <span className={styles.keyCatCount}>{otherTotal.toLocaleString()}건</span>
              <span className={`${styles.levelBadge} ${styles.levelUnknown}`}>참고</span>
            </div>
          )}
        </div>

        {/* 주의 요소 */}
        {warnings.length > 0 && (
          <div className={styles.warnings}>
            <span className={styles.warningTitle}>⚠ 주의 요소</span>
            {warnings.map(w => (
              <span key={w.cat} className={styles.warningChip}>{w.cat} 비율 높음</span>
            ))}
          </div>
        )}
      </div>

      {/* ── 상세보기 토글 ── */}
      <button className={styles.detailBtn} onClick={() => setShowDetail(v => !v)}>
        {showDetail ? '▲ 상세 닫기' : '▼ 상세 통계 보기'}
      </button>

      {showDetail && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCat}>범죄 유형</th>
                <th className={styles.thSub}>세부 분류</th>
                <th className={styles.thCnt}>건수</th>
              </tr>
            </thead>
            <tbody>
              {/* 주요 범죄 먼저 */}
              {KEY_CATS.filter(c => grouped[c]).map(cat => {
                const rows = grouped[cat];
                const subtotal = catTotals[cat];
                const color = CAT_COLOR[cat] ?? '#6b7280';
                return (
                  <Fragment key={cat}>
                    {rows.map((row, i) => (
                      <tr key={`${cat}-${i}`} className={i % 2 === 0 ? styles.even : styles.odd}>
                        {i === 0 && (
                          <td rowSpan={rows.length} className={styles.catCell} style={{ borderLeft: `4px solid ${color}` }}>
                            <span className={styles.catName}>{cat}</span>
                            <span className={styles.subtotal}>{subtotal.toLocaleString()}건</span>
                          </td>
                        )}
                        <td className={styles.subCell}>{row.subCategory}</td>
                        <td className={styles.cntCell}>{row.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
              {/* 기타 범죄 */}
              {otherCats.length > 0 && (
                <tr className={styles.otherHeaderRow}>
                  <td colSpan={3} className={styles.otherHeader}>기타 범죄 통계</td>
                </tr>
              )}
              {otherCats.map(cat => {
                const rows = grouped[cat];
                const subtotal = catTotals[cat];
                const color = CAT_COLOR[cat] ?? '#9ca3af';
                return (
                  <Fragment key={cat}>
                    {rows.map((row, i) => (
                      <tr key={`${cat}-${i}`} className={i % 2 === 0 ? styles.even : styles.odd}>
                        {i === 0 && (
                          <td rowSpan={rows.length} className={styles.catCell} style={{ borderLeft: `4px solid ${color}` }}>
                            <span className={styles.catName}>{cat}</span>
                            <span className={styles.subtotal}>{subtotal.toLocaleString()}건</span>
                          </td>
                        )}
                        <td className={styles.subCell}>{row.subCategory}</td>
                        <td className={styles.cntCell}>{row.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={2} className={styles.totalLabel}>총 합계</td>
                <td className={styles.totalCount}>{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
