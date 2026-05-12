// components/CrimeTable/CrimeTable.jsx — 지역별 범죄통계 표 (단일 책임: 범죄 데이터 표시)
import { Fragment } from 'react';
import styles from './CrimeTable.module.css';

const CAT_COLOR = {
  '강력범죄': '#ef4444',
  '절도범죄': '#f97316',
  '폭력범죄': '#eab308',
  '지능범죄': '#6366f1',
  '풍속범죄': '#ec4899',
  '마약범죄': '#8b5cf6',
  '교통범죄': '#14b8a6',
};

export default function CrimeTable({ crimeStats, regionKey }) {
  if (!regionKey) return null;

  if (!crimeStats) {
    return (
      <div className={styles.wrap}>
        <h3 className={styles.title}>📊 범죄 발생 통계</h3>
        <p className={styles.noData}>'{regionKey}' 지역의 통계 데이터가 없습니다.</p>
      </div>
    );
  }

  // 범죄대분류별 그룹화
  const grouped = crimeStats.reduce((acc, row) => {
    (acc[row.category] ??= []).push(row);
    return acc;
  }, {});

  const total = crimeStats.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>📊 {regionKey} 범죄 발생 통계</h3>
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
            {Object.entries(grouped).map(([cat, rows]) => {
              const subtotal = rows.reduce((s, r) => s + r.count, 0);
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
          </tbody>
          <tfoot>
            <tr className={styles.totalRow}>
              <td colSpan={2} className={styles.totalLabel}>총 합계</td>
              <td className={styles.totalCount}>{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
