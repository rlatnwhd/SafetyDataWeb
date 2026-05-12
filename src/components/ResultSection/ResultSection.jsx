// components/ResultSection/ResultSection.jsx — 분석 결과 표시 (단일 책임: 결과 UI)
import ScoreBar from '../ScoreBar/ScoreBar';
import KakaoMap from '../KakaoMap/KakaoMap';
import CrimeTable from '../CrimeTable/CrimeTable';
import styles from './ResultSection.module.css';

export default function ResultSection({ result, error, onClose }) {
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
          <ScoreBar label="위험도" score={result.riskScore} variant="risk" />
          <ScoreBar label="편의도" score={result.convenienceScore} variant="convenience" />
        </div>
        <KakaoMap center={result.center} markers={result.markers} />
        <CrimeTable crimeStats={result.crimeStats} regionKey={result.regionKey} />
      </div>
    </section>
  );
}
