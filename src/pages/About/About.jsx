// pages/About/About.jsx — 서비스 소개 페이지 (단일 책임: 소개 콘텐츠)
import styles from './About.module.css';

export default function About() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>서비스 소개</h1>
      <p className={styles.lead}>
        안전한가봄은 대학생 자취생을 위해 공공데이터를 기반으로 자취방 주변의 안전도와
        생활 편의도를 수치화·시각화해주는 서비스입니다.
      </p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>해결하는 문제</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>자취방 계약 전 주변 치안 상태를 파악하기 어려움</li>
          <li className={styles.listItem}>유흥업소 밀집 지역 여부를 직관적으로 알 수 없음</li>
          <li className={styles.listItem}>생활 편의시설(편의점·병원·마트) 분포 정보 부재</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>주요 기능</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>안전도 분석</strong> — 반경 1km 내 CCTV·경찰서 수를 전국 평균과 비교한 안전 점수
          </li>
          <li className={styles.listItem}>
            <strong>불편도 분석</strong> — 유흥업소 밀집도·지역 범죄 발생 건수 기반 불편도 점수
          </li>
          <li className={styles.listItem}>
            <strong>편의시설 분석</strong> — 반경 1km 내 편의점·병원·대형마트 수를 전국 평균과 비교한 편의도 점수
          </li>
          <li className={styles.listItem}>
            <strong>지도 시각화</strong> — 주변 시설 마커(브랜드 로고 포함) 및 반경 1km 원 표시
          </li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사용 데이터</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>카카오맵 API (주소 검색, 장소 카테고리 검색, 지도 시각화)</li>
          <li className={styles.listItem}>공공데이터포털 — 전국 CCTV 설치 현황</li>
          <li className={styles.listItem}>경찰청 — 범죄 발생 지역별 통계 (CSV)</li>
          <li className={styles.listItem}>금융감독원 — 전국 금융기관(은행) 점포 정보 (DBF)</li>
        </ul>
      </div>
    </main>
  );
}
