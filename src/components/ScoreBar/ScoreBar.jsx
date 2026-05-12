// components/ScoreBar/ScoreBar.jsx — 점수 원형 게이지 (단일 책임: 점수 시각화)
import styles from './ScoreBar.module.css';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreBar({ label, score, variant }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className={styles.item}>
      <svg className={`${styles.svg} ${styles[`svg--${variant}`]}`} viewBox="0 0 88 88">
        <circle className={styles.track} cx="44" cy="44" r={RADIUS} />
        <circle
          className={styles.fill}
          cx="44"
          cy="44"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.value}>{score}</span>
        <span className={styles.unit}>점</span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
