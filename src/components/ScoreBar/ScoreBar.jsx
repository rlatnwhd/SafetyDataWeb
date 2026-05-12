// components/ScoreBar/ScoreBar.jsx — 점수 막대 표시 (단일 책임: 점수 시각화)
import styles from './ScoreBar.module.css';

/**
 * @param {{ label: string, score: number, variant: 'safety'|'risk'|'convenience' }} props
 */
export default function ScoreBar({ label, score, variant }) {
  return (
    <div className={styles.item}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{score}점</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[`fill--${variant}`]}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
