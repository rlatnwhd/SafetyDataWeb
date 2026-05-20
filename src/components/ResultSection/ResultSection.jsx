// components/ResultSection/ResultSection.jsx — 분석 결과 표시 (단일 책임: 결과 UI)
import { useState } from 'react';
import ScoreBar from '../ScoreBar/ScoreBar';
import KakaoMap from '../KakaoMap/KakaoMap';
import CrimeTable from '../CrimeTable/CrimeTable';
import styles from './ResultSection.module.css';

/** 점수 기준 상세 행 */
function CriteriaRow({ item }) {
  const avgLabel = item.avg != null ? `전국 평균 ${item.avg}${item.unit}` : '평균 데이터 없음';
  const countLabel = item.count != null ? `${item.count}${item.unit}` : '데이터 없음';
  const direction = item.inverse
    ? (item.count != null && item.avg != null ? (item.count < item.avg ? '▼ 평균 이하' : item.count > item.avg ? '▲ 평균 초과' : '= 평균') : '')
    : (item.count != null && item.avg != null ? (item.count > item.avg ? '▲ 평균 초과' : item.count < item.avg ? '▼ 평균 이하' : '= 평균') : '');

  return (
    <div className={styles.criteriaRow}>
      <span className={styles.criteriaLabel}>{item.label}</span>
      <span className={styles.criteriaCount}>{countLabel}</span>
      <span className={styles.criteriaAvg}>({avgLabel})</span>
      <span className={styles.criteriaDir}>{direction}</span>
      <span className={styles.criteriaWeight}>×{item.weight}%</span>
    </div>
  );
}

/** 점수 항목별 기준 그룹 */
function CriteriaGroup({ label, score, detail, variant }) {
  const variantColor = { safety: '#22c55e', risk: '#ef4444', convenience: '#6366f1' };
  return (
    <div className={styles.criteriaGroup}>
      <div className={styles.criteriaGroupHeader}>
        <span className={styles.criteriaGroupLabel} style={{ color: variantColor[variant] }}>{label}</span>
        <span className={styles.criteriaGroupScore}>{score}점</span>
        <span className={styles.criteriaGroupNote}>• 전국 평균 대비 상대 점수</span>
      </div>
      {detail.map(item => <CriteriaRow key={item.label} item={item} />)}
    </div>
  );
}

export default function ResultSection({ result, error, onClose }) {
  const [showCriteria, setShowCriteria] = useState(false);

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.headerRow}>
            <p className={styles.error}>⚠ {error}</p>
            <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
          </div>
        </div>
      </section>
    );
  }

  if (!result) return null;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.address}>📌 {result.address}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="결과 닫기">✕</button>
        </div>
        <div className={styles.scores}>
          <ScoreBar label="안전도" score={result.safetyScore} variant="safety" />
          <ScoreBar label="불편도" score={result.inconvenienceScore} variant="risk" />
          <ScoreBar label="편의도" score={result.convenienceScore} variant="convenience" />
        </div>

        <div className={styles.body}>
          {/* 점수 산정 기준 토글 */}
          <button
            className={styles.criteriaBtn}
            onClick={() => setShowCriteria(v => !v)}
          >
            📊 점수 산정 기준 {showCriteria ? '▲' : '▼'}
          </button>
          {showCriteria && (
            <div className={styles.criteriaPanel}>
              <p className={styles.criteriaMeta}>반경 1km 내 시설 수 기준 · 전국 {result.inconvenienceDetail[1].avg != null ? `평균 범죄 발생 건수 ${result.inconvenienceDetail[1].avg}건` : '평균 비교'}</p>
              <CriteriaGroup label="안전도" score={result.safetyScore} detail={result.safetyDetail} variant="safety" />
              <CriteriaGroup label="불편도" score={result.inconvenienceScore} detail={result.inconvenienceDetail} variant="risk" />
              <CriteriaGroup label="편의도" score={result.convenienceScore} detail={result.convenienceDetail} variant="convenience" />
            </div>
          )}

          <KakaoMap center={result.center} markers={result.markers} />
          <CrimeTable crimeStats={result.crimeStats} regionKey={result.regionKey} crimeData={result.crimeData} />
        </div>
      </div>
    </section>
  );
}
