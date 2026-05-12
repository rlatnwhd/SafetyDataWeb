// pages/About/About.jsx — 서비스 소개 페이지 (단일 책임: 소개 콘텐츠)
import styles from './About.module.css';

export default function About() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>서비스 소개</h1>
      <p className={styles.lead}>
        안전봄은 대학생 자취생을 위해 공공데이터를 기반으로 자취방 주변의 안전도와
        생활 편의도를 수치화·시각화해주는 서비스입니다.
      </p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>해결하는 문제</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>자취방 계약 전 주변 치안 상태를 파악하기 어려움</li>
          <li className={styles.listItem}>유흥업소 밀집 지역 여부를 직관적으로 알 수 없음</li>
          <li className={styles.listItem}>편의점·병원·버스정류장까지의 거리 정보 부재</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>주요 기능</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>
            <strong>안전도 분석</strong> — CCTV·가로등·경찰서 위치 데이터 기반 안전 점수 산출
          </li>
          <li className={styles.listItem}>
            <strong>위험 요소 시각화</strong> — 유흥업소·치안 취약 구역 지도 마커 표시
          </li>
          <li className={styles.listItem}>
            <strong>편의시설 분석</strong> — 편의점·병원·버스정류장 거리 기반 편의 점수
          </li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사용 데이터</h2>
        <ul className={styles.list}>
          <li className={styles.listItem}>카카오맵 API (장소 검색, 지도 시각화)</li>
          <li className={styles.listItem}>공공데이터포털 CCTV 위치 정보</li>
          <li className={styles.listItem}>경찰청 치안 시설 현황 데이터</li>
        </ul>
      </div>
    </main>
  );
}
