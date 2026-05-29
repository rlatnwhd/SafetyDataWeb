// components/FeatureCards/FeatureCards.jsx
import styles from './FeatureCards.module.css';

const FEATURES = [
  {
    icon: '📷',
    variant: 'safety',
    title: '안전도 분석',
    desc: '반경 1km 내 CCTV·경찰서 수를 전국 평균과 비교한 안전 점수',
  },
  {
    icon: '📍',
    variant: 'risk',
    title: '위험 요소 시각화',
    desc: '유흥업소 밀집도·지역 범죄 발생 건수 기반 불편도 점수',
  },
  {
    icon: '🏪',
    variant: 'convenience',
    title: '편의시설 분석',
    desc: '반경 1km 내 편의점·병원·대형마트 수를 전국 평균과 비교한 편의도 점수',
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
