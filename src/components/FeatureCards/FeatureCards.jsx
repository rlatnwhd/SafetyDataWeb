// components/FeatureCards/FeatureCards.jsx
import styles from './FeatureCards.module.css';

const FEATURES = [
  {
    icon: '📷',
    variant: 'safety',
    title: '안전도 분석',
    desc: 'CCTV·가로등·경찰서 위치 기반 안전 점수 산출',
  },
  {
    icon: '📍',
    variant: 'risk',
    title: '위험 요소 시각화',
    desc: '유흥업소·치안 취약 구역 지도 표시',
  },
  {
    icon: '🏪',
    variant: 'convenience',
    title: '편의시설 분석',
    desc: '편의점·병원·버스정류장 거리 기반 점수',
  },
];

export default function FeatureCards() {
  return (
    <div className={styles.grid}>
      {FEATURES.map((f) => (
        <article key={f.title} className={styles.card}>
          <span className={`${styles.iconWrap} ${styles[`iconWrap--${f.variant}`]}`}>{f.icon}</span>
          <div className={styles.text}>
            <h3 className={styles.title}>{f.title}</h3>
            <p className={styles.desc}>{f.desc}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
