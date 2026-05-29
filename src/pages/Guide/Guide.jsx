// pages/Guide/Guide.jsx — 이용 방법 페이지 (단일 책임: 가이드 콘텐츠)
import styles from './Guide.module.css';

const STEPS = [
  {
    num: 1,
    title: '주소 입력',
    desc: '홈 화면 검색창에 자취방 주소(도로명 또는 지번)를 입력합니다.',
  },
  {
    num: 2,
    title: '분석하기 버튼 클릭',
    desc: '"분석하기" 버튼을 누르면 주변 반경 1km 내 데이터를 자동으로 수집합니다.',
  },
  {
    num: 3,
    title: '점수 확인',
    desc: '안전도·불편도·편의도 점수가 원형 게이지로 표시됩니다.',
  },
  {
    num: 4,
    title: '지도 시각화 확인',
    desc: '지도에서 CCTV, 경찰서, 유흥업소, 편의점 등 마커 위치를 확인합니다.',
  },
];

export default function Guide() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>이용 방법</h1>
      <div className={styles.steps}>
        {STEPS.map((s) => (
          <div key={s.num} className={styles.step}>
            <div className={styles.stepNum}>{s.num}</div>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>{s.title}</h2>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
